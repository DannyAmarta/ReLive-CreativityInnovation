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
  COMPLETED: 'COMPLETED',
  DISPUTED: 'DISPUTED',
  CANCELLED: 'CANCELLED',
} as const;

export const User = {} as const;
export const TrainerAvailability = {} as const;
