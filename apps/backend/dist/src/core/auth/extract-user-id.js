"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractUserIdFromGraphqlContext = extractUserIdFromGraphqlContext;
const common_1 = require("@nestjs/common");
function extractUserIdFromGraphqlContext(jwtService, ctx) {
    const authHeader = ctx.req?.headers?.authorization ?? '';
    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;
    if (!token) {
        throw new common_1.UnauthorizedException('Not authenticated');
    }
    try {
        const payload = jwtService.verify(token);
        return payload.sub;
    }
    catch {
        throw new common_1.UnauthorizedException('Invalid or expired token');
    }
}
//# sourceMappingURL=extract-user-id.js.map