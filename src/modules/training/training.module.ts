import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeminiService } from 'src/common/gemini/gemini.service';
import { QueueName } from 'src/configs/queue.config.module';
import { BookEntity } from 'src/entities/Book.entity';
import { ChunkEntity } from 'src/entities/Chunk.entity';
import { PdfService } from './pdf.service';
import { TrainingController } from './training.controller';
import { TrainingProcessor } from './training.processor';
import { TrainingService } from './training.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: QueueName.Training }),
    TypeOrmModule.forFeature([BookEntity, ChunkEntity]),
  ],
  controllers: [TrainingController],
  providers: [TrainingService, TrainingProcessor, PdfService, GeminiService],
})
export class TrainingModule {}
