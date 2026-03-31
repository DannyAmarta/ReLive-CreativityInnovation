import { RecommendationPhaseGoal } from './dto/generate-plan.dto';
export declare enum RecommendationPlanSource {
    CLOUD_AI = "CLOUD_AI",
    USER_OPENROUTER = "USER_OPENROUTER",
    RULE_FALLBACK = "RULE_FALLBACK"
}
export declare enum RecommendationFallbackReason {
    RATE_LIMITED = "RATE_LIMITED"
}
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
    source: RecommendationPlanSource;
    rationale: string;
    contextSummary: string;
    providerNotice?: string | null;
    safetyWindow: RecommendationSafetyWindow;
    routine: GeneratedRoutineEntry[];
};
export type RecommendationFallbackContext = {
    exerciseId: string;
    exercise: string;
    phaseGoal: RecommendationPhaseGoal;
    contextSummary: string;
    safetyWindow: RecommendationSafetyWindow;
    trainingDaysPerWeek: number;
    targetSets: number | null;
    targetReps: number | null;
    notes: string | null;
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
