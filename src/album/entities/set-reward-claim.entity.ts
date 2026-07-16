import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../user/entities/user.entity';
import { AlbumEntity } from '../../card/entities/album.entity';

@Entity('set_reward_claims', {
  comment: 'Album set-completion reward claims (SolanaService.claimSetReward)',
})
@Unique(['userId', 'albumId', 'period'])
export class SetRewardClaimEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ApiProperty()
  @Column({ name: 'album_id', type: 'uuid' })
  albumId: string;

  @ManyToOne(() => AlbumEntity)
  @JoinColumn({ name: 'album_id' })
  album: AlbumEntity;

  @ApiProperty({ description: 'Reward period identifier, e.g. "2026-Q1"' })
  @Column({ type: 'varchar', length: 100 })
  period: string;

  @ApiProperty({ description: 'Payout amount reported by claimSetReward' })
  @Column({ type: 'numeric', precision: 18, scale: 4 })
  amount: number;

  @ApiProperty({ required: false, nullable: true })
  @Column({ name: 'tx_sig', type: 'varchar', length: 200, nullable: true })
  txSig: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'claimed_at', type: 'timestamp' })
  claimedAt: Date;
}
