import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Log, LogsSchema } from './schema/log.schema';

@Global()
@Module({
  imports: [MongooseModule.forFeature([{ name: Log.name, schema: LogsSchema }])],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
