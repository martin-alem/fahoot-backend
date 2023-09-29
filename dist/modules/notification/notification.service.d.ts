import { OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from './../rabbitmq/rabbitmq.service';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './../logger/logger.service';
export declare class NotificationService implements OnModuleInit {
    private channel;
    private readonly rabbitMQService;
    private readonly configService;
    private readonly loggerService;
    constructor(rabbitMQService: RabbitMQService, loggerService: LoggerService, configService: ConfigService);
    onModuleInit(): Promise<void>;
    enqueueNotification(message: string): boolean;
    private sendEmail;
    private processLogMessage;
}
