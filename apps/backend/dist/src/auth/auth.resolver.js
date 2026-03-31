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
exports.AuthResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const auth_entity_1 = require("./entities/auth.entity");
const signInInput_1 = require("./dto/signInInput");
const auth_service_1 = require("./auth.service");
const forgot_password_1 = require("./dto/forgot-password");
const reset_password_1 = require("./dto/reset-password");
const forgot_reset_password_entity_1 = require("./entities/forgot-reset-password.entity");
const common_1 = require("@nestjs/common");
const exchange_openrouter_code_input_1 = require("./dto/exchange-openrouter-code.input");
const openrouter_connection_entity_1 = require("./entities/openrouter-connection.entity");
const jwt_1 = require("@nestjs/jwt");
let AuthResolver = class AuthResolver {
    authService;
    jwtService;
    constructor(authService, jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }
    async signIn(signInInput) {
        const user = await this.authService.validateLocalUser(signInInput);
        return this.authService.login(user);
    }
    async forgotPassword(dto) {
        return this.authService.forgotPassword(dto.email);
    }
    async resetPassword(dto) {
        return this.authService.resetPassword(dto.token, dto.newPassword);
    }
    async exchangeOpenRouterCode(input, ctx) {
        const userId = this.extractUserIdFromContext(ctx);
        return this.authService.exchangeOpenRouterCode(userId, input);
    }
    async disconnectOpenRouter(ctx) {
        const userId = this.extractUserIdFromContext(ctx);
        return this.authService.disconnectOpenRouterConnection(userId);
    }
    hello() {
        return 'Hello World';
    }
    extractUserIdFromContext(ctx) {
        const authHeader = ctx.req?.headers?.authorization ?? '';
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : authHeader;
        if (!token) {
            throw new common_1.UnauthorizedException('Not authenticated');
        }
        try {
            const payload = this.jwtService.verify(token);
            return payload.sub;
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
    }
};
exports.AuthResolver = AuthResolver;
__decorate([
    (0, graphql_1.Mutation)(() => auth_entity_1.AuthPayload),
    __param(0, (0, graphql_1.Args)('signInInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signInInput_1.SignInInput]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "signIn", null);
__decorate([
    (0, graphql_1.Mutation)(() => forgot_reset_password_entity_1.ForgotResetPassword),
    __param(0, (0, graphql_1.Args)('forgotInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "forgotPassword", null);
__decorate([
    (0, graphql_1.Mutation)(() => forgot_reset_password_entity_1.ForgotResetPassword),
    __param(0, (0, graphql_1.Args)('resetInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "resetPassword", null);
__decorate([
    (0, graphql_1.Mutation)(() => openrouter_connection_entity_1.OpenRouterConnectionPayload),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [exchange_openrouter_code_input_1.ExchangeOpenRouterCodeInput, Object]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "exchangeOpenRouterCode", null);
__decorate([
    (0, graphql_1.Mutation)(() => openrouter_connection_entity_1.OpenRouterConnectionPayload),
    __param(0, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthResolver.prototype, "disconnectOpenRouter", null);
__decorate([
    (0, graphql_1.Query)(() => String),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthResolver.prototype, "hello", null);
exports.AuthResolver = AuthResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        jwt_1.JwtService])
], AuthResolver);
//# sourceMappingURL=auth.resolver.js.map