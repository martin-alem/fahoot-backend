import { HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { NotificationService } from './../notification/notification.service';
import { Model } from 'mongoose';
import { Token } from './schema/tokens.schema';
import { InjectModel } from '@nestjs/mongoose';
import { UserService } from './../user/user.service';
import { IAuthUser, UserRole } from './../../types/user.types';
import { DEFAULT_DATABASE_CONNECTION, EmailPurpose, ErrorMessages, JWT_TTL, Status } from './../../utils/constant';
import { NotificationType } from './../../types/notification.type';
import { createEmailVerificationTemplate, createPasswordResetTemplate } from '../../utils/email_templates';
import { log, validateObjectId } from './../../utils/helper';
import Result from 'src/wrapper/result';
import { LoggerService } from '../logger/logger.service';
import { User } from '../user/schema/user.schema';

@Injectable()
export class SecurityService {
  private readonly jwtService: JwtService;
  private readonly configService: ConfigService;
  private readonly notificationService: NotificationService;
  private readonly tokenModel: Model<Token>;
  private readonly userService: UserService;
  private readonly loggerService: LoggerService;

  constructor(
    jwtService: JwtService,
    configService: ConfigService,
    @Inject(forwardRef(() => UserService)) userService: UserService,
    notificationService: NotificationService,
    @InjectModel(Token.name, DEFAULT_DATABASE_CONNECTION) tokenModel: Model<Token>,
    loggerService: LoggerService,
  ) {
    this.jwtService = jwtService;
    this.configService = configService;
    this.userService = userService;
    this.notificationService = notificationService;
    this.tokenModel = tokenModel;
    this.loggerService = loggerService;
  }

  /**
   * Signs a user and generates a new token
   * @param user user
   * @param ttl token time to live in milliseconds
   * @returns a promise that resolves with a Result object
   */
  public async signToken<T extends object>(entity: T, ttl: number): Promise<Result<string | null>> {
    try {
      const token = await this.jwtService.signAsync(
        { ...entity },
        {
          audience: this.configService.get<string>('JWT_TOKEN_AUDIENCE'),
          issuer: this.configService.get<string>('JWT_TOKEN_ISSUER'),
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: ttl,
        },
      );

      return new Result<string>(true, token, null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'sign_token_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Validates a jwt token
   * @param token token to validate
   * @returns a promise that resolves with a Result object
   */
  async validateToken<T extends object>(token: string): Promise<Result<T | null>> {
    try {
      const decodedToken = this.jwtService.verify<T>(token, {
        audience: this.configService.get<string>('JWT_TOKEN_AUDIENCE'),
        issuer: this.configService.get<string>('JWT_TOKEN_ISSUER'),
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      return new Result<T>(true, decodedToken, null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'validate_token_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Hashes the input data with a a randomly generated salt
   * @param data data to be hashed
   * @returns a promise that resolves with a Result object
   */
  public async hash(data: string): Promise<Result<string | null>> {
    try {
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(data, salt);
      return new Result<string>(true, hash.toString(), null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'hash_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Compares if two hashes are equal
   * @param incomingData data to be hashed and compared against the hashed data
   * @param hashedData hashed data
   * @returns a promise that resolves with a Result object
   */
  public async compare(incomingData: string, hashedData: string): Promise<Result<boolean | null>> {
    try {
      const isMatch = await bcrypt.compare(incomingData, hashedData);
      return new Result<boolean>(true, isMatch, null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'compare_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   *Generates a token for the specified entity
   * @param entity the entity
   * @returns a promise that resolves with a Result object
   */
  public async generateTokens<T extends object>(entity: T, tokenTTL: number): Promise<Result<string | null>> {
    try {
      const token = await this.signToken<T>(entity, tokenTTL);
      const data = token.getData();
      if (!data) return new Result<null>(false, null, 'Unable to sign token', HttpStatus.BAD_REQUEST);

      return new Result<string>(true, data, null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'generate_token_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Queues a verification email with the specified email address, subject and purpose.
   * @param emailAddress user email address
   * @param subject email subject
   * @param emailPurpose email's purpose
   * @returns a promise that resolves with a Result object
   */
  public async queueVerificationEmail(emailAddress: string, subject: string, emailPurpose: EmailPurpose): Promise<Result<boolean | null>> {
    try {
      let message = '';
      const token = await this.generateTokens<IAuthUser>({ id: '', emailAddress: emailAddress, role: UserRole.CREATOR }, JWT_TTL.ACCESS_TOKEN_TTL);
      const tokenData = token.getData();
      if (!tokenData) return new Result<null>(false, null, 'Could not generate token', HttpStatus.BAD_REQUEST);

      const newToken = await this.tokenModel.updateOne({ emailAddress: emailAddress }, { token: tokenData }, { upsert: true });
      if (!newToken) return new Result<null>(false, null, 'Unable to update token', HttpStatus.BAD_REQUEST);

      if (emailPurpose === EmailPurpose.EMAIL_VERIFICATION) {
        const link = `${this.configService.get<string>('VERIFY_EMAIL_URL')}?token=${tokenData}`;
        message = createEmailVerificationTemplate(link);
      } else if (emailPurpose === EmailPurpose.PASSWORD_RESET) {
        const link = `${this.configService.get<string>('PASSWORD_RESET_URL')}?token=${tokenData}`;
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
      return new Result<boolean>(true, true, null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'enqueue_email_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Verifies a token by checking it existence in database and making sure it is still valid.
   * @param token incoming token
   * @returns a promise that resolves with a Result object
   */
  private async verifyToken<T extends object>(token: string): Promise<Result<T | null>> {
    try {
      const tokenExist = await this.tokenModel.findOne({ token: token });
      if (!tokenExist) return new Result<null>(false, null, 'Token does not exist', HttpStatus.BAD_REQUEST);

      const decodedToken = await this.validateToken<T>(token);
      const decodedTokenData = decodedToken.getData();
      if (!decodedTokenData) return new Result<null>(false, null, 'Error validating token', HttpStatus.BAD_REQUEST);

      if ('emailAddress' in decodedTokenData) {
        if (decodedTokenData.emailAddress !== tokenExist.emailAddress) return new Result<null>(false, null, 'Token mismatch', HttpStatus.BAD_REQUEST);
        const deletedToken = await this.tokenModel.findOneAndDelete({ token });
        if (!deletedToken) return new Result<null>(false, null, 'Token could not be deleted', HttpStatus.BAD_REQUEST);

        return new Result<T>(true, decodedToken.getData(), null, HttpStatus.OK);
      }
      return new Result<null>(false, null, 'Token could not be decoded', HttpStatus.BAD_REQUEST);
    } catch (error) {
      log(this.loggerService, 'verify_token_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Verifies a user's email address if token exist and is valid.
   * @param token incoming token
   * @returns a promise that resolves with a Result object
   */
  public async verifyEmail(token: string): Promise<Result<User | null>> {
    try {
      const decodedToken = await this.verifyToken<IAuthUser>(token);
      const decodedTokenData = decodedToken.getData();

      if (!decodedTokenData) return new Result(false, null, 'Token could not be verified', HttpStatus.BAD_REQUEST);

      const updateResult = await this.userService.updateSensitiveData({ verified: true, status: Status.ACTIVE }, decodedTokenData.emailAddress);
      const updatedResultData = updateResult.getData();
      if (!updatedResultData) return new Result(false, null, 'Unable to update sensitive data', HttpStatus.BAD_REQUEST);

      return new Result<User>(true, updatedResultData, null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'verify_email_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Handles a request to change a user's password
   * @param oldPassword old password
   * @param newPassword new password
   * @param userId user id
   * @returns a promise that resolves with a Result object
   */
  public async updatePassword(oldPassword: string, newPassword: string, userId: string): Promise<Result<User | null>> {
    try {
      const isValidObjectId = validateObjectId(userId);
      if (!isValidObjectId.getData()) return new Result<null>(false, null, `Invalid objectId: ${userId}`, HttpStatus.BAD_REQUEST);

      const user = await this.userService.getUser(userId);
      const userData = user.getData();
      if (!userData) return new Result<null>(false, null, `Unable to find user with id: ${userId}`, HttpStatus.BAD_REQUEST);

      const validPassword = await this.compare(oldPassword, userData.password);
      const validPasswordData = validPassword.getData();
      if (!validPasswordData) return new Result<null>(false, null, 'We could not find the old password you provided', HttpStatus.BAD_REQUEST);

      const hashedPassword = await this.hash(newPassword);
      const hashedPasswordData = hashedPassword.getData();
      if (!hashedPasswordData) return new Result<null>(false, null, 'Unable to hash password', HttpStatus.BAD_REQUEST);

      const updateResult = await this.userService.updateSensitiveData({ password: hashedPasswordData }, userData.emailAddress);
      const updateResultData = updateResult.getData();
      if (!updateResultData) return new Result<null>(false, null, 'Unable to update user password', HttpStatus.BAD_REQUEST);

      return new Result<User>(true, userData, null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'update_password_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Updates a user's email
   * @param newEmailAddress new email address
   * @param userId user id
   * @returns a promise that resolves with a Result object
   */
  public async updateEmail(newEmailAddress: string, userId: string): Promise<Result<User | null>> {
    try {
      const isValidObjectId = validateObjectId(userId);
      if (!isValidObjectId.getData()) return new Result<null>(false, null, `Invalid objectId: ${userId}`, HttpStatus.BAD_REQUEST);

      const user = await this.userService.getUser(userId);
      const userData = user.getData();
      if (!userData) return new Result<null>(false, null, `Unable to find user with id: ${userId}`, HttpStatus.BAD_REQUEST);

      const checkNewEmail = await this.userService.findByEmailAddress(newEmailAddress);
      const checkNewEmailData = checkNewEmail.getData();
      if (checkNewEmailData) return new Result<null>(false, null, 'Email address already exists', HttpStatus.BAD_REQUEST);

      await this.queueVerificationEmail(newEmailAddress, 'Verify Email', EmailPurpose.EMAIL_VERIFICATION);

      const updateResult = await this.userService.updateSensitiveData(
        { emailAddress: newEmailAddress, verified: false, status: Status.INACTIVE },
        userData.emailAddress,
      );
      const updateResultData = updateResult.getData();
      if (!updateResultData) return new Result<null>(false, null, 'Unable to update user email address', HttpStatus.BAD_REQUEST);

      return new Result<User>(true, userData, null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'update_email_password_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * handles password reset request.
   * @param emailAddress user's email address
   * @returns a promise that resolves with a Result objects.
   */
  public async passwordResetRequest(emailAddress: string): Promise<Result<boolean | null>> {
    try {
      const subject = 'Password Reset Request';
      const result = await this.userService.findByEmailAddress(emailAddress);
      const resultData = result.getData();
      if (!resultData) return new Result<null>(false, null, `Unable to find user with email address: ${emailAddress}`, HttpStatus.BAD_REQUEST);

      await this.queueVerificationEmail(emailAddress, subject, EmailPurpose.PASSWORD_RESET);

      return new Result<boolean>(true, true, null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'password_reset_request_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * handles password reset.
   * @param emailAddress user's email address
   * @returns a promise that resolves with a Result objects.
   */
  public async passwordReset(token: string, password: string): Promise<Result<boolean | null>> {
    try {
      const decodedToken = await this.verifyToken<IAuthUser>(token);
      const decodedTokenData = decodedToken.getData();
      if (!decodedTokenData) return new Result<null>(false, null, 'Unable to verify token', HttpStatus.BAD_REQUEST);

      const hashedPassword = await this.hash(password);
      const hashedPasswordData = hashedPassword.getData();
      if (!hashedPasswordData) return new Result<null>(false, null, 'Unable to hash user password', HttpStatus.BAD_REQUEST);

      const updateResult = await this.userService.updateSensitiveData({ password: hashedPasswordData }, decodedTokenData.emailAddress);
      const updateResultData = updateResult.getData();
      if (!updateResultData) return new Result<null>(false, null, 'Unable to update user data', HttpStatus.BAD_REQUEST);

      return new Result<boolean>(true, true, null, HttpStatus.OK);
    } catch (error) {
      log(this.loggerService, 'password_reset_error', error.message);
      return new Result<null>(false, null, ErrorMessages.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
