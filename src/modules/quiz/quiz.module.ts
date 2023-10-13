import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Quiz, QuizSchema } from './schema/quiz.schema';
import { QuizController } from './quiz.controller';
import { DEFAULT_DATABASE_CONNECTION } from './../../utils/constant';
import { APIKeyMiddleware } from './../../middleware/apikey.middleware';
import { AccessTokenMiddleware } from 'src/middleware/access_token.middleware';

@Module({
  imports: [MongooseModule.forFeature([{ name: Quiz.name, schema: QuizSchema }], DEFAULT_DATABASE_CONNECTION)],
  providers: [QuizService],
  controllers: [QuizController],
  exports: [QuizService],
})
export class QuizModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(APIKeyMiddleware, AccessTokenMiddleware).forRoutes(QuizController);
  }
}
