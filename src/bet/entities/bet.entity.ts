import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../user/entities/user.entity';
import { PropositionEntity } from '../../proposition/entities/proposition.entity';
import { BetSettlementEntity } from './bet-settlement.entity';

@Entity('bets', { comment: 'User positions' })
export class BetEntity {
  @ApiProperty({ description: 'Unique identifier for the bet' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'UUID of the user who placed the bet' })
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ApiProperty({ description: 'UUID of the proposition being bet on' })
  @Column({ name: 'proposition_id', type: 'uuid' })
  propositionId: string;

  @ApiProperty({
    description: 'The proposition being bet on',
    type: () => PropositionEntity,
    required: false,
  })
  @ManyToOne(() => PropositionEntity)
  @JoinColumn({ name: 'proposition_id' })
  proposition: PropositionEntity;

  @ApiProperty({
    description: 'User pick — true for YES, false for NO',
    example: true,
  })
  @Column({ type: 'boolean', comment: 'true for YES, false for NO' })
  pick: boolean;

  @ApiProperty({ description: 'Amount of USDC bet', example: 10.0 })
  @Column({ type: 'numeric', comment: 'Amount of USDC bet' })
  stake: number;

  @ApiProperty({ description: 'Potential payout in USDC', example: 24.39 })
  @Column({
    type: 'numeric',
    name: 'potential_win',
    comment: 'Potential payout',
  })
  potentialWin: number;

  @ApiProperty({
    description: 'Bet status — active, pending, won, lost',
    example: 'active',
  })
  @Column({
    type: 'varchar',
    length: 50,
    comment: 'active, pending, won, lost',
  })
  status: string;

  @ApiProperty({ description: 'Timestamp when the bet was created' })
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({
    required: false,
    nullable: true,
    description: 'On-chain market identifier this bet was placed against',
  })
  @Column({ name: 'market_id', type: 'varchar', length: 150, nullable: true })
  marketId: string;

  @ApiProperty({
    required: false,
    nullable: true,
    description: 'Position id returned by SolanaService.placeBet',
  })
  @Column({ name: 'position_id', type: 'varchar', length: 150, nullable: true })
  positionId: string;

  @ApiProperty({
    required: false,
    nullable: true,
    description: 'Solana tx signature for the place_bet call',
  })
  @Column({
    name: 'place_bet_tx_sig',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  placeBetTxSig: string;

  @OneToOne(() => BetSettlementEntity, (settlement) => settlement.bet)
  settlement: BetSettlementEntity;
}
