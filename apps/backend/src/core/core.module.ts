import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * CoreModule provides shared singleton services (NotificationService, etc.)
 * that are used across multiple feature modules.
 * Import this module instead of registering NotificationService directly.
 */
@Module({
  imports: [PrismaModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class CoreModule {}
