import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { GeminiService } from 'src/common/gemini/gemini.service';
import { QueueName } from 'src/configs/queue.config.module';
import { BookEntity } from 'src/entities/Book.entity';
import { ChunkEntity, ChunkStatus } from 'src/entities/Chunk.entity';
import { Repository } from 'typeorm';

@Injectable()
@Processor(QueueName.Training)
export class TrainingProcessor extends WorkerHost {
  constructor(
    private readonly geminiService: GeminiService,
    @InjectRepository(ChunkEntity)
    private chunkRepository: Repository<ChunkEntity>,
    @InjectRepository(BookEntity)
    private bookRepository: Repository<BookEntity>,
  ) {
    super();
  }

  async storeOnDB(payload: CHUNK) {
    const chunk = this.chunkRepository.create(payload);
    const book = await this.bookRepository.findOne({
      where: { bookName: payload.book_name },
    });
    if (!book) {
      throw new Error('Book not found');
    }
    chunk.book = book;
    await this.chunkRepository.save(chunk);
    return chunk;
  }

  async updateChunk(
    chunkId: number,
    status: ChunkStatus,
    embedding?: number[],
  ) {
    const chunk = await this.chunkRepository.findOne({
      where: { id: chunkId },
    });
    if (!chunk) {
      throw new Error('Chunk not found');
    }
    chunk.status = status;
    if (embedding) chunk.embedding = embedding;
    await this.chunkRepository.save(chunk);
  }

  async process(job: Job): Promise<any> {
    let chunkId: number | null = null;
    try {
      const chunk = job.data as CHUNK;
      console.log('Processing chunk', job.id);
      const storedChunk = await this.storeOnDB(chunk);
      chunkId = storedChunk.id;
      const embedded = await this.geminiService.embedding(chunk.content);
      const embeddedText = embedded.values;
      await this.updateChunk(chunkId, ChunkStatus.Completed, embeddedText);
      console.log('Chunk processed', chunkId);
    } catch (error) {
      if (chunkId) {
        await this.updateChunk(chunkId, ChunkStatus.Failed);
      }
      console.log(error);
    }
  }
}
