import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { PropositionEntity } from '../../proposition/entities/proposition.entity';
import { BetSettlementEntity } from './bet-settlement.entity';

@Entity('bets', { comment: 'User positions' })
export class BetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'proposition_id', type: 'uuid' })
  propositionId: string;

  @ManyToOne(() => PropositionEntity)
  @JoinColumn({ name: 'proposition_id' })
  proposition: PropositionEntity;

  @Column({ type: 'boolean', comment: 'true for YES, false for NO' })
  pick: boolean;

  @Column({ type: 'numeric', comment: 'Amount of USDC bet' })
  stake: number;

  @Column({
    type: 'numeric',
    name: 'potential_win',
    comment: 'Potential payout',
  })
  potentialWin: number;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'active, pending, won, lost',
  })
  status: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @OneToOne(() => BetSettlementEntity, (settlement) => settlement.bet)
  settlement: BetSettlementEntity;
}
