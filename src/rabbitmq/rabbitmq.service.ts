import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Connection, Channel } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleDestroy {
  private connection: Connection;
  private channel: Channel;
  private readonly configService: ConfigService;

  constructor(configService: ConfigService) {
    this.configService = configService;
  }

  async connect(): Promise<void> {
    this.connection = await connect(
      this.configService.get<string>('RABBITMQ_URI') ?? 'amqp://localhost',
    );
    this.channel = await this.connection.createChannel();
    console.log('RabbitMQ connected.'); // Debugging statement
  }

  getChannel(): Channel {
    return this.channel;
  }

  async close(): Promise<void> {
    await this.channel.close();
    await this.connection.close();
  }

  async onModuleDestroy(): Promise<void> {
    await this.close();
  }
}
