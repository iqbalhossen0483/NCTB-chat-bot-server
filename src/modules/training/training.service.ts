import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { CloudinaryService } from 'nestjs-cloudinary';
import { QueueName } from 'src/configs/queue.config.module';
import { BookEntity } from 'src/entities/Book.entity';
import { Repository } from 'typeorm';
import { PdfService } from './pdf.service';
import { UploadBookDto } from './training.dto';

@Injectable()
export class TrainingService {
  constructor(
    @InjectQueue(QueueName.Training) private trainingQueue: Queue,
    @InjectRepository(BookEntity)
    private bookRepository: Repository<BookEntity>,
    private readonly pdfService: PdfService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async uploadBook(payload: UploadBookDto, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const existingBook = await this.bookRepository.findOne({
      where: { bookName: payload.bookName },
    });

    if (existingBook) {
      throw new ConflictException('Book already exists');
    }

    const result = await this.cloudinaryService.uploadFile(file, {
      folder: 'books',
    });

    const book = this.bookRepository.create(payload);
    book.fileUrl = result.url as string;
    book.fileSize = file.size / 1024 / 1024 + ' MB';
    await this.bookRepository.save(book);

    const pages = await this.pdfService.extractTextPageByPage(file.buffer);

    return {
      success: true,
      message: 'Book uploaded successfully',
      data: {
        bookName: payload.bookName,
        className: payload.className,
        writer: payload.writer,
        pages,
        result,
      },
    };
  }
}
