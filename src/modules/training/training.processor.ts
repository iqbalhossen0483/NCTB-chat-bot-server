import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QueueName } from 'src/configs/queue.config.module';

@Processor(QueueName.Training)
export class TrainingProcessor extends WorkerHost {
  process(job: Job): Promise<any> {
    console.log(job.data);
    return Promise.resolve();
  }
}
