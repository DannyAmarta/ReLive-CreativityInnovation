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
    };

    // Duitku sends the signature inside the request body, not as a header.
    // Format: MD5(merchantCode + amount + merchantOrderId + apiKey)
    const incomingSignature = body.signature;
    if (!incomingSignature) {
      throw new BadRequestException('Missing webhook signature');
    }

    const merchantCode = this.configService.get<string>('DUITKU_MERCHANT_CODE') ?? '';
    const apiKey = this.configService.get<string>('DUITKU_API_KEY') ?? '';
    const amount = String(body.amount ?? '');
    const merchantOrderId = String(body.merchantOrderId ?? '');

    const expectedSignature = createHash('md5')
      .update(merchantCode + amount + merchantOrderId + apiKey)
      .digest('hex');

    if (incomingSignature.toLowerCase() !== expectedSignature.toLowerCase()) {
      throw new BadRequestException('Invalid webhook signature');
    }
    return true;
  }
}