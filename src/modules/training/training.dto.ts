import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export enum ClassName {
  One = '1',
  Two = '2',
  Three = '3',
  Four = '4',
  Five = '5',
  Six = '6',
  Seven = '7',
  Eight = '8',
  Nine = '9',
  Ten = '10',
  Eleven = '11',
  Twelve = '12',
}

export class UploadBookDto {
  @IsNotEmpty({ message: 'Book name is required' })
  bookName: string;

  @IsNotEmpty({ message: 'Class name is required' })
  @IsEnum(ClassName, { message: 'Invalid class name' })
  className: ClassName;

  @IsOptional()
  writer: string;
}
