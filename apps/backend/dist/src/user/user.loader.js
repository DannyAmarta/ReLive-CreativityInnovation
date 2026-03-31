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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserLoader = void 0;
const common_1 = require("@nestjs/common");
const dataloader_1 = __importDefault(require("dataloader"));
const prisma_service_1 = require("../prisma/prisma.service");
let UserLoader = class UserLoader {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateDataLoader() {
        return new dataloader_1.default(async (keys) => {
            const users = await this.prisma.user.findMany({
                where: { id: { in: [...keys] } },
            });
            const userMap = new Map(users.map((user) => [user.id, user]));
            return keys.map((key) => {
                const user = userMap.get(key);
                return user ?? new Error(`User ${key} not found`);
            });
        });
    }
};
exports.UserLoader = UserLoader;
exports.UserLoader = UserLoader = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserLoader);
//# sourceMappingURL=user.loader.js.map