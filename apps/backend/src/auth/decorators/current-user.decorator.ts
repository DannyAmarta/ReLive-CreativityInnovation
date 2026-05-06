import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * @CurrentUser() decorator — extracts the authenticated user from the GraphQL
 * context. Works because JwtAuthGuard + JwtStrategy now attaches the full
 * sanitized User object to req.user during token validation.
 *
 * Usage:
 *   @UseGuards(JwtAuthGuard)
 *   async myMutation(@CurrentUser() user: CurrentUserPayload) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);

/**
 * Type representing the user object attached to requests by JwtStrategy.
 * This is the User model MINUS password & openRouterApiKeyEncrypted.
 */
export type CurrentUserPayload = {
  id: number;
  email: string;
  name: string | null;
  role: 'USER' | 'TRAINER' | 'ADMIN';
  walletAddress: string | null;
  phone: string | null;
  bio: string | null;
  avatar: string | null;
  profileCompleted: boolean;
  createdAt: Date;
  updatedAt: Date | null;
};
