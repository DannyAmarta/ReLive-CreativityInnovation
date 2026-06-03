import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { TrainerService } from './trainer.service';

@Injectable()
export class PendingBookingExpiryService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PendingBookingExpiryService.name);
  private intervalRef: NodeJS.Timeout | null = null;

  constructor(private readonly trainerService: TrainerService) {}

  onModuleInit() {
    void this.runExpirySweep();
    this.intervalRef = setInterval(() => {
      void this.runExpirySweep();
    }, 60_000);
  }

  onModuleDestroy() {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
    }
  }

  private async runExpirySweep() {
    try {
      const result = await this.trainerService.expireAbandonedPendingBookings();
      if (result.count > 0) {
        this.logger.log(`Expired ${result.count} abandoned pending booking(s).`);
      }
    } catch (err) {
      this.logger.error(`Failed to expire abandoned pending bookings: ${(err as Error).message}`);
    }
  }
}
