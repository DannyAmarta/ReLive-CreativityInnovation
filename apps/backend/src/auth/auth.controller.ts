import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

type ActivationPayload = {
  purpose: 'account_activation';
  email: string;
  password: string;
  name: string;
  bio?: string;
  avatar?: string;
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  // This function starts the Google OAuth redirect flow.
  // It is used when the frontend login page sends the user to `/auth/google/login`.
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {}

  // This function finishes the Google provider callback and creates a short-lived handoff code.
  // It is used only after Google authenticates the user, and it avoids putting the raw access token in the browser URL.
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Request() req, @Res() res: Response) {
    const code = await this.authService.createGoogleAuthHandoff(req.user);
    return res.redirect(
      `${this.getFrontendBaseUrl()}/api/auth/google/callback?code=${code}`,
    );
  }

  // This function exchanges the short-lived Google handoff code for the final auth payload.
  // It is used only by the frontend callback route so the session cookie can be created server-side.
  @Post('google/exchange')
  async exchangeGoogleCode(@Body('code') code: string) {
    if (!code) {
      throw new BadRequestException('Google sign-in code is required');
    }

    return this.authService.exchangeGoogleAuthHandoff(code);
  }

  // This function consumes the email activation token and creates the real user record once.
  // It is used from the activation link sent during registration so duplicate accounts are not created accidentally.
  @Get('activate')
  async activate(@Query('token') token: string, @Res() res: Response) {
    if (!token) {
      return res.redirect(`${this.getFrontendBaseUrl()}/auth/login`);
    }

    try {
      const payload = await this.jwtService.verifyAsync<ActivationPayload>(token, {
        secret: this.getActivationSecret(),
      });

      if (payload.purpose !== 'account_activation') {
        throw new BadRequestException('Invalid activation token');
      }

      const existingUser = await this.prisma.user.findUnique({
        where: {
          email: payload.email,
        },
      });

      if (!existingUser) {
        await this.prisma.user.create({
          data: {
            email: payload.email,
            password: payload.password,
            name: payload.name,
            bio: payload.bio,
            avatar: payload.avatar,
          },
        });
      }
    } catch {
      return res.redirect(`${this.getFrontendBaseUrl()}/auth/login`);
    }

    return res.redirect(`${this.getFrontendBaseUrl()}/auth/login`);
  }

  // This helper centralizes the frontend base URL used by auth redirects.
  // It is used by Google and activation flows so they stay configurable across environments.
  private getFrontendBaseUrl() {
    return (
      this.configService.get<string>('FRONTEND_URL') ??
      this.configService.get<string>('APP_FRONTEND_URL') ??
      'http://localhost:3000'
    );
  }

  // This helper keeps activation token verification tied to the same dedicated secret everywhere.
  // It is used only by `activate()` so account activation tokens are not confused with other JWTs.
  private getActivationSecret() {
    return (
      this.configService.get<string>('ACCOUNT_ACTIVATION_SECRET') ??
      this.configService.getOrThrow<string>('EMAIL_SECRET')
    );
  }
}
