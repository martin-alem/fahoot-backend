import { MiddlewareConsumer, Module, NestModule, RequestMethod, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Player, PlayerSchema } from './schema/player.schema';
import { DEFAULT_DATABASE_CONNECTION } from 'src/utils/constant';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { APIKeyMiddleware } from 'src/middleware/apikey.middleware';
import { PlayModule } from '../play/play.module';
import { SecurityModule } from '../security/security.module';
import { GameTokenMiddleware } from 'src/middleware/game_token.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Player.name, schema: PlayerSchema }], DEFAULT_DATABASE_CONNECTION),
    forwardRef(() => PlayModule),
    SecurityModule,
  ],
  providers: [PlayerService],
  controllers: [PlayerController],
  exports: [PlayerService],
})
export class PlayerModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(APIKeyMiddleware, GameTokenMiddleware).exclude({ path: '/player', method: RequestMethod.POST }).forRoutes(PlayerController);
  }
}
