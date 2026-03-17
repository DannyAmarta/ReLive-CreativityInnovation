import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthPayload } from './entities/auth.entity';
import { SignInInput } from './dto/signInInput';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password';
import { ResetPasswordDto } from './dto/reset-password';
import { ForgotResetPassword } from './entities/forgot-reset-password.entity';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

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

  @Query(() => String)
  hello() {
    return 'Hello World';
  }
}
