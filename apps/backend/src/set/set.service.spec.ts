import { BadRequestException } from '@nestjs/common';
import { SetService } from './set.service';
import { SetExerciseCategory, SetFormulaId } from './set.types';

describe('SetService', () => {
  const strategy = {
    calculate: jest.fn(),
  };

  const strategyFactory = {
    getStrategy: jest.fn().mockReturnValue(strategy),
  };

  const prisma = {
    workoutSet: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    exercise: {
      upsert: jest.fn(),
    },
  };

  const statisticalAggregatorService = {
    buildAndStoreAnalyticsSnapshot: jest.fn(),
  };

  const service = new SetService(
    strategyFactory as any,
    prisma as any,
    statisticalAggregatorService as any,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalizes strength inputs before delegating to the registered strategy', () => {
    strategy.calculate.mockReturnValue({ ok: true });

    service.calculate({
      exerciseId: 'back-squat',
      weightKg: 100.34,
      reps: 5.9,
      rir: 1.8,
    } as any);

    expect(strategyFactory.getStrategy).toHaveBeenCalledWith(SetFormulaId.BRZYCKI);
    expect(strategy.calculate).toHaveBeenCalledWith({
      kind: 'strength',
      input: expect.objectContaining({
        weightKg: 100.3,
        reps: 5,
        rir: 1,
        exercise: expect.objectContaining({
          id: 'back-squat',
          category: SetExerciseCategory.LOWER_BODY_COMPOUND,
        }),
      }),
    });
  });

  it('rejects cardio calculations without an rpe value', () => {
    expect(() =>
      service.calculate({
        exerciseId: 'assault-bike',
        durationMinutes: 12,
      } as any),
    ).toThrow(BadRequestException);
  });

  it('logs a workout set and returns the refreshed snapshot payload', async () => {
    const calculation = {
      exerciseId: 'back-squat',
      exerciseName: 'Back Squat',
      category: SetExerciseCategory.LOWER_BODY_COMPOUND,
      formulaUsed: SetFormulaId.BRZYCKI,
      actualReps: 5,
      rir: 1,
      effectiveReps: 4,
      boundedEffectiveReps: 4,
      boundedByRepCap: false,
      repCap: 10,
      weightKg: 100,
      estimatedOneRepMaxKg: 112.5,
      trainingMaxKg: 106.9,
      relativeIntensityPercent: 88.9,
      volumeLoadKg: 500,
      durationMinutes: null,
      distanceMeters: null,
      pacePerKilometerMinutes: null,
      cardioLoadScore: null,
      estimatedCalories: null,
      confidenceScore: 0.92,
      primaryEnergySystem: 'ATP-PC',
      insightSummary: 'Solid strength exposure.',
      warnings: [],
      recommendedLoads: [],
    };
    const analytics = {
      exerciseId: 'back-squat',
      exerciseName: 'Back Squat',
      periodDays: 14,
      emaOneRepMaxKg: 112.5,
      baselineAverageOneRepMaxKg: 110,
      latestLoggedOneRepMaxKg: 112.5,
      latestCleanOneRepMaxKg: 112.5,
      recentRirTrend: 0,
      latestSessionFlagged: false,
      performanceDropRatio: 0,
      contextSummary: 'Stable trend.',
      sampleSize: 4,
      isColdStart: false,
    };

    jest.spyOn(service, 'calculate').mockReturnValue(calculation as any);
    prisma.workoutSet.create.mockResolvedValue({
      id: 7,
      userId: 13,
      exerciseId: 'back-squat',
      formulaUsed: SetFormulaId.BRZYCKI,
      weightLifted: 100,
      actualReps: 5,
      rirLogged: 1,
      calculated1Rm: 112.5,
      isCnsFatigue: false,
      durationMinutes: null,
      distanceMeters: null,
      rpeLogged: null,
      notes: 'focused',
      createdAt: new Date('2026-05-24T00:00:00.000Z'),
    });
    prisma.workoutSet.findUnique.mockResolvedValue(null);
    statisticalAggregatorService.buildAndStoreAnalyticsSnapshot.mockResolvedValue(
      analytics,
    );

    const result = await service.logSet(13, {
      exerciseId: 'back-squat',
      weightKg: 100,
      reps: 5,
      rir: 1,
      notes: '  focused  ',
    } as any);

    expect(prisma.exercise.upsert).toHaveBeenCalled();
    expect(prisma.workoutSet.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 13,
        exerciseId: 'back-squat',
        weightLifted: 100,
        actualReps: 5,
        rirLogged: 1,
        calculated1Rm: 112.5,
        notes: 'focused',
      }),
    });
    expect(statisticalAggregatorService.buildAndStoreAnalyticsSnapshot).toHaveBeenCalledWith(
      13,
      expect.objectContaining({ id: 'back-squat' }),
    );
    expect(result).toEqual({
      loggedSet: expect.objectContaining({
        id: 7,
        userId: 13,
        exerciseId: 'back-squat',
        exerciseName: 'Back Squat',
        formulaUsed: SetFormulaId.BRZYCKI,
      }),
      calculation,
      analytics,
    });
  });
});
