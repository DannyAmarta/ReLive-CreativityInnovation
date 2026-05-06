import { ConflictException, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TrainerService } from '../trainer/trainer.service';

type BookingInitializedLog = {
  bookingId: number;
  clientWallet: string;
  trainerWallet: string;
  mint: string;
  amount: string;
  escrowAddress: string;
};

@Injectable()
export class BlockchainIndexerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BlockchainIndexerService.name);
  private subscriptionId: number | null = null;
  private connection: any = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly trainerService: TrainerService,
  ) {}

  async onModuleInit() {
    const rpcUrl = this.configService.get<string>('SOLANA_RPC_URL');
    const programId = this.configService.get<string>('ESCROW_PROGRAM_ID');

    if (!rpcUrl || !programId) {
      this.logger.warn('SOLANA_RPC_URL or ESCROW_PROGRAM_ID not set; blockchain indexer disabled.');
      return;
    }

    await this.subscribeToEscrowEvents(rpcUrl, programId);
  }

  async onModuleDestroy() {
    if (this.connection && this.subscriptionId !== null) {
      await this.connection.removeOnLogsListener(this.subscriptionId);
      this.logger.log('Blockchain indexer unsubscribed cleanly.');
    }
  }

  private async subscribeToEscrowEvents(rpcUrl: string, programId: string) {
    try {
      const solanaWeb3 = await import('@solana/web3.js');
      const { Connection, PublicKey } = solanaWeb3;

      this.connection = new Connection(rpcUrl, 'confirmed');
      this.subscriptionId = this.connection.onLogs(
        new PublicKey(programId),
        async (logEvent: { logs: string[]; signature: string; err: any }) => {
          if (logEvent.err) return;

          const event = this.parseProgramLog(logEvent.logs);
          if (!event) return;

          try {
            await this.trainerService.confirmBookingFromChain({
              bookingId: event.bookingId,
              txHash: logEvent.signature,
              escrowAddress: event.escrowAddress,
              clientWallet: event.clientWallet,
              trainerWallet: event.trainerWallet,
            });
            this.logger.log(`[Indexer] Booking ${event.bookingId} synced from ${logEvent.signature}`);
          } catch (err: any) {
            if (err?.code === 'P2002' || err instanceof ConflictException) {
              this.logger.debug(`[Indexer] Duplicate event discarded | txHash: ${logEvent.signature}`);
              return;
            }
            this.logger.error(`[Indexer] Failed to sync booking: ${err.message} | txHash: ${logEvent.signature}`);
          }
        },
        'confirmed',
      );

      this.logger.log(`[Indexer] Listening on escrow program ${programId}`);
    } catch (err) {
      this.logger.error(`[Indexer] Failed to start: ${(err as Error).message}`);
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
