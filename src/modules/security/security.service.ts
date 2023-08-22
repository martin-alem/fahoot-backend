import { Inject, Injectable, InternalServerErrorException, UnauthorizedException, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoggerService } from './../logger/logger.service';
import { NotificationService } from './../notification/notification.service';
import { Model } from 'mongoose';
import { Token } from './schema/tokens.schema';
import { InjectModel } from '@nestjs/mongoose';
import { UserService } from './../user/user.service';
import { IAuthUser, UserRole } from 'src/types/user.types';
import { LEVEL } from 'src/types/log.types';
import { EmailPurpose, ErrorMessages, JWT_TTL, Status } from 'src/utils/constant';
import { NotificationType } from 'src/types/notification.type';
import { createEmailVerificationTemplate, createPasswordResetTemplate } from 'src/utils/send_email';

@Injectable()
export class SecurityService {
  private readonly jwtService: JwtService;
  private readonly configService: ConfigService;
  private readonly loggerService: LoggerService;
  private readonly notificationService: NotificationService;
  private readonly tokenModel: Model<Token>;
  private readonly userService: UserService;

  constructor(jwtService: JwtService, configService: ConfigService, @Inject(forwardRef(() => UserService)) userService: UserService, loggerService: LoggerService, notificationService: NotificationService, @InjectModel(Token.name) tokenModel: Model<Token>) {
    this.jwtService = jwtService;
    this.configService = configService;
    this.userService = userService;
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
  async validateToken(token: string): Promise<IAuthUser> {
    try {
      const decodedToken = await this.jwtService.verify(token, {
        audience: this.configService.get<string>('JWT_TOKEN_AUDIENCE'),
        issuer: this.configService.get<string>('JWT_TOKEN_ISSUER'),
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      return decodedToken as IAuthUser;
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

  public async sendVerificationLink(emailAddress: string, subject: string, emailPurpose: EmailPurpose): Promise<void> {
    try {
      let message = '';
      const token = await this.generateTokens({ id: '', emailAddress: emailAddress, role: UserRole.USER });

      const newToken = await this.tokenModel.create({ token: token, emailAddress: emailAddress });

      if (!newToken) throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);

      if (emailPurpose === EmailPurpose.EMAIL_VERIFICATION) {
        const link = `${this.configService.get<string>('VERIFY_EMAIL_URL')}?token=${token}`;
        message = createEmailVerificationTemplate(link);
      } else if (emailPurpose === EmailPurpose.PASSWORD_RESET) {
        const link = `${this.configService.get<string>('PASSWORD_RESET_URL')}?token=${token}`;
        message = createPasswordResetTemplate(link);
      }
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

  public async verifyToken(token: string): Promise<IAuthUser> {
    const session = await this.tokenModel.startSession();
    session.startTransaction();
    try {
      const tokenExist = await this.tokenModel.findOne({ token: token }).session(session);
      if (!tokenExist) throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED);

      const decodedToken = await this.validateToken(token);
      if (decodedToken.emailAddress !== tokenExist.emailAddress) throw new UnauthorizedException(ErrorMessages.TOKEN_EMAIL_MISMATCH);

      await this.tokenModel.findOneAndDelete({ token }).session(session);

      await session.commitTransaction();

      return decodedToken;
    } catch (error) {
      await session.abortTransaction(); // Rollback on error
      this.loggerService.log(
        JSON.stringify({
          event: 'token_verification_error',
          description: error.message,
        }),
      );
      throw error;
    } finally {
      await session.endSession();
    }
  }

  public async verifyEmail(token: string): Promise<void> {
    try {
      const decodedToken = await this.verifyToken(token);
      await this.userService.updateSensitiveData({ verified: true, status: Status.ACTIVE }, decodedToken.emailAddress); // Pass session
      return;
    } catch (error) {
      this.loggerService.log(
        JSON.stringify({
          event: 'email_verification_error',
          description: error.message,
        }),
      );
      throw error;
    }
  }

  public async passwordResetRequest(emailAddress: string): Promise<void> {
    try {
      const subject = 'Password Reset Request';
      await this.userService.findByEmailAddress(emailAddress);
      await this.sendVerificationLink(emailAddress, subject, EmailPurpose.PASSWORD_RESET);
      return;
    } catch (error) {
      this.loggerService.log(
        JSON.stringify({
          event: 'password_reset_request_error',
          description: error.message,
          level: LEVEL.CRITICAL,
        }),
      );
      throw error;
    }
  }
  public async passwordReset(token: string, password: string): Promise<void> {
    try {
      const decodedToken = await this.verifyToken(token);
      const hashedPassword = await this.hash(password);
      await this.userService.updateSensitiveData({ password: hashedPassword }, decodedToken.emailAddress);
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
