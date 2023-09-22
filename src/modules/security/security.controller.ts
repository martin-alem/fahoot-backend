import { Body, Controller, Post, Query, Req } from '@nestjs/common';
import { SecurityService } from './security.service';
import { Request } from 'express';
import { EMAIL_VERIFICATION_REQUEST, PASSWORD_RESET, PASSWORD_RESET_REQUEST, SEND_VERIFICATION_EMAIL_REQUEST } from './../../utils/constant';
import { Throttle } from '@nestjs/throttler';
import { VerificationEmailDTO } from './dto/verification.dto';
import { PasswordResetRequestDTO } from './dto/password_reset_request.dto';
import { PasswordResetDTO } from './dto/password_reset.dto';
import { log } from './../../utils/helper';
import { LoggerService } from '../logger/logger.service';
import { LEVEL } from './../../types/log.types';

@Controller('security')
export class SecurityController {
  private readonly securityService: SecurityService;
  private readonly loggerService: LoggerService;

  constructor(securityService: SecurityService, loggerService: LoggerService) {
    this.securityService = securityService;
    this.loggerService = loggerService;
  }

  @Throttle(EMAIL_VERIFICATION_REQUEST.LIMIT, EMAIL_VERIFICATION_REQUEST.TTL)
  @Post('/email_verification')
  public async emailVerification(@Query('token') token: string, @Req() request: Request): Promise<void> {
    try {
      await this.securityService.verifyEmail(token);
      return;
    } catch (error) {
      log(this.loggerService, 'get_user_error', error.message, request, LEVEL.CRITICAL);
      throw error;
    }
  }

  @Throttle(SEND_VERIFICATION_EMAIL_REQUEST.LIMIT, SEND_VERIFICATION_EMAIL_REQUEST.TTL)
  @Post('/send_verification_email')
  public async sendVerificationEmail(@Body() payload: VerificationEmailDTO, @Req() request: Request): Promise<void> {
    try {
      const { emailAddress, subject, emailPurpose } = payload;
      await this.securityService.queueVerificationEmail(emailAddress, subject, emailPurpose);
      return;
    } catch (error) {
      log(this.loggerService, 'get_user_error', error.message, request, LEVEL.CRITICAL);
      throw error;
    }
  }

  @Throttle(PASSWORD_RESET_REQUEST.LIMIT, PASSWORD_RESET_REQUEST.TTL)
  @Post('/password_reset_request')
  public async passwordResetRequest(@Body() payload: PasswordResetRequestDTO, @Req() request: Request): Promise<void> {
    try {
      const { emailAddress } = payload;
      await this.securityService.passwordResetRequest(emailAddress);
      return;
    } catch (error) {
      log(this.loggerService, 'get_user_error', error.message, request, LEVEL.CRITICAL);
      throw error;
    }
  }

  @Throttle(PASSWORD_RESET.LIMIT, PASSWORD_RESET.TTL)
  @Post('/password_reset')
  public async passwordReset(@Body() payload: PasswordResetDTO, @Req() request: Request): Promise<void> {
    try {
      const { password, token } = payload;
      await this.securityService.passwordReset(token, password);
      return;
    } catch (error) {
      log(this.loggerService, 'get_user_error', error.message, request, LEVEL.CRITICAL);
      throw error;
    }
  }
}
