import { MiddlewareConsumer, Module, NestModule, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { User, UserSchema } from './schema/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { APIKeyMiddleware } from './../../middleware/apikey.middleware';
import { DEFAULT_DATABASE_CONNECTION } from './../../utils/constant';
import { SecurityModule } from '../security/security.module';
import { AccessTokenMiddleware } from 'src/middleware/access_token.middleware';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }], DEFAULT_DATABASE_CONNECTION), forwardRef(() => SecurityModule)],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(APIKeyMiddleware, AccessTokenMiddleware).forRoutes(UserController);
  }
}
