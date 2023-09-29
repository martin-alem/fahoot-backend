"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = void 0;
const common_1 = require("@nestjs/common");
const rabbitmq_service_1 = require("./../rabbitmq/rabbitmq.service");
const mongoose_1 = require("mongoose");
const log_schema_1 = require("./schema/log.schema");
const mongoose_2 = require("@nestjs/mongoose");
const constant_1 = require("./../../utils/constant");
let LoggerService = exports.LoggerService = class LoggerService {
    constructor(rabbitMQService, logModel) {
        this.rabbitMQService = rabbitMQService;
        this.logModel = logModel;
    }
    async onModuleInit() {
        await this.rabbitMQService.connect();
        this.channel = this.rabbitMQService.getChannel();
        await this.channel.assertQueue('logs');
        await this.channel.consume('logs', this.processLogMessage.bind(this));
    }
    log(message) {
        const channel = this.rabbitMQService.getChannel();
        return channel.sendToQueue('logs', Buffer.from(message));
    }
    processLogMessage(msg) {
        const log = JSON.parse(msg.content.toString());
        this.logModel.create(log).catch((error) => console.error('Error processing log message:', error));
        this.channel.ack(msg);
    }
    async getLogs(filterOption, pagination) {
        const { page, pageSize } = pagination;
        const total = await this.logModel.countDocuments(filterOption);
        const totalPages = Math.ceil(total / pageSize);
        const skip = (page - 1) * pageSize;
        const sortField = pagination.sortField ?? 'createdAt';
        const sortOrder = pagination.sortOrder === 'desc' ? -1 : 1;
        const results = await this.logModel
            .find(filterOption)
            .sort({ [sortField]: sortOrder })
            .skip(skip)
            .limit(pageSize)
            .exec();
        return { results, total, totalPages };
    }
};
exports.LoggerService = LoggerService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_2.InjectModel)(log_schema_1.Log.name, constant_1.DEFAULT_DATABASE_CONNECTION)),
    __metadata("design:paramtypes", [rabbitmq_service_1.RabbitMQService, mongoose_1.Model])
], LoggerService);
//# sourceMappingURL=logger.service.js.map