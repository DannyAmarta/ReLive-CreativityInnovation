import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { BlockchainIndexerService } from './blockchain-indexer.service';
import { BlockchainTransactionService } from './blockchain-transaction.service';
import { BlockchainResolver } from './blockchain.resolver';
import { TrainerModule } from '../trainer/trainer.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [TrainerModule, PrismaModule, JwtModule.register({})],
  providers: [BlockchainIndexerService, BlockchainTransactionService, BlockchainResolver],
  exports: [BlockchainTransactionService],
})
export class BlockchainModule {}
