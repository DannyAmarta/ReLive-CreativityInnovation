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
exports.WorkoutController = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const log_workout_set_input_1 = require("./dto/log-workout-set.input");
const set_service_1 = require("./set.service");
let WorkoutController = class WorkoutController {
    setService;
    jwtService;
    constructor(setService, jwtService) {
        this.setService = setService;
        this.jwtService = jwtService;
    }
    async logSet(input, req) {
        const userId = this.extractUserIdFromHeaders(req.headers);
        return this.setService.logSet(userId, input);
    }
    async getAnalytics(exerciseId, days, req) {
        const userId = this.extractUserIdFromHeaders(req.headers);
        const normalizedDays = Number.isFinite(Number(days))
            ? Math.max(7, Math.min(28, Math.trunc(Number(days))))
            : 14;
        return this.setService.getPerformanceAnalytics(userId, exerciseId, normalizedDays);
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
exports.WorkoutController = WorkoutController;
__decorate([
    (0, common_1.Post)('log-set'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [log_workout_set_input_1.LogWorkoutSetInput, Object]),
    __metadata("design:returntype", Promise)
], WorkoutController.prototype, "logSet", null);
__decorate([
    (0, common_1.Get)('analytics/:exerciseId'),
    __param(0, (0, common_1.Param)('exerciseId')),
    __param(1, (0, common_1.Query)('days')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], WorkoutController.prototype, "getAnalytics", null);
exports.WorkoutController = WorkoutController = __decorate([
    (0, common_1.Controller)('workouts'),
    __metadata("design:paramtypes", [set_service_1.SetService,
        jwt_1.JwtService])
], WorkoutController);
//# sourceMappingURL=workout.controller.js.map