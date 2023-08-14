import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { RabbitMQModule } from 'src/rabbitmq/rabbitmq.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [RabbitMQModule, LoggerModule],
  providers: [NotificationService],
})
export class NotificationModule {}
