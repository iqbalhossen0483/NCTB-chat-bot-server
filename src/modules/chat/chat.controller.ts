import { Body, Controller, Get, Query, Sse } from '@nestjs/common';
import { ConversationDto, GetConversationQueryDto } from './chat.dto';
import { ChatService } from './chat.service';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Sse()
  async conversation(@Body() payload: ConversationDto) {
    return this.chatService.conversation(payload);
  }

  @Get('/conversations')
  async getUserConversation(@Query() query: GetConversationQueryDto) {
    return this.chatService.getUserConversation(
      query.userId,
      query.page,
      query.limit,
    );
  }
}
