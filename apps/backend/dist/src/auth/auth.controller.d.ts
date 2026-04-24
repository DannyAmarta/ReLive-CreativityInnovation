import { AuthService } from './auth.service';
import type { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
export declare class AuthController {
    private readonly authService;
    private readonly jwtService;
    private readonly prisma;
    private readonly configService;
    constructor(authService: AuthService, jwtService: JwtService, prisma: PrismaService, configService: ConfigService);
    googleLogin(): void;
    googleCallback(req: any, res: Response): Promise<void>;
    exchangeGoogleCode(code: string): Promise<{
        id: number;
        name: string;
        avatar: string | null;
        accessToken: string;
    }>;
    activate(token: string, res: Response): Promise<void>;
    private getFrontendBaseUrl;
    private getActivationSecret;
}
