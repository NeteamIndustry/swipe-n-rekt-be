import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user.entity';
import { CardEntity } from '../../card/entities/card.entity';

@Entity('user_cards', { comment: 'Cards owned by the user' })
export class UserCardEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.userCards)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ApiProperty()
  @Column({ name: 'card_id', type: 'uuid' })
  cardId: string;

  @ApiProperty({ type: CardEntity, required: false })
  @ManyToOne(() => CardEntity)
  @JoinColumn({ name: 'card_id' })
  card: CardEntity;

  @ApiProperty()
  @CreateDateColumn({ name: 'acquired_at', type: 'timestamp' })
  acquiredAt: Date;

  @ApiProperty({
    required: false,
    nullable: true,
    description:
      'cNFT mint address for this specific copy, from SolanaService.mintCard',
  })
  @Column({
    name: 'mint_address',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  mintAddress: string;

  @ApiProperty({
    required: false,
    nullable: true,
    description: 'Solana tx signature for the mint_card call',
  })
  @Column({ name: 'mint_tx_sig', type: 'varchar', length: 200, nullable: true })
  mintTxSig: string;
}
