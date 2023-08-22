import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, IsUrl, ValidateNested } from 'class-validator';
import { OptionDTO } from './option.typeDTO';

export class QuestionDTO {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OptionDTO)
  options: OptionDTO[];

  @IsNotEmpty()
  @IsNumber()
  duration: number;

  @IsNotEmpty()
  @IsNumber()
  points: number;

  @IsNotEmpty()
  @IsUrl()
  mediaUrl: string;
}
