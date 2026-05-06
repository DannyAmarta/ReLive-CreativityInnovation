export type DuitkuCreateInvoiceResponse = {
  merchantCode: string;
  reference: string;
  paymentUrl: string;
  amount: number;
  resultCode: string;
  resultMessage: string;
  transIdMerchant?: string;
};

export type DuitkuCheckStatusResponse = {
  reference: string;
  amount: number;
  statusCode: string;
  statusMessage: string;
  transactionId: string;
};

export type DuitkuDisbursementResponse = {
  merchantCode: string;
  reference: string;
  amount: number;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  status: string;
  message: string;
  referenceId?: string;
};