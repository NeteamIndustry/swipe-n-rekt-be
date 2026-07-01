import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardEntity } from './entities/card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CardEntity])],
})
export class CardModule {}
