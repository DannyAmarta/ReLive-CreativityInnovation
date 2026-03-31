import { JwtService } from '@nestjs/jwt';
import { FeatureAnalysisDto } from './dto/feature-analysis.dto';
import { GeneratePlanDto } from './dto/generate-plan.dto';
import { RecommendationService } from './recommendation.service';
export declare class RecommendationResolver {
    private readonly recommendationService;
    private readonly jwtService;
    constructor(recommendationService: RecommendationService, jwtService: JwtService);
    generateWorkoutRecommendation(input: GeneratePlanDto, ctx: {
        req: {
            headers: Record<string, string>;
        };
    }): Promise<import("./recommendation.types").GeneratedWorkoutPlan>;
    analyzeFeatureThreats(input: FeatureAnalysisDto, ctx: {
        req: {
            headers: Record<string, string>;
        };
    }): Promise<import("./recommendation.types").FeatureThreatAnalysis>;
}
