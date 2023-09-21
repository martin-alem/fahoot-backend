import { MiddlewareConsumer, Module, NestModule, forwardRef } from '@nestjs/common';
import { SecurityService } from './security.service';
import { SecurityController } from './security.controller';
import { Token, TokenSchema } from './schema/tokens.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { SharedModule } from './../shared/shared.module';
import { APIKeyMiddleware } from 'src/middleware/apikey.middleware';

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
  }
}