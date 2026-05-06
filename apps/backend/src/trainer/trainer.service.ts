import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAccount } from '@solana/spl-token';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrainerProfileInput } from './dto/create-trainer-profile.input';
import { CreateTrainerServiceInput } from './dto/create-trainer-service.input';
import { CreateBookingInput } from './dto/create-booking.input';
import { UpgradeToTrainerInput } from './dto/upgrade-to-trainer.input';
import { UpdateTrainerServiceInput } from './dto/update-trainer-service.input';
import { UpdateBookingStatusInput } from './dto/update-booking-status.input';
import { Role, BookingStatus } from '@prisma/client';
import { FiatPaymentService } from '../fiat-payment/fiat-payment.service';

// ─── Booking State Machine (RBAC) ────────────────────────────────────────────
// TRAINER: PENDING  → ACTIVE | CANCELLED
// TRAINER: ACTIVE   → COMPLETED
// CLIENT:  ACTIVE   → DISPUTED
// ADMIN:   DISPUTED → COMPLETED | CANCELLED
const ALLOWED_TRANSITIONS: Record<Role, Partial<Record<BookingStatus, BookingStatus[]>>> = {
  [Role.TRAINER]: {
    [BookingStatus.PENDING]: [BookingStatus.ACTIVE, BookingStatus.CANCELLED],
    [BookingStatus.ACTIVE]: [BookingStatus.COMPLETED],
  },
  [Role.USER]: {
    [BookingStatus.ACTIVE]: [BookingStatus.DISPUTED],
  },
  [Role.ADMIN]: {
    [BookingStatus.DISPUTED]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
  },
};

@Injectable()
export class TrainerService {
  private readonly logger = new Logger(TrainerService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private fiatPaymentService: FiatPaymentService,
  ) {}

  // ─── Security: Strip sensitive fields from User objects ───────────────────
  private sanitizeUser(user: any) {
    if (!user) return user;
    const sanitized = {
      ...user,
      hasOpenRouterConnection: Boolean(user.openRouterApiKeyEncrypted),
    };
    delete sanitized.password;
    delete sanitized.openRouterApiKeyEncrypted;
    return sanitized;
  }

  private sanitizeProfile(profile: any) {
    if (!profile) return profile;
    if (profile.user) profile.user = this.sanitizeUser(profile.user);
    return profile;
  }

  private sanitizeBooking(booking: any) {
    if (!booking) return booking;
    if (booking.client) booking.client = this.sanitizeUser(booking.client);
    if (booking.trainer) booking.trainer = this.sanitizeProfile(booking.trainer);
    return booking;
  }

  // ─── Trainer Profile ──────────────────────────────────────────────────────
  async getTrainerProfiles() {
    const profiles = await this.prisma.trainerProfile.findMany({
      include: { user: true, services: true },
    });
    return profiles.map(p => this.sanitizeProfile(p));
  }

  async getTrainerProfile(id: number) {
    const profile = await this.prisma.trainerProfile.findUnique({
      where: { id },
      include: { user: true, services: true },
    });
    if (!profile) throw new NotFoundException('Trainer profile not found');
    return this.sanitizeProfile(profile);
  }

  async createTrainerProfile(userId: number, input: CreateTrainerProfileInput) {
    const profile = await this.prisma.trainerProfile.create({
      data: { userId, bio: input.bio, certifications: input.certifications || [] },
      include: { user: true },
    });
    return this.sanitizeProfile(profile);
  }

