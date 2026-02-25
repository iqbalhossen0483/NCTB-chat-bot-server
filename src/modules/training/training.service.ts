import { InjectQueue } from '@nestjs/bullmq';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QueueName } from 'src/configs/queue.config.module';
import { UploadBookDto } from './training.dto';

@Injectable()
export class TrainingService {
  constructor(@InjectQueue(QueueName.Training) private trainingQueue: Queue) {}

  async uploadBook(payload: UploadBookDto, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    console.log({
      payload,
      file,
    });

    await Promise.resolve();

    return {
      success: true,
      message: 'Book uploaded successfully',
    };
  }
}
