import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RecommendationPhaseGoal } from './dto/generate-plan.dto';
import { RecommendationService } from './recommendation.service';
import { RecommendationPlanSource } from './recommendation.types';
import { SetExerciseCategory, SetFormulaId } from '../set/set.types';
import { SetService } from '../set/set.service';
import { AuthService } from '../auth/auth.service';

describe('RecommendationService', () => {
  let service: RecommendationService;
  let configService: { get: jest.Mock };
  let setService: { getExercises: jest.Mock; getPerformanceAnalytics: jest.Mock };
  let authService: { getConnectedOpenRouterAccess: jest.Mock };

  const exercise = {
    id: 'back-squat',
    name: 'Back Squat',
    category: SetExerciseCategory.LOWER_BODY_COMPOUND,
    formula: SetFormulaId.BRZYCKI,
    description: 'Barbell back squat',
    repCap: 12,
    requiredMetrics: ['weightKg', 'reps', 'rir'],
  };

  const analytics = {
    exerciseId: 'back-squat',
    exerciseName: 'Back Squat',
    periodDays: 14,
    emaOneRepMaxKg: 200,
    baselineAverageOneRepMaxKg: 190,
    latestLoggedOneRepMaxKg: 195,
    latestCleanOneRepMaxKg: 195,
    recentRirTrend: 1,
    latestSessionFlagged: false,
    performanceDropRatio: 0,
    contextSummary: 'Stable lower-body performance with room to progress safely.',
    sampleSize: 6,
    isColdStart: false,
  };

  beforeEach(async () => {
    configService = {
      get: jest.fn(),
    };
    setService = {
      getExercises: jest.fn().mockReturnValue([exercise]),
      getPerformanceAnalytics: jest.fn().mockResolvedValue(analytics),
    };
    authService = {
      getConnectedOpenRouterAccess: jest.fn().mockResolvedValue({
        status: 'missing',
        apiKey: null,
        keyLabel: null,
        connectedAt: null,
      }),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        RecommendationService,
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: SetService,
          useValue: setService,
        },
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    service = moduleRef.get(RecommendationService);
  });

  it('returns a rule fallback plan when the cloud API key is missing', async () => {
    configService.get.mockReturnValue('');

    const result = await service.generateWorkoutPlan(7, {
      exerciseId: 'back-squat',
      phaseGoal: RecommendationPhaseGoal.HYPERTROPHY,
      days: 14,
      trainingDaysPerWeek: 3,
    });

    expect(result.source).toBe(RecommendationPlanSource.RULE_FALLBACK);
    expect(result.routine).toHaveLength(1);
    expect(result.routine[0].exercise).toBe('Back Squat');
    expect(result.safetyWindow.minWeightKg).not.toBeNull();
  });

  it('retries with the connected OpenRouter key when the primary key is rate limited', async () => {
    configService.get.mockReturnValue('test-key');
    authService.getConnectedOpenRouterAccess.mockResolvedValue({
      status: 'available',
      apiKey: 'user-key',
      keyLabel: 'Relive fallback',
      connectedAt: new Date('2026-03-30T00:00:00.000Z'),
    });
    jest
      .spyOn(service as any, 'requestStructuredJson')
      .mockRejectedValueOnce(new Error('429 rate limited'))
      .mockResolvedValueOnce({
        phaseGoal: RecommendationPhaseGoal.STRENGTH,
        rationale: 'Connected OpenRouter recovered the plan.',
        routine: [
          {
            exercise: 'Back Squat',
            sets: 4,
            reps: 5,
            prescribedWeightKg: 165,
            rationale: 'Stay strong and crisp.',
          },
        ],
      });

    const result = await service.generateWorkoutPlan(7, {
      exerciseId: 'back-squat',
      phaseGoal: RecommendationPhaseGoal.STRENGTH,
      days: 14,
      trainingDaysPerWeek: 3,
    });

    expect(result.source).toBe(RecommendationPlanSource.USER_OPENROUTER);
    expect(result.routine).toHaveLength(1);
    expect(result.routine[0].sets).toBe(4);
    expect((service as any).requestStructuredJson).toHaveBeenCalledTimes(2);
  });

  it('returns a reconnect notice when the connected OpenRouter key cannot be decrypted', async () => {
    configService.get.mockReturnValue('test-key');
    authService.getConnectedOpenRouterAccess.mockResolvedValue({
      status: 'decrypt_failed',
      apiKey: null,
      keyLabel: 'Relive fallback',
      connectedAt: new Date('2026-03-30T00:00:00.000Z'),
    });
    jest
      .spyOn((service as any).client.chat.completions, 'create')
      .mockRejectedValue(new Error('429 rate limited'));

    const result = await service.generateWorkoutPlan(7, {
      exerciseId: 'back-squat',
      phaseGoal: RecommendationPhaseGoal.STRENGTH,
      days: 14,
      trainingDaysPerWeek: 3,
    });

    expect(result.source).toBe(RecommendationPlanSource.RULE_FALLBACK);
    expect(result.providerNotice).toContain(
      'Reconnect OpenRouter in Profile',
    );
  });

  it('returns a rule fallback plan when the cloud provider fails for a non-429 reason', async () => {
    configService.get.mockReturnValue('test-key');
    jest
      .spyOn((service as any).client.chat.completions, 'create')
      .mockRejectedValue(new Error('provider temporarily unavailable'));

    const result = await service.generateWorkoutPlan(7, {
      exerciseId: 'back-squat',
      phaseGoal: RecommendationPhaseGoal.STRENGTH,
      days: 14,
      trainingDaysPerWeek: 3,
    });

    expect(result.source).toBe(RecommendationPlanSource.RULE_FALLBACK);
    expect(result.routine[0].sets).toBeGreaterThanOrEqual(
      result.safetyWindow.minSets,
    );
    expect(result.routine[0].sets).toBeLessThanOrEqual(
      result.safetyWindow.maxSets,
    );
  });
});
