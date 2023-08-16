import { Injectable, OnModuleInit } from '@nestjs/common';
import { Channel, ConsumeMessage } from 'amqplib';
import { RabbitMQService } from './../rabbitmq/rabbitmq.service';
import nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { IEmailOption, INotification, NotificationType } from '../types/notification.type';
import { LoggerService } from './../logger/logger.service';

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
      auth: {
        user: this.configService.get<string>('GMAIL_EMAIL'),
        pass: this.configService.get<string>('GMAIL_PASSWORD'),
      },
    });

    const mailOptions = {
      from: this.configService.get<string>('GMAIL'),
      to: to,
      subject: subject,
      text: message,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        this.loggerService.log(
          JSON.stringify({
            event: 'send_email_error',
            description: info.response,
          }),
        );
      } else {
        this.loggerService.log(
          JSON.stringify({
            event: 'send_email_success',
            description: info.response,
          }),
        );
      }
    });
  }

  private processLogMessage(msg: ConsumeMessage): void {
    const message = JSON.parse(msg.content.toString()) as INotification;
    if (message.type === NotificationType.EMAIL) {
      this.sendEmail(message.payload as IEmailOption);
    }
  }
}
