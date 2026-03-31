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
    private extractUserIdFromContext;
}
