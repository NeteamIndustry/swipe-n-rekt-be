import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CardEntity } from './card.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('albums')
export class AlbumEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid', {
    comment: 'Collection sets, e.g., Brazil, Argentina',
  })
  id: string;

  @ApiProperty({ required: false, nullable: true })
  @Column({
    name: 'country_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  countryName: string;

  @ApiProperty({ required: false, nullable: true })
  @Column({
    name: 'total_cards_required',
    type: 'int',
    nullable: true,
    comment: 'e.g., 26',
  })
  totalCardsRequired: number;

  @ApiProperty({ required: false, nullable: true })
  @Column({
    name: 'reward_type',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'e.g., LEGENDARY CHAMPION',
  })
  rewardType: string;

  @ApiProperty({ type: CardEntity, isArray: true })
  @OneToMany(() => CardEntity, (card) => card.album)
  @JoinColumn({ name: 'id' })
  cards: CardEntity[];
}
