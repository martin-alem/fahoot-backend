import { HttpStatus, Inject, Injectable, InternalServerErrorException, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { NotificationService } from './../notification/notification.service';
import { Model } from 'mongoose';
import { Token } from './schema/tokens.schema';
import { InjectModel } from '@nestjs/mongoose';
import { UserService } from './../user/user.service';
import { IAuthUser, UserRole } from './../../types/user.types';
import { DEFAULT_DATABASE_CONNECTION, EmailPurpose, JWT_TTL, Status } from './../../utils/constant';
import { NotificationType } from './../../types/notification.type';
import { createEmailVerificationTemplate, createPasswordResetTemplate } from '../../utils/email_templates';
import { validateObjectId } from './../../utils/helper';
import Result from 'src/wrapper/result';
import { UserDocument } from '../user/schema/user.schema';

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
    @InjectModel(Token.name, DEFAULT_DATABASE_CONNECTION) tokenModel: Model<Token>,
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
   * @returns a promise that resolves with a Result object
   */
  public async signToken(user: IAuthUser, ttl: number): Promise<Result<string | null>> {
    try {
      const token = await this.jwtService.signAsync(
        {
          id: user.id,
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

      return new Result<string>(true, token, null, HttpStatus.OK);
    } catch (error) {
      return new Result<null>(false, null, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Validates a jwt token
   * @param token token to validate
   * @returns a promise that resolves with a Result object
   */
  async validateToken(token: string): Promise<Result<IAuthUser | null>> {
    try {
      const decodedToken = this.jwtService.verify<IAuthUser>(token, {
        audience: this.configService.get<string>('JWT_TOKEN_AUDIENCE'),
        issuer: this.configService.get<string>('JWT_TOKEN_ISSUER'),
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      return new Result<IAuthUser>(true, decodedToken, null, HttpStatus.OK);
    } catch (error) {
      if (!(error instanceof InternalServerErrorException)) throw error;
      return new Result<null>(false, null, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
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
      return new Result<null>(false, null, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
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
      return new Result<null>(false, null, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   *Generates a token for the specified user
   * @param user user
   * @returns a promise that resolves with a Result object
   */
  public async generateTokens(user: IAuthUser, tokenTTL: number): Promise<Result<string | null>> {
    try {
      const token = await this.signToken(user, tokenTTL);
      const data = token.getData();
      if (!data) return new Result<null>(false, null, 'Unable to sign token', HttpStatus.BAD_REQUEST);

      return new Result<string>(true, data, null, HttpStatus.OK);
    } catch (error) {
      return new Result<null>(false, null, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
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
      const token = await this.generateTokens({ id: '', emailAddress: emailAddress, role: UserRole.USER }, JWT_TTL.ACCESS_TOKEN_TTL);
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
      return new Result<null>(false, null, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Verifies a token by checking it existence in database and making sure it is still valid.
   * @param token incoming token
   * @returns a promise that resolves with a Result object
   */
  private async verifyToken(token: string): Promise<Result<IAuthUser | null>> {
    try {
      const tokenExist = await this.tokenModel.findOne({ token: token });
      if (!tokenExist) return new Result<null>(false, null, 'Token does not exist', HttpStatus.BAD_REQUEST);

      const decodedToken = await this.validateToken(token);
      const decodedTokenData = decodedToken.getData();
      if (!decodedTokenData) return new Result<null>(false, null, 'Error validating token', HttpStatus.BAD_REQUEST);

      if (decodedTokenData.emailAddress !== tokenExist.emailAddress) return new Result<null>(false, null, 'Token mismatch', HttpStatus.BAD_REQUEST);
      const deletedToken = await this.tokenModel.findOneAndDelete({ token });
      if (!deletedToken) return new Result<null>(false, null, 'Token could not be deleted', HttpStatus.BAD_REQUEST);

      return new Result<IAuthUser>(true, decodedToken.getData(), null, HttpStatus.OK);
    } catch (error) {
      return new Result<null>(false, null, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Verifies a user's email address if token exist and is valid.
   * @param token incoming token
   * @returns a promise that resolves with a Result object
   */
  public async verifyEmail(token: string): Promise<Result<UserDocument | null>> {
    try {
      const decodedToken = await this.verifyToken(token);
      const decodedTokenData = decodedToken.getData();
      if (!decodedTokenData) return new Result(false, null, 'Token could not be verified', HttpStatus.BAD_REQUEST);

      const updateResult = await this.userService.updateSensitiveData({ verified: true, status: Status.ACTIVE }, decodedTokenData.emailAddress);
      const updatedResultData = updateResult.getData();
      if (!updatedResultData) return new Result(false, null, 'Unable to update sensitive data', HttpStatus.BAD_REQUEST);

      return new Result<UserDocument>(true, updatedResultData, null, HttpStatus.OK);
    } catch (error) {
      return new Result<null>(false, null, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Handles a request to change a user's password
   * @param oldPassword old password
   * @param newPassword new password
   * @param userId user id
   * @returns a promise that resolves with a Result object
   */
  public async updatePassword(oldPassword: string, newPassword: string, userId: string): Promise<Result<UserDocument | null>> {
    try {
      const isValidObjectId = validateObjectId(userId);
      if (!isValidObjectId.getData()) return new Result<null>(false, null, `Invalid objectId: ${userId}`, HttpStatus.BAD_REQUEST);

      const user = await this.userService.getUser(userId);
      const userData = user.getData();
      if (!userData) return new Result<null>(false, null, `Unable to find user with id: ${userId}`, HttpStatus.BAD_REQUEST);

      const validPassword = await this.compare(oldPassword, userData.password);
      const validPasswordData = validPassword.getData();
      if (!validPasswordData) return new Result<null>(false, null, 'Password does not match', HttpStatus.BAD_REQUEST);

      const hashedPassword = await this.hash(newPassword);
      const hashedPasswordData = hashedPassword.getData();
      if (!hashedPasswordData) return new Result<null>(false, null, 'Unable to hash password', HttpStatus.BAD_REQUEST);

      const updateResult = await this.userService.updateSensitiveData({ password: hashedPasswordData }, userData.emailAddress);
      const updateResultData = updateResult.getData();
      if (!updateResultData) return new Result<null>(false, null, 'Unable to update user password', HttpStatus.BAD_REQUEST);

      return new Result<UserDocument>(true, userData, null, HttpStatus.OK);
    } catch (error) {
      return new Result<null>(false, null, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Updates a user's email
   * @param newEmailAddress new email address
   * @param userId user id
   * @returns a promise that resolves with a Result object
   */
  public async updateEmail(newEmailAddress: string, userId: string): Promise<Result<UserDocument | null>> {
    try {
      const isValidObjectId = validateObjectId(userId);
      if (!isValidObjectId.getData()) return new Result<null>(false, null, `Invalid objectId: ${userId}`, HttpStatus.BAD_REQUEST);

      const user = await this.userService.getUser(userId);
      const userData = user.getData();
      if (!userData) return new Result<null>(false, null, `Unable to find user with id: ${userId}`, HttpStatus.BAD_REQUEST);

      const checkNewEmail = await this.userService.findByEmailAddress(newEmailAddress);
      const checkNewEmailData = checkNewEmail.getData();
      if (!checkNewEmailData) return new Result<null>(false, null, 'Email address already exists', HttpStatus.BAD_REQUEST);

      return new Result<UserDocument>(true, userData, null, HttpStatus.OK);
    } catch (error) {
      return new Result<null>(false, null, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
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
      return new Result<null>(false, null, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * handles password reset.
   * @param emailAddress user's email address
   * @returns a promise that resolves with a Result objects.
   */
  public async passwordReset(token: string, password: string): Promise<Result<boolean | null>> {
    try {
      const decodedToken = await this.verifyToken(token);
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
      return new Result<null>(false, null, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
