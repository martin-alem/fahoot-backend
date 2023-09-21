import { Inject, Injectable, InternalServerErrorException, UnauthorizedException, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { NotificationService } from './../notification/notification.service';
import { Model } from 'mongoose';
import { Token } from './schema/tokens.schema';
import { InjectModel } from '@nestjs/mongoose';
import { UserService } from './../user/user.service';
import { IAuthUser, UserRole } from './../../types/user.types';
import { EmailPurpose, ErrorMessages, JWT_TTL, Status } from './../../utils/constant';
import { NotificationType } from './../../types/notification.type';
import { createEmailVerificationTemplate, createPasswordResetTemplate } from '../../utils/email_templates';

@Injectable()
export class SecurityService {
  private readonly jwtService: JwtService;
  private readonly configService: ConfigService;
  private readonly notificationService: NotificationService;
  private readonly tokenModel: Model<Token>;
  private readonly userService: UserService;

  constructor(
    jwtService: JwtService,
    configService: ConfigService,
    @Inject(forwardRef(() => UserService)) userService: UserService,
    notificationService: NotificationService,
    @InjectModel(Token.name) tokenModel: Model<Token>,
  ) {
    this.jwtService = jwtService;
    this.configService = configService;
    this.userService = userService;
    this.notificationService = notificationService;
    this.tokenModel = tokenModel;
  }

  /**
   * Signs a user and generates a new token
   * @param user user
   * @param ttl token time to live in milliseconds
   * @returns a promise that resolves with a signed token
   * @throws InternalServerErrorException if an error occurs while signing the user
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
      if (!(error instanceof InternalServerErrorException)) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Validates a jwt token
   * @param token token to validate
   * @returns the decoded jwt token if the token is valid
   * @throws BadRequestException if the token is not valid
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
      if (!(error instanceof InternalServerErrorException)) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Hashes the input data with a a randomly generated salt
   * @param data data to be hashed
   * @returns a promise that resolves with a hashed string
   * @throws InternalServerErrorException if the error occurred during hashing
   */
  public async hash(data: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(data, salt);
      return hash.toString();
    } catch (error) {
      if (!(error instanceof InternalServerErrorException)) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Compares if two hashes are equal
   * @param incomingData data to be hashed and compared against the hashed data
   * @param hashedData hashed data
   * @returns a promise that resolves with true if match or false otherwise
   * @throws InternalServerErrorException if the error occurred while comparing
   */
  public async compare(incomingData: string, hashedData: string): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(incomingData, hashedData);
      return isMatch;
    } catch (error) {
      if (!(error instanceof InternalServerErrorException)) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   *Generates a token for the specified user
   * @param user user
   * @returns a promise that is resolved with tokens
   * @throws InternalServerErrorException if the error occurred while generating tokens
   */
  public async generateTokens(user: IAuthUser, tokenTTL: number): Promise<string> {
    try {
      const token = await this.signToken(user, tokenTTL);
      return token;
    } catch (error) {
      if (!(error instanceof InternalServerErrorException)) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Queues a verification email with the specified email address, subject and purpose.
   * @param emailAddress user email address
   * @param subject email subject
   * @param emailPurpose email's purpose
   * @throws InternalServerErrorException if the error occurred while trying to queue a verification email.
   */
  public async queueVerificationEmail(emailAddress: string, subject: string, emailPurpose: EmailPurpose): Promise<void> {
    try {
      let message = '';
      const token = await this.generateTokens({ id: '', emailAddress: emailAddress, role: UserRole.USER }, JWT_TTL.ACCESS_TOKEN_TTL);

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
      if (!(error instanceof InternalServerErrorException)) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Verifies a token by checking it existence in database and making sure it is still valid.
   * @param token incoming token
   * @returns a promise that is resolved with and IAuthUser if the token was successfully decoded
   * @throws UnauthorizedException if the token is not found in the database
   * @throws UnauthorizedException if the email address associated with the token in database does not match the email decoded from the token.
   */
  private async verifyToken(token: string): Promise<IAuthUser> {
    try {
      const tokenExist = await this.tokenModel.findOne({ token: token });
      if (!tokenExist) throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED);
      const decodedToken = await this.validateToken(token);
      if (decodedToken.emailAddress !== tokenExist.emailAddress) throw new UnauthorizedException(ErrorMessages.TOKEN_EMAIL_MISMATCH);
      await this.tokenModel.findOneAndDelete({ token });
      return decodedToken;
    } catch (error) {
      if (!(error instanceof InternalServerErrorException)) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Verifies a user's email address if token exist and is valid.
   * @param token incoming token
   * @returns a promise that resolves with void
   * @throws InternalServerErrorException if an unknown error occurred and specific errors. check nested methods for more information.
   */
  public async verifyEmail(token: string): Promise<void> {
    try {
      const decodedToken = await this.verifyToken(token);
      await this.userService.updateSensitiveData({ verified: true, status: Status.ACTIVE }, decodedToken.emailAddress);
      return;
    } catch (error) {
      if (!(error instanceof InternalServerErrorException)) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * handles password reset request.
   * @param emailAddress user's email address
   * @returns a promise that resolves with void
   * @throws InternalServerErrorException and specific error from nest methods.
   */
  public async passwordResetRequest(emailAddress: string): Promise<void> {
    try {
      const subject = 'Password Reset Request';
      await this.userService.findByEmailAddress(emailAddress);
      await this.queueVerificationEmail(emailAddress, subject, EmailPurpose.PASSWORD_RESET);
      return;
    } catch (error) {
      if (!(error instanceof InternalServerErrorException)) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * handles password reset.
   * @param emailAddress user's email address
   * @returns a promise that resolves with void
   * @throws InternalServerErrorException and specific error from nest methods.
   */
  public async passwordReset(token: string, password: string): Promise<void> {
    try {
      const decodedToken = await this.verifyToken(token);
      const hashedPassword = await this.hash(password);
      await this.userService.updateSensitiveData({ password: hashedPassword }, decodedToken.emailAddress);
    } catch (error) {
      if (!(error instanceof InternalServerErrorException)) throw error;
      throw new InternalServerErrorException(error.message);
    }
  }
}