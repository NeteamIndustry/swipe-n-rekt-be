import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { PropositionEntity } from '../../proposition/entities/proposition.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('matches')
export class MatchEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ required: false, nullable: true })
  @Column({
    name: 'external_id',
    type: 'varchar',
    length: 100,
    nullable: true,
    unique: true,
    comment: 'TxLine FixtureId, used to dedupe fixture syncs',
  })
  externalId: string;

  @ApiProperty({ required: false, nullable: true })
  @Column({
    name: 'team_home',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'e.g., ARG',
  })
  teamHome: string;

  @ApiProperty({ required: false, nullable: true })
  @Column({
    name: 'team_away',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'e.g., FRA',
  })
  teamAway: string;

  @ApiProperty({ required: false, nullable: true })
  @Column({ name: 'score_home', type: 'int', nullable: true })
  scoreHome: number;

  @ApiProperty({ required: false, nullable: true })
  @Column({ name: 'score_away', type: 'int', nullable: true })
  scoreAway: number;

  @ApiProperty({ required: false, nullable: true })
  @Column({
    name: 'match_minute',
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: "e.g., 67'",
  })
  matchMinute: string;

  @ApiProperty({ required: false, nullable: true })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'e.g., 1ST HALF, 2ND HALF',
  })
  half: string;

  @ApiProperty({ required: false, nullable: true })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'scheduled, live, finished',
  })
  status: string;

  @ApiProperty({ required: false, nullable: true, type: String })
  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt: Date;

  @OneToMany(() => PropositionEntity, (proposition) => proposition.match)
  propositions: PropositionEntity[];
}
