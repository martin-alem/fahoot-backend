import { MiddlewareConsumer, Module, NestModule, RequestMethod, forwardRef } from '@nestjs/common';
import { PlayGateway } from './play.gateway';
import { Play, PlaySchema } from './schema/play.schema';
import { DEFAULT_DATABASE_CONNECTION } from 'src/utils/constant';
import { MongooseModule } from '@nestjs/mongoose';
import { PlayController } from './play.controller';
import { PlayService } from './play.service';
import { APIKeyMiddleware } from 'src/middleware/apikey.middleware';
import { QuizModule } from '../quiz/quiz.module';
import { SecurityModule } from '../security/security.module';
import { PlayerModule } from '../player/player.module';
import { AccessTokenMiddleware } from 'src/middleware/access_token.middleware';
import { GameTokenMiddleware } from 'src/middleware/game_token.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Play.name, schema: PlaySchema }], DEFAULT_DATABASE_CONNECTION),
    QuizModule,
    SecurityModule,
    forwardRef(() => PlayerModule),
  ],
  controllers: [PlayController],
  providers: [PlayGateway, PlayService],
  exports: [PlayService],
})
export class PlayModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(APIKeyMiddleware).forRoutes(PlayController);
    consumer
      .apply(AccessTokenMiddleware)
      .exclude({ path: '/play/pin/:pin', method: RequestMethod.GET }, { path: '/play/exit_game', method: RequestMethod.DELETE })
      .forRoutes(
        { path: '/play', method: RequestMethod.POST },
        { path: '/play/id/:playId', method: RequestMethod.GET },
        { path: '/play/list/:quizId', method: RequestMethod.GET },
        { path: '/play/:playId', method: RequestMethod.PATCH },
        { path: '/play/:playId', method: RequestMethod.DELETE },
        { path: '/play/batch/:quizId', method: RequestMethod.DELETE },
      );

    consumer
      .apply(GameTokenMiddleware)
      .exclude({ path: '/play/pin/:pin', method: RequestMethod.GET }, { path: '/play/exit_game', method: RequestMethod.DELETE })
      .forRoutes({ path: '/play', method: RequestMethod.GET });
  }
}
