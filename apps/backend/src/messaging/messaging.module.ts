import { Module } from "@nestjs/common";
import { MessagingGateway } from "./messaging.gateway";
import { MessagingService } from "./messaging.service";
import { MessagingController } from "./messaging.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { NotificationService } from "../core/notification.service";

@Module({
  imports: [PrismaModule],
  providers: [MessagingGateway, MessagingService, NotificationService],
  controllers: [MessagingController],
  exports: [MessagingService],
})
export class MessagingModule {}

