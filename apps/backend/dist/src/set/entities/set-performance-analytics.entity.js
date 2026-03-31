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
exports.SetPerformanceAnalytics = void 0;
const graphql_1 = require("@nestjs/graphql");
let SetPerformanceAnalytics = class SetPerformanceAnalytics {
    exerciseId;
    exerciseName;
    periodDays;
    emaOneRepMaxKg;
    baselineAverageOneRepMaxKg;
    latestLoggedOneRepMaxKg;
    latestCleanOneRepMaxKg;
    recentRirTrend;
    latestSessionFlagged;
    performanceDropRatio;
    contextSummary;
    sampleSize;
    isColdStart;
};
exports.SetPerformanceAnalytics = SetPerformanceAnalytics;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SetPerformanceAnalytics.prototype, "exerciseId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SetPerformanceAnalytics.prototype, "exerciseName", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SetPerformanceAnalytics.prototype, "periodDays", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Object)
], SetPerformanceAnalytics.prototype, "emaOneRepMaxKg", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Object)
], SetPerformanceAnalytics.prototype, "baselineAverageOneRepMaxKg", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Object)
], SetPerformanceAnalytics.prototype, "latestLoggedOneRepMaxKg", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Object)
], SetPerformanceAnalytics.prototype, "latestCleanOneRepMaxKg", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Object)
], SetPerformanceAnalytics.prototype, "recentRirTrend", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], SetPerformanceAnalytics.prototype, "latestSessionFlagged", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Float, { nullable: true }),
    __metadata("design:type", Object)
], SetPerformanceAnalytics.prototype, "performanceDropRatio", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], SetPerformanceAnalytics.prototype, "contextSummary", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], SetPerformanceAnalytics.prototype, "sampleSize", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], SetPerformanceAnalytics.prototype, "isColdStart", void 0);
exports.SetPerformanceAnalytics = SetPerformanceAnalytics = __decorate([
    (0, graphql_1.ObjectType)()
], SetPerformanceAnalytics);
//# sourceMappingURL=set-performance-analytics.entity.js.map