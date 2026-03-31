import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

type GraphqlContextLike = {
  req?: {
    headers?: Record<string, string | undefined>;
  };
};

export function extractUserIdFromGraphqlContext(
  jwtService: JwtService,
  ctx: GraphqlContextLike,
) {
  const authHeader = ctx.req?.headers?.authorization ?? '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  if (!token) {
    throw new UnauthorizedException('Not authenticated');
  }

  try {
    const payload = jwtService.verify<{ sub: number }>(token);
    return payload.sub;
  } catch {
    throw new UnauthorizedException('Invalid or expired token');
  }
}
