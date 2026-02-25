import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BookEntity } from './Book.entity';

export enum ChunkStatus {
  Processing = 'processing',
  Completed = 'completed',
  Failed = 'failed',
}

@Entity('chunks')
export class ChunkEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BookEntity, (book) => book.chunks)
  @JoinColumn({ name: 'book_id' })
  book: BookEntity;

  @Column({ type: 'int' })
  pageStart: number;

  @Column({ type: 'int' })
  pageEnd: number;

  @Column()
  content: string;

  @Column({ type: 'enum', enum: ChunkStatus, default: ChunkStatus.Processing })
  status: ChunkStatus;

  @Column({ type: 'vector', length: 3072, nullable: true })
  embedding: number[] | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
