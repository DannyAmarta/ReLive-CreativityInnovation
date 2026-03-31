import { PrismaService } from '../prisma/prisma.service';
import { SetExerciseDefinition, SetPerformanceAnalyticsShape } from './set.types';
type BaselineComputation = Omit<SetPerformanceAnalyticsShape, 'emaOneRepMaxKg' | 'contextSummary'>;
export declare class PerformanceAnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    calculateFilteredBaseline(userId: number, exercise: SetExerciseDefinition, days?: number): Promise<BaselineComputation>;
    buildPhysiologicalContext(baseline: BaselineComputation, exercise: SetExerciseDefinition): string;
    private getWorkoutSetModel;
    private roundToTenth;
    private roundToHundredth;
}
export {};
