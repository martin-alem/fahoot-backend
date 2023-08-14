import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import helmet from 'helmet';
import { InternalServerErrorException } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.enableCors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        'http://localhost:8000',
        'http://localhost',
        'https://fahoot.com',
        'https://www.fahoot.com',
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new InternalServerErrorException('Not allowed by CORS'));
      }
    },
    credentials: true, // include this line to allow cookies
    allowedHeaders: [
      'Access-Control-Allow-Origin',
      'Content-Type',
      'Authorization',
    ], // Allow necessary headers
  });
  await app.listen(3000);
}
bootstrap().catch((error) => console.error(error));
