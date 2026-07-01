import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { MatchEntity } from '../entities/match.entity';

@Injectable()
export class MatchRepository extends Repository<MatchEntity> {
  constructor(private dataSource: DataSource) {
    super(MatchEntity, dataSource.createEntityManager());
  }
}
