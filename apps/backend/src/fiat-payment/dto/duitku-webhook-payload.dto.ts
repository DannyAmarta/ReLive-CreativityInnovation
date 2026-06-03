import { IsString, IsNumber, IsOptional, IsNotEmpty, Allow } from 'class-validator';

export class DuitkuWebhookPayload {
  @Allow()
  merchantCode!: string;

  @Allow()
  amount!: number | string;

  @Allow()
  merchantOrderId!: string;

  @Allow()
  signature!: string;

  @Allow()
  resultCode!: string;

  @Allow()
  resultMessage!: string;

  @IsOptional()
  @Allow()
  reference?: string;

  @IsOptional()
  @Allow()
  paymentMethod?: string;

  @IsOptional()
  @Allow()
  statusCode?: string;

  @IsOptional()
  @Allow()
  transactionId?: string;

  // Additional Duitku fields that trigger forbidNonWhitelisted if omitted
  @IsOptional()
  @Allow()
  productDetail?: string;

  @IsOptional()
  @Allow()
  additionalParam?: string;

  @IsOptional()
  @Allow()
  paymentCode?: string;

  @IsOptional()
  @Allow()
  merchantUserId?: string;

  @IsOptional()
  @Allow()
  publisherOrderId?: string;

  @IsOptional()
  @Allow()
  settlementDate?: string;

  @IsOptional()
  @Allow()
  vaNumber?: string;

  @IsOptional()
  @Allow()
  sourceAccount?: string;
}