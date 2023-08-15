import { Module } from '@nestjs/common';
import { SecurityService } from './security.service';
import { SecurityController } from './security.controller';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { Token, TokenSchema } from './schema/tokens.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [ThrottlerModule, MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }])],
  providers: [
    SecurityService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  controllers: [SecurityController],
})
export class SecurityModule {}
