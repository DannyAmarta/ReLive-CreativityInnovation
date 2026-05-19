import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthPayload } from './entities/auth.entity';
import { SignInInput } from './dto/signInInput';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password';
import { ResetPasswordDto } from './dto/reset-password';
import { ForgotResetPassword } from './entities/forgot-reset-password.entity';
import { UnauthorizedException } from '@nestjs/common';
import { ExchangeOpenRouterCodeInput } from './dto/exchange-openrouter-code.input';
import { OpenRouterConnectionPayload } from './entities/openrouter-connection.entity';
import { JwtService } from '@nestjs/jwt';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  // This mutation is the GraphQL login entry point for email/password authentication.
  // It is used by the frontend server action before the Next.js session cookie is created.
  @Mutation(() => AuthPayload)
  async signIn(@Args('signInInput') signInInput: SignInInput) {
    const user = await this.authService.validateLocalUser(signInInput);
    return this.authService.login(user);
  }

  // This mutation starts the password reset email flow without revealing whether the email exists.
  // It is used by the forgot-password frontend form.
  @Mutation(() => ForgotResetPassword)
  async forgotPassword(@Args('forgotInput') dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  // This mutation completes the reset-password flow using the token from the user's email.
  // It is used by the reset-password frontend form.
  @Mutation(() => ForgotResetPassword)
  async resetPassword(@Args('resetInput') dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Mutation(() => OpenRouterConnectionPayload)
  async exchangeOpenRouterCode(
    @Args('input') input: ExchangeOpenRouterCodeInput,
    @Context() ctx: { req: { headers: Record<string, string> } },
  ) {
    const userId = this.extractUserIdFromContext(ctx);
    return this.authService.exchangeOpenRouterCode(userId, input);
  }

  @Mutation(() => OpenRouterConnectionPayload)
  async disconnectOpenRouter(
    @Context() ctx: { req: { headers: Record<string, string> } },
  ) {
    const userId = this.extractUserIdFromContext(ctx);
    return this.authService.disconnectOpenRouterConnection(userId);
  }

  @Query(() => String)
  hello() {
    return 'Hello World';
  }

  @Mutation(() => AuthPayload)
  async devRefreshSession(
    @Context() ctx: { req: { headers: Record<string, string> } },
  ) {
    const authHeader = ctx.req?.headers?.authorization ?? '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      throw new UnauthorizedException('Not authenticated');
    }

    try {
      const payload = this.jwtService.verify<{ sub: number }>(token, {
        ignoreExpiration: true,
      });
      const user = await this.authService.validateJwt(payload.sub);
      return this.authService.login(user);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractUserIdFromContext(ctx: {
    req: { headers: Record<string, string> };
  }): number {
    const authHeader = ctx.req?.headers?.authorization ?? '';
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
