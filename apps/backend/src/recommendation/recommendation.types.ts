import { RecommendationPhaseGoal } from './dto/generate-plan.dto';

export type RecommendationSafetyWindow = {
  minWeightKg: number | null;
  maxWeightKg: number | null;
  minSets: number;
  maxSets: number;
  minReps: number;
  maxReps: number;
};

export type GeneratedRoutineEntry = {
  exercise: string;
  sets: number;
  reps: number;
  prescribedWeightKg: number | null;
  rationale: string;
};

export type GeneratedWorkoutPlan = {
  phaseGoal: RecommendationPhaseGoal;
  rationale: string;
  contextSummary: string;
  safetyWindow: RecommendationSafetyWindow;
  routine: GeneratedRoutineEntry[];
};

export type FeatureImplementationStep = {
  step: string;
  action: string;
  technicalDetail: string;
};

export type FeatureDangerousProblem = {
  threatName: string;
  theThreat: string;
  theFix: string;
};

export type FeatureThreatAnalysis = {
  featureName: string;
  executiveSummary: string;
  implementationSteps: FeatureImplementationStep[];
  dangerousProblems: FeatureDangerousProblem[];
};
