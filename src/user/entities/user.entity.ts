import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserPackEntity } from './user-pack.entity';
import { UserCardEntity } from './user-card.entity';

@Entity('users')
export class UserEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid', { comment: 'Unique identifier for the user' })
  id: string;

  @ApiProperty({ required: false, nullable: true })
  @Column({ type: 'varchar', length: 100, nullable: true })
  username: string;

  @Column({
    name: 'wallet_address',
    type: 'varchar',
    length: 200,
    nullable: true,
    comment: 'e.g., 7xKp...9fA2',
  })
  walletAddress: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'string acak',
  })
  nonce: string;

  @ApiProperty({ required: false, nullable: true })
  @Column({
    name: 'balance_usdc',
    type: 'numeric',
    precision: 18,
    scale: 4,
    nullable: true,
  })
  balanceUsdc: number;

  @ApiProperty({ required: false, nullable: true })
  @Column({
    name: 'win_rate_percentage',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: 'e.g., 61.0',
  })
  winRatePercentage: number;

  @ApiProperty({ required: false, nullable: true })
  @Column({ name: 'best_streak', type: 'int', nullable: true })
  bestStreak: number;

  @ApiProperty({ required: false, nullable: true })
  @Column({ name: 'current_streak', type: 'int', nullable: true })
  currentStreak: number;

  @ApiProperty({ required: false, nullable: true })
  @Column({
    name: 'net_pnl',
    type: 'numeric',
    precision: 18,
    scale: 4,
    nullable: true,
    comment: 'e.g., 640.00',
  })
  netPnl: number;

  @ApiProperty({ required: false, nullable: true })
  @Column({ name: 'total_predictions', type: 'int', nullable: true })
  totalPredictions: number;

  @ApiProperty({ required: false, nullable: true, type: String })
  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date;

  @ApiProperty({
    type: UserPackEntity,
    isArray: true,
    required: false,
  })
  @OneToMany(() => UserPackEntity, (userPack) => userPack.user)
  @JoinColumn({ name: 'id', referencedColumnName: 'user_id' })
  userPacks: UserPackEntity[];

  @ApiProperty({
    type: UserCardEntity,
    isArray: true,
    required: false,
  })
  @OneToMany(() => UserCardEntity, (userCard) => userCard.user)
  @JoinColumn({ name: 'id', referencedColumnName: 'user_id' })
  userCards: UserCardEntity[];
}
