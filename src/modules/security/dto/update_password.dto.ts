import { IsNotEmpty } from 'class-validator';
import { IsValidPassword } from './../../../decorator/validation/isValidPassword.decorator';

export class UpdatePasswordDTO {
  @IsNotEmpty()
  @IsValidPassword({
    message:
      'Invalid password. It must contain at least 1 lowercase letter, 1 uppercase letter, 1 digit, 1 special character (!@#$%), and be 8-64 characters long',
  })
  oldPassword: string;

  @IsNotEmpty()
  @IsValidPassword({
    message:
      'Invalid password. It must contain at least 1 lowercase letter, 1 uppercase letter, 1 digit, 1 special character (!@#$%), and be 8-64 characters long',
  })
  newPassword: string;
}
