import { Injectable, OnModuleInit } from '@nestjs/common';
import { Channel, ConsumeMessage } from 'amqplib';
import { RabbitMQService } from './../rabbitmq/rabbitmq.service';
import { Model } from 'mongoose';
import { Log } from './schema/log.schema';
import { InjectModel } from '@nestjs/mongoose';
import { DEFAULT_DATABASE_CONNECTION } from './../../utils/constant';

@Injectable()
export class LoggerService implements OnModuleInit {
  private channel: Channel;
  private readonly rabbitMQService: RabbitMQService;
  private readonly logModel: Model<Log>;

  constructor(rabbitMQService: RabbitMQService, @InjectModel(Log.name, DEFAULT_DATABASE_CONNECTION) logModel: Model<Log>) {
    this.rabbitMQService = rabbitMQService;
    this.logModel = logModel;
  }

  public async onModuleInit(): Promise<void> {
    await this.rabbitMQService.connect();
    this.channel = this.rabbitMQService.getChannel();
    await this.channel.assertQueue('logs');
    await this.channel.consume('logs', this.processLogMessage.bind(this));
  }

  public log(message: string): boolean {
    const channel = this.rabbitMQService.getChannel();
    return channel.sendToQueue('logs', Buffer.from(message));
  }

  private processLogMessage(msg: ConsumeMessage): void {
    const log = JSON.parse(msg.content.toString());
    this.logModel.create(log).catch((error) => console.error('Error processing log message:', error));
    this.channel.ack(msg);
  }
}
