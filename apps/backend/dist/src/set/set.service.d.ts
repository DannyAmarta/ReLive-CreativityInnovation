import { PrismaService } from '../prisma/prisma.service';
import { CalculateSetInput } from './dto/calculate-set.input';
import { LogWorkoutSetInput } from './dto/log-workout-set.input';
import { StatisticalAggregatorService } from './statistical-aggregator.service';
import { LoggedWorkoutSetPayloadShape, SetCalculationResultShape, SetExerciseDefinition, SetPerformanceAnalyticsShape } from './set.types';
import { SetStrategyFactory } from './strategies/set-strategy.factory';
export declare class SetService {
    private readonly strategyFactory;
    private readonly prisma;
    private readonly statisticalAggregatorService;
    constructor(strategyFactory: SetStrategyFactory, prisma: PrismaService, statisticalAggregatorService: StatisticalAggregatorService);
    getExercises(): SetExerciseDefinition[];
    calculate(input: CalculateSetInput | LogWorkoutSetInput): SetCalculationResultShape;
    logSet(userId: number, input: LogWorkoutSetInput): Promise<LoggedWorkoutSetPayloadShape>;
    getPerformanceAnalytics(userId: number, exerciseId: string, days?: number): Promise<SetPerformanceAnalyticsShape>;
    syncCatalogIntoDatabase(): Promise<void>;
    private mapLoggedWorkoutSet;
    private getExerciseOrThrow;
    private upsertExerciseCatalogEntry;
    private normalizeStrengthInput;
    private normalizeCardioInput;
    private getWorkoutSetModel;
    private getExerciseModel;
    private roundToTenth;
    private roundToHundredth;
}
