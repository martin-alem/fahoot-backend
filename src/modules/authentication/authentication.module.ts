import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { APIKeyMiddleware } from 'src/middleware/apikey.middleware';
import { AuthenticationController } from './authentication.controller';
import { UserModule } from '../user/user.module';
import { SecurityModule } from '../security/security.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [UserModule, SecurityModule, LoggerModule],
  providers: [AuthenticationService],
  controllers: [AuthenticationController],
})
export class AuthenticationModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(APIKeyMiddleware).forRoutes(AuthenticationController);
  }
}
