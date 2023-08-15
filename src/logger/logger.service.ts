import { Injectable, OnModuleInit } from '@nestjs/common';
import { Channel, ConsumeMessage } from 'amqplib';
import { RabbitMQService } from './../rabbitmq/rabbitmq.service';
import { Model } from 'mongoose';
import { Log } from './schema/log.schema';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationOptions, PaginationResult } from 'src/shared/types/pagination.types';
import { FilterDTO } from './dto/filter.dto';

@Injectable()
export class LoggerService implements OnModuleInit {
  private channel: Channel;
  private readonly rabbitMQService: RabbitMQService;
  private readonly LogModel: Model<Log>;

  constructor(rabbitMQService: RabbitMQService, @InjectModel(Log.name) LogModel: Model<Log>) {
    this.rabbitMQService = rabbitMQService;
    this.LogModel = LogModel;
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
    this.LogModel.create(log).catch((error) => console.error('Error processing log message:', error));
  }

  public async getLogs(filterOption: Partial<FilterDTO>, pagination: PaginationOptions): Promise<PaginationResult<Log>> {
    const { page, pageSize } = pagination;

    const total = await this.LogModel.countDocuments(filterOption); // The total number of matching records
    const totalPages = Math.ceil(total / pageSize); // The total number of pages

    const skip = (page - 1) * pageSize; // The number of records to skip

    const sortField = pagination.sortField ?? 'createdAt';
    const sortOrder = pagination.sortOrder === 'desc' ? -1 : 1;

    const results = await this.LogModel.find(filterOption)
      .sort({ [sortField]: sortOrder }) // Dynamic sorting
      .skip(skip)
      .limit(pageSize)
      .exec();

    return { results, total, totalPages };
  }
}
