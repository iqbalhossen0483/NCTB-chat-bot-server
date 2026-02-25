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

    for (const page of pages) {
      const tokens = encode(page);
      currentPage++;

      for (let i = 0; i < tokens.length; i++) {
        if (bufferTokens.length === 0) {
          pageStart = currentPage;
        }

        bufferTokens.push(tokens[i]);
        pageEnd = currentPage;

        if (bufferTokens.length >= CHUNK_SIZE) {
          chunks.push({
            book_name: bookName,
            page_start: pageStart,
            page_end: pageEnd,
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
        page_start: pageStart,
        page_end: pageEnd,
        content: decode(bufferTokens),
      });
    }

    return chunks;
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

    const result = await this.cloudinaryService.uploadFile(file, {
      folder: 'books',
    });

    const book = this.bookRepository.create(payload);
    book.fileUrl = result.url as string;
    book.fileSize = file.size / 1024 / 1024 + ' MB';

    const pages = await this.pdfService.extractTextPageByPage(file.buffer);
    book.pages = pages.length;

    await this.bookRepository.save(book);

    const chunks = this.chunkBook(pages, payload.bookName);

    return {
      success: true,
      message: 'Book uploaded successfully',
      data: book,
    };
  }
}
