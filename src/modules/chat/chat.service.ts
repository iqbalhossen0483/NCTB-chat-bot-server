import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable } from 'rxjs';
import { GeminiService } from 'src/common/gemini/gemini.service';
import { ChunkEntity, ChunkStatus } from 'src/entities/Chunk.entity';
import { ConversationEntity } from 'src/entities/Conversation.entity';
import { Repository } from 'typeorm';
import { ConversationDto } from './chat.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChunkEntity)
    private chunkRepository: Repository<ChunkEntity>,
    @InjectRepository(ConversationEntity)
    private conversationRepository: Repository<ConversationEntity>,
    private readonly geminiService: GeminiService,
  ) {}

  async retriveConversation(id: number) {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: { user: true, message: true },
      select: {
        user: {
          email: true,
          name: true,
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async conversation(payload: ConversationDto) {
    const { conversationId, message } = payload;
    let conversation: ConversationEntity | null = null;
    if (conversationId) {
      conversation = await this.retriveConversation(conversationId);
      console.log(conversation);
    }
    const embadedQuestion = await this.geminiService.embedding(message);

    // search on pgvector with this embedding
    const vectorLiteral = `[${embadedQuestion.values.join(',')}]`;

    const chunks = await this.chunkRepository
      .createQueryBuilder('chunk')
      .where('chunk.status = :status', { status: ChunkStatus.Completed })
      .orderBy(`chunk.embedding <-> '${vectorLiteral}'::vector`, 'ASC')
      .limit(10)
      .getMany();

    if (!chunks.length) {
      throw new NotFoundException('No context found');
    }

    const context = chunks.map((chunk) => chunk.content);
    const contextText = context.join(' ');

    const streamingResp = await this.geminiService.askGemini(
      message,
      contextText,
    );

    return new Observable<MessageEvent>((subscriber) => {
      void (async () => {
        try {
          let fullResponse = '';

          for await (const chunk of streamingResp.stream) {
            const text = chunk.text();
            fullResponse += text;

            subscriber.next({ data: { text, done: false } } as MessageEvent);
          }

          // await this.persistConversation(conversationId, message, fullResponse);
          console.log(fullResponse);

          subscriber.next({ data: { text: '', done: true } } as MessageEvent);
          subscriber.complete();
        } catch (error) {
          subscriber.error(error);
        }
      })();
    });
  }
}
