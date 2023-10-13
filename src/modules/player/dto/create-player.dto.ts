import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePlayerDTO {
  @IsNotEmpty()
  @IsString()
  playId: string;

  @IsNotEmpty()
  @IsString()
  nickName: string;
}
