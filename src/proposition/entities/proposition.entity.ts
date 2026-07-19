import { MatchEntity } from 'src/match/entities/match.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
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

  @ApiProperty({
    required: false,
    nullable: true,
    description:
      'Decimal odds for YES. Fixed at creation (or updated gradually by the ' +
      'schedule), independent of stake. Payout = stake * oddsYes.',
  })
  @Column({
    name: 'odds_yes',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: 'Decimal odds, e.g., 2.44 (implied probability 41%)',
  })
  oddsYes: number;

  @ApiProperty({
    required: false,
    nullable: true,
    description:
      'Decimal odds for NO. Fixed at creation (or updated gradually by the ' +
      'schedule), independent of stake. Payout = stake * oddsNo.',
  })
  @Column({
    name: 'odds_no',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: 'Decimal odds, e.g., 1.69 (implied probability 59%)',
  })
  oddsNo: number;

  @ApiProperty({ required: false, nullable: true })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'open, pending_settlement, resolved',
  })
  status: string;

  @ApiProperty({ required: false, nullable: true })
  @Column({
    name: 'outcome_key',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment:
      'Stable identifier of the market outcome this proposition covers ' +
      '(e.g. "1X2_PARTICIPANT_RESULT:part1"). Used to dedupe scheduled ' +
      'generation so a match+outcome is not recreated while still open.',
  })
  outcomeKey: string | null;

  @ApiProperty({ required: false, nullable: true })
  @Column({ type: 'boolean', nullable: true })
  outcome: boolean;

  @ApiProperty({ required: false, nullable: true, type: String })
  @Column({
    name: 'settles_at',
    type: 'timestamp',
    nullable: true,
    comment: 'Timestamp when the proposition settles',
  })
  settlesAt: Date;

  @ApiProperty({ required: false, nullable: true })
  @Column({
    name: 'market_address',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'On-chain Market PDA for this proposition, once initialized',
  })
  marketAddress: string;

  @ApiProperty({ required: false, nullable: true })
  @Column({
    name: 'vault_address',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'On-chain escrow vault PDA for this proposition',
  })
  vaultAddress: string;

  @ApiProperty({ required: false, nullable: true })
  @Column({
    name: 'market_init_tx',
    type: 'varchar',
    length: 200,
    nullable: true,
    comment: 'Solana tx signature that created the on-chain market',
  })
  marketInitTx: string;

  @ApiProperty({ required: false, nullable: true })
  @Column({
    name: 'on_chain_fixture_id',
    type: 'bigint',
    nullable: true,
    comment: 'fixture_id used to derive the Market PDA',
  })
  onChainFixtureId: string;

  @ApiProperty({ required: false, nullable: true })
  @Column({
    name: 'on_chain_stat_key',
    type: 'int',
    nullable: true,
    comment:
      'stat_key used to derive the Market PDA. Placeholder until real TxLine ' +
      'stat modeling exists — see settle_market (real oracle) follow-up.',
  })
  onChainStatKey: number;

  @ApiProperty({ required: false, nullable: true })
  @Column({
    name: 'on_chain_threshold',
    type: 'int',
    nullable: true,
    comment:
      'TraderPredicate threshold. Placeholder, unused by settle_market_mock.',
  })
  onChainThreshold: number;

  @ApiProperty({ required: false, nullable: true })
  @Column({
    name: 'on_chain_comparison',
    type: 'smallint',
    nullable: true,
    comment:
      'TraderPredicate comparison (0=GreaterThan,1=LessThan,2=EqualTo). Placeholder, unused by settle_market_mock.',
  })
  onChainComparison: number;

  @ApiProperty({ required: false, nullable: true })
  @Column({ name: 'on_chain_window_start', type: 'bigint', nullable: true })
  onChainWindowStart: string;

  @ApiProperty({ required: false, nullable: true })
  @Column({ name: 'on_chain_window_end', type: 'bigint', nullable: true })
  onChainWindowEnd: string;

  @ApiProperty({ required: false, nullable: true })
  @Column({
    name: 'market_init_error',
    type: 'text',
    nullable: true,
    comment:
      'Last error message from a failed initializeMarket attempt, if the ' +
      'on-chain market has not been created yet. Cleared on success.',
  })
  marketInitError: string | null;
}
