import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/configs/multer.config';
import { UploadBookDto } from './training.dto';
import { TrainingService } from './training.service';

@Controller('training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post('upload-book')
  @UseInterceptors(FileInterceptor('book', multerConfig))
  async uploadBook(
    @Body() payload: UploadBookDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.trainingService.uploadBook(payload, file);
  }

  @Get('queue-counts')
  async getQueueCounts() {
    return this.trainingService.getQueueCounts();
  }
}
