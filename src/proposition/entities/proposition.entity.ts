import { MatchEntity } from 'src/match/entities/match.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('propositions')
export class PropositionEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid', {
    comment: 'The specific question being bet on',
  })
  id: string;

  @ApiProperty()
  @Column({ name: 'match_id', type: 'uuid' })
  matchId: string;

  @ManyToOne(() => MatchEntity, (match) => match.propositions)
  @JoinColumn({ name: 'match_id' })
  match: MatchEntity;

  @ApiProperty({ required: false, nullable: true })
  @Column({
    type: 'text',
    nullable: true,
    comment: 'e.g., GOAL IN THE NEXT 5 MINUTES?',
  })
  question: string;

  @ApiProperty({ required: false, nullable: true })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'e.g., GOALS, SET PIECE',
  })
  category: string;

  @ApiProperty({ required: false, nullable: true })
  @Column({
    name: 'context_text',
    type: 'varchar',
    length: 250,
    nullable: true,
    comment: 'e.g., Argentina pushing...',
  })
  contextText: string;

  @ApiProperty({ required: false, nullable: true })
  @Column({
    name: 'price_yes',
    type: 'numeric',
    precision: 4,
    scale: 2,
    nullable: true,
    comment: 'e.g., 0.41',
  })
  priceYes: number;

  @ApiProperty({ required: false, nullable: true })
  @Column({
    name: 'price_no',
    type: 'numeric',
    precision: 4,
    scale: 2,
    nullable: true,
    comment: 'e.g., 0.59',
  })
  priceNo: number;

  @ApiProperty({ required: false, nullable: true })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'open, pending_settlement, resolved',
  })
  status: string;

  @ApiProperty({ required: false, nullable: true })
  @Column({ type: 'boolean', nullable: true })
  outcome: boolean;

  @ApiProperty({ required: false, nullable: true, type: String })
  @CreateDateColumn({
    name: 'settles_at',
    type: 'timestamp',
    nullable: true,
    comment: 'Timestamp when the proposition settles',
  })
  settlesAt: Date;
}
