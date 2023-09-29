import { SignUpDTO } from './dto/signup.dto';
import { AuthenticationService } from './authentication.service';
import { SignInDTO } from './dto/signin.dto';
import { User } from '../user/schema/user.schema';
import { LoggerService } from '../logger/logger.service';
import { Request, Response } from 'express';
import { SecurityService } from '../security/security.service';
import { IAuthUser } from 'src/types/user.types';
import { GoogleOAuthDTO } from './dto/google_auth.dto';
export declare class AuthenticationController {
    private readonly authenticationService;
    private readonly loggerService;
    private readonly securityService;
    constructor(authenticationService: AuthenticationService, securityService: SecurityService, loggerService: LoggerService);
    signup(payload: SignUpDTO, request: Request, response: Response): Promise<User>;
    googleSignup(payload: GoogleOAuthDTO, request: Request, response: Response): Promise<User>;
    signin(payload: SignInDTO, request: Request, response: Response): Promise<User>;
    googleSignin(payload: GoogleOAuthDTO, request: Request, response: Response): Promise<User>;
    autoLogin(request: Request): Promise<IAuthUser>;
    logout(response: Response): void;
    clearRememberMe(response: Response): void;
}
