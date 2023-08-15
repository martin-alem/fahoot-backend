import { IsEmail, IsNotEmpty } from 'class-validator';

export class PasswordResetRequestDTO {
  @IsNotEmpty()
  @IsEmail()
  emailAddress: string;
}
