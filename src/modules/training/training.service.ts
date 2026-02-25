import { InjectQueue } from '@nestjs/bullmq';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QueueName } from 'src/configs/queue.config.module';
import { PdfService } from './pdf.service';
import { UploadBookDto } from './training.dto';

@Injectable()
export class TrainingService {
  constructor(
    @InjectQueue(QueueName.Training) private trainingQueue: Queue,
    private readonly pdfService: PdfService,
  ) {}

  async uploadBook(payload: UploadBookDto, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    console.log({
      payload,
      file,
    });

    const pages = await this.pdfService.extractTextPageByPage(file.buffer);

    return {
      success: true,
      message: 'Book uploaded successfully',
      data: {
        bookName: payload.bookName,
        className: payload.className,
        writer: payload.writer,
        pages,
      },
    };
  }
}
