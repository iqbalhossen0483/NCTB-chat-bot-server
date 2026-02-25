import { Module } from '@nestjs/common';
import { NestCloudinaryModule } from './configs/cloudinary.module';
import { AppConfigModule } from './configs/env.config.module';
import { JWTConfigModule } from './configs/jwt.config.module';
import { QueueConfigModule } from './configs/queue.config.module';
import { RedisModule } from './modules/redis/redis.module';
import { TrainingModule } from './modules/training/training.module';

@Module({
  imports: [
    AppConfigModule,
    JWTConfigModule,
    QueueConfigModule,
    RedisModule,
    NestCloudinaryModule,
    TrainingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
