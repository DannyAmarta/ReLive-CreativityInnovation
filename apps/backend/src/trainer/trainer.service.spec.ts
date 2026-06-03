import { BookingStatus } from '@prisma/client';
import { TrainerService } from './trainer.service';

describe('TrainerService', () => {
  const prisma = {
    trainerService: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
    },
    booking: {
      updateMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    trainerProfile: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    paymentTransaction: {
      findFirst: jest.fn(),
    },
    review: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const availabilityService = {
    assertNoSchedulingConflict: jest.fn(),
  };

  const notificationService = {
    create: jest.fn(),
  };

  const service = new TrainerService(
    prisma as any,
    {} as any,
    {} as any,
    notificationService as any,
    availabilityService as any,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.booking.updateMany.mockResolvedValue({ count: 0 });
    prisma.trainerService.updateMany.mockResolvedValue({ count: 0 });
    notificationService.create.mockResolvedValue(undefined);
  });

  it('backfills missing token mints on crypto-priced services when default payout mint is saved', async () => {
    const profile = {
      id: 9,
      userId: 44,
      payoutMintAddress: null,
      user: { id: 44, walletAddress: null },
      services: [],
      reviews: [],
    };

    prisma.trainerProfile.findUnique
      .mockResolvedValueOnce(profile)
      .mockResolvedValueOnce({
        ...profile,
        payoutMintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        user: { id: 44, walletAddress: 'wallet-123' },
      });

    prisma.$transaction.mockImplementation(async (callback: any) =>
      callback({
        user: {
          update: jest.fn().mockResolvedValue(undefined),
        },
        trainerProfile: {
          update: jest.fn().mockResolvedValue(undefined),
          findUnique: jest.fn().mockResolvedValue({
            ...profile,
            payoutMintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            user: { id: 44, walletAddress: 'wallet-123' },
            services: [],
            reviews: [],
          }),
        },
        trainerService: {
          updateMany: prisma.trainerService.updateMany,
        },
      }),
    );

    await service.updateTrainerCryptoSettings(44, {
      walletAddress: '4iqFWGErW8Tsi2ryzwSMLG7mNDeJ4m5TN5p8U9gBAnZB',
      payoutMintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    });

    expect(prisma.trainerService.updateMany).toHaveBeenCalledWith({
      where: {
        trainerId: 9,
        priceInLamports: { gt: 0 },
        tokenMintAddress: null,
      },
      data: {
        tokenMintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      },
    });
  });

  it('reuses an unexpired pending booking for the same client and slot', async () => {
    prisma.trainerService.findUnique.mockResolvedValue({
      id: 22,
      isActive: true,
      trainerId: 9,
      trainer: { userId: 44 },
    });

    prisma.booking.findFirst.mockResolvedValue({
      id: 321,
      clientId: 7,
      trainerId: 9,
      serviceId: 22,
      status: BookingStatus.PENDING,
      paymentType: 'CRYPTO',
      timezone: 'Asia/Jakarta',
      pendingExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
      client: { id: 7, email: 'client@example.com' },
      trainer: { id: 9, user: { id: 11, name: 'Trainer' } },
      service: { id: 22, title: 'Mobility Session' },
    });

    prisma.booking.update.mockResolvedValue({
      id: 321,
      clientId: 7,
      trainerId: 9,
      serviceId: 22,
      status: BookingStatus.PENDING,
      paymentType: 'CRYPTO',
      timezone: 'Asia/Jakarta',
      pendingExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
      client: { id: 7, email: 'client@example.com' },
      trainer: { id: 9, user: { id: 11, name: 'Trainer' } },
      service: { id: 22, title: 'Mobility Session' },
    });

    const booking = await service.createBooking(7, {
      trainerId: 9,
      serviceId: 22,
      scheduledStart: '2026-06-09T13:00:00.000Z',
      scheduledEnd: '2026-06-09T14:00:00.000Z',
      timezone: 'Asia/Jakarta',
      paymentType: 'CRYPTO',
    });

    expect(prisma.booking.create).not.toHaveBeenCalled();
    expect(availabilityService.assertNoSchedulingConflict).not.toHaveBeenCalled();
    expect(prisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 321 },
        data: expect.objectContaining({
          paymentType: 'CRYPTO',
          pendingExpiresAt: expect.any(Date),
        }),
      }),
    );
    expect(booking.id).toBe(321);
  });

  it('moves expired on-chain confirmations to cancelled instead of activating them', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 7, walletAddress: 'client-wallet' });
    prisma.booking.findFirst.mockResolvedValue(null);
    prisma.booking.findUnique.mockResolvedValue({
      id: 321,
      clientId: 7,
      trainerId: 9,
      status: BookingStatus.PENDING,
      pendingExpiresAt: new Date(Date.now() - 60_000),
      txHash: null,
      client: { id: 7 },
      service: { id: 22, title: 'Mobility Session' },
      trainer: { id: 9, user: { id: 11, walletAddress: 'trainer-wallet' } },
    });
    prisma.booking.update.mockResolvedValue({
      id: 321,
      clientId: 7,
      trainerId: 9,
      status: BookingStatus.CANCELLED,
      paymentType: 'CRYPTO',
      txHash: 'sig-123',
      escrowAddress: 'escrow-123',
      pendingExpiresAt: new Date(Date.now() - 60_000),
      client: { id: 7 },
      service: { id: 22, title: 'Mobility Session' },
      trainer: { id: 9, user: { id: 11, walletAddress: 'trainer-wallet' } },
    });

    const booking = await service.confirmBookingFromChain({
      bookingId: 321,
      txHash: 'sig-123',
      escrowAddress: 'escrow-123',
      clientWallet: 'client-wallet',
      trainerWallet: 'trainer-wallet',
    });

    expect(prisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 321 },
        data: expect.objectContaining({
          status: BookingStatus.CANCELLED,
          txHash: 'sig-123',
          paymentType: 'CRYPTO',
        }),
      }),
    );
    expect(notificationService.create).toHaveBeenCalled();
    expect(booking.status).toBe(BookingStatus.CANCELLED);
  });
});
