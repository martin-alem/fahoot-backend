import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Quiz, QuizSchema } from './schema/quiz.schema';
import { QuizController } from './quiz.controller';
import { SharedModule } from '../shared/shared.module';
import { DEFAULT_DATABASE_CONNECTION } from 'src/utils/constant';

@Module({
  imports: [MongooseModule.forFeature([{ name: Quiz.name, schema: QuizSchema }], DEFAULT_DATABASE_CONNECTION), SharedModule],
  providers: [QuizService],
  controllers: [QuizController],
})
export class QuizModule {}
