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
exports.RecommendationResolver = void 0;
const jwt_1 = require("@nestjs/jwt");
const graphql_1 = require("@nestjs/graphql");
const extract_user_id_1 = require("../core/auth/extract-user-id");
const feature_analysis_dto_1 = require("./dto/feature-analysis.dto");
const generate_plan_dto_1 = require("./dto/generate-plan.dto");
const feature_threat_analysis_entity_1 = require("./entities/feature-threat-analysis.entity");
const generated_workout_plan_entity_1 = require("./entities/generated-workout-plan.entity");
const recommendation_service_1 = require("./recommendation.service");
let RecommendationResolver = class RecommendationResolver {
    recommendationService;
    jwtService;
    constructor(recommendationService, jwtService) {
        this.recommendationService = recommendationService;
        this.jwtService = jwtService;
    }
    async generateWorkoutRecommendation(input, ctx) {
        const userId = (0, extract_user_id_1.extractUserIdFromGraphqlContext)(this.jwtService, ctx);
        return this.recommendationService.generateWorkoutPlan(userId, input);
    }
    async analyzeFeatureThreats(input, ctx) {
        const userId = (0, extract_user_id_1.extractUserIdFromGraphqlContext)(this.jwtService, ctx);
        return this.recommendationService.analyzeFeatureThreats(userId, input);
    }
};
exports.RecommendationResolver = RecommendationResolver;
__decorate([
    (0, graphql_1.Mutation)(() => generated_workout_plan_entity_1.GeneratedWorkoutPlanEntity),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_plan_dto_1.GeneratePlanDto, Object]),
    __metadata("design:returntype", Promise)
], RecommendationResolver.prototype, "generateWorkoutRecommendation", null);
__decorate([
    (0, graphql_1.Mutation)(() => feature_threat_analysis_entity_1.FeatureThreatAnalysisEntity),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [feature_analysis_dto_1.FeatureAnalysisDto, Object]),
    __metadata("design:returntype", Promise)
], RecommendationResolver.prototype, "analyzeFeatureThreats", null);
exports.RecommendationResolver = RecommendationResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [recommendation_service_1.RecommendationService,
        jwt_1.JwtService])
], RecommendationResolver);
//# sourceMappingURL=recommendation.resolver.js.map