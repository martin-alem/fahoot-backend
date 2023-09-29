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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const rabbitmq_service_1 = require("./../rabbitmq/rabbitmq.service");
const nodemailer = require("nodemailer");
const config_1 = require("@nestjs/config");
const logger_service_1 = require("./../logger/logger.service");
const notification_type_1 = require("./../../types/notification.type");
const helper_1 = require("./../../utils/helper");
const log_types_1 = require("./../../types/log.types");
let NotificationService = exports.NotificationService = class NotificationService {
    constructor(rabbitMQService, loggerService, configService) {
        this.rabbitMQService = rabbitMQService;
        this.configService = configService;
        this.loggerService = loggerService;
    }
    async onModuleInit() {
        await this.rabbitMQService.connect();
        this.channel = this.rabbitMQService.getChannel();
        await this.channel.assertQueue('notifications');
        await this.channel.consume('notifications', this.processLogMessage.bind(this));
    }
    enqueueNotification(message) {
        const channel = this.rabbitMQService.getChannel();
        return channel.sendToQueue('notifications', Buffer.from(message));
    }
    sendEmail(payload) {
        const { to, subject, message } = payload;
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            secure: false,
            auth: {
                user: this.configService.get('GMAIL_EMAIL'),
                pass: this.configService.get('GMAIL_PASSWORD'),
            },
        });
        const mailOptions = {
            from: {
                name: 'Fahoot',
                address: this.configService.get('GMAIL') ?? 'alemajohmartin@gmail.com',
            },
            to: to,
            subject: subject,
            html: message,
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                (0, helper_1.log)(this.loggerService, 'send_email_error', error.message);
            }
            else {
                (0, helper_1.log)(this.loggerService, 'send_email_success', info.messageId, undefined, log_types_1.LEVEL.INFO);
            }
        });
    }
    processLogMessage(msg) {
        const message = JSON.parse(msg.content.toString());
        if (message.type === notification_type_1.NotificationType.EMAIL) {
            this.sendEmail(message.payload);
        }
        this.channel.ack(msg);
    }
};
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rabbitmq_service_1.RabbitMQService, logger_service_1.LoggerService, config_1.ConfigService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map