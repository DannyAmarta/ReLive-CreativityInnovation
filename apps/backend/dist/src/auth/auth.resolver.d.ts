import { SignInInput } from './dto/signInInput';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password';
import { ResetPasswordDto } from './dto/reset-password';
import { ExchangeOpenRouterCodeInput } from './dto/exchange-openrouter-code.input';
import { JwtService } from '@nestjs/jwt';
export declare class AuthResolver {
    private readonly authService;
    private readonly jwtService;
    constructor(authService: AuthService, jwtService: JwtService);
    signIn(signInInput: SignInInput): Promise<{
        id: number;
        name: string;
        avatar: string | null;
        accessToken: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    exchangeOpenRouterCode(input: ExchangeOpenRouterCodeInput, ctx: {
        req: {
            headers: Record<string, string>;
        };
    }): Promise<{
        success: boolean;
        message: string;
        hasConnection: boolean;
        keyLabel: string;
        connectedAt: Date;
    }>;
    disconnectOpenRouter(ctx: {
        req: {
            headers: Record<string, string>;
        };
    }): Promise<{
        success: boolean;
        message: string;
        hasConnection: boolean;
        keyLabel: null;
        connectedAt: null;
    }>;
    hello(): string;
    private extractUserIdFromContext;
}
