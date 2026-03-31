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
exports.FeatureThreatAnalysisEntity = exports.FeatureDangerousProblemEntity = exports.FeatureImplementationStepEntity = void 0;
const graphql_1 = require("@nestjs/graphql");
let FeatureImplementationStepEntity = class FeatureImplementationStepEntity {
    step;
    action;
    technicalDetail;
};
exports.FeatureImplementationStepEntity = FeatureImplementationStepEntity;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FeatureImplementationStepEntity.prototype, "step", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FeatureImplementationStepEntity.prototype, "action", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FeatureImplementationStepEntity.prototype, "technicalDetail", void 0);
exports.FeatureImplementationStepEntity = FeatureImplementationStepEntity = __decorate([
    (0, graphql_1.ObjectType)()
], FeatureImplementationStepEntity);
let FeatureDangerousProblemEntity = class FeatureDangerousProblemEntity {
    threatName;
    theThreat;
    theFix;
};
exports.FeatureDangerousProblemEntity = FeatureDangerousProblemEntity;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FeatureDangerousProblemEntity.prototype, "threatName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FeatureDangerousProblemEntity.prototype, "theThreat", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FeatureDangerousProblemEntity.prototype, "theFix", void 0);
exports.FeatureDangerousProblemEntity = FeatureDangerousProblemEntity = __decorate([
    (0, graphql_1.ObjectType)()
], FeatureDangerousProblemEntity);
let FeatureThreatAnalysisEntity = class FeatureThreatAnalysisEntity {
    featureName;
    executiveSummary;
    implementationSteps;
    dangerousProblems;
};
exports.FeatureThreatAnalysisEntity = FeatureThreatAnalysisEntity;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FeatureThreatAnalysisEntity.prototype, "featureName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], FeatureThreatAnalysisEntity.prototype, "executiveSummary", void 0);
__decorate([
    (0, graphql_1.Field)(() => [FeatureImplementationStepEntity]),
    __metadata("design:type", Array)
], FeatureThreatAnalysisEntity.prototype, "implementationSteps", void 0);
__decorate([
    (0, graphql_1.Field)(() => [FeatureDangerousProblemEntity]),
    __metadata("design:type", Array)
], FeatureThreatAnalysisEntity.prototype, "dangerousProblems", void 0);
exports.FeatureThreatAnalysisEntity = FeatureThreatAnalysisEntity = __decorate([
    (0, graphql_1.ObjectType)()
], FeatureThreatAnalysisEntity);
//# sourceMappingURL=feature-threat-analysis.entity.js.map