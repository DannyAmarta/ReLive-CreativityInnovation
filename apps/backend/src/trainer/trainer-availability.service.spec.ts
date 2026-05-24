import { BadRequestException } from '@nestjs/common';
import { TrainerAvailabilityService } from './trainer-availability.service';

describe('TrainerAvailabilityService', () => {
  const prisma = {
    trainerAvailability: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    booking: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  const service = new TrainerAvailabilityService(prisma as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds available slots from specific-date overrides, blocked windows, and existing bookings', async () => {
    prisma.trainerAvailability.findMany.mockResolvedValue([
      {
        id: 1,
        trainerId: 3,
        dayOfWeek: null,
        specificDate: new Date('2026-05-25T00:00:00.000Z'),
        startTime: '09:00',
        endTime: '12:00',
        isAvailable: true,
      },
      {
        id: 2,
        trainerId: 3,
        dayOfWeek: null,
        specificDate: new Date('2026-05-25T00:00:00.000Z'),
        startTime: '10:00',
        endTime: '11:00',
        isAvailable: false,
      },
    ]);
    prisma.booking.findMany.mockResolvedValue([
      {
        scheduledStart: new Date('2026-05-25T11:00:00.000Z'),
        scheduledEnd: new Date('2026-05-25T12:00:00.000Z'),
      },
    ]);

    const slots = await service.getAvailableSlots(3, '2026-05-25', '2026-05-25', 60);

    expect(slots).toHaveLength(1);
    expect(slots[0]).toEqual({
      start: new Date('2026-05-25T09:00:00.000Z'),
      end: new Date('2026-05-25T10:00:00.000Z'),
      label: expect.stringContaining('09:00'),
    });
  });

  it('throws when an overlapping booking already exists', async () => {
    prisma.booking.findFirst.mockResolvedValue({ id: 99 });

    await expect(
      service.assertNoSchedulingConflict(
        3,
        new Date('2026-05-25T09:00:00.000Z'),
        new Date('2026-05-25T10:00:00.000Z'),
      ),
    ).rejects.toThrow(BadRequestException);
  });
});
