import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QueueName } from 'src/configs/queue.config.module';

@Injectable()
export class TrainingService {
  constructor(@InjectQueue(QueueName.Training) private trainingQueue: Queue) {}

  async addQueue() {
    await this.trainingQueue.add(
      'training',
      {
        name: 'test',
        description: 'test',
        data: { id: 1, title: 'test' },
      },
      { removeOnComplete: true },
    );

    return {
      status: 'ok',
    };
  }
}
