import { MiddlewareConsumer, Module, NestModule, RequestMethod, forwardRef } from '@nestjs/common';
import { SecurityService } from './security.service';
import { SecurityController } from './security.controller';
import { Token, TokenSchema } from './schema/tokens.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { SharedModule } from './../shared/shared.module';
import { APIKeyMiddleware } from './../../middleware/apikey.middleware';
import { AuthenticationMiddleware } from './../../middleware/auth.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
    forwardRef(() => UserModule),
    SharedModule,
  ],
  providers: [SecurityService],
  controllers: [SecurityController],
  exports: [SecurityService],
})
export class SecurityModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(APIKeyMiddleware).forRoutes(SecurityController);
    consumer
      .apply(AuthenticationMiddleware)
      .forRoutes({ path: 'security/updatePassword', method: RequestMethod.POST }, { path: 'security/updateEmail', method: RequestMethod.POST });
  }
}
