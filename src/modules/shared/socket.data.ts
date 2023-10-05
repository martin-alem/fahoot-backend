import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { ISocketAuth } from 'src/types/user.types';

@Injectable()
export class SocketDataService {
  private readonly socketData = new Map<string, ISocketAuth>();

  setSocketData(socket: Socket, data: ISocketAuth): void {
    this.socketData.set(socket.id, data);
  }

  getSocketData(socket: Socket): ISocketAuth | undefined {
    return this.socketData.get(socket.id);
  }

  clearSocketData(socket: Socket): void {
    this.socketData.delete(socket.id);
  }
}
