import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';
import { MatchEntity } from './entities/match.entity';
import { MatchRepository } from './repositories/match.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MatchEntity])],
  controllers: [MatchController],
  providers: [MatchService, MatchRepository],
  exports: [MatchRepository],
})
export class MatchModule {}
