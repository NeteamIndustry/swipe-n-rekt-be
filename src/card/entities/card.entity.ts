import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AlbumEntity } from './album.entity';

@Entity('cards', { comment: 'Players or Rare Moments (cNFTs)' })
export class CardEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'album_id', type: 'uuid', nullable: true }) // Assuming album might not exist yet
  albumId: string;

  @ManyToOne(() => AlbumEntity)
  @JoinColumn({ name: 'album_id' })
  album: AlbumEntity;

  @Column({
    type: 'varchar',
    length: 100,
    comment: 'e.g., LIONEL MESSI, D. SCHMIDT',
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'card_type',
    comment: 'player, moment',
  })
  cardType: string;

  @Column({
    type: 'varchar',
    length: 10,
    comment: 'FW, MF, DF',
    nullable: true,
  })
  position: string;

  @Column({ type: 'int', name: 'jersey_number', nullable: true })
  jerseyNumber: number;

  @Column({
    type: 'varchar',
    length: 50,
    comment: 'uncommon, rare, epic, legendary',
  })
  rarity: string;

  @Column({
    type: 'varchar',
    length: 200,
    name: 'mint_address',
    comment: 'Solana cNFT address',
    nullable: true,
  })
  mintAddress: string;

  @Column({ type: 'text', nullable: true })
  description: string;
}
