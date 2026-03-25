import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash, verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { RequestEmailChangeInput } from './dto/request-email-change.input';
import { UpdateProfileInput } from './dto/update-profile.input';

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

type EmailChangeTokenPayload = {
  purpose: 'email_change' | 'email_change_overwrite';
  currentUserId: number;
  newEmail: string;
  alternateUserId?: number;
};

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private eventEmitter: EventEmitter2,
    private configService: ConfigService,
  ) {}

  // This function fetches the full user record for the currently authenticated user.
  // It is used by the getMe GraphQL query so profile pages can display all user fields.
  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  // This function updates the display name and/or bio for the currently authenticated user.
  // Both fields are optional so either can be changed independently.
  async updateProfile(userId: number, dto: UpdateProfileInput) {
    if (!dto.name && dto.bio === undefined) {
      throw new BadRequestException('No profile fields provided to update');
    }

    const data: { name?: string; bio?: string } = {};
    if (dto.name) data.name = dto.name;
    if (dto.bio !== undefined) data.bio = dto.bio;

    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

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

    this.eventEmitter.emit('user.registered', {
      email: dto.email,
      html,
    });

    return {
      message: 'Check your email to activate account.',
    };
  }

  // This function initiates the email change flow for an authenticated user.
  // It validates the current password for local accounts, checks for conflicts with alternate accounts,
  // and sends a secure verification link to the new email address.
  async requestEmailChange(userId: number, dto: RequestEmailChangeInput) {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!currentUser) throw new UnauthorizedException('User not found');

    // Validate current password for local (non-OAuth) accounts.
    // We detect OAuth accounts by checking if no password was explicitly set —
    // this is a heuristic since Google accounts have a random placeholder password.
    if (dto.currentPassword) {
      let passwordMatched = false;
      try {
        passwordMatched = await verify(currentUser.password, dto.currentPassword);
      } catch {
        passwordMatched = false;
      }
      if (!passwordMatched) {
        throw new BadRequestException('Invalid current password');
      }
    }

    // Reject if new email is the same as the current email.
    if (currentUser.email === dto.newEmail) {
      throw new BadRequestException('New email must be different from current email');
    }

    // Check if the new email already belongs to another account.
    const alternateUser = await this.prisma.user.findUnique({
      where: { email: dto.newEmail },
    });

    if (alternateUser && !dto.overwriteAlternate) {
      // Return a status flag so the frontend can prompt the user to confirm overwrite.
      return {
        status: 'ALTERNATE_ACCOUNT_EXISTS',
        message:
          'That email is already associated with an active account. Confirm to overwrite it.',
      };
    }

    // Build the token payload depending on whether we're overwriting an alternate account.
    const payload: EmailChangeTokenPayload = alternateUser
      ? {
          purpose: 'email_change_overwrite',
          currentUserId: userId,
          newEmail: dto.newEmail,
          alternateUserId: alternateUser.id,
        }
      : {
          purpose: 'email_change',
          currentUserId: userId,
          newEmail: dto.newEmail,
        };

    const token = await this.jwtService.signAsync(payload, {
      secret: this.getEmailChangeSecret(),
      expiresIn: '15m',
    });

    // Send verification email to the new address.
    const verifyLink = `${this.getFrontendBaseUrl()}/auth/verify-email?token=${token}`;
    const templatePath = path.join(
      process.cwd(),
      'src/mail/templates/emailChange.html',
    );
    let html = fs.readFileSync(templatePath, 'utf8');
    html = html.replace(/{{newEmail}}/g, dto.newEmail);
    html = html.replace(/{{verifyLink}}/g, verifyLink);
    html = html.replace(/{{year}}/g, new Date().getFullYear().toString());

    this.eventEmitter.emit('user.email-change-request', {
      email: dto.newEmail,
      html,
    });

    return {
      status: 'VERIFICATION_SENT',
      message: `A verification link has been sent to ${dto.newEmail}. It will expire in 15 minutes.`,
    };
  }

  // This function completes the email change flow after the user clicks the verification link.
  // It verifies the JWT, optionally deletes the overwritten account,
  // updates the current user's email, and sends a security alert to the old email.
  async verifyEmailChange(token: string) {
    let payload: EmailChangeTokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<EmailChangeTokenPayload>(
        token,
        { secret: this.getEmailChangeSecret() },
      );
    } catch {
      throw new BadRequestException('Invalid or expired email change link. Please request a new one.');
    }

    if (
      payload.purpose !== 'email_change' &&
      payload.purpose !== 'email_change_overwrite'
    ) {
      throw new BadRequestException('Invalid token purpose');
    }

    // Fetch the current user to get the OLD email for the security alert.
    const currentUser = await this.prisma.user.findUnique({
      where: { id: payload.currentUserId },
    });
    if (!currentUser) throw new BadRequestException('User account no longer exists');

    const oldEmail = currentUser.email;

    // If overwriting, delete the alternate account first.
    if (payload.purpose === 'email_change_overwrite' && payload.alternateUserId) {
      await this.prisma.user.delete({
        where: { id: payload.alternateUserId },
      });
    }

    // Update the current user to the new email.
    await this.prisma.user.update({
      where: { id: payload.currentUserId },
      data: { email: payload.newEmail },
    });

    // Send a security alert to the OLD email address.
    await this.sendEmailChangedAlert(oldEmail, payload.newEmail);

    return { message: 'Email address updated successfully.' };
  }

  // This helper sends a security alert to the old email after a successful email change.
  private async sendEmailChangedAlert(oldEmail: string, newEmail: string) {
    const templatePath = path.join(
      process.cwd(),
      'src/mail/templates/emailChangedAlert.html',
    );
    let html = fs.readFileSync(templatePath, 'utf8');
    const resetLink = `${this.getFrontendBaseUrl()}/auth/forgot-password`;
    const changedAt = new Date().toUTCString();
    html = html.replace(/{{oldEmail}}/g, oldEmail);
    html = html.replace(/{{newEmail}}/g, newEmail);
    html = html.replace(/{{changedAt}}/g, changedAt);
    html = html.replace(/{{resetPasswordLink}}/g, resetLink);
    html = html.replace(/{{year}}/g, new Date().getFullYear().toString());

    this.eventEmitter.emit('user.email-changed-alert', {
      email: oldEmail,
      html,
    });
  }

  // This helper centralizes the backend base URL used inside email links.
  // It is used by `register()` so activation emails can point to the correct backend in each environment.
  private getBackendBaseUrl() {
    return (
      this.configService.get<string>('BACKEND_URL') ??
      'http://localhost:8000'
    );
  }

  // This helper centralizes the frontend base URL used for verification links.
  private getFrontendBaseUrl() {
    return (
      this.configService.get<string>('FRONTEND_URL') ??
      this.configService.get<string>('APP_FRONTEND_URL') ??
      'http://localhost:3000'
    );
  }

  // This helper centralizes the activation-token secret.
  private getActivationSecret() {
    return (
      this.configService.get<string>('ACCOUNT_ACTIVATION_SECRET') ??
      this.configService.getOrThrow<string>('EMAIL_SECRET')
    );
  }

  // This helper centralizes the email-change token secret, separate from login and activation tokens.
  private getEmailChangeSecret() {
    return (
      this.configService.get<string>('EMAIL_CHANGE_SECRET') ??
      this.configService.getOrThrow<string>('JWT_SECRET')
    );
  }
}
