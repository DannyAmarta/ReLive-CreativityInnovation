import { CreateUserInput } from './dto/create-user.input';
import { UserService } from './user.service';
import { RequestEmailChangeInput } from './dto/request-email-change.input';
import { UpdateProfileInput } from './dto/update-profile.input';
import { JwtService } from '@nestjs/jwt';
export declare class UserResolver {
    private readonly userService;
    private readonly jwtService;
    constructor(userService: UserService, jwtService: JwtService);
    register(createUserInput: CreateUserInput): Promise<{
        message: string;
    }>;
    getMe(ctx: {
        req: {
            headers: Record<string, string>;
        };
    }): Promise<{
        hasOpenRouterConnection: boolean;
        openRouterKeyLabel: string | null;
        openRouterConnectedAt: Date | null;
        id: number;
        email: string;
        password: string;
        name: string | null;
        bio: string | null;
        avatar: string | null;
        profileCompleted: boolean;
        fitnessLevel: string | null;
        dailyActivity: string | null;
        primaryGoal: string | null;
        vitalityScore: number;
        streakDays: number;
        openRouterApiKeyEncrypted: string | null;
        openRouterUserId: string | null;
        createdAt: Date;
        updatedAt: Date | null;
    }>;
    requestEmailChange(input: RequestEmailChangeInput, ctx: {
        req: {
            headers: Record<string, string>;
        };
    }): Promise<{
        status: string;
        message: string;
    }>;
    verifyEmailChange(token: string): Promise<{
        message: string;
    }>;
    updateProfile(input: UpdateProfileInput, ctx: {
        req: {
            headers: Record<string, string>;
        };
    }): Promise<{
        hasOpenRouterConnection: boolean;
        id: number;
        email: string;
        name: string | null;
        bio: string | null;
        avatar: string | null;
        profileCompleted: boolean;
        fitnessLevel: string | null;
        dailyActivity: string | null;
        primaryGoal: string | null;
        vitalityScore: number;
        openRouterApiKeyEncrypted: string | null;
        openRouterKeyLabel: string | null;
        openRouterConnectedAt: Date | null;
        createdAt: Date;
    }>;
    private extractUserIdFromContext;
}
