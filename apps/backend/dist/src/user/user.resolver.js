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
exports.UserResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const user_entity_1 = require("./entities/user.entity");
const create_user_input_1 = require("./dto/create-user.input");
const user_service_1 = require("./user.service");
const register_response_type_1 = require("./dto/register-response.type");
const request_email_change_input_1 = require("./dto/request-email-change.input");
const request_email_change_response_1 = require("./dto/request-email-change.response");
const verify_email_change_response_1 = require("./dto/verify-email-change.response");
const update_profile_input_1 = require("./dto/update-profile.input");
const jwt_1 = require("@nestjs/jwt");
const common_1 = require("@nestjs/common");
let UserResolver = class UserResolver {
    userService;
    jwtService;
    constructor(userService, jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }
    async register(createUserInput) {
        return this.userService.register(createUserInput);
    }
    async getMe(ctx) {
        const authHeader = ctx.req?.headers?.authorization ?? '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
        if (!token)
            throw new common_1.UnauthorizedException('Not authenticated');
        let payload;
        try {
            payload = this.jwtService.verify(token);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
        return this.userService.getMe(payload.sub);
    }
    async requestEmailChange(input, ctx) {
        const userId = this.extractUserIdFromContext(ctx);
        return this.userService.requestEmailChange(userId, input);
    }
    async verifyEmailChange(token) {
        return this.userService.verifyEmailChange(token);
    }
    async updateProfile(input, ctx) {
        const userId = this.extractUserIdFromContext(ctx);
        return this.userService.updateProfile(userId, input);
    }
    extractUserIdFromContext(ctx) {
        const authHeader = ctx.req?.headers?.authorization ?? '';
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : authHeader;
        if (!token)
            throw new common_1.UnauthorizedException('Not authenticated');
        try {
            const payload = this.jwtService.verify(token);
            return payload.sub;
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
    }
};
exports.UserResolver = UserResolver;
__decorate([
    (0, graphql_1.Mutation)(() => register_response_type_1.RegisterResponse),
    __param(0, (0, graphql_1.Args)('createUserInput')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_input_1.CreateUserInput]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    (0, graphql_1.Query)(() => user_entity_1.User),
    __param(0, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "getMe", null);
__decorate([
    (0, graphql_1.Mutation)(() => request_email_change_response_1.RequestEmailChangeResponse),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [request_email_change_input_1.RequestEmailChangeInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "requestEmailChange", null);
__decorate([
    (0, graphql_1.Mutation)(() => verify_email_change_response_1.VerifyEmailChangeResponse),
    __param(0, (0, graphql_1.Args)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "verifyEmailChange", null);
__decorate([
    (0, graphql_1.Mutation)(() => user_entity_1.User),
    __param(0, (0, graphql_1.Args)('input')),
    __param(1, (0, graphql_1.Context)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_profile_input_1.UpdateProfileInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "updateProfile", null);
exports.UserResolver = UserResolver = __decorate([
    (0, graphql_1.Resolver)(() => user_entity_1.User),
    __metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService])
], UserResolver);
//# sourceMappingURL=user.resolver.js.map