import { Content } from '@google/generative-ai';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable } from 'rxjs';
import { GeminiService } from 'src/common/gemini/gemini.service';
import { ChunkEntity, ChunkStatus } from 'src/entities/Chunk.entity';
import { ConversationEntity } from 'src/entities/Conversation.entity';
import { MessageEntity, MessageRole } from 'src/entities/Message.entity';
import { UserEntity } from 'src/entities/user.entity';
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
    @InjectRepository(MessageEntity)
    private messageRepository: Repository<MessageEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async retriveConversation(id: number) {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: { user: true, messages: true },
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

  async saveMessage(
    conversation: ConversationEntity,
    message: string,
    role: MessageRole,
  ) {
    const messageInstance = this.messageRepository.create({
      message,
      role,
      conversation,
    });

    await this.messageRepository.save(messageInstance);
  }

  async conversation(payload: ConversationDto) {
    const { conversationId, message, userId } = payload;
    let conversation: ConversationEntity;
    let history: Content[] = [];

    if (conversationId) {
      conversation = await this.retriveConversation(conversationId);
      history = conversation.messages.map((message) => ({
        role: message.role,
        parts: [{ text: message.message }],
      }));
    } else {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const conversationInstance = this.conversationRepository.create({
        user,
      });
      await this.conversationRepository.save(conversationInstance);
      conversation = conversationInstance;
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
      history,
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

          // save user and assistant message
          await this.saveMessage(conversation, message, MessageRole.User);
          await this.saveMessage(
            conversation,
            fullResponse,
            MessageRole.Assistant,
          );

          subscriber.next({ data: { text: '', done: true } } as MessageEvent);
          subscriber.complete();
        } catch (error) {
          subscriber.error(error);
        }
      })();
    });
  }

  async getUserConversation(userId: number, page = 1, limit = 10) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const skip = (page - 1) * limit;
    const conversations = await this.conversationRepository.find({
      where: { user: { id: userId } },
      relations: { user: true, messages: true },
      select: {
        user: {
          email: true,
          name: true,
        },
      },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const total = await this.conversationRepository.count({
      where: { user },
    });

    return {
      success: true,
      message: 'Conversations fetched successfully',
      data: conversations,
      meta: {
        total,
        currentPage: page,
        perPage: limit,
        totalPage: Math.ceil(total / limit),
      },
    };
  }
}
