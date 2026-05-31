import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BlockchainIndexerService } from './blockchain-indexer.service';
import { BlockchainTransactionService } from './blockchain-transaction.service';
import { BlockchainResolver } from './blockchain.resolver';
import { TrainerModule } from '../trainer/trainer.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    TrainerModule,
    PrismaModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow<string>('JWT_EXPIRES_IN') as any,
        },
      }),
    }),
    BullModule.registerQueue({ name: 'escrow-reconciliation' }),
  ],
  providers: [BlockchainIndexerService, BlockchainTransactionService, BlockchainResolver],
  exports: [BlockchainTransactionService],
})
export class BlockchainModule {}
