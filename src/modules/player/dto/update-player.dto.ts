import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePlayerDTO {
  @IsNotEmpty()
  @IsString()
  nickName: string;
}
