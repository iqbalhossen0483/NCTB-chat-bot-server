import { Module } from '@nestjs/common';
import { AppConfigModule } from './configs/env.config.module';
import { JWTConfigModule } from './configs/jwt.config.module';

@Module({
  imports: [AppConfigModule, JWTConfigModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
