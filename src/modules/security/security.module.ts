import { MiddlewareConsumer, Module, NestModule, forwardRef } from '@nestjs/common';
import { SecurityService } from './security.service';
import { SecurityController } from './security.controller';
import { Token, TokenSchema } from './schema/tokens.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { APIKeyMiddleware } from './../../middleware/apikey.middleware';
import { DEFAULT_DATABASE_CONNECTION } from './../../utils/constant';
import { UserModule } from '../user/user.module';
import { AccessTokenMiddleware } from 'src/middleware/access_token.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }], DEFAULT_DATABASE_CONNECTION),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    forwardRef(() => UserModule),
  ],
  providers: [SecurityService],
  controllers: [SecurityController],
  exports: [SecurityService],
})
export class SecurityModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(APIKeyMiddleware, AccessTokenMiddleware).forRoutes(SecurityController);
  }
}
