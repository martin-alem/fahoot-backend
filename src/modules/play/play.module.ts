import { Module } from '@nestjs/common';
import { PlayService } from './play.service';
import { SecurityModule } from '../security/security.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SecurityModule, SharedModule],
  providers: [PlayService],
})
export class PlayModule {}
