import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePlayDTO {
  @IsNotEmpty()
  @IsString()
  quizId: string;
}
