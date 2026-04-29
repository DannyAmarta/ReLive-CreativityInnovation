import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('ask')
  async handleChat(@Body() body: { message: string, user: any }) {
    return this.chatService.askSage(body.message, body.user);
  }
}