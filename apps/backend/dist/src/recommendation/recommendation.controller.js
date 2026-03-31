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
exports.RecommendationController = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const feature_analysis_dto_1 = require("./dto/feature-analysis.dto");
const generate_plan_dto_1 = require("./dto/generate-plan.dto");
const recommendation_service_1 = require("./recommendation.service");
let RecommendationController = class RecommendationController {
    recommendationService;
    jwtService;
    constructor(recommendationService, jwtService) {
        this.recommendationService = recommendationService;
        this.jwtService = jwtService;
    }
    async generateWorkoutPlan(dto, req) {
        const userId = this.extractUserIdFromHeaders(req.headers);
        return this.recommendationService.generateWorkoutPlan(userId, dto);
    }
    async analyzeFeatureThreats(dto, req) {
        const userId = this.extractUserIdFromHeaders(req.headers);
        return this.recommendationService.analyzeFeatureThreats(userId, dto);
    }
    extractUserIdFromHeaders(headers) {
        const authHeader = headers?.authorization ?? '';
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : authHeader;
        if (!token) {
            throw new common_1.UnauthorizedException('Not authenticated');
        }
        try {
            const payload = this.jwtService.verify(token);
            return payload.sub;
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
    }
};
exports.RecommendationController = RecommendationController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_plan_dto_1.GeneratePlanDto, Object]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "generateWorkoutPlan", null);
__decorate([
    (0, common_1.Post)('feature-analysis'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [feature_analysis_dto_1.FeatureAnalysisDto, Object]),
    __metadata("design:returntype", Promise)
], RecommendationController.prototype, "analyzeFeatureThreats", null);
exports.RecommendationController = RecommendationController = __decorate([
    (0, common_1.Controller)('recommendations'),
    __metadata("design:paramtypes", [recommendation_service_1.RecommendationService,
        jwt_1.JwtService])
], RecommendationController);
//# sourceMappingURL=recommendation.controller.js.map