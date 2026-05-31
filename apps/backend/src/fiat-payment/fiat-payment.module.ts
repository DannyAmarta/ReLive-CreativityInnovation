import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaModule } from '../prisma/prisma.module';
import { FiatPaymentService } from './fiat-payment.service';
import { FiatPaymentResolver } from './fiat-payment.resolver';
import { FiatPaymentWebhookController } from './fiat-payment.webhook.controller';
import { EscrowReleaseProcessor } from './escrow-release.processor';
import { OutboxProcessor } from './outbox.processor';
import { CoreModule } from '../core/core.module'; // Fix #5: shared CoreModule

@Module({
  imports: [
    PrismaModule,
    CoreModule, // Fix #5: provides NotificationService as shared singleton
    BullModule.registerQueue(
      { name: 'escrow-release' },
      { name: 'outbox-relay' },
    ),
  ],
  controllers: [FiatPaymentWebhookController],
  providers: [
    FiatPaymentService,
    FiatPaymentResolver,
    EscrowReleaseProcessor,
    OutboxProcessor,
  ],
  exports: [FiatPaymentService],
})
export class FiatPaymentModule implements OnModuleInit {
  private readonly logger = new Logger(FiatPaymentModule.name);
  private lastErrorLoggedAt = 0;

  constructor(
    @InjectQueue('outbox-relay') private readonly outboxQueue: Queue,
    @InjectQueue('escrow-release') private readonly escrowQueue: Queue,
  ) {
    this.outboxQueue.on('error', (err) => {
      const now = Date.now();
      if (now - this.lastErrorLoggedAt > 30000) {
        this.lastErrorLoggedAt = now;
        this.logger.error(`BullMQ outbox-relay queue connection error: ${err.message || 'Connection refused. Retrying...'}`, '');
      }
    });

    this.escrowQueue.on('error', (err) => {
      const now = Date.now();
      if (now - this.lastErrorLoggedAt > 30000) {
        this.lastErrorLoggedAt = now;
        this.logger.error(`BullMQ escrow-release queue connection error: ${err.message || 'Connection refused. Retrying...'}`, '');
      }
    });
  }

  async onModuleInit() {

    try {
      // Schedule a repeatable job to trigger the outbox relay check every 5 seconds.
      // Behind a load balancer, only one instance will run the job at any given time.
      await this.outboxQueue.add(
        'process',
        {},
        {
          repeat: { every: 5000 },
          jobId: 'outbox-relay-repeatable',
          removeOnComplete: true,
          removeOnFail: true,
        },
      );
    } catch (err: any) {
      this.logger.error(`Failed to register outbox relay repeatable job: ${err.message}`);
    }
  }
}