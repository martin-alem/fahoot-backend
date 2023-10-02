import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Log, LogsSchema } from './schema/log.schema';
import { DEFAULT_DATABASE_CONNECTION } from './../../utils/constant';
import { LogController } from './log.controller';
import { APIKeyMiddleware } from 'src/middleware/apikey.middleware';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from '../shared/shared.module';

@Global()
@Module({
  imports: [MongooseModule.forFeature([{ name: Log.name, schema: LogsSchema }], DEFAULT_DATABASE_CONNECTION), ConfigModule, SharedModule],
  controllers: [LogController],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(APIKeyMiddleware).forRoutes(LogController);
  }
}
