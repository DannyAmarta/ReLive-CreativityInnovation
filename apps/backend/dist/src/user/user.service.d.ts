import { CreateUserInput } from './dto/create-user.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { RequestEmailChangeInput } from './dto/request-email-change.input';
import { UpdateProfileInput } from './dto/update-profile.input';
export declare class UserService {
    private prisma;
    private jwtService;
    private eventEmitter;
    private configService;
    constructor(prisma: PrismaService, jwtService: JwtService, eventEmitter: EventEmitter2, configService: ConfigService);
    getMe(userId: number): Promise<{
        hasOpenRouterConnection: boolean;
        openRouterKeyLabel: string | null;
        openRouterConnectedAt: Date | null;
        id: number;
        name: string | null;
        createdAt: Date;
        updatedAt: Date | null;
        email: string;
        password: string;
        bio: string | null;
        avatar: string | null;
        openRouterApiKeyEncrypted: string | null;
        openRouterUserId: string | null;
    }>;
    updateProfile(userId: number, dto: UpdateProfileInput): Promise<{
        hasOpenRouterConnection: boolean;
        openRouterKeyLabel: string | null;
        openRouterConnectedAt: Date | null;
        id: number;
        name: string | null;
        createdAt: Date;
        updatedAt: Date | null;
        email: string;
        password: string;
        bio: string | null;
        avatar: string | null;
        openRouterApiKeyEncrypted: string | null;
    }>;
    generateActivationToken(dto: CreateUserInput): Promise<string>;
    register(dto: CreateUserInput): Promise<{
        message: string;
    }>;
    requestEmailChange(userId: number, dto: RequestEmailChangeInput): Promise<{
        status: string;
        message: string;
    }>;
    verifyEmailChange(token: string): Promise<{
        message: string;
    }>;
    private sendEmailChangedAlert;
    private getBackendBaseUrl;
    private getFrontendBaseUrl;
    private getActivationSecret;
    private getEmailChangeSecret;
}
