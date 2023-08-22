import { Body, Controller, InternalServerErrorException, Post, Query } from '@nestjs/common';
import { SecurityService } from './security.service';
import { EMAIL_VERIFICATION_REQUEST, ErrorMessages, PASSWORD_RESET, PASSWORD_RESET_REQUEST, SEND_VERIFICATION_LINK_REQUEST } from 'src/utils/constant';
import { Throttle } from '@nestjs/throttler';
import { VerificationLinkDTO } from './dto/verification.dto';
import { PasswordResetRequestDTO } from './dto/password_reset_request.dto';
import { PasswordResetDTO } from './dto/password_reset.dto';

@Controller('security')
export class SecurityController {
  private readonly securityService: SecurityService;

  constructor(securityService: SecurityService) {
    this.securityService = securityService;
  }

  @Throttle(EMAIL_VERIFICATION_REQUEST.LIMIT, EMAIL_VERIFICATION_REQUEST.TTL)
  @Post('/email_verification')
  public async emailVerification(@Query('token') token: string): Promise<void> {
    try {
      await this.securityService.verifyEmail(token);
      return;
    } catch (error) {
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);
    }
  }

  @Throttle(SEND_VERIFICATION_LINK_REQUEST.LIMIT, SEND_VERIFICATION_LINK_REQUEST.TTL)
  @Post('/send_verification_link')
  public async sendVerificationLink(@Body() payload: VerificationLinkDTO): Promise<void> {
    try {
      const { emailAddress, subject, emailPurpose } = payload;
      await this.securityService.sendVerificationLink(emailAddress, subject, emailPurpose);
      return;
    } catch (error) {
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);
    }
  }

  @Throttle(PASSWORD_RESET_REQUEST.LIMIT, PASSWORD_RESET_REQUEST.TTL)
  @Post('/password_reset_request')
  public async passwordResetRequest(@Body() payload: PasswordResetRequestDTO): Promise<void> {
    try {
      const { emailAddress } = payload;
      await this.securityService.passwordResetRequest(emailAddress);
      return;
    } catch (error) {
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);
    }
  }

  @Throttle(PASSWORD_RESET.LIMIT, PASSWORD_RESET.TTL)
  @Post('/password_reset')
  public async passwordReset(@Body() payload: PasswordResetDTO): Promise<void> {
    try {
      const { password, token } = payload;
      await this.securityService.passwordReset(token, password);
      return;
    } catch (error) {
      throw new InternalServerErrorException(ErrorMessages.INTERNAL_ERROR);
    }
  }
}
