/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { SecurityService } from '../security/security.service';
import { IUser } from './../../types/user.types';
import { SignUpDTO } from './dto/signup.dto';
import { AuthenticationMethod, EmailPurpose, ErrorMessages, Status } from './../../utils/constant';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { SignInDTO } from './dto/signin.dto';
import { UserDocument } from '../user/schema/user.schema';
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

  public async signUp(payload: SignUpDTO): Promise<UserDocument> {
    try {
      const user = await this.userService.createUser({ ...payload, verified: false, status: Status.INACTIVE });
      await this.securityService.queueVerificationEmail(user.emailAddress, 'Verify Email', EmailPurpose.EMAIL_VERIFICATION);
      return user;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);
    }
  }

  public async googleSignUp(payload: string): Promise<UserDocument> {
    try {
      const googleUser = await this.googleOAuthVerification(payload);
      const user = await this.userService.createUser({ ...googleUser, authenticationMethod: AuthenticationMethod.GOOGLE_OAUTH });
      return user;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);
    }
  }

  public async signIn(payload: SignInDTO): Promise<UserDocument> {
    try {
      const { emailAddress, password } = payload;
      const user = await this.userService.findByEmailAddress(emailAddress);
      const passwordMatched = await this.securityService.compare(password, user.password);
      if (!passwordMatched) throw new BadRequestException(ErrorMessages.INVALID_LOGIN);
      return user;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      if (error instanceof NotFoundException) throw new BadRequestException(ErrorMessages.INVALID_LOGIN);
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);
    }
  }

  public async googleSignIn(payload: string): Promise<UserDocument> {
    try {
      const googleUser = await this.googleOAuthVerification(payload);
      const user = await this.userService.findByEmailAddress(googleUser.emailAddress);
      return user;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      if (error instanceof NotFoundException) throw new BadRequestException(ErrorMessages.INVALID_LOGIN);
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);
    }
  }

  public async googleOAuthVerification(token: string): Promise<IUser> {
    const ticket = await Client.verifyIdToken({ idToken: token, audience: this.configService.get<string>('GOOGLE_CLIENT_KEY') });
    const googlePayload = ticket.getPayload();
    if (!googlePayload) throw new BadRequestException(ErrorMessages.GOOGLE_OAUTH_FAILED);
    if (!googlePayload.given_name || !googlePayload.family_name || !googlePayload.email || !googlePayload.email_verified || !googlePayload.picture)
      throw new BadRequestException(ErrorMessages.GOOGLE_OAUTH_FAILED);
    if (!googlePayload.email_verified) throw new BadRequestException(ErrorMessages.GOOGLE_OAUTH_FAILED);
    const googleUser = {
      firstName: googlePayload.given_name,
      lastName: googlePayload.family_name,
      emailAddress: googlePayload.email,
      verified: googlePayload.email_verified,
      avatarUrl: googlePayload.picture,
      status: Status.ACTIVE,
    };
    return googleUser;
  }
}
