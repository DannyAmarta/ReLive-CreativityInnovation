"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WathanStrategy = void 0;
const common_1 = require("@nestjs/common");
const set_types_1 = require("../set.types");
let WathanStrategy = class WathanStrategy {
    formula = set_types_1.SetFormulaId.WATHAN;
    calculate(payload) {
        if (payload.kind !== 'strength') {
            throw new Error('Wathan strategy can only calculate strength inputs.');
        }
        const input = payload.input;
        const effectiveReps = input.reps + input.rir;
        const repCap = input.exercise.repCap ?? 12;
        const boundedEffectiveReps = Math.min(repCap, effectiveReps);
        const denominator = (48.8 + 53.8 * Math.exp(-0.075 * boundedEffectiveReps)) / 100;
        const estimatedOneRepMaxKg = this.roundToTenth(input.weightKg / denominator);
        const trainingMaxKg = this.roundToTenth(estimatedOneRepMaxKg * 0.9);
        const relativeIntensityPercent = this.roundToTenth((input.weightKg / estimatedOneRepMaxKg) * 100);
        const volumeLoadKg = this.roundToTenth(input.weightKg * input.reps);
        const warnings = this.buildWarnings(input.rir, effectiveReps, boundedEffectiveReps);
        const confidenceScore = this.buildConfidenceScore(input.reps, input.rir, effectiveReps !== boundedEffectiveReps);
        const recommendedLoads = this.buildRecommendedLoads(estimatedOneRepMaxKg);
        return {
            exerciseId: input.exercise.id,
            exerciseName: input.exercise.name,
            category: input.exercise.category,
            formulaUsed: this.formula,
            actualReps: input.reps,
            rir: input.rir,
            effectiveReps,
            boundedEffectiveReps,
            boundedByRepCap: effectiveReps !== boundedEffectiveReps,
            repCap,
            weightKg: input.weightKg,
            estimatedOneRepMaxKg,
            trainingMaxKg,
            relativeIntensityPercent,
            volumeLoadKg,
            durationMinutes: null,
            distanceMeters: null,
            pacePerKilometerMinutes: null,
            cardioLoadScore: null,
            estimatedCalories: null,
            confidenceScore,
            primaryEnergySystem: boundedEffectiveReps <= 6
                ? 'ATP-PC -> glycolytic edge'
                : 'Glycolytic / technical fatigue',
            insightSummary: boundedEffectiveReps <= 6
                ? 'Exponential fatigue modeling fits abrupt upper-body and technical drop-off better than a linear curve.'
                : 'This set is already moving toward a fatigue wall. Technique and stabilizer failure matter more than raw contractile strength here.',
            warnings,
            recommendedLoads,
        };
    }
    buildWarnings(rir, effectiveReps, boundedEffectiveReps) {
        const warnings = [];
        if (effectiveReps !== boundedEffectiveReps) {
            warnings.push(`Effective reps were capped at ${boundedEffectiveReps} because higher-rep estimates drift away from true max-strength prediction.`);
        }
        if (rir >= 3) {
            warnings.push('Because you reported multiple reps in reserve, the estimate is intentionally conservative rather than a true all-out max projection.');
        }
        if (boundedEffectiveReps >= 10) {
            warnings.push('For technical or upper-body lifts, fatigue can cliff hard at these reps, so treat the estimate as a planning aid rather than a competition max.');
        }
        return warnings;
    }
    buildConfidenceScore(reps, rir, bounded) {
        let score = 90;
        if (reps > 9) {
            score -= (reps - 9) * 3;
        }
        score -= rir * 4;
        if (bounded) {
            score -= 10;
        }
        return Math.max(38, Math.min(97, score));
    }
    buildRecommendedLoads(oneRepMaxKg) {
        return [3, 5, 8].map((repTarget) => {
            const denominator = (48.8 + 53.8 * Math.exp(-0.075 * repTarget)) / 100;
            return {
                repTarget,
                intensityPercent: this.roundToTenth(denominator * 100),
                weightKg: this.roundToTenth(oneRepMaxKg * denominator),
            };
        });
    }
    roundToTenth(value) {
        return Math.round(value * 10) / 10;
    }
};
exports.WathanStrategy = WathanStrategy;
exports.WathanStrategy = WathanStrategy = __decorate([
    (0, common_1.Injectable)()
], WathanStrategy);
//# sourceMappingURL=wathan.strategy.js.map