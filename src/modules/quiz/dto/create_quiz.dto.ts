import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { QuestionDTO } from './question.typeDTO';
import { Type } from 'class-transformer';
import { SettingDTO } from './settings.typeDTO';

export class CreateQuizDTO {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => QuestionDTO)
  questions: QuestionDTO[];

  @IsNotEmpty()
  @Type(() => SettingDTO)
  settings: SettingDTO;
}
