import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { BetEntity } from '../entities/bet.entity';

@Injectable()
export class BetRepository extends Repository<BetEntity> {
  constructor(private dataSource: DataSource) {
    super(BetEntity, dataSource.createEntityManager());
  }
}
