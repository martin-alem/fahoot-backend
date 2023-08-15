import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { RabbitMQModule } from './../rabbitmq/rabbitmq.module';
import { LoggerModule } from './../logger/logger.module';

@Module({
  imports: [RabbitMQModule, LoggerModule],
  providers: [NotificationService],
})
export class NotificationModule {}
