import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerificationLinkDTO {
  @IsNotEmpty()
  @IsEmail()
  emailAddress: string;

  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  message: string;
}
