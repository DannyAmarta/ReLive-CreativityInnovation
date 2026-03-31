import { PrismaService } from '../prisma/prisma.service';
import { PerformanceAnalyticsService } from './performance-analytics.service';
import { SetExerciseDefinition, SetPerformanceAnalyticsShape } from './set.types';
export declare class StatisticalAggregatorService {
    private readonly prisma;
    private readonly performanceAnalyticsService;
    private readonly logger;
    constructor(prisma: PrismaService, performanceAnalyticsService: PerformanceAnalyticsService);
    calculate1RmEma(userId: number, exerciseId: string, days?: number): Promise<{
        emaOneRepMaxKg: null;
        latestCleanOneRepMaxKg: null;
        sampleSize: number;
    } | {
        emaOneRepMaxKg: number;
        latestCleanOneRepMaxKg: number;
        sampleSize: number;
    }>;
    buildAndStoreAnalyticsSnapshot(userId: number, exercise: SetExerciseDefinition, days?: number): Promise<SetPerformanceAnalyticsShape>;
    calculatePerformanceTrend(): Promise<void>;
    private upsertDailyPerformanceSnapshot;
    private collapseToDailyPeakValues;
    private mapExerciseRecord;
    private startOfDay;
    private getWorkoutSetModel;
    private getExerciseModel;
    private getDailyPerformanceSnapshotModel;
    private roundToTenth;
}
