import { AuthenticationMethod } from './../../../utils/constant';
export declare class SignInDTO {
    emailAddress: string;
    password: string;
    authenticationMethod: AuthenticationMethod;
    rememberMe: boolean;
}
