"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const recommendation_resolver_1 = require("./recommendation.resolver");
const recommendation_service_1 = require("./recommendation.service");
const set_module_1 = require("../set/set.module");
const auth_module_1 = require("../auth/auth.module");
let RecommendationModule = class RecommendationModule {
};
exports.RecommendationModule = RecommendationModule;
exports.RecommendationModule = RecommendationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            auth_module_1.AuthModule,
            set_module_1.SetModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    secret: configService.getOrThrow('JWT_SECRET'),
                    signOptions: {
                        expiresIn: configService.getOrThrow('JWT_EXPIRES_IN'),
                    },
                }),
            }),
        ],
        controllers: [],
        providers: [recommendation_service_1.RecommendationService, recommendation_resolver_1.RecommendationResolver],
        exports: [recommendation_service_1.RecommendationService],
    })
], RecommendationModule);
//# sourceMappingURL=recommendation.module.js.map