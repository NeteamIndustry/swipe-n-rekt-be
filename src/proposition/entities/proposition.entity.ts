import { MatchEntity } from 'src/match/entities/match.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity('propositions')
export class PropositionEntity {
  @PrimaryGeneratedColumn('uuid', {
    comment: 'The specific question being bet on',
  })
  id: string;

  @ManyToOne(() => MatchEntity, (match: MatchEntity) => match.propositions)
  match_id: MatchEntity;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'e.g., GOAL IN THE NEXT 5 MINUTES?',
  })
  question: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'e.g., GOALS, SET PIECE',
  })
  category: string;

  @Column({
    type: 'varchar',
    length: 250,
    nullable: true,
    comment: 'e.g., Argentina pushing...',
  })
  context_text: string;

  @Column({
    type: 'numeric',
    precision: 4,
    scale: 2,
    nullable: true,
    comment: 'e.g., 0.41',
  })
  price_yes: number;

  @Column({
    type: 'numeric',
    precision: 4,
    scale: 2,
    nullable: true,
    comment: 'e.g., 0.59',
  })
  price_no: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'open, pending_settlement, resolved',
  })
  status: string;

  @Column({ type: 'boolean', nullable: true })
  outcome: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
    comment: 'Timestamp when the proposition settles',
  })
  settles_at: Date;
}
