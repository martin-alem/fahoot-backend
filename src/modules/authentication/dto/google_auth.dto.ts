import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleOAuthDTO {
  @IsNotEmpty()
  @IsString()
  credential: string;
}
