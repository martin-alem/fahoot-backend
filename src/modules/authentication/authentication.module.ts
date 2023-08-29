import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { APIKeyMiddleware } from 'src/middleware/apikey.middleware';
import { AuthenticationController } from './authentication.controller';
import { UserModule } from '../user/user.module';
import { SecurityModule } from '../security/security.module';
import { LoggerModule } from '../logger/logger.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [UserModule, SecurityModule, LoggerModule, SharedModule],
  providers: [AuthenticationService],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(APIKeyMiddleware).forRoutes(AuthenticationController);
  }
}
