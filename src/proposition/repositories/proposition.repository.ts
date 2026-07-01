import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { PropositionEntity } from '../entities/proposition.entity';

@Injectable()
export class PropositionRepository extends Repository<PropositionEntity> {
  constructor(private dataSource: DataSource) {
    super(PropositionEntity, dataSource.createEntityManager());
  }
}
