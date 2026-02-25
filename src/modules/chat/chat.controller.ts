import { Body, Controller, Sse } from '@nestjs/common';
import { ConversationDto } from './chat.dto';
import { ChatService } from './chat.service';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Sse()
  async conversation(@Body() payload: ConversationDto) {
    return this.chatService.conversation(payload);
  }
}
