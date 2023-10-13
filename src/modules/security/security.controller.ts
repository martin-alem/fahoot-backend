import { BadRequestException, Body, Controller, Post, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { SecurityService } from './security.service';
import { Response } from 'express';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  EMAIL_VERIFICATION_REQUEST,
  PASSWORD_RESET,
  PASSWORD_RESET_REQUEST,
  REMEMBER_ME_COOKIE_NAME,
  SEND_VERIFICATION_EMAIL_REQUEST,
  Status,
  UPDATE_EMAIL_REQUEST,
  UPDATE_PASSWORD_REQUEST,
} from './../../utils/constant';
import { Throttle } from '@nestjs/throttler';
import { VerificationEmailDTO } from './dto/verification.dto';
import { PasswordResetRequestDTO } from './dto/password_reset_request.dto';
import { PasswordResetDTO } from './dto/password_reset.dto';
import { clearCookie, handleResult } from './../../utils/helper';
import { Active, Role } from './../../decorator/auth.decorator';
import { UserRole } from './../../types/user.types';
import { AuthorizationGuard } from './../../guard/auth.guard';
import { UpdatePasswordDTO } from './dto/update_password.dto';
import { UpdateEmailDTO } from './dto/update_email.dto';
import { AuthService } from '../shared/auth.service';
import { ResponseInterceptor } from 'src/interceptor/response.interceptor';
import { UserShape } from '../authentication/response/UserShape';
import { User } from '../user/schema/user.schema';

@Controller('security')
export class SecurityController {
  private readonly securityService: SecurityService;
  private readonly authService: AuthService;

  constructor(securityService: SecurityService, authService: AuthService) {
    this.securityService = securityService;
    this.authService = authService;
  }

  @Throttle(EMAIL_VERIFICATION_REQUEST.LIMIT, EMAIL_VERIFICATION_REQUEST.TTL)
  @UseInterceptors(new ResponseInterceptor(UserShape))
  @Post('/email_verification')
  public async emailVerification(@Body('token') token: string): Promise<User> {
    try {
      const result = await this.securityService.verifyEmail(token);
      return handleResult<User>(result);
    } catch (error) {
      throw error;
    }
  }

  @Throttle(UPDATE_PASSWORD_REQUEST.LIMIT, UPDATE_PASSWORD_REQUEST.TTL)
  @Role([UserRole.CREATOR])
  @Active([Status.ACTIVE])
  @UseGuards(AuthorizationGuard)
  @UseInterceptors(new ResponseInterceptor(UserShape))
  @Post('/update_password')
  public async updatePassword(@Body() payload: UpdatePasswordDTO, @Res({ passthrough: true }) response: Response): Promise<User> {
    try {
      const id = this.authService.getId();
      const { oldPassword, newPassword } = payload;
      const result = await this.securityService.updatePassword(oldPassword, newPassword, id);

      const resultData = result.getData();
      if (!resultData) throw new BadRequestException(result.getError());

      clearCookie(response, {}, ACCESS_TOKEN_COOKIE_NAME, REMEMBER_ME_COOKIE_NAME);
      return handleResult<User>(result);
    } catch (error) {
      throw error;
    }
  }

  @Throttle(UPDATE_EMAIL_REQUEST.LIMIT, UPDATE_EMAIL_REQUEST.TTL)
  @Role([UserRole.CREATOR])
  @Active([Status.ACTIVE])
  @UseGuards(AuthorizationGuard)
  @Post('/update_email')
  public async updateEmailAddress(@Body() payload: UpdateEmailDTO, @Res({ passthrough: true }) response: Response): Promise<User> {
    try {
      const id = this.authService.getId();
      const { emailAddress } = payload;
      const result = await this.securityService.updateEmail(emailAddress, id);
      const resultData = result.getData();

      if (!resultData) throw new BadRequestException(result.getError());

      clearCookie(response, {}, ACCESS_TOKEN_COOKIE_NAME, REMEMBER_ME_COOKIE_NAME);
      return handleResult<User>(result);
    } catch (error) {
      throw error;
    }
  }

  @Throttle(SEND_VERIFICATION_EMAIL_REQUEST.LIMIT, SEND_VERIFICATION_EMAIL_REQUEST.TTL)
  @Role([UserRole.CREATOR])
  @Active([Status.INACTIVE])
  @UseGuards(AuthorizationGuard)
  @Post('/send_verification_email')
  public async sendVerificationEmail(@Body() payload: VerificationEmailDTO): Promise<boolean> {
    try {
      const { emailAddress, subject, emailPurpose } = payload;
      const result = await this.securityService.queueVerificationEmail(emailAddress, subject, emailPurpose);
      return handleResult<boolean>(result);
    } catch (error) {
      throw error;
    }
  }

  @Throttle(PASSWORD_RESET_REQUEST.LIMIT, PASSWORD_RESET_REQUEST.TTL)
  @Post('/password_reset_request')
  public async passwordResetRequest(@Body() payload: PasswordResetRequestDTO): Promise<boolean> {
    try {
      const { emailAddress } = payload;
      const result = await this.securityService.passwordResetRequest(emailAddress);
      return handleResult<boolean>(result);
    } catch (error) {
      throw error;
    }
  }

  @Throttle(PASSWORD_RESET.LIMIT, PASSWORD_RESET.TTL)
  @Post('/password_reset')
  public async passwordReset(@Body() payload: PasswordResetDTO): Promise<boolean> {
    try {
      const { password, token } = payload;
      const result = await this.securityService.passwordReset(token, password);
      return handleResult<boolean>(result);
    } catch (error) {
      throw error;
    }
  }
}
