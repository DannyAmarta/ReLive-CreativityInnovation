import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { PerformanceAnalyticsService } from './performance-analytics.service';
import {
  SetExerciseCategory,
  SetExerciseDefinition,
  SetFormulaId,
  SetPerformanceAnalyticsShape,
} from './set.types';

@Injectable()
export class StatisticalAggregatorService {
  private readonly logger = new Logger(StatisticalAggregatorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly performanceAnalyticsService: PerformanceAnalyticsService,
  ) {}

  async calculate1RmEma(userId: number, exerciseId: string, days = 14) {
    const workoutSetModel = this.getWorkoutSetModel();
    const windowStart = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const rows = (await workoutSetModel.findMany({
      where: {
        userId,
        exerciseId,
        isCnsFatigue: false,
        calculated1Rm: {
          not: null,
        },
        createdAt: {
          gte: windowStart,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        calculated1Rm: true,
        createdAt: true,
      },
    })) as Array<{ calculated1Rm: number; createdAt: Date }>;

    const dailyValues = this.collapseToDailyPeakValues(rows);

    if (dailyValues.length === 0) {
      return {
        emaOneRepMaxKg: null,
        latestCleanOneRepMaxKg: null,
        sampleSize: 0,
      };
    }

    const alpha = 2 / (dailyValues.length + 1);
    let ema = dailyValues[0];

    for (let index = 1; index < dailyValues.length; index += 1) {
      ema = dailyValues[index] * alpha + ema * (1 - alpha);
    }

    return {
      emaOneRepMaxKg: this.roundToTenth(ema),
      latestCleanOneRepMaxKg: this.roundToTenth(
        dailyValues[dailyValues.length - 1],
      ),
      sampleSize: dailyValues.length,
    };
  }

  async buildAndStoreAnalyticsSnapshot(
    userId: number,
    exercise: SetExerciseDefinition,
    days = 14,
  ): Promise<SetPerformanceAnalyticsShape> {
    const baseline = await this.performanceAnalyticsService.calculateFilteredBaseline(
      userId,
      exercise,
      days,
    );
    const ema = await this.calculate1RmEma(userId, exercise.id, days);
    const contextSummary =
      this.performanceAnalyticsService.buildPhysiologicalContext(
        baseline,
        exercise,
      );

    const analytics: SetPerformanceAnalyticsShape = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      periodDays: days,
      emaOneRepMaxKg: ema.emaOneRepMaxKg,
      baselineAverageOneRepMaxKg: baseline.baselineAverageOneRepMaxKg,
      latestLoggedOneRepMaxKg: baseline.latestLoggedOneRepMaxKg,
      latestCleanOneRepMaxKg:
        baseline.latestCleanOneRepMaxKg ?? ema.latestCleanOneRepMaxKg,
      recentRirTrend: baseline.recentRirTrend,
      latestSessionFlagged: baseline.latestSessionFlagged,
      performanceDropRatio: baseline.performanceDropRatio,
      contextSummary,
      sampleSize: ema.sampleSize,
      isColdStart: baseline.isColdStart,
    };

    await this.upsertDailyPerformanceSnapshot(userId, exercise, analytics);

    return analytics;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async calculatePerformanceTrend() {
    this.logger.log('Starting daily performance snapshot precomputation.');

    const workoutSetModel = this.getWorkoutSetModel();
    const distinctPairs = (await workoutSetModel.findMany({
      select: {
        userId: true,
        exerciseId: true,
      },
      distinct: ['userId', 'exerciseId'],
    })) as Array<{ userId: number; exerciseId: string }>;

    for (const pair of distinctPairs) {
      const exerciseRecord = await this.getExerciseModel().findUnique({
        where: {
          id: pair.exerciseId,
        },
      });

      if (!exerciseRecord) {
        continue;
      }

      await this.buildAndStoreAnalyticsSnapshot(
        pair.userId,
        this.mapExerciseRecord(exerciseRecord),
      );
    }

    this.logger.log('Finished daily performance snapshot precomputation.');
  }

  private async upsertDailyPerformanceSnapshot(
    userId: number,
    exercise: SetExerciseDefinition,
    analytics: SetPerformanceAnalyticsShape,
  ) {
    const snapshotDate = this.startOfDay(new Date());
    const dailyPerformanceSnapshotModel =
      this.getDailyPerformanceSnapshotModel();

    await dailyPerformanceSnapshotModel.upsert({
      where: {
        userId_exerciseId_periodDays_snapshotDate: {
          userId,
          exerciseId: exercise.id,
          periodDays: analytics.periodDays,
          snapshotDate,
        },
      },
      create: {
        userId,
        exerciseId: exercise.id,
        periodDays: analytics.periodDays,
        snapshotDate,
        emaOneRepMax: analytics.emaOneRepMaxKg,
        baselineAverage1Rm: analytics.baselineAverageOneRepMaxKg,
        latestLogged1Rm: analytics.latestLoggedOneRepMaxKg,
        latestClean1Rm: analytics.latestCleanOneRepMaxKg,
        latestRirTrend: analytics.recentRirTrend,
        latestSessionFlagged: analytics.latestSessionFlagged,
        contextSummary: analytics.contextSummary,
        sampleSize: analytics.sampleSize,
      },
      update: {
        emaOneRepMax: analytics.emaOneRepMaxKg,
        baselineAverage1Rm: analytics.baselineAverageOneRepMaxKg,
        latestLogged1Rm: analytics.latestLoggedOneRepMaxKg,
        latestClean1Rm: analytics.latestCleanOneRepMaxKg,
        latestRirTrend: analytics.recentRirTrend,
        latestSessionFlagged: analytics.latestSessionFlagged,
        contextSummary: analytics.contextSummary,
        sampleSize: analytics.sampleSize,
      },
    });
  }

  private collapseToDailyPeakValues(
    rows: Array<{ calculated1Rm: number; createdAt: Date }>,
  ) {
    const dailyPeakMap = new Map<string, number>();

    for (const row of rows) {
      const key = this.startOfDay(row.createdAt).toISOString();
      const currentPeak = dailyPeakMap.get(key) ?? 0;
      dailyPeakMap.set(key, Math.max(currentPeak, row.calculated1Rm));
    }

    return Array.from(dailyPeakMap.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([, value]) => value);
  }

  private mapExerciseRecord(record: {
    id: string;
    name: string;
    category: string;
    formula: string;
    description: string;
    repCap: number | null;
    requiredMetrics: string[];
  }): SetExerciseDefinition {
    return {
      id: record.id,
      name: record.name,
      category: record.category as SetExerciseCategory,
      formula: record.formula as SetFormulaId,
      description: record.description,
      repCap: record.repCap,
      requiredMetrics: record.requiredMetrics,
    };
  }

  private startOfDay(value: Date) {
    const copy = new Date(value);
    copy.setHours(0, 0, 0, 0);
    return copy;
  }

  private getWorkoutSetModel() {
    return (this.prisma as unknown as { workoutSet: any }).workoutSet;
  }

  private getExerciseModel() {
    return (this.prisma as unknown as { exercise: any }).exercise;
  }

  private getDailyPerformanceSnapshotModel() {
    return (this.prisma as unknown as {
      dailyPerformanceSnapshot: any;
    }).dailyPerformanceSnapshot;
  }

  private roundToTenth(value: number) {
    return Math.round(value * 10) / 10;
  }
}
