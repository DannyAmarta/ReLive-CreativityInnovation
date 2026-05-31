import { Module } from "@nestjs/common";
import { MessagingGateway } from "./messaging.gateway";
import { MessagingService } from "./messaging.service";
import { MessagingController } from "./messaging.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { CoreModule } from "../core/core.module"; // Fix #5: shared CoreModule

@Module({
  imports: [
    PrismaModule,
    CoreModule, // Fix #5: provides NotificationService as shared singleton
  ],
  providers: [MessagingGateway, MessagingService],
  controllers: [MessagingController],
  exports: [MessagingService],
})
export class MessagingModule {}

