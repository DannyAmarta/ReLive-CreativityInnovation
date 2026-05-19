import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TrainerAvailabilityService } from './trainer-availability.service';
import { TrainerAvailabilityModel, AvailableSlot } from './models/trainer-availability.model';
import { CreateAvailabilityRuleInput, UpdateAvailabilityRuleInput } from './dto/availability.input';

@Resolver()
export class TrainerAvailabilityResolver {
  constructor(
    private readonly availabilityService: TrainerAvailabilityService,
    private readonly jwtService: JwtService,
  ) {}

  private extractUserId(ctx: { req: { headers: Record<string, string> } }): number {
    const authHeader = ctx.req?.headers?.authorization ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    if (!token) throw new UnauthorizedException('Not authenticated');
    try {
      const payload = this.jwtService.verify<{ sub: number }>(token);
      return payload.sub;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // ── Public: clients can query availability slots for any trainer ──────────

  @Query(() => [TrainerAvailabilityModel])
  async getTrainerAvailabilityRules(
    @Args('trainerId', { type: () => Int }) trainerId: number,
  ) {
    return this.availabilityService.getAvailabilityRules(trainerId);
  }

  @Query(() => [AvailableSlot])
  async getAvailableSlots(
    @Args('trainerId', { type: () => Int }) trainerId: number,
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
    @Args('slotDurationMinutes', { type: () => Int, defaultValue: 60 }) slotDurationMinutes: number,
  ) {
    return this.availabilityService.getAvailableSlots(
      trainerId, startDate, endDate, slotDurationMinutes,
    );
  }

  // ── Trainer-only: manage own availability rules ───────────────────────────

  @Mutation(() => TrainerAvailabilityModel)
  async createAvailabilityRule(
    @Context() ctx: { req: { headers: Record<string, string> } },
    @Args('input') input: CreateAvailabilityRuleInput,
  ) {
    const userId = this.extractUserId(ctx);
    // trainerId is the TrainerProfile id — we look it up by userId
    const profile = await this.availabilityService['prisma'].trainerProfile.findUnique({
      where: { userId }, select: { id: true },
    });
    if (!profile) throw new UnauthorizedException('Trainer profile not found');
    return this.availabilityService.createAvailabilityRule(profile.id, input);
  }

  @Mutation(() => TrainerAvailabilityModel)
  async updateAvailabilityRule(
    @Context() ctx: { req: { headers: Record<string, string> } },
    @Args('input') input: UpdateAvailabilityRuleInput,
  ) {
    const userId = this.extractUserId(ctx);
    const profile = await this.availabilityService['prisma'].trainerProfile.findUnique({
      where: { userId }, select: { id: true },
    });
    if (!profile) throw new UnauthorizedException('Trainer profile not found');
    return this.availabilityService.updateAvailabilityRule(profile.id, input);
  }

  @Mutation(() => Boolean)
  async deleteAvailabilityRule(
    @Context() ctx: { req: { headers: Record<string, string> } },
    @Args('ruleId', { type: () => Int }) ruleId: number,
  ) {
    const userId = this.extractUserId(ctx);
    const profile = await this.availabilityService['prisma'].trainerProfile.findUnique({
      where: { userId }, select: { id: true },
    });
    if (!profile) throw new UnauthorizedException('Trainer profile not found');
    return this.availabilityService.deleteAvailabilityRule(profile.id, ruleId);
  }
}
