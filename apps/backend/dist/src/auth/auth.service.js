"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const argon2_1 = require("argon2");
const jwt_1 = require("@nestjs/jwt");
const path_1 = __importDefault(require("path"));
const fs = __importStar(require("fs"));
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const crypto_1 = require("crypto");
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    eventEmitter;
    configService;
    logger = new common_1.Logger(AuthService_1.name);
    googleAuthHandoffs = new Map();
    genericCredentialError = 'Invalid email or password';
    constructor(prisma, jwtService, eventEmitter, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.eventEmitter = eventEmitter;
        this.configService = configService;
    }
    async validateLocalUser({ email, password }) {
        const user = await this.prisma.user.findUnique({
            where: {
                email,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException(this.genericCredentialError);
        }
        let passwordMatched = false;
        try {
            passwordMatched = await (0, argon2_1.verify)(user.password, password);
        }
        catch {
            throw new common_1.UnauthorizedException(this.genericCredentialError);
        }
        if (!passwordMatched) {
            throw new common_1.UnauthorizedException(this.genericCredentialError);
        }
        return user;
    }
    async generateToken(userId) {
        const payload = { sub: userId };
        const accessToken = await this.jwtService.signAsync(payload);
        return { accessToken };
    }
    async login(user) {
        const { accessToken } = await this.generateToken(user.id);
        return {
            id: user.id,
            name: user.name ?? 'User',
            avatar: user.avatar ?? null,
            accessToken,
        };
    }
    async validate(userId) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return { id: user.id };
    }
    async validateGoogleUser(googleUser) {
        const existingUser = await this.prisma.user.findUnique({
            where: {
                email: googleUser.email,
            },
        });
        if (existingUser) {
            const shouldSyncProfile = (!existingUser.name && googleUser.name) ||
                (!existingUser.avatar && googleUser.avatar);
            if (shouldSyncProfile) {
                return this.prisma.user.update({
                    where: { id: existingUser.id },
                    data: {
                        name: existingUser.name ?? googleUser.name,
                        avatar: existingUser.avatar ?? googleUser.avatar,
                    },
                });
            }
            return existingUser;
        }
        const password = await this.createGooglePasswordPlaceholder();
        return this.prisma.user.create({
            data: {
                email: googleUser.email,
                name: googleUser.name,
                avatar: googleUser.avatar,
                password,
            },
        });
    }
    async createGoogleAuthHandoff(user) {
        this.pruneExpiredGoogleAuthHandoffs();
        const authPayload = await this.login(user);
        const code = (0, crypto_1.randomBytes)(24).toString('hex');
        this.googleAuthHandoffs.set(code, {
            authPayload,
            expiresAt: Date.now() + 2 * 60 * 1000,
        });
        return code;
    }
    async exchangeGoogleAuthHandoff(code) {
        this.pruneExpiredGoogleAuthHandoffs();
        const handoff = this.googleAuthHandoffs.get(code);
        if (!handoff) {
            throw new common_1.BadRequestException('Google sign-in session expired. Please try again.');
        }
        this.googleAuthHandoffs.delete(code);
        return handoff.authPayload;
    }
    async forgotPassword(email) {
        const user = await this.prisma.user.findUnique({
            where: {
                email,
            },
        });
        const genericResponse = {
            message: 'If that email exists, a reset link has been sent.',
        };
        if (!user) {
            return genericResponse;
        }
        const token = await this.signResetPasswordToken(user.id);
        const templatePath = path_1.default.join(process.cwd(), 'src/mail/templates/resetPassword.html');
        let html = fs.readFileSync(templatePath, 'utf8');
        const resetLink = `${this.getFrontendBaseUrl()}/auth/reset-password?token=${token}`;
        html = html.replace('{{resetLink}}', resetLink);
        html = html.replace('{{email}}', email);
        this.eventEmitter.emit('user.forgot-password', {
            email,
            html,
        });
        return genericResponse;
    }
    async resetPassword(token, newPassword) {
        const payload = await this.verifyResetPasswordToken(token);
        const hashed = await (0, argon2_1.hash)(newPassword);
        await this.prisma.user.update({
            where: { id: payload.sub },
            data: {
                password: hashed,
            },
        });
        return {
            message: 'Password updated successfully',
        };
    }
    async exchangeOpenRouterCode(userId, input) {
        const response = await fetch(`${OPENROUTER_BASE_URL}/auth/keys`, {
            method: 'POST',
            headers: this.buildOpenRouterExchangeHeaders(),
            body: JSON.stringify({
                code: input.code,
                code_verifier: input.verifier,
                code_challenge_method: 'S256',
            }),
        });
        const payload = await this.readJson(response);
        const apiKey = this.readString(payload?.key) ??
            this.readString(payload?.data?.key) ??
            this.readString(payload?.token) ??
            null;
        if (!response.ok || !apiKey) {
            throw new common_1.BadRequestException(this.readString(payload?.error?.message) ??
                this.readString(payload?.message) ??
                'Unable to connect your OpenRouter account right now.');
        }
        const keyMetadata = await this.fetchOpenRouterKeyMetadata(apiKey);
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                openRouterApiKeyEncrypted: this.encryptOpenRouterApiKey(apiKey),
                openRouterKeyLabel: keyMetadata.label,
                openRouterUserId: keyMetadata.userId,
                openRouterConnectedAt: new Date(),
            },
        });
        return {
            success: true,
            message: 'OpenRouter account connected successfully.',
            hasConnection: true,
            keyLabel: keyMetadata.label,
            connectedAt: new Date(),
        };
    }
    async disconnectOpenRouterConnection(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                openRouterApiKeyEncrypted: null,
                openRouterKeyLabel: null,
                openRouterUserId: null,
                openRouterConnectedAt: null,
            },
        });
        return {
            success: true,
            message: 'OpenRouter connection removed.',
            hasConnection: false,
            keyLabel: null,
            connectedAt: null,
        };
    }
    async getConnectedOpenRouterApiKey(userId) {
        const connection = await this.getConnectedOpenRouterAccess(userId);
        return connection.apiKey;
    }
    async getConnectedOpenRouterAccess(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                openRouterApiKeyEncrypted: true,
                openRouterKeyLabel: true,
                openRouterConnectedAt: true,
            },
        });
        if (!user?.openRouterApiKeyEncrypted) {
            return {
                status: 'missing',
                apiKey: null,
                keyLabel: user?.openRouterKeyLabel ?? null,
                connectedAt: user?.openRouterConnectedAt ?? null,
            };
        }
        try {
            return {
                status: 'available',
                apiKey: this.decryptOpenRouterApiKey(user.openRouterApiKeyEncrypted),
                keyLabel: user.openRouterKeyLabel ?? null,
                connectedAt: user.openRouterConnectedAt ?? null,
            };
        }
        catch (error) {
            this.logger.warn(`Connected OpenRouter key for user ${userId} could not be decrypted. Reconnect is required.`, error instanceof Error ? error.stack : String(error));
            return {
                status: 'decrypt_failed',
                apiKey: null,
                keyLabel: user.openRouterKeyLabel ?? null,
                connectedAt: user.openRouterConnectedAt ?? null,
            };
        }
    }
    async createGooglePasswordPlaceholder() {
        return (0, argon2_1.hash)((0, crypto_1.randomBytes)(32).toString('hex'));
    }
    buildOpenRouterExchangeHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        const serverKey = this.configService.get('QWEN_API_KEY');
        if (serverKey) {
            headers.Authorization = `Bearer ${serverKey}`;
        }
        return headers;
    }
    async fetchOpenRouterKeyMetadata(apiKey) {
        try {
            const response = await fetch(`${OPENROUTER_BASE_URL}/key`, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
            });
            const payload = await this.readJson(response);
            return {
                label: this.readString(payload?.data?.label) ??
                    this.maskOpenRouterKey(apiKey),
                userId: this.readString(payload?.data?.owner_id) ??
                    this.readString(payload?.data?.user_id) ??
                    null,
            };
        }
        catch {
            return {
                label: this.maskOpenRouterKey(apiKey),
                userId: null,
            };
        }
    }
    encryptOpenRouterApiKey(apiKey) {
        try {
            const iv = (0, crypto_1.randomBytes)(12);
            const cipher = (0, crypto_1.createCipheriv)('aes-256-gcm', this.getOpenRouterEncryptionKey(), iv);
            const encrypted = Buffer.concat([
                cipher.update(apiKey, 'utf8'),
                cipher.final(),
            ]);
            const tag = cipher.getAuthTag();
            return [iv, tag, encrypted]
                .map((part) => part.toString('base64url'))
                .join('.');
        }
        catch {
            throw new common_1.InternalServerErrorException('Unable to store your OpenRouter connection securely.');
        }
    }
    decryptOpenRouterApiKey(payload) {
        const [ivPart, tagPart, encryptedPart] = payload.split('.');
        if (!ivPart || !tagPart || !encryptedPart) {
            throw new Error('Invalid OpenRouter key payload.');
        }
        const decipher = (0, crypto_1.createDecipheriv)('aes-256-gcm', this.getOpenRouterEncryptionKey(), Buffer.from(ivPart, 'base64url'));
        decipher.setAuthTag(Buffer.from(tagPart, 'base64url'));
        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(encryptedPart, 'base64url')),
            decipher.final(),
        ]);
        return decrypted.toString('utf8');
    }
    getOpenRouterEncryptionKey() {
        const secret = this.configService.get('OPENROUTER_KEY_ENCRYPTION_SECRET') ??
            this.configService.getOrThrow('JWT_SECRET');
        return (0, crypto_1.createHash)('sha256').update(secret).digest();
    }
    maskOpenRouterKey(apiKey) {
        if (apiKey.length <= 8) {
            return apiKey;
        }
        return `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`;
    }
    async readJson(response) {
        try {
            return (await response.json());
        }
        catch {
            return null;
        }
    }
    readString(value) {
        return typeof value === 'string' && value.trim().length > 0
            ? value.trim()
            : null;
    }
    async signResetPasswordToken(userId) {
        return this.jwtService.signAsync({
            sub: userId,
            purpose: 'password_reset',
        }, {
            secret: this.getResetPasswordSecret(),
            expiresIn: '15m',
        });
    }
    async verifyResetPasswordToken(token) {
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.getResetPasswordSecret(),
            });
            if (payload.purpose !== 'password_reset') {
                throw new common_1.BadRequestException('Invalid or expired token');
            }
            return payload;
        }
        catch {
            throw new common_1.BadRequestException('Invalid or expired token');
        }
    }
    pruneExpiredGoogleAuthHandoffs() {
        const now = Date.now();
        for (const [code, handoff] of this.googleAuthHandoffs.entries()) {
            if (handoff.expiresAt <= now) {
                this.googleAuthHandoffs.delete(code);
            }
        }
    }
    getFrontendBaseUrl() {
        return (this.configService.get('FRONTEND_URL') ??
            this.configService.get('APP_FRONTEND_URL') ??
            'http://localhost:3000');
    }
    getResetPasswordSecret() {
        return (this.configService.get('RESET_PASSWORD_SECRET') ??
            this.configService.getOrThrow('JWT_SECRET'));
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        event_emitter_1.EventEmitter2,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map