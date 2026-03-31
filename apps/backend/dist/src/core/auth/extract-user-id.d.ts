import { JwtService } from '@nestjs/jwt';
type GraphqlContextLike = {
    req?: {
        headers?: Record<string, string | undefined>;
    };
};
export declare function extractUserIdFromGraphqlContext(jwtService: JwtService, ctx: GraphqlContextLike): number;
export {};
