import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoggerService } from './../logger/logger.service';
import { IAuthUser } from './../shared/types/user.types';
import { ErrorMessages, JWT_TTL } from './../shared/utils/constant';
import { NotificationService } from './../notification/notification.service';
import { NotificationType } from './../shared/types/notification.type';
import { LEVEL } from './../shared/types/log.types';
import { Model } from 'mongoose';
import { Token } from './schema/tokens.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SecurityService {
  private readonly jwtService: JwtService;
  private readonly configService: ConfigService;
  private readonly loggerService: LoggerService;
  private readonly notificationService: NotificationService;
  private readonly tokenModel: Model<Token>;

  constructor(jwtService: JwtService, configService: ConfigService, loggerService: LoggerService, notificationService: NotificationService, @InjectModel(Token.name) tokenModel: Model<Token>) {
    this.jwtService = jwtService;
    this.configService = configService;
    this.loggerService = loggerService;
    this.notificationService = notificationService;
    this.tokenModel = tokenModel;
  }

  /**
   * Signs a user and generates a new token
   * @param user user
   * @param ttl token time to live in milliseconds
   * @returns a promise that resolves with a signed token
   */
  public async signToken(user: IAuthUser, ttl: number): Promise<string> {
    try {
      const token = await this.jwtService.signAsync(
        {
          sub: user.id,
          emailAddress: user.emailAddress,
          role: user.role,
        },
        {
          audience: this.configService.get<string>('JWT_TOKEN_AUDIENCE'),
          issuer: this.configService.get<string>('JWT_TOKEN_ISSUER'),
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: ttl,
        },
      );

      return token;
    } catch (error) {
      this.loggerService.log(
        JSON.stringify({
          event: 'token_sign_error',
          description: error.message,
        }),
      );
      throw error;
    }
  }

  /**
   * Validates a jwt token
   * @param token token to validate
   * @returns the decoded jwt token if the token is valid
   * @throws UnauthorizedException if the token is not valid
   */
  async validateToken(token: string): Promise<unknown> {
    try {
      return this.jwtService.verify(token, {
        audience: this.configService.get<string>('JWT_TOKEN_AUDIENCE'),
        issuer: this.configService.get<string>('JWT_TOKEN_ISSUER'),
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (error) {
      this.loggerService.log(
        JSON.stringify({
          event: 'token_validation_error',
          description: error.message,
        }),
      );
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Hashes the input data with a a randomly generated salt
   * @param data data to be hashed
   * @returns a promise that resolves with a hashed string
   */
  public async hash(data: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(data, salt);
      return hash.toString();
    } catch (error) {
      this.loggerService.log(
        JSON.stringify({
          event: 'hash_error',
          description: error.message,
          level: LEVEL.CRITICAL,
        }),
      );
      throw error;
    }
  }

  /**
   * Compares if two hashes are equal
   * @param incomingData data to be hashed and compared against the hashed data
   * @param hashedData hashed data
   * @returns a promise that resolves with true if match or false otherwise
   */
  public async compare(incomingData: string, hashedData: string): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(incomingData, hashedData);
      return isMatch;
    } catch (error) {
      this.loggerService.log(
        JSON.stringify({
          event: 'compare_error',
          description: error.message,
          level: LEVEL.CRITICAL,
        }),
      );
      throw error;
    }
  }

  /**
   *Generates an access and refresh token for the specified user
   * @param user user
   * @returns a promise that is resolved with tokens
   */
  public async generateTokens(user: IAuthUser): Promise<string> {
    try {
      const accessTokenTTL: number = JWT_TTL.JWT_ACCESS_TOKEN_TTL;
      const accessToken = await this.signToken(user, accessTokenTTL);
      return accessToken;
    } catch (error) {
      this.loggerService.log(
        JSON.stringify({
          event: 'token_generation_error',
          description: error.message,
        }),
      );
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);
    }
  }

  public async sendVerificationLink(emailAddress: string, subject: string, message: string): Promise<void> {
    try {
      const payload = {
        to: emailAddress,
        subject,
        message,
      };
      const notification = {
        type: NotificationType.EMAIL,
        payload: payload,
      };
      this.notificationService.enqueueNotification(JSON.stringify(notification));
    } catch (error) {
      this.loggerService.log(
        JSON.stringify({
          event: 'send_verification_link_error',
          description: error.message,
        }),
      );
    }
  }

  public async verifyEmail(token: string): Promise<void> {
    try {
      const decodedToken = await this.validateToken(token);
      console.log(decodedToken);
      // TODO: verify user email address
      // TODO: Update user
    } catch (error) {
      this.loggerService.log(
        JSON.stringify({
          event: 'token_generation_error',
          description: error.message,
        }),
      );
    }
  }

  public async passwordResetRequest(emailAddress: string): Promise<void> {
    try {
      const subject = 'Password Reset Request';
      const message = 'Please follow the link below to reset your password';
      await this.sendVerificationLink(emailAddress, subject, message);
      //TODO: Check to make sure the email address exist.
      //TODO: if the email address exist send an email
      //TODO: Save a copy of the token generated
      //TODO: send back a 200 ok response
    } catch (error) {
      this.loggerService.log(
        JSON.stringify({
          event: 'password_reset_request_error',
          description: error.message,
          level: LEVEL.CRITICAL,
        }),
      );
    }
  }
  public async passwordReset(token: string, password: string): Promise<void> {
    try {
      const decodedToken = await this.validateToken(token);
      console.log(decodedToken);
      //TODO: decoded token wil contain the email address. If it matches what was associated with token hash the password
      const hashedPassword = await this.hash(password);
      console.log(hashedPassword);
      //TODO:Update the user password.
    } catch (error) {
      this.loggerService.log(
        JSON.stringify({
          event: 'password_reset_error',
          description: error.message,
          level: LEVEL.CRITICAL,
        }),
      );
    }
  }
}
