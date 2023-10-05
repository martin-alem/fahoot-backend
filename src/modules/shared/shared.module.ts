import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TransactionManager } from './transaction.manager';
import { SocketDataService } from './socket.data';

@Module({
  providers: [AuthService, TransactionManager, SocketDataService],
  exports: [AuthService, TransactionManager, SocketDataService],
})
export class SharedModule {}
