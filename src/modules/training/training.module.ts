import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { QueueName } from 'src/configs/queue.config.module';
import { PdfService } from './pdf.service';
import { TrainingController } from './training.controller';
import { TrainingProcessor } from './training.processor';
import { TrainingService } from './training.service';

@Module({
  imports: [BullModule.registerQueue({ name: QueueName.Training })],
  controllers: [TrainingController],
  providers: [TrainingService, TrainingProcessor, PdfService],
})
export class TrainingModule {}
