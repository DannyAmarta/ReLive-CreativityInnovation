import { Controller, Post, Body, UseGuards, Catch, ExceptionFilter, ArgumentsHost, HttpException, UseFilters } from '@nestjs/common';
import { FiatPaymentService } from './fiat-payment.service';
import { DuitkuSignatureGuard } from './guards/duitku-signature.guard';
import { DuitkuWebhookPayload } from './dto/duitku-webhook-payload.dto';

@Catch()
export class DebugWebhookFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : String(exception);

    const debugInfo = {
      message: '--- WEBHOOK DEBUG ERROR ---',
      status,
      errorResponse: exceptionResponse,
      receivedBody: request.body,
      receivedHeaders: request.headers,
    };
    
    console.error(debugInfo);
    response.status(status).json(debugInfo);
  }
}

@Controller('api/webhooks')
@UseFilters(DebugWebhookFilter)
export class FiatPaymentWebhookController {
  constructor(private readonly fiatPaymentService: FiatPaymentService) {}

  @Post('duitku')
  @UseGuards(DuitkuSignatureGuard)
  async handleDuitkuWebhook(@Body() payload: DuitkuWebhookPayload) {
    return this.fiatPaymentService.processWebhook(payload);
  }
}