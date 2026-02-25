import { Body, Controller, Post } from '@nestjs/common';
import { ConversationDto } from './chat.dto';
import { ChatService } from './chat.service';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async conversation(@Body() payload: ConversationDto) {
    return this.chatService.conversation(payload);
  }
}
