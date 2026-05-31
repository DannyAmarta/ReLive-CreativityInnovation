import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../prisma/prisma.module';
import { SetResolver } from './set.resolver';
import { SetService } from './set.service';
import { PerformanceAnalyticsService } from './performance-analytics.service';
import { StatisticalAggregatorService } from './statistical-aggregator.service';
import { BrzyckiStrategy } from './strategies/brzycki.strategy';
import { WathanStrategy } from './strategies/wathan.strategy';
import { CardioLoadStrategy } from './strategies/cardio-load.strategy';
import { SetStrategyFactory } from './strategies/set-strategy.factory';
import { PartitionProvisionerProcessor } from './partition-provisioner.processor';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    BullModule.registerQueue({ name: 'partition-provisioner' }),
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
  controllers: [],
  providers: [
    SetService,
    SetResolver,
    PerformanceAnalyticsService,
    StatisticalAggregatorService,
    BrzyckiStrategy,
    WathanStrategy,
    CardioLoadStrategy,
    SetStrategyFactory,
    PartitionProvisionerProcessor,
  ],
  exports: [SetService, PerformanceAnalyticsService, StatisticalAggregatorService],
})
export class SetModule {}
