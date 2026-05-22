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

    let contextualRole: Role | null = null;

    if (user.role === Role.ADMIN) {
      contextualRole = Role.ADMIN;
    } else if (booking.clientId === userId) {
      contextualRole = Role.USER;
    } else {
      const profile = await this.prisma.trainerProfile.findUnique({ where: { userId } });
      if (profile && booking.trainerId === profile.id) {
        contextualRole = Role.TRAINER;
      }
    }

    if (!contextualRole) {
      throw new ForbiddenException('You are not authorized to manage this booking');
    }

    const allowedForRole = ALLOWED_TRANSITIONS[contextualRole] ?? {};
    const allowedNextStatuses = allowedForRole[booking.status] ?? [];

    if (!allowedNextStatuses.includes(input.status)) {
      throw new ForbiddenException(
        `Role ${contextualRole} cannot transition booking from ${booking.status} to ${input.status}`,
      );
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
        if (booking.status === BookingStatus.DISPUTED) {
          await this.notificationService.createMany([
            {
              userId: clientId,
              title: '⚖️ Dispute Resolved',
              body: `The dispute for "${serviceName}" has been resolved. The session was marked as completed.`,
              link: '/client/dashboard',
            },
            {
              userId: trainerUserId,
              title: '⚖️ Dispute Resolved',
              body: `The dispute for "${serviceName}" has been resolved in your favor. Your earnings have been credited.`,
              link: '/trainer/wallet',
            },
          ]);
        } else {
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
        }
      } else if (input.status === BookingStatus.CANCELLED) {
        if (booking.status === BookingStatus.DISPUTED) {
          await this.notificationService.createMany([
            {
              userId: clientId,
              title: '⚖️ Dispute Resolved',
              body: `The dispute for "${serviceName}" has been resolved in your favor. The booking was cancelled and payment transaction refunded.`,
              link: '/client/dashboard',
            },
            {
              userId: trainerUserId,
              title: '⚖️ Dispute Resolved',
              body: `The dispute for "${serviceName}" has been resolved. The booking was cancelled.`,
              link: '/trainer/bookings',
            },
          ]);
        } else if (user.role === Role.TRAINER) {
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

  async getDisputedBookings() {
    const bookings = await this.prisma.booking.findMany({
      where: { status: BookingStatus.DISPUTED },
      include: { client: true, service: true, trainer: { include: { user: true } } },
      orderBy: { updatedAt: 'desc' },
    });
    return bookings.map(b => this.sanitizeBooking(b));
  }

  // ─── Reschedule & Cancellation Requests ─────────────────────────────────────

  private async getBookingParties(bookingId: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        client: true,
        trainer: { include: { user: true } },
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  private async assertIsParty(userId: number, booking: { clientId: number; trainer: { userId: number } }) {
    const isClient = booking.clientId === userId;
    const isTrainer = booking.trainer.userId === userId;
    if (!isClient && !isTrainer) {
      throw new ForbiddenException('You are not a party to this booking');
    }
    return { isClient, isTrainer };
  }

  async proposeReschedule(userId: number, input: { bookingId: number; proposedStart: string; proposedEnd: string; timezone?: string }) {
    const booking = await this.getBookingParties(input.bookingId);
    if (booking.status !== BookingStatus.ACTIVE) {
      throw new BadRequestException('Reschedule can only be proposed for ACTIVE bookings');
    }
    const { isClient, isTrainer } = await this.assertIsParty(userId, booking);

    const existing = await this.prisma.bookingRescheduleRequest.findFirst({
      where: { bookingId: input.bookingId, status: 'PENDING' },
    });
    if (existing) {
      throw new ConflictException('A reschedule proposal is already pending for this booking');
    }

    const start = new Date(input.proposedStart);
    const end = new Date(input.proposedEnd);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date format — use ISO-8601');
    }
    if (end <= start) {
      throw new BadRequestException('proposedEnd must be after proposedStart');
    }

    const request = await this.prisma.bookingRescheduleRequest.create({
      data: {
        bookingId: input.bookingId,
        proposedById: userId,
        originalStart: booking.scheduledStart,
        originalEnd: booking.scheduledEnd,
        proposedStart: start,
        proposedEnd: end,
        timezone: input.timezone ?? booking.timezone ?? 'Asia/Jakarta',
        status: 'PENDING',
      },
    });

    // Notify the other party
    const otherUserId = isClient ? booking.trainer.user.id : booking.clientId;
    const proposerName = isClient ? (booking.client.name ?? 'Your client') : (booking.trainer.user.name ?? 'Your trainer');
    try {
      await this.notificationService.create({
        userId: otherUserId,
        title: '📅 Reschedule Proposed',
        body: `${proposerName} has proposed to reschedule the "${booking.service.title}" session. Review it in your bookings.`,
        link: isClient ? '/trainer/bookings' : '/client/dashboard',
      });
    } catch (err) {
      this.logger.warn(`Notification failed for reschedule proposal on booking ${input.bookingId}: ${(err as Error).message}`);
    }

    return request;
  }

  async resolveReschedule(userId: number, input: { requestId: number; action: string }) {
    const request = await this.prisma.bookingRescheduleRequest.findUnique({
      where: { id: input.requestId },
    });
    if (!request) throw new NotFoundException('Reschedule request not found');
    if (request.status !== 'PENDING') throw new BadRequestException('This request has already been resolved');
    if (request.proposedById === userId) throw new ForbiddenException('You cannot respond to your own reschedule proposal');

    const booking = await this.getBookingParties(request.bookingId);
    await this.assertIsParty(userId, booking);

    const isAccepted = input.action === 'ACCEPT';

    const [updated] = await this.prisma.$transaction([
      this.prisma.bookingRescheduleRequest.update({
        where: { id: input.requestId },
        data: { status: isAccepted ? 'ACCEPTED' : 'REJECTED' },
      }),
      ...(isAccepted
        ? [this.prisma.booking.update({
            where: { id: request.bookingId },
            data: {
              scheduledStart: request.proposedStart,
              scheduledEnd: request.proposedEnd,
              timezone: request.timezone,
            },
          })]
        : []),
    ]);

    // Notify proposer
    try {
      await this.notificationService.create({
        userId: request.proposedById,
        title: isAccepted ? '✅ Reschedule Accepted' : '❌ Reschedule Declined',
        body: isAccepted
          ? `Your reschedule proposal for "${booking.service.title}" has been accepted. Session is now rescheduled.`
          : `Your reschedule proposal for "${booking.service.title}" was declined. The original schedule remains.`,
        link: request.proposedById === booking.clientId ? '/client/dashboard' : '/trainer/bookings',
      });
    } catch (err) {
      this.logger.warn(`Notification failed resolving reschedule ${input.requestId}: ${(err as Error).message}`);
    }

    return updated;
  }

  async requestCancellation(userId: number, input: { bookingId: number; reason?: string }) {
    const booking = await this.getBookingParties(input.bookingId);
    if (booking.status !== BookingStatus.ACTIVE) {
      throw new BadRequestException('Cancellation can only be requested for ACTIVE bookings');
    }
    const { isClient, isTrainer } = await this.assertIsParty(userId, booking);

    const existing = await this.prisma.bookingCancellationRequest.findFirst({
      where: { bookingId: input.bookingId, status: 'PENDING' },
    });
    if (existing) {
      throw new ConflictException('A cancellation request is already pending for this booking');
    }

    const request = await this.prisma.bookingCancellationRequest.create({
      data: {
        bookingId: input.bookingId,
        proposedById: userId,
        reason: input.reason,
        status: 'PENDING',
      },
    });

    const otherUserId = isClient ? booking.trainer.user.id : booking.clientId;
    const proposerName = isClient ? (booking.client.name ?? 'Your client') : (booking.trainer.user.name ?? 'Your trainer');
    try {
      await this.notificationService.create({
        userId: otherUserId,
        title: '🚫 Cancellation Requested',
        body: `${proposerName} has requested to cancel the "${booking.service.title}" session. Please review and respond.`,
        link: isClient ? '/trainer/bookings' : '/client/dashboard',
      });
    } catch (err) {
      this.logger.warn(`Notification failed for cancellation request on booking ${input.bookingId}: ${(err as Error).message}`);
    }

    return request;
  }

  async resolveCancellation(userId: number, input: { requestId: number; action: string }) {
    const request = await this.prisma.bookingCancellationRequest.findUnique({
      where: { id: input.requestId },
    });
    if (!request) throw new NotFoundException('Cancellation request not found');
    if (request.status !== 'PENDING') throw new BadRequestException('This request has already been resolved');
    if (request.proposedById === userId) throw new ForbiddenException('You cannot respond to your own cancellation request');

    const booking = await this.getBookingParties(request.bookingId);
    await this.assertIsParty(userId, booking);

    const isAccepted = input.action === 'ACCEPT';

    if (isAccepted) {
      await this.prisma.$transaction([
        this.prisma.bookingCancellationRequest.update({
          where: { id: input.requestId },
          data: { status: 'ACCEPTED' },
        }),
        this.prisma.booking.update({
          where: { id: request.bookingId },
          data: { status: BookingStatus.CANCELLED },
        }),
      ]);

      // Trigger fiat refund if applicable
      try {
        await this.fiatPaymentService.handleFiatBookingCancellation(request.bookingId);
      } catch (err) {
        this.logger.error(`Fiat refund hook failed for mutual cancellation of booking ${request.bookingId}: ${(err as Error).message}`);
      }

      // Notify both parties
      try {
        await this.notificationService.createMany([
          {
            userId: booking.clientId,
            title: '🤝 Booking Cancelled',
            body: `Your "${booking.service.title}" session has been mutually cancelled. Any payment will be refunded.`,
            link: '/client/dashboard',
          },
          {
            userId: booking.trainer.user.id,
            title: '🤝 Booking Cancelled',
            body: `The "${booking.service.title}" session has been mutually cancelled.`,
            link: '/trainer/bookings',
          },
        ]);
      } catch (err) {
        this.logger.warn(`Notifications failed for mutual cancellation of booking ${request.bookingId}: ${(err as Error).message}`);
      }
    } else {
      await this.prisma.bookingCancellationRequest.update({
        where: { id: input.requestId },
        data: { status: 'REJECTED' },
      });

      try {
        await this.notificationService.create({
          userId: request.proposedById,
          title: '❌ Cancellation Declined',
          body: `Your cancellation request for "${booking.service.title}" was declined. The session remains active.`,
          link: request.proposedById === booking.clientId ? '/client/dashboard' : '/trainer/bookings',
        });
      } catch (err) {
        this.logger.warn(`Notification failed resolving cancellation ${input.requestId}: ${(err as Error).message}`);
      }
    }

    return this.prisma.bookingCancellationRequest.findUnique({ where: { id: input.requestId } });
  }

  async getMyRescheduleRequests(userId: number) {
    // Return all PENDING reschedule requests where user is a party (client or trainer)
    const asClient = await this.prisma.bookingRescheduleRequest.findMany({
      where: {
        booking: { clientId: userId },
        status: 'PENDING',
      },
      orderBy: { createdAt: 'desc' },
    });

    const trainerProfile = await this.prisma.trainerProfile.findUnique({ where: { userId } });
    const asTrainer = trainerProfile
      ? await this.prisma.bookingRescheduleRequest.findMany({
          where: {
            booking: { trainerId: trainerProfile.id },
            status: 'PENDING',
          },
          orderBy: { createdAt: 'desc' },
        })
      : [];

    // Merge and deduplicate
    const seen = new Set<number>();
    return [...asClient, ...asTrainer].filter(r => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
  }

  async getMyCancellationRequests(userId: number) {
    const asClient = await this.prisma.bookingCancellationRequest.findMany({
      where: {
        booking: { clientId: userId },
        status: 'PENDING',
      },
      orderBy: { createdAt: 'desc' },
    });

    const trainerProfile = await this.prisma.trainerProfile.findUnique({ where: { userId } });
    const asTrainer = trainerProfile
      ? await this.prisma.bookingCancellationRequest.findMany({
          where: {
            booking: { trainerId: trainerProfile.id },
            status: 'PENDING',
          },
          orderBy: { createdAt: 'desc' },
        })
      : [];

    const seen = new Set<number>();
    return [...asClient, ...asTrainer].filter(r => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
  }
}

