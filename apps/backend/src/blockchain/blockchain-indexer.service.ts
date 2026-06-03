import { ConflictException, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Queue, Job } from 'bullmq';
import { Connection, PublicKey } from '@solana/web3.js';
import { TrainerService } from '../trainer/trainer.service';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus } from '@prisma/client';
import { trace, SpanStatusCode } from '@opentelemetry/api';

type BookingInitializedLog = {
  bookingId: number;
  clientWallet: string;
  trainerWallet: string;
  mint: string;
  amount: string;
  escrowAddress: string;
};

const tracer = trace.getTracer('relive-indexer');

@Processor('escrow-reconciliation')
export class BlockchainIndexerService extends WorkerHost implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BlockchainIndexerService.name);
  private subscriptionId: number | null = null;
  private connection: Connection | null = null;
  private rpcUrls: string[] = [];
  private currentRpcIndex = 0;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private retryTimeout: NodeJS.Timeout | null = null; // Fix #16: track retry so we can cancel on destroy
  private lastErrorLoggedAt = 0;
  private activeProgramId: string | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly trainerService: TrainerService,
    private readonly prisma: PrismaService,
    @InjectQueue('escrow-reconciliation') private readonly reconciliationQueue: Queue,
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

    this.reconciliationQueue.on('error', (err) => {
      const now = Date.now();
      if (now - this.lastErrorLoggedAt > 30000) {
        this.lastErrorLoggedAt = now;
        this.logger.error(`BullMQ queue error: ${err.message || 'Connection refused. Retrying...'}`, '');
      }
    });
  }

  async onModuleInit() {
    // Worker error listener is attached immediately via _worker descriptor inside constructor
    const rawUrls = this.configService.get<string>('SOLANA_RPC_URLS') || this.configService.get<string>('SOLANA_RPC_URL');
    const programId = this.configService.get<string>('ESCROW_PROGRAM_ID');

    if (!rawUrls || !programId) {
      this.logger.warn('SOLANA_RPC_URL(S) or ESCROW_PROGRAM_ID not set; blockchain indexer and reconciliation disabled.');
      return;
    }

    this.activeProgramId = programId;
    this.rpcUrls = rawUrls.split(',').map((url) => url.trim()).filter(Boolean);

    // Initial connection subscription
    await this.subscribeWithFallback(programId);

    // Start heartbeat monitor check (every 30 seconds)
    this.startHeartbeat(programId);

    // Register repeatable reconciliation loop (every 5 minutes)
    try {
      await this.reconciliationQueue.add(
        'reconcile',
        {},
        {
          repeat: { every: 300000 },
          jobId: 'escrow-reconciliation-repeatable',
          removeOnComplete: true,
          removeOnFail: true,
        },
      );
      this.logger.log('[Reconciliation] Registered 5-minute repeatable loop');
    } catch (err: any) {
      this.logger.error(`Failed to register repeatable reconciliation job: ${err.message}`);
    }
  }

  async onModuleDestroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    // Fix #16: cancel any pending reconnect timeout so it doesn't fire after destroy
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    await this.cleanupSubscription();
  }

  private async cleanupSubscription() {
    if (this.connection && this.subscriptionId !== null) {
      try {
        await this.connection.removeOnLogsListener(this.subscriptionId);
        this.logger.log('Blockchain indexer unsubscribed cleanly.');
      } catch (err: any) {
        this.logger.warn(`Failed to remove logs listener during cleanup: ${err.message}`);
      }
      this.subscriptionId = null;
    }
  }

  private async subscribeWithFallback(programId: string) {
    return tracer.startActiveSpan('subscribeWithFallback', async (span) => {
      if (this.rpcUrls.length === 0) {
        span.recordException(new Error('No RPC URLs available'));
        span.setStatus({ code: SpanStatusCode.ERROR });
        span.end();
        return;
      }

      await this.cleanupSubscription();

      for (let i = 0; i < this.rpcUrls.length; i++) {
        const index = (this.currentRpcIndex + i) % this.rpcUrls.length;
        const url = this.rpcUrls[index];
        this.logger.log(`[Failover] Attempting to connect to RPC index [${index}]: ${url}`);
        span.addEvent('connection_attempt', { url, index });

        try {
          const conn = new Connection(url, 'confirmed');
          // Health check: test slot resolution
          await conn.getSlot();
          this.connection = conn;
          this.currentRpcIndex = index;

          this.subscriptionId = conn.onLogs(
            new PublicKey(programId),
            async (logEvent: { logs: string[]; signature: string; err: any }) => {
              if (logEvent.err) return;
              const event = this.parseProgramLog(logEvent.logs);
              if (!event) return;
              await this.syncBooking(event, logEvent.signature);
            },
            'confirmed',
          );

          this.logger.log(`[Failover] Successfully connected and subscribed to RPC [${index}]: ${url}`);
          span.setAttribute('rpc.index', index);
          span.setAttribute('rpc.url', url);
          span.setStatus({ code: SpanStatusCode.OK });
          span.end();

          // Synchronously backfill any signatures missed during downtime
          await this.backfillMissedTransactions();
          return;
        } catch (err: any) {
          this.logger.warn(`[Failover] RPC [${index}] (${url}) failed: ${err.message}`);
          span.recordException(err);
        }
      }

      this.logger.error('All configured RPC endpoints are offline. Retrying in 10 seconds...');
      span.setStatus({ code: SpanStatusCode.ERROR, message: 'All RPC endpoints offline' });
      span.end();

      // Fix #16: store ref so onModuleDestroy can cancel it
      this.retryTimeout = setTimeout(() => {
        this.retryTimeout = null;
        void this.subscribeWithFallback(programId);
      }, 10000);
    });
  }

  private startHeartbeat(programId: string) {
    let failureCount = 0;
    this.heartbeatInterval = setInterval(async () => {
      if (!this.connection) return;
      try {
        await this.connection.getSlot();
        failureCount = 0;
      } catch (err: any) {
        failureCount++;
        this.logger.warn(`[Heartbeat] Failed attempt ${failureCount}/2 to RPC [${this.currentRpcIndex}]: ${err.message}`);
        
        if (failureCount >= 2) {
          this.logger.error(`[Heartbeat] RPC [${this.currentRpcIndex}] declared dead. Failover rollover initiated.`);
          
          tracer.startActiveSpan('heartbeatFailover', async (span) => {
            span.setAttribute('dead_rpc.index', this.currentRpcIndex);
            span.setAttribute('dead_rpc.url', this.rpcUrls[this.currentRpcIndex] ?? '');
            
            this.currentRpcIndex = (this.currentRpcIndex + 1) % this.rpcUrls.length;
            failureCount = 0;
            
            await this.subscribeWithFallback(programId);
            span.end();
          });
        }
      }
    }, 30000);
  }

  private isPendingExpiryColumnMissing(err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return message.includes('Booking.pendingExpiresAt') && message.includes('does not exist');
  }

  // BullMQ repeatable reconciliation check (running every 5 minutes)
  async process(job: Job<any>): Promise<void> {
    return tracer.startActiveSpan('processReconciliation', async (span) => {
      this.logger.debug('Running blockchain reconciliation loop...');
      if (!this.connection) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: 'No RPC connection' });
        span.end();
        return;
      }
      await this.backfillMissedTransactions();
      span.end();
    });
  }

  private async backfillMissedTransactions() {
    return tracer.startActiveSpan('backfillMissedTransactions', async (span) => {
      if (!this.connection) return;
      this.logger.log('[Backfill] Reconciling pending crypto bookings...');
      const now = new Date();
      let pendingBookings;

      try {
        pendingBookings = await this.prisma.booking.findMany({
          where: {
            status: BookingStatus.PENDING,
            paymentType: 'CRYPTO',
            escrowAddress: { not: null },
            pendingExpiresAt: { gt: now },
          },
        });
      } catch (err) {
        if (this.isPendingExpiryColumnMissing(err)) {
          this.logger.error(
            '[Backfill] Database migration missing: apply the pending booking expiry migration before running the blockchain indexer.',
          );
          span.setStatus({ code: SpanStatusCode.ERROR, message: 'Missing pending booking expiry migration' });
          span.recordException(err as Error);
          span.end();
          return;
        }
        throw err;
      }

      span.setAttribute('pending_bookings.count', pendingBookings.length);
      if (pendingBookings.length === 0) {
        span.end();
        return;
      }

      for (const booking of pendingBookings) {
        try {
          const escrowPublicKey = new PublicKey(booking.escrowAddress!);
          // Retrieve the last 10 transaction signatures for this derived escrow PDA
          const signaturesInfo = await this.connection.getSignaturesForAddress(escrowPublicKey, { limit: 10 });
          
          for (const sigInfo of signaturesInfo) {
            if (sigInfo.err) continue;

            const tx = await this.connection.getTransaction(sigInfo.signature, {
              commitment: 'confirmed',
              maxSupportedTransactionVersion: 0,
            });

            if (!tx || !tx.meta || !tx.meta.logMessages) continue;

            const event = this.parseProgramLog(tx.meta.logMessages);
            if (event && event.bookingId === booking.id) {
              await this.syncBooking(event, sigInfo.signature);
              span.addEvent('booking_backfilled', { bookingId: booking.id, signature: sigInfo.signature });
              break;
            }
          }
        } catch (err: any) {
          this.logger.error(`[Backfill] Failed to reconcile booking ${booking.id}: ${err.message}`);
          span.recordException(err);
        }
      }
      span.end();
    });
  }

  private async syncBooking(event: BookingInitializedLog, signature: string) {
    try {
      await this.trainerService.confirmBookingFromChain({
        bookingId: event.bookingId,
        txHash: signature,
        escrowAddress: event.escrowAddress,
        clientWallet: event.clientWallet,
        trainerWallet: event.trainerWallet,
      });
      this.logger.log(`[Indexer] Reconciled booking ${event.bookingId} with transaction: ${signature}`);
    } catch (err: any) {
      if (err?.code === 'P2002' || err instanceof ConflictException) {
        this.logger.debug(`[Indexer] Duplicate event discarded | txHash: ${signature}`);
        return;
      }
      this.logger.error(`[Indexer] Failed to sync booking: ${err.message} | txHash: ${signature}`);
    }
  }

  private parseProgramLog(logs: string[]): BookingInitializedLog | null {
    const eventLog = logs.find((log) => log.includes('BookingInitialized:'));
    if (!eventLog) return null;

    try {
      const jsonStr = eventLog.split('BookingInitialized:')[1];
      const parsed = JSON.parse(jsonStr) as BookingInitializedLog;
      if (!parsed.bookingId || !parsed.clientWallet || !parsed.trainerWallet || !parsed.escrowAddress) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }
}
