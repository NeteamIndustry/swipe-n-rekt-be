import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user.entity';

@Entity('user_packs', { comment: 'Unopened card packs in inventory' })
export class UserPackEntity {
  @ApiProperty({ description: 'Unopened card packs in inventory' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'ID of the user who owns the pack' })
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.userPacks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ApiProperty({
    description: 'Rarity of the pack: common, uncommon, rare, epic',
  })
  @Column({
    name: 'pack_rarity',
    type: 'varchar',
    length: 50,
    comment: 'common, uncommon, rare, epic',
  })
  packRarity: string;

  @ApiProperty({ description: 'Number of packs of this rarity' })
  @Column({ type: 'int' })
  quantity: number;
}
