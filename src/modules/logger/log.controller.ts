import { Body, Controller, Post } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { Throttle } from '@nestjs/throttler';
import { LOGOUT_REQUEST } from 'src/utils/constant';

@Controller('log')
export class LogController {
  private readonly loggerService: LoggerService;

  constructor(LoggerService: LoggerService) {
    this.loggerService = LoggerService;
  }
  @Throttle(LOGOUT_REQUEST.LIMIT, LOGOUT_REQUEST.TTL)
  @Post()
  public log(@Body() payload: string): void {
    try {
      console.log(payload);
      this.loggerService.log(JSON.stringify(payload));
      return;
    } catch (error) {
      throw error;
    }
  }
}
