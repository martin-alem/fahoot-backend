import { Injectable, OnModuleInit } from '@nestjs/common';
import { Channel, ConsumeMessage } from 'amqplib';
import { RabbitMQService } from './../rabbitmq/rabbitmq.service';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './../logger/logger.service';
import { IEmailOption, INotification, NotificationType } from './../../types/notification.type';
import { log } from './../../utils/helper';
import { LEVEL } from './../../types/log.types';

@Injectable()
export class NotificationService implements OnModuleInit {
  private channel: Channel;
  private readonly rabbitMQService: RabbitMQService;
  private readonly configService: ConfigService;
  private readonly loggerService: LoggerService;

  constructor(rabbitMQService: RabbitMQService, loggerService: LoggerService, configService: ConfigService) {
    this.rabbitMQService = rabbitMQService;
    this.configService = configService;
    this.loggerService = loggerService;
  }

  public async onModuleInit(): Promise<void> {
    await this.rabbitMQService.connect();
    this.channel = this.rabbitMQService.getChannel();
    await this.channel.assertQueue('notifications');
    await this.channel.consume('notifications', this.processLogMessage.bind(this));
  }

  public enqueueNotification(message: string): boolean {
    const channel = this.rabbitMQService.getChannel();
    return channel.sendToQueue('notifications', Buffer.from(message));
  }

  private sendEmail(payload: IEmailOption): void {
    const { to, subject, message } = payload;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: false,
      auth: {
        user: this.configService.get<string>('GMAIL_EMAIL'),
        pass: this.configService.get<string>('GMAIL_PASSWORD'),
      },
    });

    const mailOptions = {
      from: {
        name: 'Fahoot',
        address: this.configService.get<string>('GMAIL') ?? 'alemajohmartin@gmail.com',
      },
      to: to,
      subject: subject,
      html: message,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        log(this.loggerService, 'send_email_error', error.message);
      } else {
        log(this.loggerService, 'send_email_success', info.messageId, LEVEL.INFO);
      }
    });
  }

  private processLogMessage(msg: ConsumeMessage): void {
    const message = JSON.parse(msg.content.toString()) as INotification;
    if (message.type === NotificationType.EMAIL) {
      this.sendEmail(message.payload as IEmailOption);
    }
    this.channel.ack(msg);
  }
}
