import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropositionController } from './proposition.controller';
import { PropositionService } from './proposition.service';
import { PropositionEntity } from './entities/proposition.entity';
import { PropositionRepository } from './repositories/proposition.repository';
import { PropositionSchedule } from './proposition.schedule';
import { AiModule } from 'src/ai/ai.module';
import { MatchModule } from 'src/match/match.module';
import { SolanaModule } from 'src/solana/solana.module';
import { BetEntity } from 'src/bet/entities/bet.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PropositionEntity, BetEntity]),
    AiModule,
    MatchModule,
    SolanaModule,
  ],
  controllers: [PropositionController],
  providers: [PropositionService, PropositionRepository, PropositionSchedule],
  exports: [PropositionRepository],
})
export class PropositionModule {}
