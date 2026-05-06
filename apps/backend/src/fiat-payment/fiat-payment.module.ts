import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FiatPaymentService } from './fiat-payment.service';
import { FiatPaymentResolver } from './fiat-payment.resolver';
import { FiatPaymentWebhookController } from './fiat-payment.webhook.controller';

@Module({
  imports: [PrismaModule],
  controllers: [FiatPaymentWebhookController],
  providers: [FiatPaymentService, FiatPaymentResolver],
  exports: [FiatPaymentService],
})
export class FiatPaymentModule {}