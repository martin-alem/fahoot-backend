import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { RabbitMQModule } from './../rabbitmq/rabbitmq.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Log, LogsSchema } from './schema/log.schema';

@Module({
  imports: [
    RabbitMQModule,
    MongooseModule.forFeature([{ name: Log.name, schema: LogsSchema }]),
  ],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
