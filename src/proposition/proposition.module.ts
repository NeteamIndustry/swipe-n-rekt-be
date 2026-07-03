import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropositionController } from './proposition.controller';
import { PropositionService } from './proposition.service';
import { PropositionEntity } from './entities/proposition.entity';
import { PropositionRepository } from './repositories/proposition.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PropositionEntity])],
  controllers: [PropositionController],
  providers: [PropositionService, PropositionRepository],
  exports: [PropositionRepository],
})
export class PropositionModule {}
