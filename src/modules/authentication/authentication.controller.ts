import { BadRequestException, Body, Controller, Delete, Post, Req, Res, UseInterceptors } from '@nestjs/common';
import { SignUpDTO } from './dto/signup.dto';
import { AuthenticationService } from './authentication.service';
import { SignInDTO } from './dto/signin.dto';
import { Throttle } from '@nestjs/throttler';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  COOKIE,
  JWT_TTL,
  LOGOUT_REQUEST,
  REMEMBER_ME_COOKIE_NAME,
  SIGNIN_REQUEST,
  SIGNUP_REQUEST,
} from './../../utils/constant';
import { User } from '../user/schema/user.schema';
import { LoggerService } from '../logger/logger.service';
import { Request, Response } from 'express';
import { clearCookie, handleResult, log, setCookie } from './../../utils/helper';
import { SecurityService } from '../security/security.service';
import { ResponseInterceptor } from './../../interceptor/response.interceptor';
import { UserShape } from './response/UserShape';
import { IAuthUser } from 'src/types/user.types';
import { GoogleOAuthDTO } from './dto/google_auth.dto';

@Controller('authentication')
export class AuthenticationController {
  private readonly authenticationService: AuthenticationService;
  private readonly loggerService: LoggerService;
  private readonly securityService: SecurityService;

  constructor(authenticationService: AuthenticationService, securityService: SecurityService, loggerService: LoggerService) {
    this.authenticationService = authenticationService;
    this.loggerService = loggerService;
    this.securityService = securityService;
  }

  @Throttle(SIGNUP_REQUEST.LIMIT, SIGNUP_REQUEST.TTL)
  @UseInterceptors(new ResponseInterceptor(UserShape))
  @Post('/signup')
  public async signup(@Body() payload: SignUpDTO, @Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<User> {
    try {
      const user = await this.authenticationService.signUp(payload);
      const userData = user.getData();
      if (!userData) throw new BadRequestException('Unable to signup user');

      const accessToken = await this.securityService.generateTokens(
        { id: userData._id, emailAddress: userData.emailAddress, role: userData.role },
        JWT_TTL.ACCESS_TOKEN_TTL,
      );

      const accessTokenData = accessToken.getData();
      if (!accessTokenData) throw new BadRequestException('Could not generate access token');

      setCookie(response, ACCESS_TOKEN_COOKIE_NAME, accessTokenData, COOKIE.ACCESS_TOKEN_COOKIE_TTL);
      return handleResult<User>(user);
    } catch (error) {
      log(this.loggerService, 'manual_signup-error', error.message, request);
      throw error;
    }
  }

  @Throttle(SIGNUP_REQUEST.LIMIT, SIGNUP_REQUEST.TTL)
  @Post('/google_signup')
  public async googleSignup(@Body() payload: GoogleOAuthDTO, @Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<User> {
    try {
      const user = await this.authenticationService.googleSignUp(payload.credential);
      const userData = user.getData();
      if (!userData) throw new BadRequestException('Unable to signup user using google');

      const accessToken = await this.securityService.generateTokens(
        { id: userData._id, emailAddress: userData.emailAddress, role: userData.role },
        JWT_TTL.ACCESS_TOKEN_TTL,
      );

      const accessTokenData = accessToken.getData();
      if (!accessTokenData) throw new BadRequestException('Could not generate access token');

      setCookie(response, ACCESS_TOKEN_COOKIE_NAME, accessTokenData, COOKIE.ACCESS_TOKEN_COOKIE_TTL);
      return handleResult<User>(user);
    } catch (error) {
      log(this.loggerService, 'google_signup-error', error.message, request);
      throw error;
    }
  }

  @Throttle(SIGNIN_REQUEST.LIMIT, SIGNIN_REQUEST.TTL)
  @UseInterceptors(new ResponseInterceptor(UserShape))
  @Post('/signin')
  public async signin(@Body() payload: SignInDTO, @Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<User> {
    try {
      const user = await this.authenticationService.signIn(payload);
      const userData = user.getData();
      if (!userData) throw new BadRequestException('Unable to signin user');

      const accessToken = await this.securityService.generateTokens(
        { id: userData._id, emailAddress: userData.emailAddress, role: userData.role },
        JWT_TTL.ACCESS_TOKEN_TTL,
      );
      const rememberMeToken = await this.securityService.generateTokens(
        { id: userData._id, emailAddress: userData.emailAddress, role: userData.role },
        JWT_TTL.REMEMBER_ME_TOKEN_TTL,
      );
      const accessTokenData = accessToken.getData();
      if (!accessTokenData) throw new BadRequestException('Could not generate access token');

      const rememberMeTokenData = rememberMeToken.getData();
      if (!rememberMeTokenData) throw new BadRequestException('Could not generate rememberMe token');

      setCookie(response, ACCESS_TOKEN_COOKIE_NAME, accessTokenData, COOKIE.ACCESS_TOKEN_COOKIE_TTL);
      if (payload.rememberMe) setCookie(response, REMEMBER_ME_COOKIE_NAME, rememberMeTokenData, COOKIE.REMEMBER_ME_COOKIE_TTL);

      return handleResult<User>(user);
    } catch (error) {
      log(this.loggerService, 'manual_signin-error', error.message, request);
      throw error;
    }
  }

  @Throttle(SIGNIN_REQUEST.LIMIT, SIGNIN_REQUEST.TTL)
  @Post('/google_signin')
  public async googleSignin(@Body() payload: GoogleOAuthDTO, @Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<User> {
    try {
      const user = await this.authenticationService.googleSignIn(payload.credential);
      const userData = user.getData();
      if (!userData) throw new BadRequestException('Unable to signin user using google');

      const accessToken = await this.securityService.generateTokens(
        { id: userData._id, emailAddress: userData.emailAddress, role: userData.role },
        JWT_TTL.ACCESS_TOKEN_TTL,
      );

      const accessTokenData = accessToken.getData();
      if (!accessTokenData) throw new BadRequestException('Could not generate access token');
      setCookie(response, ACCESS_TOKEN_COOKIE_NAME, accessTokenData, COOKIE.ACCESS_TOKEN_COOKIE_TTL);

      return handleResult<User>(user);
    } catch (error) {
      log(this.loggerService, 'google_signin-error', error.message, request);
      throw error;
    }
  }

  @Throttle(SIGNIN_REQUEST.LIMIT, SIGNIN_REQUEST.TTL)
  @Post('/auto_login')
  public async autoLogin(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<IAuthUser | null> {
    try {
      const tokenCookie = request.cookies[REMEMBER_ME_COOKIE_NAME];
      if (!tokenCookie) {
        response.status(204);
        return null;
      }
      const decodedPayload = await this.securityService.validateToken(tokenCookie);

      if (!decodedPayload.isSuccess()) throw new BadRequestException('Unable to decode payload');

      return handleResult<IAuthUser | null>(decodedPayload);
    } catch (error) {
      log(this.loggerService, 'auto_signin-error', error.message, request);
      throw error;
    }
  }

  @Throttle(LOGOUT_REQUEST.LIMIT, LOGOUT_REQUEST.TTL)
  @Delete('/logout')
  public logout(@Res({ passthrough: true }) response: Response): void {
    clearCookie(response, {}, ACCESS_TOKEN_COOKIE_NAME);
  }

  @Throttle(LOGOUT_REQUEST.LIMIT, LOGOUT_REQUEST.TTL)
  @Delete('/remember_me')
  public clearRememberMe(@Res({ passthrough: true }) response: Response): void {
    clearCookie(response, {}, REMEMBER_ME_COOKIE_NAME);
  }
}
