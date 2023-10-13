import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Log, LogsSchema } from './schema/log.schema';
import { DEFAULT_DATABASE_CONNECTION } from './../../utils/constant';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [MongooseModule.forFeature([{ name: Log.name, schema: LogsSchema }], DEFAULT_DATABASE_CONNECTION), ConfigModule],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
