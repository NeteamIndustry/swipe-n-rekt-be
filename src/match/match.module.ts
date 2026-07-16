import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';
import { MatchEntity } from './entities/match.entity';
import { MatchRepository } from './repositories/match.repository';
import { TxlineService } from './txline.service';
import { MatchSchedule } from './match.schedule';

@Module({
  imports: [TypeOrmModule.forFeature([MatchEntity])],
  controllers: [MatchController],
  providers: [MatchService, MatchRepository, TxlineService, MatchSchedule],
  exports: [MatchRepository],
})
export class MatchModule {}
