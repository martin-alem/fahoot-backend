import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class OptionDTO {
  @IsNotEmpty()
  @IsBoolean()
  isCorrect: boolean;

  @IsNotEmpty()
  @IsString()
  option: string;

  @IsNotEmpty()
  @IsString()
  colorLabel: string;
}
