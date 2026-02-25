import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MessageEntity } from './Message.entity';
import { UserEntity } from './user.entity';

@Entity('conversations')
export class ConversationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.conversations)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @OneToMany(() => MessageEntity, (message) => message.conversation)
  messages: MessageEntity[];

  @CreateDateColumn()
  createdAt: Date;
}
