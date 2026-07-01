import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { BetEntity } from './bet.entity';

@Entity('bet_settlements', { comment: 'On-chain verification receipt' })
export class BetSettlementEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'bet_id', type: 'uuid' })
  betId: string;

  @OneToOne(() => BetEntity, (bet) => bet.settlement)
  @JoinColumn({ name: 'bet_id' })
  bet: BetEntity;

  @Column({ type: 'varchar', length: 50, name: 'oracle_source', comment: 'e.g., TxODDS scores stream' })
  oracleSource: string;

  @Column({ type: 'varchar', length: 200, name: 'merkle_root', nullable: true })
  merkleRoot: string;

  @Column({ type: 'varchar', length: 200, name: 'leaf_hash', nullable: true })
  leafHash: string;

  @Column({ type: 'varchar', length: 200, name: 'settlement_tx', comment: 'Solana tx hash', nullable: true })
  settlementTx: string;

  @Column({ type: 'bigint', nullable: true })
  slot: number;

  @Column({ type: 'timestamp', name: 'settled_at', nullable: true })
  settledAt: Date;
}
