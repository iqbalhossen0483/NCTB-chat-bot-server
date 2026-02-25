import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { RedisModule } from 'src/modules/redis/redis.module';
import { RedisService } from 'src/modules/redis/redis.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [RedisModule],
      inject: [RedisService],
      useFactory: (redisService: RedisService) => ({
        connection: redisService.getClient(),
      }),
    }),
  ],
})
export class QueueConfigModule {}
