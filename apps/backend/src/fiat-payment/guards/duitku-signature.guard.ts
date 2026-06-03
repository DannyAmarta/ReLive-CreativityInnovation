import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';

@Injectable()
export class DuitkuSignatureGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const body = req.body as {
      merchantCode?: string;
      amount?: string | number;
      merchantOrderId?: string;
      signature?: string;
      resultCode?: string;
    };

    console.log('[Duitku Webhook] Received body:', JSON.stringify(body));

    // Duitku sends the signature inside the request body, not as a header.
    // Format: MD5(merchantCode + amount + merchantOrderId + apiKey)
    const incomingSignature = body.signature;
    if (!incomingSignature) {
      console.error('[Duitku Webhook] Missing signature');
      throw new BadRequestException('Missing webhook signature');
    }

    const merchantCode = this.configService.get<string>('DUITKU_MERCHANT_CODE') ?? '';
    const apiKey = this.configService.get<string>('DUITKU_API_KEY') ?? '';
    const amount = String(body.amount ?? '');
    const merchantOrderId = String(body.merchantOrderId ?? '');

    const stringToHash = merchantCode + amount + merchantOrderId + apiKey;
    const expectedSignature = createHash('md5')
      .update(stringToHash)
      .digest('hex');

    console.log('[Duitku Webhook] stringToHash:', stringToHash.replace(apiKey, '***'));
    console.log('[Duitku Webhook] incomingSignature:', incomingSignature);
    console.log('[Duitku Webhook] expectedSignature:', expectedSignature);

    if (incomingSignature.toLowerCase() !== expectedSignature.toLowerCase()) {
      console.error('[Duitku Webhook] Invalid signature');
      throw new BadRequestException('Invalid webhook signature');
    }
    return true;
  }
}