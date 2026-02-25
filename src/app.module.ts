import { Module } from '@nestjs/common';
import { AppConfigModule } from './configs/env.config.module';
import { JWTConfigModule } from './configs/jwt.config.module';
import { QueueConfigModule } from './configs/queue.config.module';
import { RedisModule } from './modules/redis/redis.module';

@Module({
  imports: [AppConfigModule, JWTConfigModule, QueueConfigModule, RedisModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
