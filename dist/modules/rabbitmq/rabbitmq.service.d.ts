import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Channel } from 'amqplib';
export declare class RabbitMQService implements OnModuleDestroy {
    private connection;
    private channel;
    private readonly configService;
    constructor(configService: ConfigService);
    connect(): Promise<void>;
    getChannel(): Channel;
    close(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
