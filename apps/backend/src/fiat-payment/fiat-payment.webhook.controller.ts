import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { FiatPaymentService } from './fiat-payment.service';
import { DuitkuSignatureGuard } from './guards/duitku-signature.guard';
import { DuitkuWebhookPayload } from './dto/duitku-webhook-payload.dto';

@Controller('api/webhooks')
export class FiatPaymentWebhookController {
  constructor(private readonly fiatPaymentService: FiatPaymentService) {}

  @Post('duitku')
  @UseGuards(DuitkuSignatureGuard)
  async handleDuitkuWebhook(@Body() payload: DuitkuWebhookPayload) {
    return this.fiatPaymentService.processWebhook(payload);
  }
}