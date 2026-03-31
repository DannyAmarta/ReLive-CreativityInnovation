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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetResolver = void 0;
const jwt_1 = require("@nestjs/jwt");
const graphql_1 = require("@nestjs/graphql");
const extract_user_id_1 = require("../core/auth/extract-user-id");
const calculate_set_input_1 = require("./dto/calculate-set.input");
const log_workout_set_input_1 = require("./dto/log-workout-set.input");
const set_analytics_args_1 = require("./dto/set-analytics.args");
const logged_workout_set_payload_entity_1 = require("./entities/logged-workout-set-payload.entity");
const set_calculation_result_entity_1 = require("./entities/set-calculation-result.entity");
const set_exercise_entity_1 = require("./entities/set-exercise.entity");
const set_performance_analytics_entity_1 = require("./entities/set-performance-analytics.entity");
const set_service_1 = require("./set.service");
let SetResolver = class SetResolver {
    setService;
    jwtService;
    constructor(setService, jwtService) {
        this.setService = setService;
        this.jwtService = jwtService;
    }
    setExercises() {
        return this.setService.getExercises();
    }
    calculateSetEstimate(input) {
        return this.setService.calculate(input);
    }
    async logWorkoutSet(input, ctx) {
        const userId = (0, extract_user_id_1.extractUserIdFromGraphqlContext)(this.jwtService, ctx);
        return this.setService.logSet(userId, input);
    }
    async setPerformanceAnalytics(args, ctx) {
        const userId = (0, extract_user_id_1.extractUserIdFromGraphqlContext)(this.jwtService, ctx);
        return this.setService.getPerformanceAnalytics(userId, args.exerciseId, args.days ?? 14);
    }
};
exports.SetResolver = SetResolver;
__decorate([
    (0, graphql_1.Query)(() => [set_exercise_entity_1.SetExercise]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SetResolver.prototype, "setExercises", null);
__decorate([
    (0, graphql_1.Query)(() => set_calculation_result_entity_1.SetCalculationResult),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [calculate_set_input_1.CalculateSetInput]),
    __metadata("design:returntype", void 0)
], SetResolver.prototype, "calculateSetEstimate", null);
__decorate([
    (0, graphql_1.Mutation)(() => logged_workout_set_payload_entity_1.LoggedWorkoutSetPayload),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [log_workout_set_input_1.LogWorkoutSetInput, Object]),
    __metadata("design:returntype", Promise)
], SetResolver.prototype, "logWorkoutSet", null);
__decorate([
    (0, graphql_1.Query)(() => set_performance_analytics_entity_1.SetPerformanceAnalytics),
    __param(0, (0, graphql_1.Args)()),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [set_analytics_args_1.SetAnalyticsArgs, Object]),
    __metadata("design:returntype", Promise)
], SetResolver.prototype, "setPerformanceAnalytics", null);
exports.SetResolver = SetResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [set_service_1.SetService,
        jwt_1.JwtService])
], SetResolver);
//# sourceMappingURL=set.resolver.js.map