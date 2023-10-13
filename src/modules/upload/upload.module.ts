import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './update.service';
import { APIKeyMiddleware } from './../../middleware/apikey.middleware';
import { AccessTokenMiddleware } from 'src/middleware/access_token.middleware';

@Module({
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(APIKeyMiddleware, AccessTokenMiddleware).forRoutes(UploadController);
  }
}
