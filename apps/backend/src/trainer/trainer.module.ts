import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TrainerService } from './trainer.service';
import { TrainerResolver } from './trainer.resolver';
import { TrainerAvailabilityService } from './trainer-availability.service';
import { TrainerAvailabilityResolver } from './trainer-availability.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { FiatPaymentModule } from '../fiat-payment/fiat-payment.module';
import { NotificationService } from '../core/notification.service';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    FiatPaymentModule,
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
    TrainerResolver,
    TrainerAvailabilityService,
    TrainerAvailabilityResolver,
    NotificationService,
  ],
  exports: [TrainerService, TrainerAvailabilityService],
})
export class TrainerModule {}

