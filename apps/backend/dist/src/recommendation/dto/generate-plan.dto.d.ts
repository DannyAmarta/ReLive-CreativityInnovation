export declare enum RecommendationPhaseGoal {
    BASELINE_TESTING = "BASELINE_TESTING",
    HYPERTROPHY = "HYPERTROPHY",
    STRENGTH = "STRENGTH",
    POWER = "POWER",
    RECOVERY = "RECOVERY"
}
export declare class GeneratePlanDto {
    exerciseId: string;
    phaseGoal: RecommendationPhaseGoal;
    days?: number;
    trainingDaysPerWeek?: number;
    targetSets?: number;
    targetReps?: number;
    notes?: string;
}
