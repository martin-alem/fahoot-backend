import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { GameExitType } from 'src/utils/constant';

export class ExitGameDTO {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  room: string;

  @IsNotEmpty()
  @IsEnum(GameExitType)
  reason: GameExitType;
}
