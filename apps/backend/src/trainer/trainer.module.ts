import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TrainerService } from './trainer.service';
import { TrainerResolver } from './trainer.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { FiatPaymentModule } from '../fiat-payment/fiat-payment.module';

@Module({
  imports: [PrismaModule, JwtModule.register({}), FiatPaymentModule],
  providers: [TrainerService, TrainerResolver],
  exports: [TrainerService],
})
export class TrainerModule {}
