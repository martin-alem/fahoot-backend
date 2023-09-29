import { OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from './../rabbitmq/rabbitmq.service';
import { Model } from 'mongoose';
import { Log } from './schema/log.schema';
import { PaginationOptions, PaginationResult } from 'src/types/pagination.types';
import { FilterDTO } from './dto/filter.dto';
export declare class LoggerService implements OnModuleInit {
    private channel;
    private readonly rabbitMQService;
    private readonly logModel;
    constructor(rabbitMQService: RabbitMQService, logModel: Model<Log>);
    onModuleInit(): Promise<void>;
    log(message: string): boolean;
    private processLogMessage;
    getLogs(filterOption: Partial<FilterDTO>, pagination: PaginationOptions): Promise<PaginationResult<Log>>;
}
