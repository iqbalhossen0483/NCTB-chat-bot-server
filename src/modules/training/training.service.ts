import { InjectQueue } from '@nestjs/bullmq';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { decode, encode } from 'gpt-tokenizer';
import { CloudinaryService } from 'nestjs-cloudinary';
import { QueueName } from 'src/configs/queue.config.module';
import { BookEntity } from 'src/entities/Book.entity';
import { Repository } from 'typeorm';
import { PdfService } from './pdf.service';
import { UploadBookDto } from './training.dto';

export class TrainingService {
  constructor(
    @InjectQueue(QueueName.Training) private trainingQueue: Queue,
    @InjectRepository(BookEntity)
    private bookRepository: Repository<BookEntity>,
    private readonly pdfService: PdfService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  chunkBook(pages: string[], bookName: string) {
    const chunks: CHUNK[] = [];
    let bufferTokens: number[] = [];
    let pageStart = 1;
    let pageEnd = 1;
    const CHUNK_SIZE = 500;
    const OVERLAP = 100;
    let currentPage = 0;

    console.log('page found: ', pages.length);

    for (const page of pages) {
      const tokens = encode(page);
      currentPage++;
      console.log('current page: ', currentPage);

      for (let i = 0; i < tokens.length; i++) {
        if (bufferTokens.length === 0) {
          pageStart = currentPage;
        }

        bufferTokens.push(tokens[i]);
        pageEnd = currentPage;

        if (bufferTokens.length >= CHUNK_SIZE) {
          chunks.push({
            book_name: bookName,
            pageStart: pageStart,
            pageEnd: pageEnd,
            content: decode(bufferTokens),
          });

          // Keep last OVERLAP tokens for the next chunk
          bufferTokens = bufferTokens.slice(CHUNK_SIZE - OVERLAP);
          pageStart = pageEnd;
        }
      }
    }

    // Flush remaining tokens that never reached CHUNK_SIZE
    if (bufferTokens.length > 0) {
      chunks.push({
        book_name: bookName,
        pageStart: pageStart,
        pageEnd: pageEnd,
        content: decode(bufferTokens),
      });
    }

    return chunks;
  }

  async processToQueue(chunks: CHUNK[]) {
    for (const chunk of chunks) {
      const job = await this.trainingQueue.add(QueueName.Training, chunk);
      console.log('job added: ', job.id);
    }
  }

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

    const book = this.bookRepository.create(payload);
    book.fileSize = file.size / 1024 / 1024 + ' MB';

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size <= MAX_FILE_SIZE) {
      const result = await this.cloudinaryService.uploadFile(file, {
        folder: 'books',
      });
      book.fileUrl = result.url as string;
    } else {
      book.fileUrl = '';
    }

    const pages = await this.pdfService.extractTextPageByPage(file.buffer);
    book.pages = pages.length;

    await this.bookRepository.save(book);

    const chunks = this.chunkBook(pages, payload.bookName);

    await this.processToQueue(chunks);

    return {
      success: true,
      message: 'Book uploaded successfully',
      data: book,
      chunks: chunks.length,
    };
  }

  async getQueueCounts() {
    const counts = await this.trainingQueue.getJobCounts();
    return {
      success: true,
      message: 'Queue counts fetched successfully',
      data: counts,
    };
  }
}
