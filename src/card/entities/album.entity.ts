import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('albums')
export class AlbumEntity {
  @PrimaryGeneratedColumn('uuid', {
    comment: 'Collection sets, e.g., Brazil, Argentina',
  })
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country_name: string;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'e.g., 26',
  })
  total_cards_required: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'e.g., LEGENDARY CHAMPION',
  })
  reward_type: string;
}
