import { UseFilters } from '@nestjs/common';
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GatewayExceptionsFilter } from 'src/exception/gateway.exception';
import { SecurityService } from '../security/security.service';
import { ISocketAuth } from 'src/types/user.types';
import { SocketDataService } from '../shared/socket.data';
import { Events, PLAY_NAMESPACE } from 'src/utils/constant';
import { EventData } from 'src/wrapper/event.data';

@UseFilters(GatewayExceptionsFilter)
@WebSocketGateway({ cors: { origin: ['https://fahoot.com', 'http://localhost:8000'] }, namespace: PLAY_NAMESPACE })
export class PlayService implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server: Server;
  private readonly securityService: SecurityService;
  private readonly socketDataService: SocketDataService;

  constructor(securityService: SecurityService, socketDataService: SocketDataService) {
    this.securityService = securityService;
    this.socketDataService = socketDataService;
  }
  public async handleConnection(client: Socket): Promise<void> {
    try {
      const cookie = client.handshake.headers.cookie;
      if (!cookie) {
        const data = { message: 'Invalid token' };
        client.emit(Events.ERROR, new EventData(Events.ERROR, data, PLAY_NAMESPACE, null, null));
        client.disconnect(true);
        return;
      }
      const result = await this.securityService.validateToken<ISocketAuth>(cookie);

      const resultData = result.getData();

      if (!resultData) {
        const data = { message: 'Unable to verify token' };
        client.emit(Events.ERROR, new EventData(Events.ERROR, data, PLAY_NAMESPACE, null, null));
        client.disconnect(true);
        return;
      }

      this.socketDataService.setSocketData(client, resultData);

      console.log(resultData);
      await client.join(resultData.room);

      const data = { message: 'Connection successfully established' };
      client.emit(Events.ERROR, new EventData(Events.ERROR, data, PLAY_NAMESPACE, null, resultData.room));
    } catch (error) {
      const data = { message: 'Unable to establish connection' };
      client.emit(Events.ERROR, new EventData(Events.ERROR, data, PLAY_NAMESPACE, null, null));
      client.disconnect(true);
      return;
    }
  }

  handleDisconnect(client: Socket): void {
    const data = { message: 'Connection successfully terminated' };
    const room = this.socketDataService.getSocketData(client)?.room ?? null;
    const recipient = this.socketDataService.getSocketData(client)?.id ?? null;
    client.emit(Events.DISCONNECT, new EventData(Events.DISCONNECT, data, PLAY_NAMESPACE, recipient, room));
  }

  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    return data;
  }
}
