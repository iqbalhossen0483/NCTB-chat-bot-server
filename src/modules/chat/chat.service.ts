import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChunkEntity } from 'src/entities/Chunk.entity';
import { Repository } from 'typeorm';
import { ConversationDto } from './chat.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChunkEntity)
    private chunkRepository: Repository<ChunkEntity>,
  ) {}

  async conversation(payload: ConversationDto) {}
}
