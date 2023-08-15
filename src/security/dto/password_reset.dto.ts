import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { IsValidPassword } from './../../shared/decorator/validation/isValidPassword.decorator';

export class PasswordResetDTO {
  @IsNotEmpty()
  @IsEmail()
  emailAddress: string;

  @IsNotEmpty()
  @IsValidPassword({
    message: 'Invalid password. It must contain at least 1 lowercase letter, 1 uppercase letter, 1 digit, 1 special character (!@#$%), and be 8-64 characters long',
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  token: string;
}
