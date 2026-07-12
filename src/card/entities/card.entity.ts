import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AlbumEntity } from './album.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('cards', { comment: 'Players or Rare Moments (cNFTs)' })
export class CardEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ required: false, nullable: true })
  @Column({ name: 'album_id', type: 'uuid', nullable: true }) // Assuming album might not exist yet
  albumId: string;

  @ApiProperty({ type: AlbumEntity, required: false })
  @ManyToOne(() => AlbumEntity, (album) => album.cards)
  @JoinColumn({ name: 'album_id' })
  album: AlbumEntity;

  @ApiProperty()
  @Column({
    type: 'varchar',
    length: 100,
    comment: 'e.g., LIONEL MESSI, D. SCHMIDT',
  })
  name: string;

  @ApiProperty()
  @Column({
    type: 'varchar',
    length: 50,
    name: 'card_type',
    comment: 'player, moment',
  })
  cardType: string;

  @ApiProperty()
  @Column({
    type: 'varchar',
    length: 10,
    comment: 'FW, MF, DF',
    nullable: true,
  })
  position: string;

  @ApiProperty({ required: false, nullable: true })
  @Column({ type: 'int', name: 'jersey_number', nullable: true })
  jerseyNumber: number;

  @ApiProperty()
  @Column({
    type: 'varchar',
    length: 50,
    comment: 'uncommon, rare, epic, legendary',
  })
  rarity: string;

  @ApiProperty()
  @Column({
    type: 'varchar',
    length: 200,
    name: 'mint_address',
    comment: 'Solana cNFT address',
    nullable: true,
  })
  mintAddress: string;

  @ApiProperty({ required: false, nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string;
}
