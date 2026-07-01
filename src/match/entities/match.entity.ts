import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { PropositionEntity } from '../../proposition/entities/proposition.entity';

@Entity('matches')
export class MatchEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'e.g., ARG',
  })
  team_home: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'e.g., FRA',
  })
  team_away: string;

  @Column({ type: 'int', nullable: true })
  score_home: number;

  @Column({ type: 'int', nullable: true })
  score_away: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: "e.g., 67'",
  })
  match_minute: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'e.g., 1ST HALF, 2ND HALF',
  })
  half: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'scheduled, live, finished',
  })
  status: string;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  created_at: Date;

  @OneToMany(() => PropositionEntity, (proposition) => proposition.match_id)
  propositions: PropositionEntity[];
}