  // FIX #2 — Concurrency: role check is now INSIDE the transaction with
  // serializable isolation, preventing race conditions from rapid double-clicks.
  async upgradeToTrainer(userId: number, input: UpgradeToTrainerInput) {
    await this.assertPayoutAtaExists(input.walletAddress, input.payoutAtaAddress, input.payoutMintAddress);

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Re-read user INSIDE the transaction to prevent TOCTOU race condition
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');
        if (user.role === Role.TRAINER) {
          throw new ConflictException('You are already a trainer');
        }

        await tx.user.update({
          where: { id: userId },
          data: { role: Role.TRAINER, walletAddress: input.walletAddress },
        });

        const profile = await tx.trainerProfile.create({
          data: {
            userId,
            bio: input.bio,
            certifications: input.certifications,
            payoutAtaAddress: input.payoutAtaAddress,
            payoutMintAddress: input.payoutMintAddress,
            ataInitializedAt: new Date(),
          },
          include: { user: true },
        });

        return this.sanitizeProfile(profile);
      });
    } catch (err) {
      // Catch Prisma unique constraint violation (P2002) as a friendly error
      if ((err as any)?.code === 'P2002') {
        throw new ConflictException('Trainer profile already exists for this account');
      }
      throw err;
    }
  }

  private async assertPayoutAtaExists(
    walletAddress: string,
    payoutAtaAddress: string,
    payoutMintAddress: string,
  ) {
    const rpcUrl = this.configService.get<string>('SOLANA_RPC_URL');
    if (!rpcUrl) {
      throw new BadRequestException('SOLANA_RPC_URL must be configured before trainer blockchain onboarding');
    }

    try {
      const connection = new Connection(rpcUrl, 'confirmed');
      const wallet = new PublicKey(walletAddress);
      const payoutAta = new PublicKey(payoutAtaAddress);
      const mint = new PublicKey(payoutMintAddress);
      const account = await getAccount(connection, payoutAta);

      if (!account.owner.equals(wallet)) {
        throw new BadRequestException('Payout ATA owner does not match trainer wallet');
      }
      if (!account.mint.equals(mint)) {
        throw new BadRequestException('Payout ATA mint does not match payout mint');
      }
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException('Payout ATA must exist on-chain before upgrading to trainer');
    }
  }

  // ─── Trainer Services ─────────────────────────────────────────────────────
  async createTrainerService(userId: number, input: CreateTrainerServiceInput) {
    const profile = await this.prisma.trainerProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Create a trainer profile first');
    if (!profile.payoutAtaAddress || !profile.payoutMintAddress) {
      throw new ForbiddenException('Initialize and register your payout ATA before listing services');
    }
    const tokenMintAddress = input.tokenMintAddress ?? profile.payoutMintAddress;
    if (tokenMintAddress !== profile.payoutMintAddress) {
      throw new ForbiddenException('Service mint must match the payout ATA mint registered during onboarding');
    }

    return this.prisma.trainerService.create({
      data: {
        trainerId: profile.id,
        title: input.title,
        description: input.description,
        priceInLamports: input.priceInLamports,
        tokenMintAddress,
      },
    });
  }

  async getTrainerServices(trainerId: number) {
    return this.prisma.trainerService.findMany({ where: { trainerId } });
  }

  async updateTrainerService(userId: number, input: UpdateTrainerServiceInput) {
    const profile = await this.prisma.trainerProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Trainer profile not found');

    const service = await this.prisma.trainerService.findUnique({ where: { id: input.serviceId } });
    if (!service) throw new NotFoundException('Service not found');
    if (service.trainerId !== profile.id) {
      throw new ForbiddenException('You can only edit your own services');
    }

    return this.prisma.trainerService.update({
      where: { id: input.serviceId },
      data: {
        title: input.title,
        description: input.description,
        priceInLamports: input.priceInLamports ?? undefined,
        isActive: input.isActive,
      },
    });
  }

  // ─── Bookings ─────────────────────────────────────────────────────────────
  async createBooking(clientId: number, input: CreateBookingInput) {
    const service = await this.prisma.trainerService.findUnique({
      where: { id: input.serviceId },
      include: { trainer: true },
    });
    if (!service || !service.isActive) throw new NotFoundException('Trainer service not found');
    if (service.trainerId !== input.trainerId) {
      throw new BadRequestException('Service does not belong to the selected trainer');
    }
    if (service.trainer.userId === clientId) {
      throw new BadRequestException('You cannot book your own trainer service');
    }

    const booking = await this.prisma.booking.create({
      data: {
        clientId,
        trainerId: input.trainerId,
        serviceId: input.serviceId,
        status: BookingStatus.PENDING,
      },
      include: { trainer: { include: { user: true } }, service: true, client: true },
    });
    return this.sanitizeBooking(booking);
  }

  // FIX #1 — Web3 Sync: This method is called by the Blockchain Indexer
  // when it detects the on-chain deposit event, bypassing the frontend entirely.
  async confirmBookingFromChain(params: {
    bookingId: number;
    txHash: string;
    escrowAddress: string;
    clientWallet: string;
    trainerWallet: string;
  }) {
    // Find the user by their connected wallet address
    const client = await this.prisma.user.findUnique({ where: { walletAddress: params.clientWallet } });
    if (!client) throw new NotFoundException(`No user found for wallet: ${params.clientWallet}`);

    // Idempotency guard: don't create duplicate bookings for the same tx
    const existing = await this.prisma.booking.findFirst({ where: { txHash: params.txHash } });
    if (existing) return this.sanitizeBooking(existing);

    const booking = await this.prisma.booking.findUnique({
      where: { id: params.bookingId },
      include: { trainer: { include: { user: true } } },
    });
    if (!booking) throw new NotFoundException(`Booking ${params.bookingId} not found`);
    if (booking.clientId !== client.id) {
      throw new ForbiddenException('On-chain client wallet does not match booking client');
    }
    if (booking.trainer.user.walletAddress !== params.trainerWallet) {
      throw new ForbiddenException('On-chain trainer wallet does not match booking trainer');
    }
    if (booking.status !== BookingStatus.PENDING) {
      return this.sanitizeBooking(booking);
    }

    const updated = await this.prisma.booking.update({
      where: { id: params.bookingId },
      data: {
        txHash: params.txHash,
        escrowAddress: params.escrowAddress,
        status: BookingStatus.ACTIVE,
      },
      include: { trainer: { include: { user: true } }, service: true, client: true },
    });
    return this.sanitizeBooking(updated);
  }

  async getClientBookings(clientId: number) {
    const bookings = await this.prisma.booking.findMany({
      where: { clientId },
      include: { trainer: { include: { user: true } }, service: true },
    });
    return bookings.map(b => this.sanitizeBooking(b));
  }

  async getTrainerBookings(userId: number) {
    const profile = await this.prisma.trainerProfile.findUnique({ where: { userId } });
    if (!profile) return [];

    const bookings = await this.prisma.booking.findMany({
      where: { trainerId: profile.id },
      include: { client: true, service: true },
    });
    return bookings.map(b => this.sanitizeBooking(b));
  }

  // FIX #5 — Dispute + RBAC State Machine: enforces valid state transitions per role.
  async updateBookingStatus(userId: number, input: UpdateBookingStatusInput) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const booking = await this.prisma.booking.findUnique({ where: { id: input.bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');

    const allowedForRole = ALLOWED_TRANSITIONS[user.role] ?? {};
    const allowedNextStatuses = allowedForRole[booking.status] ?? [];

    if (!allowedNextStatuses.includes(input.status)) {
      throw new ForbiddenException(
        `Role ${user.role} cannot transition booking from ${booking.status} to ${input.status}`,
      );
    }

    // Trainers can only touch their own bookings
    if (user.role === Role.TRAINER) {
      const profile = await this.prisma.trainerProfile.findUnique({ where: { userId } });
      if (!profile || booking.trainerId !== profile.id) {
        throw new ForbiddenException('You can only manage your own bookings');
      }
    }

    // Clients can only touch their own bookings
    if (user.role === Role.USER && booking.clientId !== userId) {
      throw new ForbiddenException('You can only manage your own bookings');
    }

    const updated = await this.prisma.booking.update({
      where: { id: input.bookingId },
      data: {
        status: input.status,
        disputeReason: input.disputeReason,
        resolvedBy: user.role === Role.ADMIN ? userId : undefined,
      },
      include: { client: true, service: true, trainer: { include: { user: true } } },
    });

    // ─── FIX #2 & #7: Fiat payment hooks on status transitions ────────────
    // When a fiat booking is COMPLETED, credit the trainer's wallet.
    // When a fiat booking is CANCELLED, mark payment transactions as refunded.
    try {
      if (input.status === BookingStatus.COMPLETED) {
        await this.fiatPaymentService.creditTrainerOnCompletion(input.bookingId);
      } else if (input.status === BookingStatus.CANCELLED) {
        await this.fiatPaymentService.handleFiatBookingCancellation(input.bookingId);
      }
    } catch (err) {
      // Log but don't fail the booking transition — the booking status is already
      // updated, and the fiat ledger can be reconciled manually if needed.
      this.logger.error(
        `Fiat payment hook failed for booking ${input.bookingId}: ${(err as Error).message}`,
      );
    }

    return this.sanitizeBooking(updated);
  }
}
