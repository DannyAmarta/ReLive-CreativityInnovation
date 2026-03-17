import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInInput } from './dto/signInInput';
import { hash, verify } from 'argon2';
import { User } from '@prisma/client';
import { AuthJwtPayload } from './types/auth-jwtPayload';
import { JwtService } from '@nestjs/jwt';
import { CreateUserInput } from 'src/user/dto/create-user.input';
import path from 'path';
import * as fs from 'fs';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

type SafeAuthUser = {
  id: number;
  name: string;
  avatar: string | null;
  accessToken: string;
};

type PasswordResetPayload = {
  sub: number;
  purpose: 'password_reset';
};

type GoogleProfileInput = Pick<CreateUserInput, 'email' | 'name' | 'avatar'>;

type GoogleAuthHandoffRecord = {
  authPayload: SafeAuthUser;
  expiresAt: number;
};

@Injectable()
export class AuthService {
  private readonly googleAuthHandoffs = new Map<string, GoogleAuthHandoffRecord>();
  private readonly genericCredentialError = 'Invalid email or password';

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  // This function handles local email/password login.
  // It is used by the GraphQL `signIn` mutation before a JWT session is created.
  async validateLocalUser({ email, password }: SignInInput) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnauthorizedException(this.genericCredentialError);
    }

    let passwordMatched = false;

    try {
      passwordMatched = await verify(user.password, password);
    } catch {
      throw new UnauthorizedException(this.genericCredentialError);
    }

    if (!passwordMatched) {
      throw new UnauthorizedException(this.genericCredentialError);
    }

    return user;
  }

  // This function creates the access token that powers authenticated API calls.
  // It is used by `login()` for both normal login and Google login handoff exchange.
  async generateToken(userId: number) {
    const payload: AuthJwtPayload = { sub: userId };
    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken };
  }

  // This function converts a database user into the safe auth payload returned to clients.
  // It is used by the GraphQL login mutation and the Google OAuth exchange endpoint.
  async login(user: Pick<User, 'id' | 'name' | 'avatar'>) {
    const { accessToken } = await this.generateToken(user.id);
    return {
      id: user.id,
      name: user.name ?? 'User',
      avatar: user.avatar ?? null,
      accessToken,
    };
  }

  // This function verifies that a JWT subject still points to a valid user record.
  // It is used by `JwtStrategy` whenever a protected request sends a bearer token.
  async validate(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return { id: user.id };
  }

  // This function resolves a Google profile into a local user record.
  // It is used only by `GoogleStrategy`, and it avoids storing an empty password for OAuth accounts.
  async validateGoogleUser(googleUser: GoogleProfileInput) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: googleUser.email,
      },
    });

    if (existingUser) {
      const shouldSyncProfile =
        (!existingUser.name && googleUser.name) ||
        (!existingUser.avatar && googleUser.avatar);

      if (shouldSyncProfile) {
        return this.prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name: existingUser.name ?? googleUser.name,
            avatar: existingUser.avatar ?? googleUser.avatar,
          },
        });
      }

      return existingUser;
    }

    const password = await this.createGooglePasswordPlaceholder();

    return this.prisma.user.create({
      data: {
        email: googleUser.email,
        name: googleUser.name,
        avatar: googleUser.avatar,
        password,
      },
    });
  }

  // This function creates a short-lived, opaque code for Google OAuth completion.
  // It is used by `AuthController.googleCallback()` so the browser URL never contains the raw access token.
  async createGoogleAuthHandoff(user: Pick<User, 'id' | 'name' | 'avatar'>) {
    this.pruneExpiredGoogleAuthHandoffs();

    const authPayload = await this.login(user);
    const code = randomBytes(24).toString('hex');

    this.googleAuthHandoffs.set(code, {
      authPayload,
      expiresAt: Date.now() + 2 * 60 * 1000,
    });

    return code;
  }

  // This function exchanges the one-time Google handoff code for the real auth payload.
  // It is used only by the frontend callback route right after Google redirects back into the app.
  async exchangeGoogleAuthHandoff(code: string) {
    this.pruneExpiredGoogleAuthHandoffs();

    const handoff = this.googleAuthHandoffs.get(code);
    if (!handoff) {
      throw new BadRequestException(
        'Google sign-in session expired. Please try again.',
      );
    }

    this.googleAuthHandoffs.delete(code);
    return handoff.authPayload;
  }

  // This function starts the reset-password email flow without revealing whether the email exists.
  // It is used by both the GraphQL forgot-password mutation and any future REST password reset endpoint.
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    const genericResponse = {
      message: 'If that email exists, a reset link has been sent.',
    };

    if (!user) {
      return genericResponse;
    }

    const token = await this.signResetPasswordToken(user.id);

    const templatePath = path.join(
      process.cwd(),
      'src/mail/templates/resetPassword.html',
    );

    let html = fs.readFileSync(templatePath, 'utf8');
    const resetLink = `${this.getFrontendBaseUrl()}/auth/reset-password?token=${token}`;
    html = html.replace('{{resetLink}}', resetLink);
    html = html.replace('{{email}}', email);

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset',
      html,
    });

    return genericResponse;
  }

  // This function finishes the reset-password flow after the user opens the email link.
  // It is used by the GraphQL reset-password mutation to safely replace the stored password hash.
  async resetPassword(token: string, newPassword: string) {
    const payload = await this.verifyResetPasswordToken(token);
    const hashed = await hash(newPassword);

    await this.prisma.user.update({
      where: { id: payload.sub },
      data: {
        password: hashed,
      },
    });

    return {
      message: 'Password updated successfully',
    };
  }

  // This helper creates a random password hash for Google-created accounts.
  // It is used only by `validateGoogleUser()` so OAuth users do not end up with an empty password value.
  private async createGooglePasswordPlaceholder() {
    return hash(randomBytes(32).toString('hex'));
  }

  // This helper signs reset-password tokens with a dedicated purpose and secret.
  // It is used only by `forgotPassword()` to keep password reset tokens separate from login tokens.
  private async signResetPasswordToken(userId: number) {
    return this.jwtService.signAsync(
      {
        sub: userId,
        purpose: 'password_reset',
      },
      {
        secret: this.getResetPasswordSecret(),
        expiresIn: '15m',
      },
    );
  }

  // This helper verifies reset-password tokens and rejects tokens signed for another purpose.
  // It is used only by `resetPassword()` before the password hash is updated in the database.
  private async verifyResetPasswordToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<PasswordResetPayload>(
        token,
        {
          secret: this.getResetPasswordSecret(),
        },
      );

      if (payload.purpose !== 'password_reset') {
        throw new BadRequestException('Invalid or expired token');
      }

      return payload;
    } catch {
      throw new BadRequestException('Invalid or expired token');
    }
  }

  // This helper removes expired Google OAuth handoff codes from memory.
  // It is used by the Google handoff create/exchange flow so old codes cannot be reused later.
  private pruneExpiredGoogleAuthHandoffs() {
    const now = Date.now();

    for (const [code, handoff] of this.googleAuthHandoffs.entries()) {
      if (handoff.expiresAt <= now) {
        this.googleAuthHandoffs.delete(code);
      }
    }
  }

  // This helper centralizes the frontend base URL used inside auth emails and redirects.
  // It is used by email-based flows so auth links do not stay hardcoded to localhost forever.
  private getFrontendBaseUrl() {
    return (
      this.configService.get<string>('FRONTEND_URL') ??
      this.configService.get<string>('APP_FRONTEND_URL') ??
      'http://localhost:3000'
    );
  }

  // This helper centralizes the reset-password secret with a safe fallback.
  // It is used by reset token signing and verification so password reset tokens stay isolated from login intent.
  private getResetPasswordSecret() {
    return (
      this.configService.get<string>('RESET_PASSWORD_SECRET') ??
      this.configService.getOrThrow<string>('JWT_SECRET')
    );
  }
}
