import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { hash, verify } from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { RequestEmailChangeInput } from './dto/request-email-change.input';
import { UpdateProfileInput } from './dto/update-profile.input';
import { Role } from '@prisma/client';

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

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
    return {
      ...user,
      hasOpenRouterConnection: Boolean(user.openRouterApiKeyEncrypted),
      openRouterKeyLabel: user.openRouterKeyLabel,
      openRouterConnectedAt: user.openRouterConnectedAt,
    };
  }

  async changeMyRole(userId: number, nextRole: string) {
    if (nextRole !== Role.USER && nextRole !== Role.TRAINER && nextRole !== Role.ADMIN) {
      throw new BadRequestException('Role must be USER, TRAINER, or ADMIN');
    }

    return this.prisma.$transaction(async (tx) => {
      const currentUser = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!currentUser) {
        throw new UnauthorizedException('User not found');
      }

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { role: nextRole },
      });

      if (nextRole === Role.TRAINER) {
        await tx.trainerProfile.upsert({
          where: { userId },
          update: {},
          create: {
            userId,
            bio: currentUser.bio ?? 'Dev role switch trainer profile.',
            certifications: [],
            rating: 0,
          },
        });

        await tx.fiatWallet.upsert({
          where: { trainerId: userId },
          update: {},
          create: {
            trainerId: userId,
            balanceIdr: 0,
          },
        });
      }

      return {
        ...updatedUser,
        hasOpenRouterConnection: Boolean(updatedUser.openRouterApiKeyEncrypted),
        openRouterKeyLabel: updatedUser.openRouterKeyLabel,
        openRouterConnectedAt: updatedUser.openRouterConnectedAt,
      };
    });
  }

  // This function updates the display name and/or bio for the currently authenticated user.
  // Both fields are optional so either can be changed independently.
  async updateProfile(userId: number, dto: UpdateProfileInput) { 
  // 1. Check if ANY data was provided (including our new onboarding fields)
  const hasData = Object.keys(dto).length > 0;
  if (!hasData) {
    throw new BadRequestException('No profile fields provided to update');
  }

  // 2. Build the data object dynamically
  // This allows the function to handle name/bio AND fitnessLevel/goal etc.
  const data: any = { ...dto };
  
  // Ensure we don't try to update the 'id' field inside the 'data' block
  delete data.id;

  return this.prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      bio: true,
      avatar: true,
      profileCompleted: true, // Add these to the select!
      fitnessLevel: true,
      dailyActivity: true,
      primaryGoal: true,
      vitalityScore: true,
      createdAt: true,
      openRouterApiKeyEncrypted: true,
      openRouterKeyLabel: true,
      openRouterConnectedAt: true,
    },
  }).then((user) => ({
    ...user,
    hasOpenRouterConnection: Boolean(user.openRouterApiKeyEncrypted),
  }));
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

  // This helper is for changing avatar
  async updateAvatar(userId: number, filename: string) {
    const avatarPath = `/uploads/avatars/${filename}`;

    try {
      return await this.prisma.user.update({
        where: { id: userId },
        data: { avatar: avatarPath },
      });
    } catch (error: any) {
      // Look at your terminal! This will show the specific Prisma error code (like P2025)
      console.error("DATABASE UPDATE ERROR:", error.meta?.cause || error.message);
      
      throw new BadRequestException(`Archive Update Failed: User ID ${userId} not found.`);
    }
  }

  async requestAccountDeletionCode(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    // Generate a 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the code
    const salt = this.configService.getOrThrow<string>('JWT_SECRET');
    const codeHash = crypto.createHmac('sha256', salt).update(code).digest('hex');

    // Create the token payload
    const tokenPayload = {
      purpose: 'account_deletion',
      sub: userId,
      codeHash,
    };

    // Sign the token (expires in 10 minutes)
    const verifyToken = await this.jwtService.signAsync(tokenPayload, {
      secret: this.getEmailChangeSecret(),
      expiresIn: '10m',
    });

    const templatePath = path.join(
      process.cwd(),
      'src/mail/templates/accountDeletion.html',
    );
    let html = fs.readFileSync(templatePath, 'utf8');
    html = html.replace(/{{code}}/g, code);
    html = html.replace(/{{year}}/g, new Date().getFullYear().toString());

    this.eventEmitter.emit('user.delete-request', {
      email: user.email,
      html,
    });

    return {
      success: true,
      verifyToken,
      message: `A 6-digit verification code has been sent to ${user.email}. It will expire in 10 minutes.`,
    };
  }

  async confirmAccountDeletion(userId: number, verifyToken: string, code: string) {
    let payload: { purpose: string; sub: number; codeHash: string };
    try {
      payload = await this.jwtService.verifyAsync(verifyToken, {
        secret: this.getEmailChangeSecret(),
      });
    } catch {
      throw new BadRequestException('Invalid or expired deletion token. Please request a new code.');
    }

    if (payload.purpose !== 'account_deletion' || payload.sub !== userId) {
      throw new BadRequestException('Invalid verification token');
    }

    const salt = this.configService.getOrThrow<string>('JWT_SECRET');
    const computedHash = crypto.createHmac('sha256', salt).update(code).digest('hex');

    if (computedHash !== payload.codeHash) {
      throw new BadRequestException('Invalid verification code');
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return {
      success: true,
      message: 'Account deleted successfully.',
    };
  }
}
