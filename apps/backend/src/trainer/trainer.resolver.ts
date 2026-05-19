import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TrainerService as TrainerServiceModel } from './trainer.service';
import { TrainerProfile } from './models/trainer-profile.model';
import { TrainerService } from './models/trainer-service.model';
import { Booking } from './models/booking.model';
import { CreateTrainerProfileInput } from './dto/create-trainer-profile.input';
import { CreateTrainerServiceInput } from './dto/create-trainer-service.input';
import { CreateBookingInput } from './dto/create-booking.input';
import { UpgradeToTrainerInput } from './dto/upgrade-to-trainer.input';
import { UpdateTrainerServiceInput } from './dto/update-trainer-service.input';
import { UpdateBookingStatusInput } from './dto/update-booking-status.input';
import { RegisterTrainerFiatInput } from './dto/register-trainer-fiat.input';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Resolver()
export class TrainerResolver {
  constructor(
    private readonly trainerService: TrainerServiceModel,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  // --- Helpers ---
  private extractUserIdFromContext(ctx: { req: { headers: Record<string, string> } }): number {
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

  private async requireRole(userId: number, requiredRole: Role) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== requiredRole) {
      throw new UnauthorizedException(`Requires ${requiredRole} role`);
    }
    return user;
  }

  // --- Queries ---

  @Query(() => [TrainerProfile])
  async getTrainerProfiles() {
    return this.trainerService.getTrainerProfiles();
  }

  @Query(() => TrainerProfile)
  async getTrainerProfile(@Args('id', { type: () => Int }) id: number) {
    return this.trainerService.getTrainerProfile(id);
  }

  @Query(() => TrainerProfile)
  async myTrainerProfile(@Context() ctx: { req: { headers: Record<string, string> } }) {
    const userId = this.extractUserIdFromContext(ctx);
    await this.requireRole(userId, Role.TRAINER);
    return this.trainerService.getMyTrainerProfile(userId);
  }

  @Query(() => [Booking])
  async myClientBookings(@Context() ctx: { req: { headers: Record<string, string> } }) {
    const userId = this.extractUserIdFromContext(ctx);
    return this.trainerService.getClientBookings(userId);
  }

  @Query(() => [Booking])
  async myTrainerBookings(@Context() ctx: { req: { headers: Record<string, string> } }) {
    const userId = this.extractUserIdFromContext(ctx);
    await this.requireRole(userId, Role.TRAINER);
    return this.trainerService.getTrainerBookings(userId);
  }

  // --- Mutations ---

  @Mutation(() => TrainerProfile)
  async createTrainerProfile(
    @Context() ctx: { req: { headers: Record<string, string> } },
    @Args('input') input: CreateTrainerProfileInput,
  ) {
    const userId = this.extractUserIdFromContext(ctx);
    await this.requireRole(userId, Role.TRAINER);
    return this.trainerService.createTrainerProfile(userId, input);
  }

  @Mutation(() => TrainerProfile)
  async upgradeToTrainer(
    @Context() ctx: { req: { headers: Record<string, string> } },
    @Args('input') input: UpgradeToTrainerInput,
  ) {
    // FIX #2: Role check is now INSIDE the Prisma transaction in the service layer.
    // No pre-check here — eliminates the TOCTOU race condition.
    const userId = this.extractUserIdFromContext(ctx);
    return this.trainerService.upgradeToTrainer(userId, input);
  }

  @Mutation(() => TrainerProfile)
  async registerTrainerFiat(
    @Context() ctx: { req: { headers: Record<string, string> } },
    @Args('input') input: RegisterTrainerFiatInput,
  ) {
    const userId = this.extractUserIdFromContext(ctx);
    return this.trainerService.registerTrainerFiat(userId, input);
  }

  @Mutation(() => TrainerService)
  async createTrainerService(
    @Context() ctx: { req: { headers: Record<string, string> } },
    @Args('input') input: CreateTrainerServiceInput,
  ) {
    const userId = this.extractUserIdFromContext(ctx);
    await this.requireRole(userId, Role.TRAINER);
    return this.trainerService.createTrainerService(userId, input);
  }

  @Mutation(() => TrainerService)
  async updateTrainerService(
    @Context() ctx: { req: { headers: Record<string, string> } },
    @Args('input') input: UpdateTrainerServiceInput,
  ) {
    const userId = this.extractUserIdFromContext(ctx);
    await this.requireRole(userId, Role.TRAINER);
    return this.trainerService.updateTrainerService(userId, input);
  }

  @Mutation(() => Booking)
  async createBooking(
    @Context() ctx: { req: { headers: Record<string, string> } },
    @Args('input') input: CreateBookingInput,
  ) {
    const userId = this.extractUserIdFromContext(ctx);
    return this.trainerService.createBooking(userId, input);
  }

  // FIX #5: No role guard here — the service-layer RBAC state machine decides
  // what each role (TRAINER / CLIENT / ADMIN) is allowed to transition to.
  @Mutation(() => Booking)
  async updateBookingStatus(
    @Context() ctx: { req: { headers: Record<string, string> } },
    @Args('input') input: UpdateBookingStatusInput,
  ) {
    const userId = this.extractUserIdFromContext(ctx);
    return this.trainerService.updateBookingStatus(userId, input);
  }
}
