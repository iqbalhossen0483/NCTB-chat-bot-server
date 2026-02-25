import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class ConversationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false }, { message: 'Invalid conversation id' })
  conversationId?: number;

  @IsNotEmpty({ message: 'Message is required' })
  @IsString({ message: 'Message must be a string' })
  @Length(10, 300, { message: 'Message must be between 10 and 300 characters' })
  message: string;

  @IsNotEmpty({ message: 'User id is required' })
  @Type(() => Number)
  @IsNumber({ allowNaN: false }, { message: 'Invalid user id' })
  userId: number;
}

export class GetConversationQueryDto {
  @IsNotEmpty({ message: 'User id is required' })
  @Type(() => Number)
  @IsNumber({ allowNaN: false }, { message: 'Invalid user id' })
  userId: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false }, { message: 'Invalid page number' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false }, { message: 'Invalid limit number' })
  limit?: number;
}
