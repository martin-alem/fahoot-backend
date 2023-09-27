import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Quiz, QuizSchema } from './schema/quiz.schema';
import { QuizController } from './quiz.controller';
import { SharedModule } from '../shared/shared.module';
import { DEFAULT_DATABASE_CONNECTION } from './../../utils/constant';
import { APIKeyMiddleware } from './../../middleware/apikey.middleware';
import { AuthenticationMiddleware } from './../../middleware/auth.middleware';
import { SecurityModule } from '../security/security.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Quiz.name, schema: QuizSchema }], DEFAULT_DATABASE_CONNECTION),
    SharedModule,
    SecurityModule,
    UserModule,
  ],
  providers: [QuizService],
  controllers: [QuizController],
})
export class QuizModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(APIKeyMiddleware, AuthenticationMiddleware).forRoutes(QuizController);
  }
}
