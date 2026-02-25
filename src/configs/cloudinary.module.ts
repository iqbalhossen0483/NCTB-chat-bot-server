import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CloudinaryModule } from 'nestjs-cloudinary';

@Module({
  imports: [
    CloudinaryModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        isGlobal: true,
        cloud_name: configService.get('CLOUDINARY_CLOUD_NAME'),
        api_key: configService.get('CLOUDINARY_API_KEY'),
        api_secret: configService.get('CLOUDINARY_API_SECRET'),
      }),
    }),
  ],
})
export class NestCloudinaryModule {}
