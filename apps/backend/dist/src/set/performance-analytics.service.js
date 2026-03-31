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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const set_types_1 = require("./set.types");
let PerformanceAnalyticsService = class PerformanceAnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async calculateFilteredBaseline(userId, exercise, days = 14) {
        if (exercise.category === set_types_1.SetExerciseCategory.METABOLIC_CARDIO) {
            return {
                exerciseId: exercise.id,
                exerciseName: exercise.name,
                periodDays: days,
                baselineAverageOneRepMaxKg: null,
                latestLoggedOneRepMaxKg: null,
                latestCleanOneRepMaxKg: null,
                recentRirTrend: null,
                latestSessionFlagged: false,
                performanceDropRatio: null,
                sampleSize: 0,
                isColdStart: true,
            };
        }
        const workoutSetModel = this.getWorkoutSetModel();
        const windowStart = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const latestLoggedSet = await workoutSetModel.findFirst({
            where: {
                userId,
                exerciseId: exercise.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        if (!latestLoggedSet || latestLoggedSet.calculated1Rm == null) {
            return {
                exerciseId: exercise.id,
                exerciseName: exercise.name,
                periodDays: days,
                baselineAverageOneRepMaxKg: null,
                latestLoggedOneRepMaxKg: null,
                latestCleanOneRepMaxKg: null,
                recentRirTrend: null,
                latestSessionFlagged: false,
                performanceDropRatio: null,
                sampleSize: 0,
                isColdStart: true,
            };
        }
        const cleanSets = (await workoutSetModel.findMany({
            where: {
                userId,
                exerciseId: exercise.id,
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
        }));
        const baselineCandidates = cleanSets.filter((set) => set.id !== latestLoggedSet.id);
        const baselineAverageOneRepMaxKg = baselineCandidates.length > 0
            ? this.roundToTenth(baselineCandidates.reduce((sum, set) => sum + (set.calculated1Rm ?? 0), 0) / baselineCandidates.length)
            : null;
        const latestLoggedOneRepMaxKg = this.roundToTenth(latestLoggedSet.calculated1Rm);
        const performanceDropRatio = baselineAverageOneRepMaxKg && latestLoggedOneRepMaxKg
            ? (baselineAverageOneRepMaxKg - latestLoggedOneRepMaxKg) /
                baselineAverageOneRepMaxKg
            : null;
        let latestSessionFlagged = Boolean(latestLoggedSet.isCnsFatigue);
        if (performanceDropRatio !== null &&
            performanceDropRatio > 0.15 &&
            !latestLoggedSet.isCnsFatigue) {
            await workoutSetModel.update({
                where: {
                    id: latestLoggedSet.id,
                },
                data: {
                    isCnsFatigue: true,
                },
            });
            latestSessionFlagged = true;
        }
        const cleanSetsAfterFlag = latestSessionFlagged
            ? cleanSets.filter((set) => set.id !== latestLoggedSet.id)
            : cleanSets;
        const latestCleanSet = cleanSetsAfterFlag[cleanSetsAfterFlag.length - 1] ?? null;
        const recentRirSamples = cleanSetsAfterFlag
            .map((set) => set.rirLogged)
            .filter((value) => typeof value === 'number')
            .slice(-5);
        const recentRirTrend = recentRirSamples.length > 0
            ? this.roundToHundredth(recentRirSamples.reduce((sum, value) => sum + value, 0) /
                recentRirSamples.length)
            : null;
        return {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            periodDays: days,
            baselineAverageOneRepMaxKg,
            latestLoggedOneRepMaxKg,
            latestCleanOneRepMaxKg: latestCleanSet?.calculated1Rm
                ? this.roundToTenth(latestCleanSet.calculated1Rm)
                : null,
            recentRirTrend,
            latestSessionFlagged,
            performanceDropRatio: performanceDropRatio !== null
                ? this.roundToHundredth(performanceDropRatio)
                : null,
            sampleSize: cleanSetsAfterFlag.length,
            isColdStart: cleanSetsAfterFlag.length === 0,
        };
    }
    buildPhysiologicalContext(baseline, exercise) {
        if (exercise.category === set_types_1.SetExerciseCategory.METABOLIC_CARDIO) {
            return `The user's recent ${exercise.name} entries are stored, but this movement does not use a 1RM baseline. Progress conditioning conservatively and prioritize effort quality.`;
        }
        if (baseline.isColdStart ||
            baseline.baselineAverageOneRepMaxKg === null) {
            return `The user has no clean ${baseline.periodDays}-day ${exercise.name} history yet. Prescribe a conservative baseline testing week and log submaximal sets before progressing load.`;
        }
        if (baseline.latestSessionFlagged &&
            baseline.performanceDropRatio !== null) {
            return `The user's ${baseline.periodDays}-day ${exercise.name} baseline is ${baseline.baselineAverageOneRepMaxKg}kg. Their last session triggered a CNS Fatigue flag (${Math.round(baseline.performanceDropRatio * 100)}% drop in performance). Prioritize recovery.`;
        }
        const rirPhrase = baseline.recentRirTrend !== null
            ? ` Their recent RIR trend is ${baseline.recentRirTrend.toFixed(2)}.`
            : '';
        return `The user's ${baseline.periodDays}-day ${exercise.name} baseline is ${baseline.baselineAverageOneRepMaxKg}kg.${rirPhrase} Keep progression inside safe, conservative boundaries.`;
    }
    getWorkoutSetModel() {
        return this.prisma.workoutSet;
    }
    roundToTenth(value) {
        return Math.round(value * 10) / 10;
    }
    roundToHundredth(value) {
        return Math.round(value * 100) / 100;
    }
};
exports.PerformanceAnalyticsService = PerformanceAnalyticsService;
exports.PerformanceAnalyticsService = PerformanceAnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PerformanceAnalyticsService);
//# sourceMappingURL=performance-analytics.service.js.map