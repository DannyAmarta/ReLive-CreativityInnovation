import { JwtService } from '@nestjs/jwt';
import { FeatureAnalysisDto } from './dto/feature-analysis.dto';
import { GeneratePlanDto } from './dto/generate-plan.dto';
import { RecommendationService } from './recommendation.service';
export declare class RecommendationController {
    private readonly recommendationService;
    private readonly jwtService;
    constructor(recommendationService: RecommendationService, jwtService: JwtService);
    generateWorkoutPlan(dto: GeneratePlanDto, req: {
        headers: Record<string, string>;
    }): Promise<import("./recommendation.types").GeneratedWorkoutPlan>;
    analyzeFeatureThreats(dto: FeatureAnalysisDto, req: {
        headers: Record<string, string>;
    }): Promise<import("./recommendation.types").FeatureThreatAnalysis>;
    private extractUserIdFromHeaders;
}
