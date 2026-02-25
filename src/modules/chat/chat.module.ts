import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChunkEntity } from 'src/entities/Chunk.entity';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChunkEntity])],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
