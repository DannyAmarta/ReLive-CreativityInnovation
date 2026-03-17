import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

import * as fs from 'fs';
import * as path from 'path';

type ActivationTokenPayload = {
  purpose: 'account_activation';
  email: string;
  password: string;
  name: string;
  bio?: string;
  avatar?: string;
};

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailerService,
    private configService: ConfigService,
  ) {}

  // This function signs the short-lived token that carries pending registration data.
  // It is used only by `register()` so the app can delay user creation until the email owner confirms activation.
  async generateActivationToken(dto: CreateUserInput) {
    const payload: ActivationTokenPayload = {
      purpose: 'account_activation',
      email: dto.email,
      password: dto.password,
      name: dto.name,
      bio: dto.bio,
      avatar: dto.avatar,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.getActivationSecret(),
      expiresIn: '15m',
    });
  }

  // This function handles registration without creating the database user immediately.
  // It is used by the frontend register form so unverified emails do not become active accounts yet.
  async register(dto: CreateUserInput) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await hash(dto.password);
    const token = await this.generateActivationToken({
      ...dto,
      password: hashedPassword,
    });

    const templatePath = path.join(
      process.cwd(),
      'src/mail/templates/mail.html',
    );

    let html = fs.readFileSync(templatePath, 'utf8');
    const activationLink = `${this.getBackendBaseUrl()}/auth/activate?token=${token}`;

    html = html.replace('{{activationLink}}', activationLink);
    html = html.replace('{{dtoEmail}}', dto.email);

    await this.mailService.sendMail({
      to: dto.email,
      subject: 'Activate your account',
      html,
    });

    return {
      message: 'Check your email to activate account.',
    };
  }

  // This helper centralizes the backend base URL used inside email links.
  // It is used by `register()` so activation emails can point to the correct backend in each environment.
  private getBackendBaseUrl() {
    return (
      this.configService.get<string>('BACKEND_URL') ??
      'http://localhost:8000'
    );
  }

  // This helper centralizes the activation-token secret with a dedicated fallback path.
  // It is used by `generateActivationToken()` so account activation tokens stay isolated from normal auth tokens.
  private getActivationSecret() {
    return (
      this.configService.get<string>('ACCOUNT_ACTIVATION_SECRET') ??
      this.configService.getOrThrow<string>('EMAIL_SECRET')
    );
  }
}
