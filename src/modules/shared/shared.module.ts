import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TransactionManager } from './transaction.manager';

@Global()
@Module({
  providers: [AuthService, TransactionManager],
  exports: [AuthService, TransactionManager],
})
export class SharedModule {}
