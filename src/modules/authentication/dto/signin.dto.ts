import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AuthenticationMethod } from './../../../utils/constant';

export class SignInDTO {
  @IsNotEmpty()
  @IsEmail()
  emailAddress: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsEnum(AuthenticationMethod)
  authenticationMethod: AuthenticationMethod;

  @IsOptional()
  @IsBoolean()
  rememberMe: boolean;
}
