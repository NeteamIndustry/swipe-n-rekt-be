import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { BetSettlementEntity } from '../entities/bet-settlement.entity';

@Injectable()
export class BetSettlementRepository extends Repository<BetSettlementEntity> {
  constructor(private dataSource: DataSource) {
    super(BetSettlementEntity, dataSource.createEntityManager());
  }
}
