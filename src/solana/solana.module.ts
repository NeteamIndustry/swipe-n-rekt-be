import { Global, Module } from '@nestjs/common';
import { SolanaService } from './solana.service';
import { SolanaMockService } from './solana-mock.service';

// Global so bet/settlement/user/album modules can inject SolanaService
// without each importing this module. Swapping mock -> real Anchor client
// later is a one-line change to `useClass` here (plan doc section 3.2).
@Global()
@Module({
  providers: [{ provide: SolanaService, useClass: SolanaMockService }],
  exports: [SolanaService],
})
export class SolanaModule {}
