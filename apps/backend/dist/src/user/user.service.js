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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const argon2_1 = require("argon2");
const jwt_1 = require("@nestjs/jwt");
const event_emitter_1 = require("@nestjs/event-emitter");
const config_1 = require("@nestjs/config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let UserService = class UserService {
    prisma;
    jwtService;
    eventEmitter;
    configService;
    constructor(prisma, jwtService, eventEmitter, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.eventEmitter = eventEmitter;
        this.configService = configService;
    }
    async getMe(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        return {
            ...user,
            hasOpenRouterConnection: Boolean(user.openRouterApiKeyEncrypted),
            openRouterKeyLabel: user.openRouterKeyLabel,
            openRouterConnectedAt: user.openRouterConnectedAt,
        };
    }
    async updateProfile(userId, dto) {
        if (!dto.name && dto.bio === undefined) {
            throw new common_1.BadRequestException('No profile fields provided to update');
        }
        const data = {};
        if (dto.name)
            data.name = dto.name;
        if (dto.bio !== undefined)
            data.bio = dto.bio;
        return this.prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                email: true,
                password: true,
                name: true,
                bio: true,
                avatar: true,
                createdAt: true,
                updatedAt: true,
                openRouterApiKeyEncrypted: true,
                openRouterKeyLabel: true,
                openRouterConnectedAt: true,
            },
        }).then((user) => ({
            ...user,
            hasOpenRouterConnection: Boolean(user.openRouterApiKeyEncrypted),
            openRouterKeyLabel: user.openRouterKeyLabel,
            openRouterConnectedAt: user.openRouterConnectedAt,
        }));
    }
    async generateActivationToken(dto) {
        const payload = {
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
    async register(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('Email already registered');
        }
        const hashedPassword = await (0, argon2_1.hash)(dto.password);
        const token = await this.generateActivationToken({
            ...dto,
            password: hashedPassword,
        });
        const templatePath = path.join(process.cwd(), 'src/mail/templates/mail.html');
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
    async requestEmailChange(userId, dto) {
        const currentUser = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!currentUser)
            throw new common_1.UnauthorizedException('User not found');
        if (dto.currentPassword) {
            let passwordMatched = false;
            try {
                passwordMatched = await (0, argon2_1.verify)(currentUser.password, dto.currentPassword);
            }
            catch {
                passwordMatched = false;
            }
            if (!passwordMatched) {
                throw new common_1.BadRequestException('Invalid current password');
            }
        }
        if (currentUser.email === dto.newEmail) {
            throw new common_1.BadRequestException('New email must be different from current email');
        }
        const alternateUser = await this.prisma.user.findUnique({
            where: { email: dto.newEmail },
        });
        if (alternateUser && !dto.overwriteAlternate) {
            return {
                status: 'ALTERNATE_ACCOUNT_EXISTS',
                message: 'That email is already associated with an active account. Confirm to overwrite it.',
            };
        }
        const payload = alternateUser
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
        const verifyLink = `${this.getFrontendBaseUrl()}/auth/verify-email?token=${token}`;
        const templatePath = path.join(process.cwd(), 'src/mail/templates/emailChange.html');
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
    async verifyEmailChange(token) {
        let payload;
        try {
            payload = await this.jwtService.verifyAsync(token, { secret: this.getEmailChangeSecret() });
        }
        catch {
            throw new common_1.BadRequestException('Invalid or expired email change link. Please request a new one.');
        }
        if (payload.purpose !== 'email_change' &&
            payload.purpose !== 'email_change_overwrite') {
            throw new common_1.BadRequestException('Invalid token purpose');
        }
        const currentUser = await this.prisma.user.findUnique({
            where: { id: payload.currentUserId },
        });
        if (!currentUser)
            throw new common_1.BadRequestException('User account no longer exists');
        const oldEmail = currentUser.email;
        if (payload.purpose === 'email_change_overwrite' && payload.alternateUserId) {
            await this.prisma.user.delete({
                where: { id: payload.alternateUserId },
            });
        }
        await this.prisma.user.update({
            where: { id: payload.currentUserId },
            data: { email: payload.newEmail },
        });
        await this.sendEmailChangedAlert(oldEmail, payload.newEmail);
        return { message: 'Email address updated successfully.' };
    }
    async sendEmailChangedAlert(oldEmail, newEmail) {
        const templatePath = path.join(process.cwd(), 'src/mail/templates/emailChangedAlert.html');
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
    getBackendBaseUrl() {
        return (this.configService.get('BACKEND_URL') ??
            'http://localhost:8000');
    }
    getFrontendBaseUrl() {
        return (this.configService.get('FRONTEND_URL') ??
            this.configService.get('APP_FRONTEND_URL') ??
            'http://localhost:3000');
    }
    getActivationSecret() {
        return (this.configService.get('ACCOUNT_ACTIVATION_SECRET') ??
            this.configService.getOrThrow('EMAIL_SECRET'));
    }
    getEmailChangeSecret() {
        return (this.configService.get('EMAIL_CHANGE_SECRET') ??
            this.configService.getOrThrow('JWT_SECRET'));
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        event_emitter_1.EventEmitter2,
        config_1.ConfigService])
], UserService);
//# sourceMappingURL=user.service.js.map