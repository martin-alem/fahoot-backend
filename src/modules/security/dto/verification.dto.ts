import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { EmailPurpose } from 'src/utils/constant';

export class VerificationLinkDTO {
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
