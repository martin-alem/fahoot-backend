/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { SecurityService } from '../security/security.service';
import { IUser } from './../../types/user.types';
import { SignUpDTO } from './dto/signup.dto';
import { AuthenticationMethod, EmailPurpose, ErrorMessages, Status } from './../../utils/constant';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { SignInDTO } from './dto/signin.dto';
import { UserDocument } from '../user/schema/user.schema';
import Result from 'src/wrapper/result';
const Client = new OAuth2Client();

/**
 * Authentication Service responsible for signing up, logging in and logging out users.
 * @author Martin Alemajoh
 * @version 1.0
 */
@Injectable()
export class AuthenticationService {
  private readonly userService: UserService;
  private readonly securityService: SecurityService;
  private readonly configService: ConfigService;

  constructor(userService: UserService, securityService: SecurityService, configService: ConfigService) {
    this.userService = userService;
    this.securityService = securityService;
    this.configService = configService;
  }

  public async signUp(payload: SignUpDTO): Promise<Result<UserDocument | null>> {
    try {
      const user = await this.userService.createUser({ ...payload, verified: false, status: Status.INACTIVE });
      const userData = user.getData();
      if (!userData) return new Result<null>(false, null, 'Could not create user', HttpStatus.BAD_REQUEST);

      const result = await this.securityService.queueVerificationEmail(userData.emailAddress, 'Verify Email', EmailPurpose.EMAIL_VERIFICATION);

      if (!result.isSuccess) return new Result<null>(false, null, 'Could not enqueue verification email', HttpStatus.BAD_REQUEST);

      return new Result<UserDocument>(true, userData, null, HttpStatus.OK);
    } catch (error) {
      return new Result<null>(false, null, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async googleSignUp(payload: string): Promise<Result<UserDocument | null>> {
    try {
      const googleUser = await this.googleOAuthVerification(payload);
      const googleUserData = googleUser.getData();
      if (!googleUserData) return new Result<null>(false, null, 'Could not get user data from google', HttpStatus.BAD_REQUEST);

      const user = await this.userService.createUser({ ...googleUserData, authenticationMethod: AuthenticationMethod.GOOGLE_OAUTH });
      const userData = user.getData();
      if (!userData) return new Result<null>(false, null, 'Could not create user using google account', HttpStatus.BAD_REQUEST);

      return new Result<UserDocument>(true, userData, null, HttpStatus.OK);
    } catch (error) {
      return new Result<null>(false, null, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async signIn(payload: SignInDTO): Promise<Result<UserDocument | null>> {
    try {
      const { emailAddress, password } = payload;
      const user = await this.userService.findByEmailAddress(emailAddress);
      const userData = user.getData();
      if (!userData) return new Result<null>(false, null, 'Could not find email address', HttpStatus.BAD_REQUEST);

      const passwordMatched = await this.securityService.compare(password, userData.password);
      if (!passwordMatched.getData()) return new Result<null>(false, null, 'Invalid password', HttpStatus.BAD_REQUEST);

      return new Result<UserDocument>(true, userData, null, HttpStatus.OK);
    } catch (error) {
      return new Result<null>(false, null, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async googleSignIn(payload: string): Promise<Result<UserDocument | null>> {
    try {
      const googleUser = await this.googleOAuthVerification(payload);
      const googleUserData = googleUser.getData();
      if (!googleUserData) return new Result<null>(false, null, 'Could not get user data from google', HttpStatus.BAD_REQUEST);

      const user = await this.userService.findByEmailAddress(googleUserData.emailAddress);
      const userData = user.getData();
      if (!userData) return new Result<null>(false, null, 'Could not find email address for google signin', HttpStatus.BAD_REQUEST);

      return new Result<UserDocument>(true, userData, null, HttpStatus.OK);
    } catch (error) {
      return new Result<null>(false, null, error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async googleOAuthVerification(token: string): Promise<Result<IUser | null>> {
    const ticket = await Client.verifyIdToken({ idToken: token, audience: this.configService.get<string>('GOOGLE_CLIENT_KEY') });
    const googlePayload = ticket.getPayload();
    if (!googlePayload) throw new BadRequestException(ErrorMessages.GOOGLE_OAUTH_FAILED);
    if (!googlePayload.given_name || !googlePayload.family_name || !googlePayload.email || !googlePayload.email_verified || !googlePayload.picture) {
      return new Result<null>(false, null, 'Invalid google payload', HttpStatus.BAD_REQUEST);
    }
    if (!googlePayload.email_verified) return new Result<null>(false, null, 'Google authentication failed', HttpStatus.BAD_REQUEST);
    const googleUser = {
      firstName: googlePayload.given_name,
      lastName: googlePayload.family_name,
      emailAddress: googlePayload.email,
      verified: googlePayload.email_verified,
      avatarUrl: googlePayload.picture,
      status: Status.ACTIVE,
    };
    return new Result<IUser>(true, googleUser, null, HttpStatus.OK);
  }
}
