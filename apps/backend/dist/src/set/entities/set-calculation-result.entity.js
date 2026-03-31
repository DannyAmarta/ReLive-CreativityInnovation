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
exports.SetCalculationResult = void 0;
const graphql_1 = require("@nestjs/graphql");
const set_types_1 = require("../set.types");
const set_recommended_load_entity_1 = require("./set-recommended-load.entity");
let SetCalculationResult = class SetCalculationResult {
    exerciseId;
    exerciseName;
    category;
    formulaUsed;
    actualReps;
    rir;
    effectiveReps;
    boundedEffectiveReps;
    boundedByRepCap;
    repCap;
    weightKg;
    estimatedOneRepMaxKg;
    trainingMaxKg;
    relativeIntensityPercent;
    volumeLoadKg;
    durationMinutes;
    distanceMeters;
    pacePerKilometerMinutes;
    cardioLoadScore;
    estimatedCalories;
    confidenceScore;
    primaryEnergySystem;
    insightSummary;
    warnings;
    recommendedLoads;
};
exports.SetCalculationResult = SetCalculationResult;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SetCalculationResult.prototype, "exerciseId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SetCalculationResult.prototype, "exerciseName", void 0);
__decorate([
    (0, graphql_1.Field)(() => set_types_1.SetExerciseCategory),
    __metadata("design:type", String)
], SetCalculationResult.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)(() => set_types_1.SetFormulaId),
    __metadata("design:type", String)
], SetCalculationResult.prototype, "formulaUsed", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], SetCalculationResult.prototype, "actualReps", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], SetCalculationResult.prototype, "rir", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], SetCalculationResult.prototype, "effectiveReps", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], SetCalculationResult.prototype, "boundedEffectiveReps", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], SetCalculationResult.prototype, "boundedByRepCap", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    __metadata("design:type", Object)
], SetCalculationResult.prototype, "repCap", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Object)
], SetCalculationResult.prototype, "weightKg", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Object)
], SetCalculationResult.prototype, "estimatedOneRepMaxKg", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Object)
], SetCalculationResult.prototype, "trainingMaxKg", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Object)
], SetCalculationResult.prototype, "relativeIntensityPercent", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Object)
], SetCalculationResult.prototype, "volumeLoadKg", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Object)
], SetCalculationResult.prototype, "durationMinutes", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Object)
], SetCalculationResult.prototype, "distanceMeters", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Object)
], SetCalculationResult.prototype, "pacePerKilometerMinutes", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Object)
], SetCalculationResult.prototype, "cardioLoadScore", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Object)
], SetCalculationResult.prototype, "estimatedCalories", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float),
    __metadata("design:type", Number)
], SetCalculationResult.prototype, "confidenceScore", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SetCalculationResult.prototype, "primaryEnergySystem", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SetCalculationResult.prototype, "insightSummary", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String]),
    __metadata("design:type", Array)
], SetCalculationResult.prototype, "warnings", void 0);
__decorate([
    (0, graphql_1.Field)(() => [set_recommended_load_entity_1.SetRecommendedLoad]),
    __metadata("design:type", Array)
], SetCalculationResult.prototype, "recommendedLoads", void 0);
exports.SetCalculationResult = SetCalculationResult = __decorate([
    (0, graphql_1.ObjectType)()
], SetCalculationResult);
//# sourceMappingURL=set-calculation-result.entity.js.map