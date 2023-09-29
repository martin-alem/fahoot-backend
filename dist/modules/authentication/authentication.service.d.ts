import { UserService } from '../user/user.service';
import { SecurityService } from '../security/security.service';
import { IUser } from './../../types/user.types';
import { SignUpDTO } from './dto/signup.dto';
import { ConfigService } from '@nestjs/config';
import { SignInDTO } from './dto/signin.dto';
import { UserDocument } from '../user/schema/user.schema';
export declare class AuthenticationService {
    private readonly userService;
    private readonly securityService;
    private readonly configService;
    constructor(userService: UserService, securityService: SecurityService, configService: ConfigService);
    signUp(payload: SignUpDTO): Promise<UserDocument>;
    googleSignUp(payload: string): Promise<UserDocument>;
    signIn(payload: SignInDTO): Promise<UserDocument>;
    googleSignIn(payload: string): Promise<UserDocument>;
    googleOAuthVerification(token: string): Promise<IUser>;
}
