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
import { RegisterTrainerFiatInput } from './dto/register-trainer-fiat.input';
import { Role, BookingStatus } from '@prisma/client';
import { FiatPaymentService } from '../fiat-payment/fiat-payment.service';
import { NotificationService } from '../core/notification.service';
import { TrainerAvailabilityService } from './trainer-availability.service';

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
    private notificationService: NotificationService,
    private availabilityService: TrainerAvailabilityService,
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

  async getMyTrainerProfile(userId: number) {
    const profile = await this.prisma.trainerProfile.findUnique({
      where: { userId },
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

  // ─── Fiat-only trainer registration (no Solana wallet required) ───────────
  async registerTrainerFiat(userId: number, input: RegisterTrainerFiatInput) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');
        if (user.role === Role.TRAINER) {
          throw new ConflictException('You are already a trainer');
        }

        await tx.user.update({
          where: { id: userId },
          data: { role: Role.TRAINER },
        });

        const profile = await tx.trainerProfile.create({
          data: {
            userId,
            bio: input.bio,
            certifications: input.certifications ?? [],
            // No wallet/ATA fields — fiat-only trainer
          },
          include: { user: true },
        });

        // Auto-create fiat wallet so they can receive IDR payments immediately
        await tx.fiatWallet.upsert({
          where: { trainerId: userId },
          create: { trainerId: userId, balanceIdr: 0 },
          update: {},
        });

        return this.sanitizeProfile(profile);
      });
    } catch (err) {
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

    // Must have at least one payment option set
    if (!input.priceInLamports && !input.priceInIdr) {
      throw new BadRequestException('Set at least a Crypto price (Token price) or a Fiat price (IDR) for the service');
    }

    // Crypto: only enforce mint match if a crypto price is being set
    const tokenMintAddress = input.priceInLamports
      ? (input.tokenMintAddress ?? profile.payoutMintAddress ?? 'So11111111111111111111111111111111111111112')
      : null;

    const service = await this.prisma.trainerService.create({
      data: {
        trainerId: profile.id,
        title: input.title,
        description: input.description,
        priceInLamports: input.priceInLamports ?? null,
        priceInIdr: input.priceInIdr ?? null,
        tokenMintAddress,
      },
    });

    // Auto-create a FiatWallet ledger row for this trainer if it doesn't exist yet,
    // so fiat earnings are captured the moment the first client pays.
    if (input.priceInIdr) {
      await this.prisma.fiatWallet.upsert({
        where: { trainerId: userId },
        create: { trainerId: userId, balanceIdr: 0 },
        update: {},
      });
    }

    return service;
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
        priceInIdr: input.priceInIdr ?? undefined,
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

    const scheduledStart = new Date(input.scheduledStart);
    const scheduledEnd = new Date(input.scheduledEnd);
    
    // Assert no conflicts before proceeding
    await this.availabilityService.assertNoSchedulingConflict(
      input.trainerId,
      scheduledStart,
      scheduledEnd,
    );

    const booking = await this.prisma.booking.create({
      data: {
        clientId,
        trainerId: input.trainerId,
        serviceId: input.serviceId,
        status: BookingStatus.PENDING,
        scheduledStart,
        scheduledEnd,
        timezone: input.timezone ?? 'Asia/Jakarta',
      },
      include: { trainer: { include: { user: true } }, service: true, client: true },
    });

    // ── Notify the trainer that a new booking was requested ──────────────
    try {
      const formattedDate = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: input.timezone ?? 'Asia/Jakarta',
      }).format(scheduledStart);

      await this.notificationService.create({
        userId: booking.trainer.user.id,
        title: '📅 New Booking Request',
        body: `${booking.client?.name ?? 'A client'} has requested "${booking.service.title}" for ${formattedDate}. Review and accept it from your Bookings page.`,
        link: '/trainer/bookings',
      });
    } catch (err) {
      this.logger.warn(`Failed to send new-booking notification: ${(err as Error).message}`);
    }

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
    try {
      if (input.status === BookingStatus.COMPLETED) {
        await this.fiatPaymentService.creditTrainerOnCompletion(input.bookingId);
      } else if (input.status === BookingStatus.CANCELLED) {
        await this.fiatPaymentService.handleFiatBookingCancellation(input.bookingId);
      }
    } catch (err) {
      this.logger.error(
        `Fiat payment hook failed for booking ${input.bookingId}: ${(err as Error).message}`,
      );
    }

    // ─── Notify affected parties of the status change ────────────────────
    try {
      const serviceName = updated.service.title;
      const clientId   = updated.clientId;
      const trainerUserId = updated.trainer.user.id;

      if (input.status === BookingStatus.ACTIVE) {
        // Trainer accepted → notify client
        await this.notificationService.create({
          userId: clientId,
          title: '✅ Booking Accepted',
          body: `Your booking for "${serviceName}" has been accepted. Your session is now active!`,
          link: '/client/dashboard',
        });
      } else if (input.status === BookingStatus.COMPLETED) {
        // Completed → notify client and trainer
        await this.notificationService.createMany([
          {
            userId: clientId,
            title: '🎉 Session Completed',
            body: `Your session for "${serviceName}" has been marked as complete. Thank you for training with us!`,
            link: '/client/dashboard',
          },
          {
            userId: trainerUserId,
            title: '💰 Earnings Credited',
            body: `The session "${serviceName}" is complete and your earnings have been credited to your wallet.`,
            link: '/trainer/wallet',
          },
        ]);
      } else if (input.status === BookingStatus.CANCELLED) {
        // Cancelled → notify the other party
        if (user.role === Role.TRAINER) {
          await this.notificationService.create({
            userId: clientId,
            title: '❌ Booking Cancelled',
            body: `Your booking for "${serviceName}" was cancelled by the trainer.`,
            link: '/client/dashboard',
          });
        } else {
          await this.notificationService.create({
            userId: trainerUserId,
            title: '❌ Booking Cancelled',
            body: `A client cancelled their booking for "${serviceName}".`,
            link: '/trainer/bookings',
          });
        }
      } else if (input.status === BookingStatus.DISPUTED) {
        // Dispute raised → notify trainer
        await this.notificationService.create({
          userId: trainerUserId,
          title: '⚠️ Dispute Raised',
          body: `A client has raised a dispute for the session "${serviceName}". Our team will review it shortly.`,
          link: '/trainer/bookings',
        });
      }
    } catch (err) {
      this.logger.warn(`Notification hook failed for booking ${input.bookingId}: ${(err as Error).message}`);
    }

    return this.sanitizeBooking(updated);
  }
}
