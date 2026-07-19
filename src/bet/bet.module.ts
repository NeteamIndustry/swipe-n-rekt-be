import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BetEntity } from './entities/bet.entity';
import { BetSettlementEntity } from './entities/bet-settlement.entity';
import { PropositionEntity } from '../proposition/entities/proposition.entity';
import { UserEntity } from '../user/entities/user.entity';
import { BetController } from './bet.controller';
import { BetService } from './bet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SolanaModule } from '../solana/solana.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BetEntity,
      BetSettlementEntity,
      PropositionEntity,
      UserEntity,
    ]),
    SolanaModule,
  ],
  controllers: [BetController],
  providers: [BetService, JwtAuthGuard],
})
export class BetModule {}
