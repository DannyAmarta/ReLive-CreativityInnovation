import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignInInput } from './dto/signInInput';
import { hash, verify } from 'argon2';
import { User } from '@prisma/client';
import { AuthJwtPayload } from './types/auth-jwtPayload';
import { JwtService } from '@nestjs/jwt';
import { CreateUserInput } from '../user/dto/create-user.input';
import path from 'path';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';
import { ExchangeOpenRouterCodeInput } from './dto/exchange-openrouter-code.input';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

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

export type ConnectedOpenRouterAccess = {
  status: 'available' | 'missing' | 'decrypt_failed';
  apiKey: string | null;
  keyLabel: string | null;
  connectedAt: Date | null;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly googleAuthHandoffs = new Map<string, GoogleAuthHandoffRecord>();
  private readonly genericCredentialError = 'Invalid email or password';

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private eventEmitter: EventEmitter2,
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
  // Returns the full user object (minus password & sensitive fields) so that
  // downstream guards, decorators, and services can access user.role without
  // an additional database query.
  async validateJwt(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Strip sensitive fields before attaching to request context
    const { password, openRouterApiKeyEncrypted, ...safeUser } = user;
    return safeUser;
  }

  // Backward-compatible alias for any code that still calls validate()
  async validate(userId: number) {
    return this.validateJwt(userId);
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

    this.eventEmitter.emit('user.forgot-password', {
      email,
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

  // This function exchanges the frontend PKCE auth code for a user-controlled OpenRouter API key.
  // It is used by the GraphQL OpenRouter connect mutation so the key never passes through the browser UI.
  async exchangeOpenRouterCode(
    userId: number,
    input: ExchangeOpenRouterCodeInput,
  ) {
    const response = await fetch(`${OPENROUTER_BASE_URL}/auth/keys`, {
      method: 'POST',
      headers: this.buildOpenRouterExchangeHeaders(),
      body: JSON.stringify({
        code: input.code,
        code_verifier: input.verifier,
        code_challenge_method: 'S256',
      }),
    });

    const payload = await this.readJson(response);
    const apiKey =
      this.readString(payload?.key) ??
      this.readString(payload?.data?.key) ??
      this.readString(payload?.token) ??
      null;

    if (!response.ok || !apiKey) {
      throw new BadRequestException(
        this.readString(payload?.error?.message) ??
          this.readString(payload?.message) ??
          'Unable to connect your OpenRouter account right now.',
      );
    }

    const keyMetadata = await this.fetchOpenRouterKeyMetadata(apiKey);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        openRouterApiKeyEncrypted: this.encryptOpenRouterApiKey(apiKey),
        openRouterKeyLabel: keyMetadata.label,
        openRouterUserId: keyMetadata.userId,
        openRouterConnectedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'OpenRouter account connected successfully.',
      hasConnection: true,
      keyLabel: keyMetadata.label,
      connectedAt: new Date(),
    };
  }

  // This function removes the stored OpenRouter fallback key for the authenticated user.
  // It is used by the profile disconnect action when the user wants to stop BYOK fallback.
  async disconnectOpenRouterConnection(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        openRouterApiKeyEncrypted: null,
        openRouterKeyLabel: null,
        openRouterUserId: null,
        openRouterConnectedAt: null,
      },
    });

    return {
      success: true,
      message: 'OpenRouter connection removed.',
      hasConnection: false,
      keyLabel: null,
      connectedAt: null,
    };
  }

  // This function returns the decrypted user-controlled OpenRouter API key when one is connected.
  // It is used by the recommendation service as the second-layer fallback after the server key is rate-limited.
  async getConnectedOpenRouterApiKey(userId: number) {
    const connection = await this.getConnectedOpenRouterAccess(userId);
    return connection.apiKey;
  }

  async getConnectedOpenRouterAccess(
    userId: number,
  ): Promise<ConnectedOpenRouterAccess> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        openRouterApiKeyEncrypted: true,
        openRouterKeyLabel: true,
        openRouterConnectedAt: true,
      },
    });

    if (!user?.openRouterApiKeyEncrypted) {
      return {
        status: 'missing',
        apiKey: null,
        keyLabel: user?.openRouterKeyLabel ?? null,
        connectedAt: user?.openRouterConnectedAt ?? null,
      };
    }

    try {
      return {
        status: 'available',
        apiKey: this.decryptOpenRouterApiKey(user.openRouterApiKeyEncrypted),
        keyLabel: user.openRouterKeyLabel ?? null,
        connectedAt: user.openRouterConnectedAt ?? null,
      };
    } catch (error) {
      this.logger.warn(
        `Connected OpenRouter key for user ${userId} could not be decrypted. Reconnect is required.`,
        error instanceof Error ? error.stack : String(error),
      );

      return {
        status: 'decrypt_failed',
        apiKey: null,
        keyLabel: user.openRouterKeyLabel ?? null,
        connectedAt: user.openRouterConnectedAt ?? null,
      };
    }
  }

  // This helper creates a random password hash for Google-created accounts.
  // It is used only by `validateGoogleUser()` so OAuth users do not end up with an empty password value.
  private async createGooglePasswordPlaceholder() {
    return hash(randomBytes(32).toString('hex'));
  }

  private buildOpenRouterExchangeHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const serverKey = this.configService.get<string>('QWEN_API_KEY');

    if (serverKey) {
      headers.Authorization = `Bearer ${serverKey}`;
    }

    return headers;
  }

  private async fetchOpenRouterKeyMetadata(apiKey: string) {
    try {
      const response = await fetch(`${OPENROUTER_BASE_URL}/key`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      const payload = await this.readJson(response);

      return {
        label:
          this.readString(payload?.data?.label) ??
          this.maskOpenRouterKey(apiKey),
        userId:
          this.readString(payload?.data?.owner_id) ??
          this.readString(payload?.data?.user_id) ??
          null,
      };
    } catch {
      return {
        label: this.maskOpenRouterKey(apiKey),
        userId: null,
      };
    }
  }

  private encryptOpenRouterApiKey(apiKey: string) {
    try {
      const iv = randomBytes(12);
      const cipher = createCipheriv(
        'aes-256-gcm',
        this.getOpenRouterEncryptionKey(),
        iv,
      );
      const encrypted = Buffer.concat([
        cipher.update(apiKey, 'utf8'),
        cipher.final(),
      ]);
      const tag = cipher.getAuthTag();

      return [iv, tag, encrypted]
        .map((part) => part.toString('base64url'))
        .join('.');
    } catch {
      throw new InternalServerErrorException(
        'Unable to store your OpenRouter connection securely.',
      );
    }
  }

  private decryptOpenRouterApiKey(payload: string) {
    const [ivPart, tagPart, encryptedPart] = payload.split('.');

    if (!ivPart || !tagPart || !encryptedPart) {
      throw new Error('Invalid OpenRouter key payload.');
    }

    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.getOpenRouterEncryptionKey(),
      Buffer.from(ivPart, 'base64url'),
    );
    decipher.setAuthTag(Buffer.from(tagPart, 'base64url'));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedPart, 'base64url')),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  private getOpenRouterEncryptionKey() {
    const secret =
      this.configService.get<string>('OPENROUTER_KEY_ENCRYPTION_SECRET') ??
      this.configService.getOrThrow<string>('JWT_SECRET');

    return createHash('sha256').update(secret).digest();
  }

  private maskOpenRouterKey(apiKey: string) {
    if (apiKey.length <= 8) {
      return apiKey;
    }

    return `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`;
  }

  private async readJson(response: Response) {
    try {
      return (await response.json()) as Record<string, any>;
    } catch {
      return null;
    }
  }

  private readString(value: unknown) {
    return typeof value === 'string' && value.trim().length > 0
      ? value.trim()
      : null;
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
