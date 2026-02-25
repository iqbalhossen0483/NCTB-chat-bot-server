import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ConversationEntity } from './Conversation.entity';

@Entity('messages')
export class MessageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => ConversationEntity, (conversation) => conversation.message)
  @JoinColumn({ name: 'conversation_id' })
  conversation: ConversationEntity;

  @Column()
  message: string;
}
