import { UserService } from '../user/user.service';
import { SecurityService } from '../security/security.service';
import { IUser } from './../../types/user.types';
import { SignUpDTO } from './dto/signup.dto';
import { ConfigService } from '@nestjs/config';
import { SignInDTO } from './dto/signin.dto';
import { UserDocument } from '../user/schema/user.schema';
import Result from 'src/wrapper/result';
export declare class AuthenticationService {
    private readonly userService;
    private readonly securityService;
    private readonly configService;
    constructor(userService: UserService, securityService: SecurityService, configService: ConfigService);
    signUp(payload: SignUpDTO): Promise<Result<UserDocument | null>>;
    googleSignUp(payload: string): Promise<Result<UserDocument | null>>;
    signIn(payload: SignInDTO): Promise<Result<UserDocument | null>>;
    googleSignIn(payload: string): Promise<Result<UserDocument | null>>;
    googleOAuthVerification(token: string): Promise<Result<IUser | null>>;
}
