import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './update.service';
import { APIKeyMiddleware } from './../../middleware/apikey.middleware';
import { AuthenticationMiddleware } from './../../middleware/auth.middleware';
import { SharedModule } from '../shared/shared.module';
import { SecurityModule } from '../security/security.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [SharedModule, SecurityModule, UserModule],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(APIKeyMiddleware, AuthenticationMiddleware).forRoutes(UploadController);
  }
}
