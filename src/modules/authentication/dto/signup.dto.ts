import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { AuthenticationMethod } from './../../../utils/constant';

export class SignUpDTO {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  emailAddress: string;

  @IsNotEmpty()
  @IsEnum(AuthenticationMethod)
  authenticationMethod: AuthenticationMethod;

  @IsNotEmpty()
  @IsString()
  password: string;
}
