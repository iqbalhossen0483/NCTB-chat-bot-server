import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeminiService } from 'src/common/gemini/gemini.service';
import { ChunkEntity } from 'src/entities/Chunk.entity';
import { ConversationEntity } from 'src/entities/Conversation.entity';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChunkEntity, ConversationEntity])],
  controllers: [ChatController],
  providers: [ChatService, GeminiService],
})
export class ChatModule {}
