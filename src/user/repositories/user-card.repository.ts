import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { UserCardEntity } from '../entities/user-card.entity';

@Injectable()
export class UserCardRepository extends Repository<UserCardEntity> {
  constructor(private dataSource: DataSource) {
    super(UserCardEntity, dataSource.createEntityManager());
  }
}
