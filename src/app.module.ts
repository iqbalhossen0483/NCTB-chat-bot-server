import { Module } from '@nestjs/common';
import { RedisModule } from './common/redis/redis.module';
import { NestCloudinaryModule } from './configs/cloudinary.module';
import { DatabaseModule } from './configs/database.config';
import { AppConfigModule } from './configs/env.config.module';
import { JWTConfigModule } from './configs/jwt.config.module';
import { QueueConfigModule } from './configs/queue.config.module';
import { TrainingModule } from './modules/training/training.module';

@Module({
  imports: [
    AppConfigModule,
    JWTConfigModule,
    QueueConfigModule,
    RedisModule,
    NestCloudinaryModule,
    DatabaseModule,
    TrainingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
