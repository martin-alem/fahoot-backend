import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException, WsResponse } from '@nestjs/websockets';

@Catch(WsException)
export class GatewayExceptionsFilter extends BaseWsExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost): void {
    const ctx = host.switchToWs();
    const client = ctx.getClient();

    const response: WsResponse<WsException> = {
      event: 'error',
      data: exception,
    };

    client.emit(response.event, response.data);

    super.catch(exception, host);
  }
}
