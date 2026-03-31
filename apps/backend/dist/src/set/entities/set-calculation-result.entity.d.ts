import { SetExerciseCategory, SetFormulaId } from '../set.types';
import { SetRecommendedLoad } from './set-recommended-load.entity';
export declare class SetCalculationResult {
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
