import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TrainerService } from './trainer.service';
import { TrainerResolver } from './trainer.resolver';
import { TrainerAvailabilityService } from './trainer-availability.service';
import { PendingBookingExpiryService } from './pending-booking-expiry.service';
import { TrainerAvailabilityResolver } from './trainer-availability.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { FiatPaymentModule } from '../fiat-payment/fiat-payment.module';
import { CoreModule } from '../core/core.module'; // Fix #5: shared CoreModule

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    CoreModule, // Fix #5: provides NotificationService as shared singleton
    FiatPaymentModule,
    BullModule.registerQueue({ name: 'escrow-release' }),
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
  ],
  providers: [
    TrainerService,
    PendingBookingExpiryService,
    TrainerResolver,
    TrainerAvailabilityService,
    TrainerAvailabilityResolver,
  ],
  exports: [TrainerService, TrainerAvailabilityService],
})
export class TrainerModule {}
