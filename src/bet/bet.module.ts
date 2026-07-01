import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BetEntity } from './entities/bet.entity';
import { BetSettlementEntity } from './entities/bet-settlement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BetEntity, BetSettlementEntity])],
})
export class BetModule {}
