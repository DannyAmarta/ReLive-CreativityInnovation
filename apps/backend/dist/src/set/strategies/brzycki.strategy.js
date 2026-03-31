"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrzyckiStrategy = void 0;
const common_1 = require("@nestjs/common");
const set_types_1 = require("../set.types");
let BrzyckiStrategy = class BrzyckiStrategy {
    formula = set_types_1.SetFormulaId.BRZYCKI;
    calculate(payload) {
        if (payload.kind !== 'strength') {
            throw new Error('Brzycki strategy can only calculate strength inputs.');
        }
        const input = payload.input;
        const effectiveReps = input.reps + input.rir;
        const repCap = input.exercise.repCap ?? 10;
        const boundedEffectiveReps = Math.min(repCap, effectiveReps);
        const estimatedOneRepMaxKg = this.roundToTenth(input.weightKg * (36 / (37 - boundedEffectiveReps)));
        const trainingMaxKg = this.roundToTenth(estimatedOneRepMaxKg * 0.9);
        const relativeIntensityPercent = this.roundToTenth((input.weightKg / estimatedOneRepMaxKg) * 100);
        const volumeLoadKg = this.roundToTenth(input.weightKg * input.reps);
        const warnings = this.buildWarnings(input, effectiveReps, boundedEffectiveReps);
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
            primaryEnergySystem: boundedEffectiveReps <= 5 ? 'ATP-PC / maximal strength' : 'Glycolytic / heavy volume',
            insightSummary: boundedEffectiveReps <= 5
                ? 'Linear fatigue modeling is strongest here. This estimate is best suited for heavy lower-body work near true strength efforts.'
                : 'This estimate is still useful, but rep-driven endurance starts adding more noise as sets drift away from pure phosphagen work.',
            warnings,
            recommendedLoads,
        };
    }
    buildWarnings(input, effectiveReps, boundedEffectiveReps) {
        const warnings = [];
        if (effectiveReps !== boundedEffectiveReps) {
            warnings.push(`Effective reps were capped at ${boundedEffectiveReps} because linear 1RM estimates lose meaning at higher rep counts.`);
        }
        if (input.rir >= 3) {
            warnings.push('A high RIR means this set was likely far from failure, so your estimate carries a wider uncertainty band.');
        }
        if (input.reps === 1 && input.rir === 0) {
            warnings.push('A true single is already close to a direct max test, so formula-based estimation adds less value here.');
        }
        return warnings;
    }
    buildConfidenceScore(reps, rir, bounded) {
        let score = 92;
        if (reps > 8) {
            score -= (reps - 8) * 3;
        }
        score -= rir * 4;
        if (bounded) {
            score -= 12;
        }
        return Math.max(40, Math.min(98, score));
    }
    buildRecommendedLoads(oneRepMaxKg) {
        return [3, 5, 8].map((repTarget) => {
            const intensityPercent = this.roundToTenth(((37 - repTarget) / 36) * 100);
            return {
                repTarget,
                intensityPercent,
                weightKg: this.roundToTenth(oneRepMaxKg * ((37 - repTarget) / 36)),
            };
        });
    }
    roundToTenth(value) {
        return Math.round(value * 10) / 10;
    }
};
exports.BrzyckiStrategy = BrzyckiStrategy;
exports.BrzyckiStrategy = BrzyckiStrategy = __decorate([
    (0, common_1.Injectable)()
], BrzyckiStrategy);
//# sourceMappingURL=brzycki.strategy.js.map