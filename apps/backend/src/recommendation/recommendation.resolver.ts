import { JwtService } from '@nestjs/jwt';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { extractUserIdFromGraphqlContext } from '../core/auth/extract-user-id';
import { FeatureAnalysisDto } from './dto/feature-analysis.dto';
import { GeneratePlanDto } from './dto/generate-plan.dto';
import { FeatureThreatAnalysisEntity } from './entities/feature-threat-analysis.entity';
import { GeneratedWorkoutPlanEntity } from './entities/generated-workout-plan.entity';
import { RecommendationService } from './recommendation.service';

@Resolver()
export class RecommendationResolver {
  constructor(
    private readonly recommendationService: RecommendationService,
    private readonly jwtService: JwtService,
  ) {}

  @Mutation(() => GeneratedWorkoutPlanEntity)
  // GraphQL is the canonical contract for recommendation flows.
  // Keep recommendation generation on the resolver/schema path.
  async generateWorkoutRecommendation(
    @Args('input') input: GeneratePlanDto,
    @Context() ctx: { req: { headers: Record<string, string> } },
  ) {
    const userId = extractUserIdFromGraphqlContext(this.jwtService, ctx);
    return this.recommendationService.generateWorkoutPlan(userId, input);
  }

  @Mutation(() => FeatureThreatAnalysisEntity)
  async analyzeFeatureThreats(
    @Args('input') input: FeatureAnalysisDto,
    @Context() ctx: { req: { headers: Record<string, string> } },
  ) {
    const userId = extractUserIdFromGraphqlContext(this.jwtService, ctx);
    return this.recommendationService.analyzeFeatureThreats(userId, input);
  }
}
