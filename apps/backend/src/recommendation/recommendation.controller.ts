import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FeatureAnalysisDto } from './dto/feature-analysis.dto';
import { GeneratePlanDto } from './dto/generate-plan.dto';
import { RecommendationService } from './recommendation.service';

@Controller('recommendations')
export class RecommendationController {
  constructor(
    private readonly recommendationService: RecommendationService,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async generateWorkoutPlan(
    @Body() dto: GeneratePlanDto,
    @Req() req: { headers: Record<string, string> },
  ) {
    const userId = this.extractUserIdFromHeaders(req.headers);
    return this.recommendationService.generateWorkoutPlan(userId, dto);
  }

  @Post('feature-analysis')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async analyzeFeatureThreats(
    @Body() dto: FeatureAnalysisDto,
    @Req() req: { headers: Record<string, string> },
  ) {
    const userId = this.extractUserIdFromHeaders(req.headers);
    return this.recommendationService.analyzeFeatureThreats(userId, dto);
  }

  private extractUserIdFromHeaders(headers: Record<string, string>) {
    const authHeader = headers?.authorization ?? '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      throw new UnauthorizedException('Not authenticated');
    }

    try {
      const payload = this.jwtService.verify<{ sub: number }>(token);
      return payload.sub;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
