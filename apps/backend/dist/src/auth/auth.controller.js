"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const google_auth_guard_1 = require("./guards/google-auth/google-auth.guard");
const auth_service_1 = require("./auth.service");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const config_1 = require("@nestjs/config");
let AuthController = class AuthController {
    authService;
    jwtService;
    prisma;
    configService;
    constructor(authService, jwtService, prisma, configService) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.prisma = prisma;
        this.configService = configService;
    }
    googleLogin() { }
    async googleCallback(req, res) {
        const code = await this.authService.createGoogleAuthHandoff(req.user);
        return res.redirect(`${this.getFrontendBaseUrl()}/api/auth/google/callback?code=${code}`);
    }
    async exchangeGoogleCode(code) {
        if (!code) {
            throw new common_1.BadRequestException('Google sign-in code is required');
        }
        return this.authService.exchangeGoogleAuthHandoff(code);
    }
    async activate(token, res) {
        if (!token) {
            return res.redirect(`${this.getFrontendBaseUrl()}/auth/login`);
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.getActivationSecret(),
            });
            if (payload.purpose !== 'account_activation') {
                throw new common_1.BadRequestException('Invalid activation token');
            }
            const existingUser = await this.prisma.user.findUnique({
                where: {
                    email: payload.email,
                },
            });
            if (!existingUser) {
                await this.prisma.user.create({
                    data: {
                        email: payload.email,
                        password: payload.password,
                        name: payload.name,
                        bio: payload.bio,
                        avatar: payload.avatar,
                    },
                });
            }
        }
        catch {
            return res.redirect(`${this.getFrontendBaseUrl()}/auth/login`);
        }
        return res.redirect(`${this.getFrontendBaseUrl()}/auth/login`);
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
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.UseGuards)(google_auth_guard_1.GoogleAuthGuard),
    (0, common_1.Get)('google/login'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "googleLogin", null);
__decorate([
    (0, common_1.UseGuards)(google_auth_guard_1.GoogleAuthGuard),
    (0, common_1.Get)('google/callback'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleCallback", null);
__decorate([
    (0, common_1.Post)('google/exchange'),
    __param(0, (0, common_1.Body)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "exchangeGoogleCode", null);
__decorate([
    (0, common_1.Get)('activate'),
    __param(0, (0, common_1.Query)('token')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "activate", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        jwt_1.JwtService,
        prisma_service_1.PrismaService,
        config_1.ConfigService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map