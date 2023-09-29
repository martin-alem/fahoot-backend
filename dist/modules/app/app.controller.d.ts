import { AppService } from './app.service';
import { PingResponse } from 'src/types/ping-response.type';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    checkStatus(): PingResponse;
}
