import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateSignature } from '../fiat-payment.utils';

@Injectable()
export class DuitkuSignatureGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const body = req.body;
    //lowercase work katanya sih 
    const signature = req.headers['x-signature'];

    if (!signature) {
      throw new BadRequestException('Missing signature');
    }

    const merchantCode = this.configService.get<string>('DUITKU_MERCHANT_CODE') ?? '';
    const apiKey = this.configService.get<string>('DUITKU_API_KEY') ?? '';
    const amount = body.amount;
    const merchantOrderId = body.merchantOrderId;

    const expectedSignature = generateSignature(merchantCode, amount, merchantOrderId, apiKey);
    if (signature !== expectedSignature) {
      throw new BadRequestException('Invalid signature');
    }
    return true;
  }
}