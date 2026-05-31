import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
  imports: [ConfigModule], // Fix #10: required for ConfigService injection in ChatService
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}