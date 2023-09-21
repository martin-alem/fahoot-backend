import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TransactionManager } from './transaction.manager';

@Module({
  providers: [AuthService, TransactionManager],
  exports: [AuthService, TransactionManager],
})
export class SharedModule {}
