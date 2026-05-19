import { createHash } from 'crypto';

export function calculateDuitkuFee(amountIdr: number): number {
  const percent = Math.ceil(amountIdr * 0.025);
  const fixed = 4000;
  return percent + fixed;
}

export function generateInquirySignature(
  merchantCode: string,
  merchantOrderId: string,
  amount: number,
  apiKey: string,
): string {
  // Inquiry format: merchantCode + merchantOrderId + paymentAmount + apiKey
  const stringToHash = merchantCode + merchantOrderId + amount + apiKey;
  return createHash('md5').update(stringToHash).digest('hex');
}

export function generateCallbackSignature(
  merchantCode: string,
  amount: number | string,
  merchantOrderId: string,
  apiKey: string,
): string {
  // Callback format: merchantCode + amount + merchantOrderId + apiKey
  const stringToHash = merchantCode + amount + merchantOrderId + apiKey;
  return createHash('md5').update(stringToHash).digest('hex');
}

export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/^0/, '62').replace(/\D/g, '');
}