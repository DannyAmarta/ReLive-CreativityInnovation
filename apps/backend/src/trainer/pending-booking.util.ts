import { BookingStatus, Prisma } from '@prisma/client';

export const PENDING_BOOKING_TTL_MINUTES = 15;
const PENDING_BOOKING_TTL_MS = PENDING_BOOKING_TTL_MINUTES * 60 * 1000;

export function getPendingBookingExpiresAt(from = new Date()) {
  return new Date(from.getTime() + PENDING_BOOKING_TTL_MS);
}

export function isPendingBookingExpired(
  booking: { status: BookingStatus | string; pendingExpiresAt?: Date | null },
  now = new Date(),
) {
  return (
    booking.status === BookingStatus.PENDING &&
    booking.pendingExpiresAt != null &&
    booking.pendingExpiresAt.getTime() <= now.getTime()
  );
}

export function buildBlockingBookingWindowWhere(now = new Date()): Prisma.BookingWhereInput {
  return {
    OR: [
      { status: BookingStatus.ACTIVE },
      {
        status: BookingStatus.PENDING,
        pendingExpiresAt: { gt: now },
      },
    ],
  };
}
