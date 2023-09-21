import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, IsUrl, ValidateNested, IsEnum } from 'class-validator';
import { OptionDTO } from './option.typeDTO';
import { QuestionType } from './../../../utils/constant';

export class QuestionDTO {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsEnum(QuestionType)
  questionType: string;

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
