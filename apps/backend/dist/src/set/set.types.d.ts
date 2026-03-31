export declare enum SetExerciseCategory {
    LOWER_BODY_COMPOUND = "LOWER_BODY_COMPOUND",
    UPPER_BODY_TECHNICAL = "UPPER_BODY_TECHNICAL",
    METABOLIC_CARDIO = "METABOLIC_CARDIO"
}
export declare enum SetFormulaId {
    BRZYCKI = "BRZYCKI",
    WATHAN = "WATHAN",
    CARDIO_LOAD = "CARDIO_LOAD"
}
export type SetExerciseDefinition = {
    id: string;
    name: string;
    category: SetExerciseCategory;
    formula: SetFormulaId;
    description: string;
    repCap: number | null;
    requiredMetrics: string[];
};
export type StrengthCalculationInput = {
    exercise: SetExerciseDefinition;
    weightKg: number;
    reps: number;
    rir: number;
};
export type CardioCalculationInput = {
    exercise: SetExerciseDefinition;
    durationMinutes: number;
    rpe: number;
    distanceMeters: number | null;
};
export type SetRecommendedLoad = {
    repTarget: number;
    weightKg: number;
    intensityPercent: number;
};
export type SetCalculationResultShape = {
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
};
export type LoggedWorkoutSetShape = {
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
    createdAt: Date;
};
export type SetPerformanceAnalyticsShape = {
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
};
export type LoggedWorkoutSetPayloadShape = {
    loggedSet: LoggedWorkoutSetShape;
    calculation: SetCalculationResultShape;
    analytics: SetPerformanceAnalyticsShape;
};
