import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid', { comment: 'Unique identifier for the user' })
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  username: string;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
    comment: 'e.g., 7xKp...9fA2',
  })
  wallet_address: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'string acak',
  })
  nonce: string;

  @Column({ type: 'numeric', precision: 18, scale: 4, nullable: true })
  balance_usdc: number;

  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: 'e.g., 61.0',
  })
  win_rate_percentage: number;

  @Column({ type: 'int', nullable: true })
  best_streak: number;

  @Column({ type: 'int', nullable: true })
  current_streak: number;

  @Column({
    type: 'numeric',
    precision: 18,
    scale: 4,
    nullable: true,
    comment: 'e.g., 640.00',
  })
  net_pnl: number;

  @Column({ type: 'int', nullable: true })
  total_predictions: number;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  created_at: Date;
}
