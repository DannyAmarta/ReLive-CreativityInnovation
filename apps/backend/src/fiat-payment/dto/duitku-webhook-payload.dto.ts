export class DuitkuWebhookPayload {
  merchantCode!: string;
  amount!: number;
  merchantOrderId!: string;
  signature!: string;
  resultCode!: string;
  resultMessage!: string;
  reference?: string;
  paymentMethod?: string;
  statusCode?: string;
  transactionId?: string;
}