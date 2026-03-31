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
exports.GeneratedWorkoutPlanEntity = void 0;
const graphql_1 = require("@nestjs/graphql");
const generate_plan_dto_1 = require("../dto/generate-plan.dto");
const recommendation_types_1 = require("../recommendation.types");
const generated_routine_entry_entity_1 = require("./generated-routine-entry.entity");
const recommendation_safety_window_entity_1 = require("./recommendation-safety-window.entity");
(0, graphql_1.registerEnumType)(recommendation_types_1.RecommendationPlanSource, {
    name: 'RecommendationPlanSource',
});
let GeneratedWorkoutPlanEntity = class GeneratedWorkoutPlanEntity {
    phaseGoal;
    source;
    rationale;
    contextSummary;
    providerNotice;
    safetyWindow;
    routine;
};
exports.GeneratedWorkoutPlanEntity = GeneratedWorkoutPlanEntity;
__decorate([
    (0, graphql_1.Field)(() => generate_plan_dto_1.RecommendationPhaseGoal),
    __metadata("design:type", String)
], GeneratedWorkoutPlanEntity.prototype, "phaseGoal", void 0);
__decorate([
    (0, graphql_1.Field)(() => recommendation_types_1.RecommendationPlanSource),
    __metadata("design:type", String)
], GeneratedWorkoutPlanEntity.prototype, "source", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], GeneratedWorkoutPlanEntity.prototype, "rationale", void 0);
__decorate([
    (0, graphql_1.Field)(() => String),
    __metadata("design:type", String)
], GeneratedWorkoutPlanEntity.prototype, "contextSummary", void 0);
__decorate([
    (0, graphql_1.Field)(() => String, { nullable: true }),
    __metadata("design:type", Object)
], GeneratedWorkoutPlanEntity.prototype, "providerNotice", void 0);
__decorate([
    (0, graphql_1.Field)(() => recommendation_safety_window_entity_1.RecommendationSafetyWindowEntity),
    __metadata("design:type", recommendation_safety_window_entity_1.RecommendationSafetyWindowEntity)
], GeneratedWorkoutPlanEntity.prototype, "safetyWindow", void 0);
__decorate([
    (0, graphql_1.Field)(() => [generated_routine_entry_entity_1.GeneratedRoutineEntryEntity]),
    __metadata("design:type", Array)
], GeneratedWorkoutPlanEntity.prototype, "routine", void 0);
exports.GeneratedWorkoutPlanEntity = GeneratedWorkoutPlanEntity = __decorate([
    (0, graphql_1.ObjectType)()
], GeneratedWorkoutPlanEntity);
//# sourceMappingURL=generated-workout-plan.entity.js.map