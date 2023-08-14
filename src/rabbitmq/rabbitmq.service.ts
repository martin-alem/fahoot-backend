import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { connect, Connection, Channel } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleDestroy {
  private connection: Connection;
  private channel: Channel;

  async connect(): Promise<void> {
    this.connection = await connect('amqp://localhost');
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
