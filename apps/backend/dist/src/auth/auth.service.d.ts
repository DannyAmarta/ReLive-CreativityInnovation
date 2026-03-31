import { PrismaService } from '../prisma/prisma.service';
import { SignInInput } from './dto/signInInput';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { CreateUserInput } from '../user/dto/create-user.input';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ExchangeOpenRouterCodeInput } from './dto/exchange-openrouter-code.input';
type SafeAuthUser = {
    id: number;
    name: string;
    avatar: string | null;
    accessToken: string;
};
type GoogleProfileInput = Pick<CreateUserInput, 'email' | 'name' | 'avatar'>;
export type ConnectedOpenRouterAccess = {
    status: 'available' | 'missing' | 'decrypt_failed';
    apiKey: string | null;
    keyLabel: string | null;
    connectedAt: Date | null;
};
export declare class AuthService {
    private prisma;
    private jwtService;
    private eventEmitter;
    private configService;
    private readonly logger;
    private readonly googleAuthHandoffs;
    private readonly genericCredentialError;
    constructor(prisma: PrismaService, jwtService: JwtService, eventEmitter: EventEmitter2, configService: ConfigService);
    validateLocalUser({ email, password }: SignInInput): Promise<{
        id: number;
        name: string | null;
        createdAt: Date;
        updatedAt: Date | null;
        email: string;
        password: string;
        bio: string | null;
        avatar: string | null;
        openRouterApiKeyEncrypted: string | null;
        openRouterKeyLabel: string | null;
        openRouterUserId: string | null;
        openRouterConnectedAt: Date | null;
    }>;
    generateToken(userId: number): Promise<{
        accessToken: string;
    }>;
    login(user: Pick<User, 'id' | 'name' | 'avatar'>): Promise<{
        id: number;
        name: string;
        avatar: string | null;
        accessToken: string;
    }>;
    validate(userId: number): Promise<{
        id: number;
    }>;
    validateGoogleUser(googleUser: GoogleProfileInput): Promise<{
        id: number;
        name: string | null;
        createdAt: Date;
        updatedAt: Date | null;
        email: string;
        password: string;
        bio: string | null;
        avatar: string | null;
        openRouterApiKeyEncrypted: string | null;
        openRouterKeyLabel: string | null;
        openRouterUserId: string | null;
        openRouterConnectedAt: Date | null;
    }>;
    createGoogleAuthHandoff(user: Pick<User, 'id' | 'name' | 'avatar'>): Promise<string>;
    exchangeGoogleAuthHandoff(code: string): Promise<SafeAuthUser>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    exchangeOpenRouterCode(userId: number, input: ExchangeOpenRouterCodeInput): Promise<{
        success: boolean;
        message: string;
        hasConnection: boolean;
        keyLabel: string;
        connectedAt: Date;
    }>;
    disconnectOpenRouterConnection(userId: number): Promise<{
        success: boolean;
        message: string;
        hasConnection: boolean;
        keyLabel: null;
        connectedAt: null;
    }>;
    getConnectedOpenRouterApiKey(userId: number): Promise<string | null>;
    getConnectedOpenRouterAccess(userId: number): Promise<ConnectedOpenRouterAccess>;
    private createGooglePasswordPlaceholder;
    private buildOpenRouterExchangeHeaders;
    private fetchOpenRouterKeyMetadata;
    private encryptOpenRouterApiKey;
    private decryptOpenRouterApiKey;
    private getOpenRouterEncryptionKey;
    private maskOpenRouterKey;
    private readJson;
    private readString;
    private signResetPasswordToken;
    private verifyResetPasswordToken;
    private pruneExpiredGoogleAuthHandoffs;
    private getFrontendBaseUrl;
    private getResetPasswordSecret;
}
export {};
