import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { InternalServerErrorException, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './modules/app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter } from './exception/global.exception';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.enableCors({
    origin: function (origin, callback) {
      const allowedOrigins = ['http://localhost:8000', 'https://fahoot.com', 'https://www.fahoot.com'];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new InternalServerErrorException('Not allowed by CORS'));
      }
    },
    credentials: true, // include this line to allow cookies
    allowedHeaders: ['Access-Control-Allow-Origin', 'Content-Type', 'Authorization'], // Allow necessary headers
  });

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      disableErrorMessages: process.env.NODE_ENV === 'production' ? true : false,
    }),
  );

  const config = new DocumentBuilder().setTitle('Fahoot API').setDescription('Fahoot API documentation').setVersion('1.0').addTag('Fahoot').build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((error) => console.error(error));
