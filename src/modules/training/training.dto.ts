import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ClassName } from 'src/entities/Book.entity';

export class UploadBookDto {
  @IsNotEmpty({ message: 'Book name is required' })
  bookName: string;

  @IsNotEmpty({ message: 'Class name is required' })
  @IsEnum(ClassName, { message: 'Invalid class name' })
  className: ClassName;

  @IsOptional()
  writer: string;

  @IsNotEmpty({ message: 'Pages is required' })
  pages: number;
}
