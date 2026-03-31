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
exports.SetService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const statistical_aggregator_service_1 = require("./statistical-aggregator.service");
const set_exercise_catalog_1 = require("./set-exercise.catalog");
const set_types_1 = require("./set.types");
const set_strategy_factory_1 = require("./strategies/set-strategy.factory");
let SetService = class SetService {
    strategyFactory;
    prisma;
    statisticalAggregatorService;
    constructor(strategyFactory, prisma, statisticalAggregatorService) {
        this.strategyFactory = strategyFactory;
        this.prisma = prisma;
        this.statisticalAggregatorService = statisticalAggregatorService;
    }
    getExercises() {
        return set_exercise_catalog_1.SET_EXERCISE_CATALOG;
    }
    calculate(input) {
        const exercise = this.getExerciseOrThrow(input.exerciseId);
        const strategy = this.strategyFactory.getStrategy(exercise.formula);
        if (exercise.category === set_types_1.SetExerciseCategory.METABOLIC_CARDIO) {
            const cardioInput = this.normalizeCardioInput(exercise, input);
            return strategy.calculate({ kind: 'cardio', input: cardioInput });
        }
        const strengthInput = this.normalizeStrengthInput(exercise, input);
        return strategy.calculate({ kind: 'strength', input: strengthInput });
    }
    async logSet(userId, input) {
        const exercise = this.getExerciseOrThrow(input.exerciseId);
        await this.upsertExerciseCatalogEntry(exercise);
        const calculation = this.calculate(input);
        const createdSet = await this.getWorkoutSetModel().create({
            data: {
                userId,
                exerciseId: exercise.id,
                weightLifted: calculation.weightKg,
                actualReps: calculation.actualReps,
                rirLogged: calculation.rir,
                calculated1Rm: calculation.estimatedOneRepMaxKg,
                formulaUsed: calculation.formulaUsed,
                durationMinutes: calculation.durationMinutes,
                distanceMeters: calculation.distanceMeters,
                rpeLogged: typeof input.rpe === 'number' && !Number.isNaN(input.rpe)
                    ? this.roundToHundredth(input.rpe)
                    : null,
                notes: input.notes?.trim() || null,
            },
        });
        const analytics = await this.statisticalAggregatorService.buildAndStoreAnalyticsSnapshot(userId, exercise);
        const refreshedSet = await this.getWorkoutSetModel().findUnique({
            where: {
                id: createdSet.id,
            },
        });
        return {
            loggedSet: this.mapLoggedWorkoutSet(refreshedSet ?? createdSet, exercise),
            calculation,
            analytics,
        };
    }
    async getPerformanceAnalytics(userId, exerciseId, days = 14) {
        const exercise = this.getExerciseOrThrow(exerciseId);
        await this.upsertExerciseCatalogEntry(exercise);
        return this.statisticalAggregatorService.buildAndStoreAnalyticsSnapshot(userId, exercise, days);
    }
    async syncCatalogIntoDatabase() {
        for (const exercise of set_exercise_catalog_1.SET_EXERCISE_CATALOG) {
            await this.upsertExerciseCatalogEntry(exercise);
        }
    }
    mapLoggedWorkoutSet(record, exercise) {
        return {
            id: record.id,
            userId: record.userId,
            exerciseId: record.exerciseId,
            exerciseName: exercise.name,
            formulaUsed: record.formulaUsed,
            weightLifted: record.weightLifted,
            actualReps: record.actualReps,
            rirLogged: record.rirLogged,
            calculated1Rm: record.calculated1Rm,
            isCnsFatigue: record.isCnsFatigue,
            durationMinutes: record.durationMinutes,
            distanceMeters: record.distanceMeters,
            rpeLogged: record.rpeLogged,
            notes: record.notes,
            createdAt: record.createdAt,
        };
    }
    getExerciseOrThrow(exerciseId) {
        const exercise = set_exercise_catalog_1.SET_EXERCISE_CATALOG.find((item) => item.id === exerciseId);
        if (!exercise) {
            throw new common_1.BadRequestException(`Unknown exercise "${exerciseId}".`);
        }
        return exercise;
    }
    async upsertExerciseCatalogEntry(exercise) {
        await this.getExerciseModel().upsert({
            where: {
                id: exercise.id,
            },
            create: {
                id: exercise.id,
                name: exercise.name,
                category: exercise.category,
                formula: exercise.formula,
                description: exercise.description,
                repCap: exercise.repCap,
                requiredMetrics: exercise.requiredMetrics,
            },
            update: {
                name: exercise.name,
                category: exercise.category,
                formula: exercise.formula,
                description: exercise.description,
                repCap: exercise.repCap,
                requiredMetrics: exercise.requiredMetrics,
                isActive: true,
            },
        });
    }
    normalizeStrengthInput(exercise, input) {
        if (typeof input.weightKg !== 'number' || Number.isNaN(input.weightKg)) {
            throw new common_1.BadRequestException('weightKg is required for strength calculations.');
        }
        if (typeof input.reps !== 'number' || Number.isNaN(input.reps)) {
            throw new common_1.BadRequestException('reps is required for strength calculations.');
        }
        const reps = Math.max(1, Math.trunc(input.reps));
        const rir = Math.max(0, Math.trunc(input.rir ?? 0));
        if (reps > 30) {
            throw new common_1.BadRequestException('Strength calculations reject very high reps because they stop representing max-strength data.');
        }
        return {
            exercise,
            weightKg: this.roundToTenth(input.weightKg),
            reps,
            rir,
        };
    }
    normalizeCardioInput(exercise, input) {
        if (typeof input.durationMinutes !== 'number' ||
            Number.isNaN(input.durationMinutes)) {
            throw new common_1.BadRequestException('durationMinutes is required for metabolic/cardio calculations.');
        }
        if (typeof input.rpe !== 'number' || Number.isNaN(input.rpe)) {
            throw new common_1.BadRequestException('rpe is required for metabolic/cardio calculations.');
        }
        return {
            exercise,
            durationMinutes: this.roundToHundredth(input.durationMinutes),
            rpe: this.roundToHundredth(input.rpe),
            distanceMeters: typeof input.distanceMeters === 'number' && !Number.isNaN(input.distanceMeters)
                ? this.roundToTenth(input.distanceMeters)
                : null,
        };
    }
    getWorkoutSetModel() {
        return this.prisma.workoutSet;
    }
    getExerciseModel() {
        return this.prisma.exercise;
    }
    roundToTenth(value) {
        return Math.round(value * 10) / 10;
    }
    roundToHundredth(value) {
        return Math.round(value * 100) / 100;
    }
};
exports.SetService = SetService;
exports.SetService = SetService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [set_strategy_factory_1.SetStrategyFactory,
        prisma_service_1.PrismaService,
        statistical_aggregator_service_1.StatisticalAggregatorService])
], SetService);
//# sourceMappingURL=set.service.js.map