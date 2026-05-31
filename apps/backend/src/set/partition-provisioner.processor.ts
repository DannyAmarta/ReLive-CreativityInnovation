import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Processor('partition-provisioner')
export class PartitionProvisionerProcessor extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(PartitionProvisionerProcessor.name);
  private lastErrorLoggedAt = 0;

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('partition-provisioner') private readonly queue: Queue,
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

    this.queue.on('error', (err) => {
      const now = Date.now();
      if (now - this.lastErrorLoggedAt > 30000) {
        this.lastErrorLoggedAt = now;
        this.logger.error(`BullMQ queue error: ${err.message || 'Connection refused. Retrying...'}`, '');
      }
    });
  }

  async onModuleInit() {
    // Worker error listener is attached immediately via _worker descriptor inside constructor

    try {
      // Register repeatable job: runs every Sunday at midnight to pre-create partitions
      await this.queue.add(
        'provision',
        {},
        {
          repeat: { pattern: '0 0 * * 0' },
          jobId: 'partition-provisioner-repeatable',
          removeOnComplete: true,
          removeOnFail: true,
        },
      );
      this.logger.log('Registered partition provisioner repeatable job (weekly)');
      
      // Run once immediately on start to ensure initial partitions exist
      await this.queue.add('provision-immediate', {}, { removeOnComplete: true });
    } catch (err: any) {
      this.logger.error(`Failed to register partition provisioner repeatable job: ${err.message}`);
    }
  }

  async process(job: Job<any>): Promise<void> {
    this.logger.log('Starting dynamic partition provisioning check...');

    // We will ensure partitions exist for the current month and the next 2 months
    const now = new Date();
    const targets = [
      new Date(now.getFullYear(), now.getMonth(), 1), // Current Month
      new Date(now.getFullYear(), now.getMonth() + 1, 1), // Next Month
      new Date(now.getFullYear(), now.getMonth() + 2, 1), // Month After Next
    ];

    for (const targetDate of targets) {
      const year = targetDate.getFullYear();
      // Pad month to 2 digits
      const monthStr = String(targetDate.getMonth() + 1).padStart(2, '0');
      const tableName = `WorkoutSet_y${year}m${monthStr}`;

      // Start date: YYYY-MM-01 00:00:00
      const startDateStr = `${year}-${monthStr}-01 00:00:00`;

      // End date is targetDate + 1 month
      const nextMonthDate = new Date(year, targetDate.getMonth() + 1, 1);
      const nextYear = nextMonthDate.getFullYear();
      const nextMonthStr = String(nextMonthDate.getMonth() + 1).padStart(2, '0');
      const endDateStr = `${nextYear}-${nextMonthStr}-01 00:00:00`;

      const sql = `
        CREATE TABLE IF NOT EXISTS "${tableName}" 
        PARTITION OF "WorkoutSet" 
        FOR VALUES FROM ('${startDateStr}') TO ('${endDateStr}');
      `;

      try {
        await this.prisma.$executeRawUnsafe(sql);
        this.logger.log(`Ensured partition table "${tableName}" exists for range [${startDateStr} -> ${endDateStr}].`);
      } catch (err: any) {
        this.logger.error(`Failed to create partition table "${tableName}": ${err.message}`);
      }
    }
  }
}
