import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CardEntity } from '../entities/card.entity';

@Injectable()
export class CardRepository extends Repository<CardEntity> {
  constructor(private dataSource: DataSource) {
    super(CardEntity, dataSource.createEntityManager());
  }
}
