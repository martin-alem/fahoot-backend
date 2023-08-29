/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { SecurityService } from '../security/security.service';
import { LoggerService } from '../logger/logger.service';
import { IPlainUser, IUser } from 'src/types/user.types';
import { SignUpDTO } from './dto/signup.dto';
import { AuthenticationMethod, EmailPurpose, ErrorMessages, Status } from 'src/utils/constant';
import { LEVEL } from 'src/types/log.types';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { SignInDTO } from './dto/signin.dto';
import { UserDocument } from '../user/schema/user.schema';
const Client = new OAuth2Client();

@Injectable()
export class AuthenticationService {
  private readonly userService: UserService;
  private readonly securityService: SecurityService;
  private readonly loggerService: LoggerService;
  private readonly configService: ConfigService;

  constructor(userService: UserService, securityService: SecurityService, loggerService: LoggerService, configService: ConfigService) {
    this.userService = userService;
    this.securityService = securityService;
    this.loggerService = loggerService;
    this.configService = configService;
  }

  public async signUp(payload: SignUpDTO | string): Promise<IPlainUser> {
    try {
      if (typeof payload === 'string') {
        const googleUser = await this.googleOAuthVerification(payload);
        const user = await this.userService.createUser({ ...googleUser, authenticationMethod: AuthenticationMethod.GOOGLE_OAUTH });
        return user;
      }
      const user = await this.userService.createUser({ ...payload, verified: false, status: Status.INACTIVE });
      await this.securityService.sendVerificationLink(user.emailAddress, 'Verify Email', EmailPurpose.EMAIL_VERIFICATION);
      return user;
    } catch (error) {
      this.loggerService.log(JSON.stringify({ event: 'error_signing_up_user', description: error.message, level: LEVEL.CRITICAL }));
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);
    }
  }

  public async signIn(payload: SignInDTO | string): Promise<IPlainUser> {
    try {
      let user: UserDocument;
      if (typeof payload === 'string') {
        const googleUser = await this.googleOAuthVerification(payload);
        user = await this.userService.findByEmailAddress(googleUser.emailAddress);
      } else {
        const { emailAddress, password } = payload;
        user = await this.userService.findByEmailAddress(emailAddress);
        const passwordMatched = await this.securityService.compare(password, user.password);
        if (!passwordMatched) throw new BadRequestException(ErrorMessages.INVALID_LOGIN);
      }
      const userObject = user.toObject({ versionKey: false });
      const { password, role, ...userWithoutPassword } = userObject;
      return userWithoutPassword as IPlainUser;
    } catch (error) {
      this.loggerService.log(JSON.stringify({ event: 'error_signing_in_user', description: error.message, level: LEVEL.CRITICAL }));
      if (error instanceof BadRequestException) throw error;
      if (error instanceof NotFoundException) throw new BadRequestException(ErrorMessages.INVALID_LOGIN);
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);
    }
  }

  private async googleOAuthVerification(token: string): Promise<IUser> {
    const ticket = await Client.verifyIdToken({ idToken: token, audience: this.configService.get<string>('GOOGLE_CLIENT_KEY') });
    const googlePayload = ticket.getPayload();
    if (!googlePayload) throw new BadRequestException(ErrorMessages.GOOGLE_OAUTH_FAILED);
    if (!googlePayload.given_name || !googlePayload.family_name || !googlePayload.email || !googlePayload.email_verified || !googlePayload.picture) throw new BadRequestException(ErrorMessages.GOOGLE_OAUTH_FAILED);
    if (!googlePayload.email_verified) throw new BadRequestException(ErrorMessages.GOOGLE_OAUTH_FAILED);
    const googleUser = { firstName: googlePayload.given_name, lastName: googlePayload.family_name, emailAddress: googlePayload.email, verified: googlePayload.email_verified, avatarUrl: googlePayload.picture, status: Status.ACTIVE };
    return googleUser;
  }
}
