export type SetExerciseCategory =
  | "LOWER_BODY_COMPOUND"
  | "UPPER_BODY_TECHNICAL"
  | "METABOLIC_CARDIO";

export type RecommendationPhaseGoal =
  | "BASELINE_TESTING"
  | "HYPERTROPHY"
  | "STRENGTH"
  | "POWER"
  | "RECOVERY";

export type RecommendationPlanSource =
  | "CLOUD_AI"
  | "USER_OPENROUTER"
  | "RULE_FALLBACK";

export type SetFormulaId = "BRZYCKI" | "WATHAN" | "CARDIO_LOAD";

export interface SetExerciseDefinition {
  id: string;
  name: string;
  category: SetExerciseCategory;
  formula: SetFormulaId;
  description: string;
  repCap: number | null;
  requiredMetrics: string[];
}

export interface SetRecommendedLoad {
  repTarget: number;
  weightKg: number;
  intensityPercent: number;
}

export interface SetCalculationResult {
  exerciseId: string;
  exerciseName: string;
  category: SetExerciseCategory;
  formulaUsed: SetFormulaId;
  actualReps: number | null;
  rir: number | null;
  effectiveReps: number | null;
  boundedEffectiveReps: number | null;
  boundedByRepCap: boolean;
  repCap: number | null;
  weightKg: number | null;
  estimatedOneRepMaxKg: number | null;
  trainingMaxKg: number | null;
  relativeIntensityPercent: number | null;
  volumeLoadKg: number | null;
  durationMinutes: number | null;
  distanceMeters: number | null;
  pacePerKilometerMinutes: number | null;
  cardioLoadScore: number | null;
  estimatedCalories: number | null;
  confidenceScore: number;
  primaryEnergySystem: string;
  insightSummary: string;
  warnings: string[];
  recommendedLoads: SetRecommendedLoad[];
}

export interface LoggedWorkoutSet {
  id: number;
  userId: number;
  exerciseId: string;
  exerciseName: string;
  formulaUsed: SetFormulaId;
  weightLifted: number | null;
  actualReps: number | null;
  rirLogged: number | null;
  calculated1Rm: number | null;
  isCnsFatigue: boolean;
  durationMinutes: number | null;
  distanceMeters: number | null;
  rpeLogged: number | null;
  notes: string | null;
  createdAt: string;
}

export interface SetPerformanceAnalytics {
  exerciseId: string;
  exerciseName: string;
  periodDays: number;
  emaOneRepMaxKg: number | null;
  baselineAverageOneRepMaxKg: number | null;
  latestLoggedOneRepMaxKg: number | null;
  latestCleanOneRepMaxKg: number | null;
  recentRirTrend: number | null;
  latestSessionFlagged: boolean;
  performanceDropRatio: number | null;
  contextSummary: string;
  sampleSize: number;
  isColdStart: boolean;
}

export interface LoggedWorkoutSetPayload {
  loggedSet: LoggedWorkoutSet;
  calculation: SetCalculationResult;
  analytics: SetPerformanceAnalytics;
}

export interface RecommendationSafetyWindow {
  minWeightKg: number | null;
  maxWeightKg: number | null;
  minSets: number;
  maxSets: number;
  minReps: number;
  maxReps: number;
}

export interface GeneratedRoutineEntry {
  exercise: string;
  sets: number;
  reps: number;
  prescribedWeightKg: number | null;
  rationale: string;
}

export interface GeneratedWorkoutPlan {
  phaseGoal: RecommendationPhaseGoal;
  source: RecommendationPlanSource;
  rationale: string;
  contextSummary: string;
  providerNotice?: string | null;
  safetyWindow: RecommendationSafetyWindow;
  routine: GeneratedRoutineEntry[];
}

export interface SetExperienceFormValues {
  exerciseId: string;
  category: SetExerciseCategory;
  weightKg?: number;
  reps?: number;
  rir?: number;
  durationMinutes?: number;
  distanceMeters?: number;
  rpe?: number;
  notes?: string;
  phaseGoal: RecommendationPhaseGoal;
  days: number;
  trainingDaysPerWeek: number;
  targetSets?: number;
  targetReps?: number;
}
