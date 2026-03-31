"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var StatisticalAggregatorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticalAggregatorService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const performance_analytics_service_1 = require("./performance-analytics.service");
let StatisticalAggregatorService = StatisticalAggregatorService_1 = class StatisticalAggregatorService {
    prisma;
    performanceAnalyticsService;
    logger = new common_1.Logger(StatisticalAggregatorService_1.name);
    constructor(prisma, performanceAnalyticsService) {
        this.prisma = prisma;
        this.performanceAnalyticsService = performanceAnalyticsService;
    }
    async calculate1RmEma(userId, exerciseId, days = 14) {
        const workoutSetModel = this.getWorkoutSetModel();
        const windowStart = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const rows = (await workoutSetModel.findMany({
            where: {
                userId,
                exerciseId,
                isCnsFatigue: false,
                calculated1Rm: {
                    not: null,
                },
                createdAt: {
                    gte: windowStart,
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
            select: {
                calculated1Rm: true,
                createdAt: true,
            },
        }));
        const dailyValues = this.collapseToDailyPeakValues(rows);
        if (dailyValues.length === 0) {
            return {
                emaOneRepMaxKg: null,
                latestCleanOneRepMaxKg: null,
                sampleSize: 0,
            };
        }
        const alpha = 2 / (dailyValues.length + 1);
        let ema = dailyValues[0];
        for (let index = 1; index < dailyValues.length; index += 1) {
            ema = dailyValues[index] * alpha + ema * (1 - alpha);
        }
        return {
            emaOneRepMaxKg: this.roundToTenth(ema),
            latestCleanOneRepMaxKg: this.roundToTenth(dailyValues[dailyValues.length - 1]),
            sampleSize: dailyValues.length,
        };
    }
    async buildAndStoreAnalyticsSnapshot(userId, exercise, days = 14) {
        const baseline = await this.performanceAnalyticsService.calculateFilteredBaseline(userId, exercise, days);
        const ema = await this.calculate1RmEma(userId, exercise.id, days);
        const contextSummary = this.performanceAnalyticsService.buildPhysiologicalContext(baseline, exercise);
        const analytics = {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            periodDays: days,
            emaOneRepMaxKg: ema.emaOneRepMaxKg,
            baselineAverageOneRepMaxKg: baseline.baselineAverageOneRepMaxKg,
            latestLoggedOneRepMaxKg: baseline.latestLoggedOneRepMaxKg,
            latestCleanOneRepMaxKg: baseline.latestCleanOneRepMaxKg ?? ema.latestCleanOneRepMaxKg,
            recentRirTrend: baseline.recentRirTrend,
            latestSessionFlagged: baseline.latestSessionFlagged,
            performanceDropRatio: baseline.performanceDropRatio,
            contextSummary,
            sampleSize: ema.sampleSize,
            isColdStart: baseline.isColdStart,
        };
        await this.upsertDailyPerformanceSnapshot(userId, exercise, analytics);
        return analytics;
    }
    async calculatePerformanceTrend() {
        this.logger.log('Starting daily performance snapshot precomputation.');
        const workoutSetModel = this.getWorkoutSetModel();
        const distinctPairs = (await workoutSetModel.findMany({
            select: {
                userId: true,
                exerciseId: true,
            },
            distinct: ['userId', 'exerciseId'],
        }));
        for (const pair of distinctPairs) {
            const exerciseRecord = await this.getExerciseModel().findUnique({
                where: {
                    id: pair.exerciseId,
                },
            });
            if (!exerciseRecord) {
                continue;
            }
            await this.buildAndStoreAnalyticsSnapshot(pair.userId, this.mapExerciseRecord(exerciseRecord));
        }
        this.logger.log('Finished daily performance snapshot precomputation.');
    }
    async upsertDailyPerformanceSnapshot(userId, exercise, analytics) {
        const snapshotDate = this.startOfDay(new Date());
        const dailyPerformanceSnapshotModel = this.getDailyPerformanceSnapshotModel();
        await dailyPerformanceSnapshotModel.upsert({
            where: {
                userId_exerciseId_periodDays_snapshotDate: {
                    userId,
                    exerciseId: exercise.id,
                    periodDays: analytics.periodDays,
                    snapshotDate,
                },
            },
            create: {
                userId,
                exerciseId: exercise.id,
                periodDays: analytics.periodDays,
                snapshotDate,
                emaOneRepMax: analytics.emaOneRepMaxKg,
                baselineAverage1Rm: analytics.baselineAverageOneRepMaxKg,
                latestLogged1Rm: analytics.latestLoggedOneRepMaxKg,
                latestClean1Rm: analytics.latestCleanOneRepMaxKg,
                latestRirTrend: analytics.recentRirTrend,
                latestSessionFlagged: analytics.latestSessionFlagged,
                contextSummary: analytics.contextSummary,
                sampleSize: analytics.sampleSize,
            },
            update: {
                emaOneRepMax: analytics.emaOneRepMaxKg,
                baselineAverage1Rm: analytics.baselineAverageOneRepMaxKg,
                latestLogged1Rm: analytics.latestLoggedOneRepMaxKg,
                latestClean1Rm: analytics.latestCleanOneRepMaxKg,
                latestRirTrend: analytics.recentRirTrend,
                latestSessionFlagged: analytics.latestSessionFlagged,
                contextSummary: analytics.contextSummary,
                sampleSize: analytics.sampleSize,
            },
        });
    }
    collapseToDailyPeakValues(rows) {
        const dailyPeakMap = new Map();
        for (const row of rows) {
            const key = this.startOfDay(row.createdAt).toISOString();
            const currentPeak = dailyPeakMap.get(key) ?? 0;
            dailyPeakMap.set(key, Math.max(currentPeak, row.calculated1Rm));
        }
        return Array.from(dailyPeakMap.entries())
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([, value]) => value);
    }
    mapExerciseRecord(record) {
        return {
            id: record.id,
            name: record.name,
            category: record.category,
            formula: record.formula,
            description: record.description,
            repCap: record.repCap,
            requiredMetrics: record.requiredMetrics,
        };
    }
    startOfDay(value) {
        const copy = new Date(value);
        copy.setHours(0, 0, 0, 0);
        return copy;
    }
    getWorkoutSetModel() {
        return this.prisma.workoutSet;
    }
    getExerciseModel() {
        return this.prisma.exercise;
    }
    getDailyPerformanceSnapshotModel() {
        return this.prisma.dailyPerformanceSnapshot;
    }
    roundToTenth(value) {
        return Math.round(value * 10) / 10;
    }
};
exports.StatisticalAggregatorService = StatisticalAggregatorService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatisticalAggregatorService.prototype, "calculatePerformanceTrend", null);
exports.StatisticalAggregatorService = StatisticalAggregatorService = StatisticalAggregatorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        performance_analytics_service_1.PerformanceAnalyticsService])
], StatisticalAggregatorService);
//# sourceMappingURL=statistical-aggregator.service.js.map