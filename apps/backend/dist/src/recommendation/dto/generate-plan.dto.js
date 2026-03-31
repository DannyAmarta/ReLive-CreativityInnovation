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
exports.GeneratePlanDto = exports.RecommendationPhaseGoal = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
var RecommendationPhaseGoal;
(function (RecommendationPhaseGoal) {
    RecommendationPhaseGoal["BASELINE_TESTING"] = "BASELINE_TESTING";
    RecommendationPhaseGoal["HYPERTROPHY"] = "HYPERTROPHY";
    RecommendationPhaseGoal["STRENGTH"] = "STRENGTH";
    RecommendationPhaseGoal["POWER"] = "POWER";
    RecommendationPhaseGoal["RECOVERY"] = "RECOVERY";
})(RecommendationPhaseGoal || (exports.RecommendationPhaseGoal = RecommendationPhaseGoal = {}));
(0, graphql_1.registerEnumType)(RecommendationPhaseGoal, {
    name: 'RecommendationPhaseGoal',
});
let GeneratePlanDto = class GeneratePlanDto {
    exerciseId;
    phaseGoal;
    days = 14;
    trainingDaysPerWeek = 3;
    targetSets;
    targetReps;
    notes;
};
exports.GeneratePlanDto = GeneratePlanDto;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    __metadata("design:type", String)
], GeneratePlanDto.prototype, "exerciseId", void 0);
__decorate([
    (0, graphql_1.Field)(() => RecommendationPhaseGoal),
    (0, class_validator_1.IsEnum)(RecommendationPhaseGoal),
    __metadata("design:type", String)
], GeneratePlanDto.prototype, "phaseGoal", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 14 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(7),
    (0, class_validator_1.Max)(28),
    __metadata("design:type", Number)
], GeneratePlanDto.prototype, "days", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 3 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(6),
    __metadata("design:type", Number)
], GeneratePlanDto.prototype, "trainingDaysPerWeek", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(6),
    __metadata("design:type", Number)
], GeneratePlanDto.prototype, "targetSets", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(15),
    __metadata("design:type", Number)
], GeneratePlanDto.prototype, "targetReps", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(400),
    __metadata("design:type", String)
], GeneratePlanDto.prototype, "notes", void 0);
exports.GeneratePlanDto = GeneratePlanDto = __decorate([
    (0, graphql_1.InputType)()
], GeneratePlanDto);
//# sourceMappingURL=generate-plan.dto.js.map