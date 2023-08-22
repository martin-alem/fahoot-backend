import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PingResponse } from 'src/types/ping-response.type';

@Controller()
export class AppController {
  private readonly appService: AppService;
  constructor(appService: AppService) {
    this.appService = appService;
  }

  @Get()
  checkStatus(): PingResponse {
    return this.appService.checkStatus();
  }
}
