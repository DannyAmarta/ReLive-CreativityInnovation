import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { FiatPaymentService } from './fiat-payment.service';
import { NotificationService } from '../core/notification.service';
import { BookingStatus } from '@prisma/client';

export interface EscrowReleaseJobData {
  bookingId: number;
}

// This processor handles the distributed auto-release of PENDING_RELEASE escrow bookings.
// By using BullMQ on top of the shared Redis instance, only one worker node across all
// horizontally-scaled instances will pick up and execute each job, preventing the
// multi-instance cron double-payment race condition that @nestjs/schedule would cause.
@Processor('escrow-release')
export class EscrowReleaseProcessor extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(EscrowReleaseProcessor.name);
  private lastErrorLoggedAt = 0;

  constructor(
    private readonly prisma: PrismaService,
    private readonly fiatPaymentService: FiatPaymentService,
    private readonly notificationService: NotificationService, // Fix #6: inject for auto-release notifications
  ) {
    super();
    let workerInstance: any = undefined;
    Object.defineProperty(this, '_worker', {
      set: (worker: any) => {
        workerInstance = worker;
        if (worker) {
          worker.on('error', (err: any) => {
            const now = Date.now();
            if (now - this.lastErrorLoggedAt > 30000) {
              this.lastErrorLoggedAt = now;
              this.logger.error(`BullMQ worker error: ${err.message || 'Connection refused. Retrying...'}`, '');
            }
          });
        }
      },
      get: () => workerInstance,
      configurable: true,
      enumerable: true,
    });
  }

  async onModuleInit() {
    // Worker error listener is attached immediately via _worker descriptor inside constructor
  }

  async process(job: Job<EscrowReleaseJobData>): Promise<void> {
    const { bookingId } = job.data;
    this.logger.log(`Processing auto-release for booking ${bookingId}`);

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      this.logger.warn(`Booking ${bookingId} not found — skipping auto-release`);
      return;
    }

    // Idempotency guard: skip if the booking was already resolved
    // (e.g., client approved early, admin resolved dispute, or job fired twice)
    if (booking.status !== BookingStatus.PENDING_RELEASE) {
      this.logger.log(
        `Booking ${bookingId} is already ${booking.status} — skipping auto-release`,
      );
      return;
    }

    // Transition to COMPLETED and credit the trainer
    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.COMPLETED, releaseJobId: null },
    });

    await this.fiatPaymentService.creditTrainerOnCompletion(bookingId);

    this.logger.log(`Auto-released booking ${bookingId} — trainer credited`);

    // Fix #6: Notify both parties that the session was auto-completed
    try {
      const fullBooking = await this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: { client: true, service: true, trainer: { include: { user: true } } },
      });
      if (fullBooking) {
        await this.notificationService.createMany([
          {
            userId: fullBooking.clientId,
            title: '🎉 Session Auto-Completed',
            body: `Your session "${fullBooking.service.title}" was automatically completed after 3 days. Thank you for training with ReLive!`,
            link: '/client/dashboard',
          },
          {
            userId: fullBooking.trainer.user.id,
            title: '💰 Earnings Auto-Released',
            body: `The session "${fullBooking.service.title}" was automatically completed after 3 days. Your earnings have been credited to your wallet.`,
            link: '/trainer/wallet',
          },
        ]);
      }
    } catch (err: any) {
      this.logger.error(`Failed to send auto-release notifications for booking ${bookingId}: ${err.message}`);
    }
  }
}
