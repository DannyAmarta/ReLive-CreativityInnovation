export class PrismaClient {
  async $connect() {
    return undefined;
  }

  async $disconnect() {
    return undefined;
  }
}

export const Role = {
  USER: 'USER',
  TRAINER: 'TRAINER',
  ADMIN: 'ADMIN',
} as const;

export const BookingStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  PENDING_RELEASE: 'PENDING_RELEASE',
  COMPLETED: 'COMPLETED',
  DISPUTED: 'DISPUTED',
  CANCELLED: 'CANCELLED',
} as const;

export const PaymentType = {
  FIAT: 'FIAT',
  CRYPTO: 'CRYPTO',
} as const;

export const User = {} as const;
export const TrainerAvailability = {} as const;
