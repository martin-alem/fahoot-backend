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

@Module({
  imports: [
    UserModule,
    AuthenticationModule,
    SecurityModule,
    NotificationModule,
    QuizModule,
    ParticipationModule,
    AnalyticsModule,
    LoggerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
