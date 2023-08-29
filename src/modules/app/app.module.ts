import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from '../user/user.module';
import { AuthenticationModule } from '../authentication/authentication.module';
import { SecurityModule } from '../security/security.module';
import { NotificationModule } from '../notification/notification.module';
import { QuizModule } from '../quiz/quiz.module';
import { ParticipationModule } from '../participation/participation.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { LoggerModule } from '../logger/logger.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import * as Joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMQModule } from './../rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    UserModule,
    AuthenticationModule,
    SecurityModule,
    NotificationModule,
    QuizModule,
    ParticipationModule,
    AnalyticsModule,
    LoggerModule,
    RabbitMQModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production').default('development'),
        DATABASE_URL: Joi.string().required(),
        COOKIE_SECRET: Joi.string().required(),
        PORT: Joi.number().default(3000),
        HOST: Joi.string().default('localhost'),
        HTTP_PROTOCOL: Joi.string().default('http'),
        FRONTEND_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_TOKEN_AUDIENCE: Joi.string().required(),
        JWT_TOKEN_ISSUER: Joi.string().required(),
        RABBITMQ_URI: Joi.string().required(),
        GMAIL_EMAIL: Joi.string().required(),
        GMAIL_PASSWORD: Joi.string().required(),
        CLIENT_API_KEY: Joi.string().required(),
        VERIFY_EMAIL_URL: Joi.string().required(),
        PASSWORD_RESET_URL: Joi.string().required(),
        GOOGLE_CLIENT_KEY: Joi.string().required(),
        GOOGLE_SECRET_KEY: Joi.string().required(),
      }),
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule], // import ConfigModule
      inject: [ConfigService], // inject ConfigService
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URL'),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
