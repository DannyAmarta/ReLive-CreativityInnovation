import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';

import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UserService } from './user.service';
import { RegisterResponse } from './dto/register-response.type';
import { RequestEmailChangeInput } from './dto/request-email-change.input';
import { RequestEmailChangeResponse } from './dto/request-email-change.response';
import { VerifyEmailChangeResponse } from './dto/verify-email-change.response';
import { UpdateProfileInput } from './dto/update-profile.input';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // This mutation starts account registration by sending an activation email.
  // It is used by the frontend register form instead of creating an active user immediately.
  @Mutation(() => RegisterResponse)
  async register(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.userService.register(createUserInput);
  }

  // This query returns the full user profile for the caller identified by their bearer token.
  // It is used by the profile page to display real user data without a dedicated auth guard decorator.
  @Query(() => User)
  async getMe(@Context() ctx: { req: { headers: Record<string, string> } }) {
    const authHeader = ctx.req?.headers?.authorization ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    if (!token) throw new UnauthorizedException('Not authenticated');

    let payload: { sub: number };
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return this.userService.getMe(payload.sub);
  }

  // This mutation initiates a secure email change for the currently authenticated user.
  // It validates the user's current password, checks for conflicts, and sends a verification link.
  @Mutation(() => RequestEmailChangeResponse)
  async requestEmailChange(
    @Args('input') input: RequestEmailChangeInput,
    @Context() ctx: { req: { headers: Record<string, string> } },
  ) {
    const userId = this.extractUserIdFromContext(ctx);
    return this.userService.requestEmailChange(userId, input);
  }

  // This mutation verifies the email change token sent to the new email address.
  // It finalizes the email update, optionally removes alternate accounts, and alerts the old email.
  @Mutation(() => VerifyEmailChangeResponse)
  async verifyEmailChange(@Args('token') token: string) {
    return this.userService.verifyEmailChange(token);
  }

  // This mutation updates the authenticated user's display name and/or bio in the database.
  // It returns the full updated User record so the frontend can reflect changes instantly.
  @Mutation(() => User)
  async updateProfile(
    @Args('input') input: UpdateProfileInput,
    @Context() ctx: { req: { headers: Record<string, string> } },
  ) {
    const userId = this.extractUserIdFromContext(ctx);
    return this.userService.updateProfile(userId, input);
  }

  // This helper extracts the authenticated user's ID from the request context JWT.
  private extractUserIdFromContext(ctx: {
    req: { headers: Record<string, string> };
  }): number {
    const authHeader = ctx.req?.headers?.authorization ?? '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;
    if (!token) throw new UnauthorizedException('Not authenticated');

    try {
      const payload = this.jwtService.verify<{ sub: number }>(token);
      return payload.sub;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
