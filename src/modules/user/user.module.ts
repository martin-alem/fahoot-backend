import { MiddlewareConsumer, Module, NestModule, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { User, UserSchema } from './schema/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { SecurityModule } from './../security/security.module';
import { UserController } from './user.controller';
import { SharedModule } from './../shared/shared.module';
import { APIKeyMiddleware } from './../../middleware/apikey.middleware';
import { AuthenticationMiddleware } from './../../middleware/auth.middleware';
import { DEFAULT_DATABASE_CONNECTION } from './../../utils/constant';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }], DEFAULT_DATABASE_CONNECTION),
    forwardRef(() => SecurityModule),
    SharedModule,
  ],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(APIKeyMiddleware, AuthenticationMiddleware).forRoutes(UserController);
  }
}
