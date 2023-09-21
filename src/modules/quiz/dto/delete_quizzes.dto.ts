import { IsArray, IsNotEmpty } from 'class-validator';

export class DeleteQuizzesDTO {
  @IsNotEmpty()
  @IsArray()
  quizId: string[];
}
