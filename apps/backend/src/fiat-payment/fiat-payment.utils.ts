import { createHash } from 'crypto';

export function calculateDuitkuFee(amountIdr: number): number {
  const percent = Math.ceil(amountIdr * 0.025);
  const fixed = 4000;
  return percent + fixed;
}

export function generateSignature(
  merchantCode: string,
  amount: number,
  merchantOrderId: string,
  apiKey: string,
): string {
  const stringToHash = merchantCode + amount + merchantOrderId + apiKey;
  return createHash('md5').update(stringToHash).digest('hex');
}

export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/^0/, '62').replace(/\D/g, '');
}