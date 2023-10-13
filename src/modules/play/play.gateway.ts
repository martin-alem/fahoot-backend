import { UseFilters } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GatewayExceptionsFilter } from 'src/exception/gateway.exception';
import { SecurityService } from '../security/security.service';
import { ISocketAuth } from 'src/types/user.types';
import { Events, PLAY_NAMESPACE, PLAY_TOKEN_COOKIE_NAME } from 'src/utils/constant';
import { EventData } from 'src/wrapper/event.data';
import { getCookieValue } from 'src/utils/helper';
import { IEventData } from 'src/types/event_data.type';
import { PlayService } from './play.service';
import { UpdatePlayDTO } from './dto/update-play.dto';
import { PlayerService } from '../player/player.service';

@UseFilters(GatewayExceptionsFilter)
@WebSocketGateway({ cors: { origin: ['https://fahoot.com', 'http://localhost:8000'] }, namespace: PLAY_NAMESPACE })
export class PlayGateway implements OnGatewayConnection {
  @WebSocketServer()
  private readonly server: Server;
  private readonly securityService: SecurityService;
  private readonly playService: PlayService;
  private readonly playerService: PlayerService;

  constructor(securityService: SecurityService, playService: PlayService, playerService: PlayerService) {
    this.securityService = securityService;
    this.playService = playService;
    this.playerService = playerService;
  }
  public async handleConnection(client: Socket): Promise<void> {
    try {
      const cookie = getCookieValue(client.handshake.headers.cookie ?? '', PLAY_TOKEN_COOKIE_NAME);
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

      await client.join(resultData.room);

      const data = { message: 'Connection successfully established' };
      client.emit(Events.CONNECTED, new EventData(Events.CONNECTED, data, PLAY_NAMESPACE, null, resultData.room));
    } catch (error) {
      const data = { message: 'Unable to establish connection because we could authenticate' };
      client.emit(Events.ERROR, new EventData(Events.ERROR, data, PLAY_NAMESPACE, null, null));
      client.disconnect(true);
      return;
    }
  }
  @SubscribeMessage(Events.PLAYER_JOINED)
  joinGame(@MessageBody() data: IEventData, @ConnectedSocket() client: Socket): void {
    if (!data.room) return;
    client.to(data.room).emit(Events.PLAYER_JOINED, data);
  }

  @SubscribeMessage(Events.LOCK_GAME)
  async lockGame(@MessageBody() data: IEventData): Promise<void> {
    if (!data.room) return;
    const updatedPlay = await this.playService.updatePlay(data.data as UpdatePlayDTO, data.room);
    const updatedPlayData = updatedPlay.getData();
    if (updatedPlayData) {
      const newData = new EventData(Events.LOCK_GAME, updatedPlayData, data.namespace, null, data.room);
      this.server.to(data.room).emit(Events.LOCK_GAME, newData);
    }
  }

  @SubscribeMessage(Events.REMOVE_PLAYER)
  async removePlayer(@MessageBody() data: IEventData): Promise<void> {
    if (!data.room) return;
    const deletedPlayer = await this.playerService.deletePlayer(data.data as string);
    const deletedPlayerData = deletedPlayer.getData();
    if (deletedPlayerData) {
      const newData = new EventData(Events.REMOVE_PLAYER, deletedPlayerData, data.namespace, data.data as string, data.room);
      this.server.to(data.room).emit(Events.REMOVE_PLAYER, newData);
    }
  }
}
