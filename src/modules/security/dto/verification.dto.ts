import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { EmailPurpose } from './../../../utils/constant';

export class VerificationEmailDTO {
  @IsNotEmpty()
  @IsEmail()
  emailAddress: string;

  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsEnum(EmailPurpose)
  emailPurpose: EmailPurpose;
}
