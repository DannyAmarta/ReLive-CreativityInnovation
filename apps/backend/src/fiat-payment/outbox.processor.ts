import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

// The outbox relay processor reads unprocessed outbox events from PostgreSQL
// and executes the corresponding BullMQ operations (delayed enqueuing / cancellation).
@Processor('outbox-relay')
export class OutboxProcessor extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(OutboxProcessor.name);
  private lastErrorLoggedAt = 0;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @InjectQueue('escrow-release') private readonly escrowQueue: Queue,
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

    this.escrowQueue.on('error', (err) => {
      const now = Date.now();
      if (now - this.lastErrorLoggedAt > 30000) {
        this.lastErrorLoggedAt = now;
        this.logger.error(`BullMQ queue error: ${err.message || 'Connection refused. Retrying...'}`, '');
      }
    });
  }

  async onModuleInit() {
    // Worker error listener is attached immediately via _worker descriptor inside constructor
  }

  async process(job: Job<any>): Promise<void> {
    // Select unprocessed events with less than 5 retries, ordering oldest first to maintain sequence
    const events = await this.prisma.outboxEvent.findMany({
      where: { 
        processed: false,
        retryCount: { lt: 5 },
      },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    if (events.length === 0) {
      return;
    }

    this.logger.log(`Found ${events.length} unprocessed outbox events. Relaying to BullMQ...`);

    for (const event of events) {
      const payload = event.payload as Record<string, any>;
      const bookingId = payload.bookingId;

      try {
        if (event.eventType === 'enqueue-auto-release') {
          const delayDays = this.configService.get<number>('ESCROW_AUTO_RELEASE_DAYS') ?? 3;
          const delayMs = delayDays * 24 * 60 * 60 * 1000;

          // Add delayed BullMQ auto-release job
          const releaseJob = await this.escrowQueue.add(
            'auto-release',
            { bookingId },
            {
              delay: delayMs,
              attempts: 3,
              backoff: { type: 'exponential', delay: 5000 },
            },
          );

          // Update booking record to store the releaseJobId
          await this.prisma.booking.update({
            where: { id: bookingId },
            data: { releaseJobId: releaseJob.id?.toString() },
          });

          this.logger.log(
            `[Outbox] Enqueued auto-release job ${releaseJob.id} for booking ${bookingId} (delay: ${delayDays}d)`,
          );
        } else if (event.eventType === 'cancel-auto-release') {
          const releaseJobId = payload.releaseJobId;
          if (releaseJobId) {
            const pendingJob = await this.escrowQueue.getJob(releaseJobId);
            if (pendingJob) {
              await pendingJob.remove();
              this.logger.log(`[Outbox] Cancelled auto-release job ${releaseJobId} for booking ${bookingId}`);
            }
          }
          await this.prisma.booking.update({
            where: { id: bookingId },
            data: { releaseJobId: null },
          });
        }

        // Mark this event as processed in the database
        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: { processed: true, error: null },
        });
      } catch (err: any) {
        this.logger.error(
          `Failed to process outbox event ${event.id} (type: ${event.eventType}): ${err.message}`,
          err.stack,
        );
        // Fix #17: Increment retry count and store error message on failure
        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: { 
            retryCount: { increment: 1 },
            error: err.message || String(err),
          },
        });
      }
    }
  }
}
