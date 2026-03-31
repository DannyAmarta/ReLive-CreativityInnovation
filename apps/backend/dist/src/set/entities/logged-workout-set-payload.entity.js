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
exports.LoggedWorkoutSetPayload = void 0;
const graphql_1 = require("@nestjs/graphql");
const set_calculation_result_entity_1 = require("./set-calculation-result.entity");
const logged_workout_set_entity_1 = require("./logged-workout-set.entity");
const set_performance_analytics_entity_1 = require("./set-performance-analytics.entity");
let LoggedWorkoutSetPayload = class LoggedWorkoutSetPayload {
    loggedSet;
    calculation;
    analytics;
};
exports.LoggedWorkoutSetPayload = LoggedWorkoutSetPayload;
__decorate([
    (0, graphql_1.Field)(() => logged_workout_set_entity_1.LoggedWorkoutSet),
    __metadata("design:type", logged_workout_set_entity_1.LoggedWorkoutSet)
], LoggedWorkoutSetPayload.prototype, "loggedSet", void 0);
__decorate([
    (0, graphql_1.Field)(() => set_calculation_result_entity_1.SetCalculationResult),
    __metadata("design:type", set_calculation_result_entity_1.SetCalculationResult)
], LoggedWorkoutSetPayload.prototype, "calculation", void 0);
__decorate([
    (0, graphql_1.Field)(() => set_performance_analytics_entity_1.SetPerformanceAnalytics),
    __metadata("design:type", set_performance_analytics_entity_1.SetPerformanceAnalytics)
], LoggedWorkoutSetPayload.prototype, "analytics", void 0);
exports.LoggedWorkoutSetPayload = LoggedWorkoutSetPayload = __decorate([
    (0, graphql_1.ObjectType)()
], LoggedWorkoutSetPayload);
//# sourceMappingURL=logged-workout-set-payload.entity.js.map