"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardioLoadStrategy = void 0;
const common_1 = require("@nestjs/common");
const set_types_1 = require("../set.types");
let CardioLoadStrategy = class CardioLoadStrategy {
    formula = set_types_1.SetFormulaId.CARDIO_LOAD;
    calculate(payload) {
        if (payload.kind !== 'cardio') {
            throw new Error('Cardio strategy can only calculate cardio inputs.');
        }
        const input = payload.input;
        const densityMultiplier = input.distanceMeters
            ? 1 + Math.min(input.distanceMeters / 5000, 1.2)
            : 1;
        const cardioLoadScore = this.roundToTenth(input.durationMinutes * input.rpe * densityMultiplier);
        const estimatedCalories = this.roundToTenth(input.durationMinutes * (4.2 + input.rpe * 0.85));
        const pacePerKilometerMinutes = input.distanceMeters && input.distanceMeters > 0
            ? this.roundToHundredth(input.durationMinutes / (input.distanceMeters / 1000))
            : null;
        const confidenceScore = Math.max(45, Math.min(96, Math.round(78 + input.rpe * 1.6)));
        return {
            exerciseId: input.exercise.id,
            exerciseName: input.exercise.name,
            category: input.exercise.category,
            formulaUsed: this.formula,
            actualReps: null,
            rir: null,
            effectiveReps: null,
            boundedEffectiveReps: null,
            boundedByRepCap: false,
            repCap: null,
            weightKg: null,
            estimatedOneRepMaxKg: null,
            trainingMaxKg: null,
            relativeIntensityPercent: null,
            volumeLoadKg: null,
            durationMinutes: input.durationMinutes,
            distanceMeters: input.distanceMeters,
            pacePerKilometerMinutes,
            cardioLoadScore,
            estimatedCalories,
            confidenceScore,
            primaryEnergySystem: this.resolveEnergySystem(input.durationMinutes, input.rpe),
            insightSummary: input.distanceMeters
                ? 'This estimate emphasizes session density and perceived effort so you can compare conditioning work without pretending cardio behaves like a barbell max.'
                : 'Without distance, the model leans more heavily on duration and RPE, which is still useful for heavy bag, sled, or interval blocks.',
            warnings: input.rpe <= 5
                ? [
                    'A lower RPE session is excellent for recovery or aerobic base work, but it should not be compared directly to high-intensity intervals.',
                ]
                : [],
            recommendedLoads: [],
        };
    }
    resolveEnergySystem(durationMinutes, rpe) {
        if (durationMinutes <= 0.5 && rpe >= 8) {
            return 'ATP-PC / explosive burst';
        }
        if (durationMinutes <= 3) {
            return 'Glycolytic / anaerobic capacity';
        }
        return 'Aerobic / mixed conditioning';
    }
    roundToTenth(value) {
        return Math.round(value * 10) / 10;
    }
    roundToHundredth(value) {
        return Math.round(value * 100) / 100;
    }
};
exports.CardioLoadStrategy = CardioLoadStrategy;
exports.CardioLoadStrategy = CardioLoadStrategy = __decorate([
    (0, common_1.Injectable)()
], CardioLoadStrategy);
//# sourceMappingURL=cardio-load.strategy.js.map