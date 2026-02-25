import {
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

  @OneToMany(() => UserEntity, (user) => user.conversation)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => MessageEntity, (message) => message.conversation)
  message: MessageEntity;
}
