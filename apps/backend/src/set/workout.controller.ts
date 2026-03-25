import { Body, Controller, Get, Param, Post, Query, Req, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LogWorkoutSetInput } from './dto/log-workout-set.input';
import { SetService } from './set.service';

@Controller('workouts')
export class WorkoutController {
  constructor(
    private readonly setService: SetService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('log-set')
  async logSet(
    @Body() input: LogWorkoutSetInput,
    @Req() req: { headers: Record<string, string> },
  ) {
    const userId = this.extractUserIdFromHeaders(req.headers);
    return this.setService.logSet(userId, input);
  }

  @Get('analytics/:exerciseId')
  async getAnalytics(
    @Param('exerciseId') exerciseId: string,
    @Query('days') days: string | undefined,
    @Req() req: { headers: Record<string, string> },
  ) {
    const userId = this.extractUserIdFromHeaders(req.headers);
    const normalizedDays = Number.isFinite(Number(days))
      ? Math.max(7, Math.min(28, Math.trunc(Number(days))))
      : 14;

    return this.setService.getPerformanceAnalytics(
      userId,
      exerciseId,
      normalizedDays,
    );
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
