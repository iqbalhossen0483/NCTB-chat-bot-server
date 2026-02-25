import { Module } from '@nestjs/common';
import { AppConfigModule } from './configs/env.config.module';
import { JWTConfigModule } from './configs/jwt.config.module';
import { RedisService } from './services/redis.service';

@Module({
  imports: [AppConfigModule, JWTConfigModule],
  controllers: [],
  providers: [RedisService],
  exports: [RedisService],
})
export class AppModule {}
