import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CalculateSetInput } from './dto/calculate-set.input';
import { LogWorkoutSetInput } from './dto/log-workout-set.input';
import { StatisticalAggregatorService } from './statistical-aggregator.service';
import { SET_EXERCISE_CATALOG } from './set-exercise.catalog';
import {
  CardioCalculationInput,
  LoggedWorkoutSetPayloadShape,
  LoggedWorkoutSetShape,
  SetCalculationResultShape,
  SetExerciseCategory,
  SetExerciseDefinition,
  SetFormulaId,
  SetPerformanceAnalyticsShape,
  StrengthCalculationInput,
} from './set.types';
import { SetStrategyFactory } from './strategies/set-strategy.factory';

@Injectable()
export class SetService {
  constructor(
    private readonly strategyFactory: SetStrategyFactory,
    private readonly prisma: PrismaService,
    private readonly statisticalAggregatorService: StatisticalAggregatorService,
  ) {}

  getExercises() {
    return SET_EXERCISE_CATALOG;
  }

  calculate(input: CalculateSetInput | LogWorkoutSetInput): SetCalculationResultShape {
    const exercise = this.getExerciseOrThrow(input.exerciseId);
    const strategy = this.strategyFactory.getStrategy(exercise.formula);

    if (exercise.category === SetExerciseCategory.METABOLIC_CARDIO) {
      const cardioInput = this.normalizeCardioInput(exercise, input);
      return strategy.calculate({ kind: 'cardio', input: cardioInput });
    }

    const strengthInput = this.normalizeStrengthInput(exercise, input);
    return strategy.calculate({ kind: 'strength', input: strengthInput });
  }

  async logSet(
    userId: number,
    input: LogWorkoutSetInput,
  ): Promise<LoggedWorkoutSetPayloadShape> {
    const exercise = this.getExerciseOrThrow(input.exerciseId);
    await this.upsertExerciseCatalogEntry(exercise);

    const calculation = this.calculate(input);
    const createdSet = await this.getWorkoutSetModel().create({
      data: {
        userId,
        exerciseId: exercise.id,
        weightLifted: calculation.weightKg,
        actualReps: calculation.actualReps,
        rirLogged: calculation.rir,
        calculated1Rm: calculation.estimatedOneRepMaxKg,
        formulaUsed: calculation.formulaUsed,
        durationMinutes: calculation.durationMinutes,
        distanceMeters: calculation.distanceMeters,
        rpeLogged:
          typeof input.rpe === 'number' && !Number.isNaN(input.rpe)
            ? this.roundToHundredth(input.rpe)
            : null,
        notes: input.notes?.trim() || null,
      },
    });

    const analytics = await this.statisticalAggregatorService.buildAndStoreAnalyticsSnapshot(
      userId,
      exercise,
    );
    const refreshedSet = await this.getWorkoutSetModel().findUnique({
      where: {
        id: createdSet.id,
      },
    });

    return {
      loggedSet: this.mapLoggedWorkoutSet(refreshedSet ?? createdSet, exercise),
      calculation,
      analytics,
    };
  }

  async getPerformanceAnalytics(
    userId: number,
    exerciseId: string,
    days = 14,
  ): Promise<SetPerformanceAnalyticsShape> {
    const exercise = this.getExerciseOrThrow(exerciseId);
    await this.upsertExerciseCatalogEntry(exercise);

    return this.statisticalAggregatorService.buildAndStoreAnalyticsSnapshot(
      userId,
      exercise,
      days,
    );
  }

  async syncCatalogIntoDatabase() {
    for (const exercise of SET_EXERCISE_CATALOG) {
      await this.upsertExerciseCatalogEntry(exercise);
    }
  }

