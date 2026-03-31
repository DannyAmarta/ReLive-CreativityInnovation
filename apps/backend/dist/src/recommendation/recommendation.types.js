"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationFallbackReason = exports.RecommendationPlanSource = void 0;
var RecommendationPlanSource;
(function (RecommendationPlanSource) {
    RecommendationPlanSource["CLOUD_AI"] = "CLOUD_AI";
    RecommendationPlanSource["USER_OPENROUTER"] = "USER_OPENROUTER";
    RecommendationPlanSource["RULE_FALLBACK"] = "RULE_FALLBACK";
})(RecommendationPlanSource || (exports.RecommendationPlanSource = RecommendationPlanSource = {}));
var RecommendationFallbackReason;
(function (RecommendationFallbackReason) {
    RecommendationFallbackReason["RATE_LIMITED"] = "RATE_LIMITED";
})(RecommendationFallbackReason || (exports.RecommendationFallbackReason = RecommendationFallbackReason = {}));
//# sourceMappingURL=recommendation.types.js.map