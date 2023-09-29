import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { QuestionDTO } from './question.typeDTO';
import { Type } from 'class-transformer';
import { SettingDTO } from './settings.typeDTO';
import { QuizStatus } from './../../../utils/constant';

export class CreateQuizDTO {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsEnum(QuizStatus)
  @IsOptional()
  status: string;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => QuestionDTO)
  questions: QuestionDTO[];

  @IsNotEmpty()
  settings: SettingDTO;
}
