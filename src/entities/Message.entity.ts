import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ConversationEntity } from './Conversation.entity';

export enum MessageRole {
  User = 'user',
  Assistant = 'model',
}

@Entity('messages')
export class MessageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ConversationEntity, (conversation) => conversation.messages)
  conversation: ConversationEntity;

  @Column()
  message: string;

  @Column({ type: 'enum', enum: MessageRole })
  role: MessageRole;
}
