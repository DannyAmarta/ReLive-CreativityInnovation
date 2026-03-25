import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  SetExerciseCategory,
  SetExerciseDefinition,
  SetPerformanceAnalyticsShape,
} from './set.types';

type BaselineComputation = Omit<SetPerformanceAnalyticsShape, 'emaOneRepMaxKg' | 'contextSummary'>;

@Injectable()
export class PerformanceAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async calculateFilteredBaseline(
    userId: number,
    exercise: SetExerciseDefinition,
    days = 14,
  ): Promise<BaselineComputation> {
    if (exercise.category === SetExerciseCategory.METABOLIC_CARDIO) {
      return {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        periodDays: days,
        baselineAverageOneRepMaxKg: null,
        latestLoggedOneRepMaxKg: null,
        latestCleanOneRepMaxKg: null,
        recentRirTrend: null,
        latestSessionFlagged: false,
        performanceDropRatio: null,
        sampleSize: 0,
        isColdStart: true,
      };
    }

    const workoutSetModel = this.getWorkoutSetModel();
    const windowStart = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const latestLoggedSet = await workoutSetModel.findFirst({
      where: {
        userId,
        exerciseId: exercise.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!latestLoggedSet || latestLoggedSet.calculated1Rm == null) {
      return {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        periodDays: days,
        baselineAverageOneRepMaxKg: null,
        latestLoggedOneRepMaxKg: null,
        latestCleanOneRepMaxKg: null,
        recentRirTrend: null,
        latestSessionFlagged: false,
        performanceDropRatio: null,
        sampleSize: 0,
        isColdStart: true,
      };
    }

    const cleanSets = (await workoutSetModel.findMany({
      where: {
        userId,
        exerciseId: exercise.id,
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
    })) as Array<{
      id: number;
      calculated1Rm: number | null;
      rirLogged: number | null;
      createdAt: Date;
    }>;

    const baselineCandidates = cleanSets.filter((set) => set.id !== latestLoggedSet.id);
    const baselineAverageOneRepMaxKg =
      baselineCandidates.length > 0
        ? this.roundToTenth(
            baselineCandidates.reduce(
              (sum, set) => sum + (set.calculated1Rm ?? 0),
              0,
            ) / baselineCandidates.length,
          )
        : null;

    const latestLoggedOneRepMaxKg = this.roundToTenth(latestLoggedSet.calculated1Rm);
    const performanceDropRatio =
      baselineAverageOneRepMaxKg && latestLoggedOneRepMaxKg
        ? (baselineAverageOneRepMaxKg - latestLoggedOneRepMaxKg) /
          baselineAverageOneRepMaxKg
        : null;

    let latestSessionFlagged = Boolean(latestLoggedSet.isCnsFatigue);

    if (
      performanceDropRatio !== null &&
      performanceDropRatio > 0.15 &&
      !latestLoggedSet.isCnsFatigue
    ) {
      await workoutSetModel.update({
        where: {
          id: latestLoggedSet.id,
        },
        data: {
          isCnsFatigue: true,
        },
      });

      latestSessionFlagged = true;
    }

    const cleanSetsAfterFlag = latestSessionFlagged
      ? cleanSets.filter((set) => set.id !== latestLoggedSet.id)
      : cleanSets;

    const latestCleanSet =
      cleanSetsAfterFlag[cleanSetsAfterFlag.length - 1] ?? null;
    const recentRirSamples = cleanSetsAfterFlag
      .map((set) => set.rirLogged)
      .filter((value): value is number => typeof value === 'number')
      .slice(-5);

    const recentRirTrend =
      recentRirSamples.length > 0
        ? this.roundToHundredth(
            recentRirSamples.reduce((sum, value) => sum + value, 0) /
              recentRirSamples.length,
          )
        : null;

    return {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      periodDays: days,
      baselineAverageOneRepMaxKg,
      latestLoggedOneRepMaxKg,
      latestCleanOneRepMaxKg: latestCleanSet?.calculated1Rm
        ? this.roundToTenth(latestCleanSet.calculated1Rm)
        : null,
      recentRirTrend,
      latestSessionFlagged,
      performanceDropRatio:
        performanceDropRatio !== null
          ? this.roundToHundredth(performanceDropRatio)
          : null,
      sampleSize: cleanSetsAfterFlag.length,
      isColdStart: cleanSetsAfterFlag.length === 0,
    };
  }

  buildPhysiologicalContext(
    baseline: BaselineComputation,
    exercise: SetExerciseDefinition,
  ) {
    if (exercise.category === SetExerciseCategory.METABOLIC_CARDIO) {
      return `The user's recent ${exercise.name} entries are stored, but this movement does not use a 1RM baseline. Progress conditioning conservatively and prioritize effort quality.`;
    }

    if (
      baseline.isColdStart ||
      baseline.baselineAverageOneRepMaxKg === null
    ) {
      return `The user has no clean ${baseline.periodDays}-day ${exercise.name} history yet. Prescribe a conservative baseline testing week and log submaximal sets before progressing load.`;
    }

    if (
      baseline.latestSessionFlagged &&
      baseline.performanceDropRatio !== null
    ) {
      return `The user's ${baseline.periodDays}-day ${exercise.name} baseline is ${baseline.baselineAverageOneRepMaxKg}kg. Their last session triggered a CNS Fatigue flag (${Math.round(
        baseline.performanceDropRatio * 100,
      )}% drop in performance). Prioritize recovery.`;
    }

    const rirPhrase =
      baseline.recentRirTrend !== null
        ? ` Their recent RIR trend is ${baseline.recentRirTrend.toFixed(2)}.`
        : '';

    return `The user's ${baseline.periodDays}-day ${exercise.name} baseline is ${baseline.baselineAverageOneRepMaxKg}kg.${rirPhrase} Keep progression inside safe, conservative boundaries.`;
  }

  private getWorkoutSetModel() {
    return (this.prisma as unknown as { workoutSet: any }).workoutSet;
  }

  private roundToTenth(value: number) {
    return Math.round(value * 10) / 10;
  }

  private roundToHundredth(value: number) {
    return Math.round(value * 100) / 100;
  }
}