  private mapLoggedWorkoutSet(
    record: {
      id: number;
      userId: number;
      exerciseId: string;
      formulaUsed: string;
      weightLifted: number | null;
      actualReps: number | null;
      rirLogged: number | null;
      calculated1Rm: number | null;
      isCnsFatigue: boolean;
      durationMinutes: number | null;
      distanceMeters: number | null;
      rpeLogged: number | null;
      notes: string | null;
      createdAt: Date;
    },
    exercise: SetExerciseDefinition,
  ): LoggedWorkoutSetShape {
    return {
      id: record.id,
      userId: record.userId,
      exerciseId: record.exerciseId,
      exerciseName: exercise.name,
      formulaUsed: record.formulaUsed as SetFormulaId,
      weightLifted: record.weightLifted,
      actualReps: record.actualReps,
      rirLogged: record.rirLogged,
      calculated1Rm: record.calculated1Rm,
      isCnsFatigue: record.isCnsFatigue,
      durationMinutes: record.durationMinutes,
      distanceMeters: record.distanceMeters,
      rpeLogged: record.rpeLogged,
      notes: record.notes,
      createdAt: record.createdAt,
    };
  }

  private getExerciseOrThrow(exerciseId: string) {
    const exercise = SET_EXERCISE_CATALOG.find((item) => item.id === exerciseId);

    if (!exercise) {
      throw new BadRequestException(`Unknown exercise "${exerciseId}".`);
    }

    return exercise;
  }

  private async upsertExerciseCatalogEntry(exercise: SetExerciseDefinition) {
    await this.getExerciseModel().upsert({
      where: {
        id: exercise.id,
      },
      create: {
        id: exercise.id,
        name: exercise.name,
        category: exercise.category,
        formula: exercise.formula,
        description: exercise.description,
        repCap: exercise.repCap,
        requiredMetrics: exercise.requiredMetrics,
      },
      update: {
        name: exercise.name,
        category: exercise.category,
        formula: exercise.formula,
        description: exercise.description,
        repCap: exercise.repCap,
        requiredMetrics: exercise.requiredMetrics,
        isActive: true,
      },
    });
  }

  private normalizeStrengthInput(
    exercise: SetExerciseDefinition,
    input: CalculateSetInput | LogWorkoutSetInput,
  ): StrengthCalculationInput {
    if (typeof input.weightKg !== 'number' || Number.isNaN(input.weightKg)) {
      throw new BadRequestException('weightKg is required for strength calculations.');
    }

    if (typeof input.reps !== 'number' || Number.isNaN(input.reps)) {
      throw new BadRequestException('reps is required for strength calculations.');
    }

    const reps = Math.max(1, Math.trunc(input.reps));
    const rir = Math.max(0, Math.trunc(input.rir ?? 0));

    if (reps > 30) {
      throw new BadRequestException(
        'Strength calculations reject very high reps because they stop representing max-strength data.',
      );
    }

    return {
      exercise,
      weightKg: this.roundToTenth(input.weightKg),
      reps,
      rir,
    };
  }

  private normalizeCardioInput(
    exercise: SetExerciseDefinition,
    input: CalculateSetInput | LogWorkoutSetInput,
  ): CardioCalculationInput {
    if (
      typeof input.durationMinutes !== 'number' ||
      Number.isNaN(input.durationMinutes)
    ) {
      throw new BadRequestException(
        'durationMinutes is required for metabolic/cardio calculations.',
      );
    }

    if (typeof input.rpe !== 'number' || Number.isNaN(input.rpe)) {
      throw new BadRequestException('rpe is required for metabolic/cardio calculations.');
    }

    return {
      exercise,
      durationMinutes: this.roundToHundredth(input.durationMinutes),
      rpe: this.roundToHundredth(input.rpe),
      distanceMeters:
        typeof input.distanceMeters === 'number' && !Number.isNaN(input.distanceMeters)
          ? this.roundToTenth(input.distanceMeters)
          : null,
    };
  }

  private getWorkoutSetModel() {
    return (this.prisma as unknown as { workoutSet: any }).workoutSet;
  }

  private getExerciseModel() {
    return (this.prisma as unknown as { exercise: any }).exercise;
  }

  private roundToTenth(value: number) {
    return Math.round(value * 10) / 10;
  }

  private roundToHundredth(value: number) {
    return Math.round(value * 100) / 100;
  }
}
