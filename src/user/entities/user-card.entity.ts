import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { CardEntity } from '../../card/entities/card.entity';

@Entity('user_cards', { comment: 'Cards owned by the user' })
export class UserCardEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'card_id', type: 'uuid' })
  cardId: string;

  @ManyToOne(() => CardEntity)
  @JoinColumn({ name: 'card_id' })
  card: CardEntity;

  @CreateDateColumn({ name: 'acquired_at', type: 'timestamp' })
  acquiredAt: Date;
}
