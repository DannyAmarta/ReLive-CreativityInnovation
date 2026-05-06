import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { FiatPaymentService } from './fiat-payment.service';
import { calculateDuitkuFee } from './fiat-payment.utils';

describe('FiatPaymentService', () => {
  let service: FiatPaymentService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        FiatPaymentService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('true'),
            getOrThrow: jest.fn().mockReturnValue('test-value'),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            booking: { findUnique: jest.fn() },
            paymentTransaction: { findUnique: jest.fn(), create: jest.fn() },
            fiatWallet: { upsert: jest.fn() },
            $executeRaw: jest.fn(),
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get(FiatPaymentService);
  });

  it('should calculate fee correctly', () => {
    expect(calculateDuitkuFee(100000)).toBe(2500 + 4000);
    expect(calculateDuitkuFee(50000)).toBe(1250 + 4000);
  });
});