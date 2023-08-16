import { Injectable } from '@nestjs/common';
import { PingResponse } from '../types/ping-response.type';

@Injectable()
export class AppService {
  checkStatus(): PingResponse {
    return {
      status: 'success',
      message: 'Server is up and running',
      timestamp: new Date().toISOString(),
    };
  }
}
