import { Module } from '@nestjs/common';
import { MailListener } from './mail.listener';

@Module({
  providers: [MailListener],
})
export class MailModule {}
