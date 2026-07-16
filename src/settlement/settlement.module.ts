import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropositionEntity } from '../proposition/entities/proposition.entity';
import { BetEntity } from '../bet/entities/bet.entity';
import { BetSettlementEntity } from '../bet/entities/bet-settlement.entity';
import { UserEntity } from '../user/entities/user.entity';
import { SettlementService } from './settlement.service';
import { SettlementSchedule } from './settlement.schedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PropositionEntity,
      BetEntity,
      BetSettlementEntity,
      UserEntity,
    ]),
  ],
  providers: [SettlementService, SettlementSchedule],
})
export class SettlementModule {}
