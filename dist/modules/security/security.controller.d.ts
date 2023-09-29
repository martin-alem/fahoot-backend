import { SecurityService } from './security.service';
import { Request, Response } from 'express';
import { VerificationEmailDTO } from './dto/verification.dto';
import { PasswordResetRequestDTO } from './dto/password_reset_request.dto';
import { PasswordResetDTO } from './dto/password_reset.dto';
import { LoggerService } from '../logger/logger.service';
import { UpdatePasswordDTO } from './dto/update_password.dto';
import { UpdateEmailDTO } from './dto/update_email.dto';
import { AuthService } from '../shared/auth.service';
export declare class SecurityController {
    private readonly securityService;
    private readonly loggerService;
    private readonly authService;
    constructor(securityService: SecurityService, loggerService: LoggerService, authService: AuthService);
    emailVerification(token: string, request: Request): Promise<void>;
    updatePassword(payload: UpdatePasswordDTO, request: Request, response: Response): Promise<void>;
    updateEmailAddress(payload: UpdateEmailDTO, request: Request, response: Response): Promise<void>;
    sendVerificationEmail(payload: VerificationEmailDTO, request: Request): Promise<void>;
    passwordResetRequest(payload: PasswordResetRequestDTO, request: Request): Promise<void>;
    passwordReset(payload: PasswordResetDTO, request: Request): Promise<void>;
}
