import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';
import { trace } from '@opentelemetry/api';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  protected readonly logger = new Logger(GqlThrottlerGuard.name);

  getRequestResponse(context: ExecutionContext) {
    const isGraphql = context.getType<string>() === 'graphql';

    if (isGraphql) {
      const gqlCtx = GqlExecutionContext.create(context);
      const ctx = gqlCtx.getContext();
      // Safely extract the Express/Fastify request object from Apollo GraphQL context
      return { req: ctx.req, res: ctx.res || ctx.reply };
    }

    // Fallback to standard HTTP execution wrapper for normal REST controllers
    return super.getRequestResponse(context);
  }

  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: any,
  ): Promise<void> {
    const { req } = this.getRequestResponse(context);
    const ip = req?.ip || req?.headers?.['x-forwarded-for'] || 'unknown';
    const path = req?.url || req?.originalUrl || 'graphql';

    // Record rate-limiting block in current trace span
    const activeSpan = trace.getActiveSpan();
    if (activeSpan) {
      activeSpan.addEvent('rate_limit_blocked', {
        ip,
        path,
        limit: throttlerLimitDetail?.limit,
        ttl: throttlerLimitDetail?.ttl,
        name: throttlerLimitDetail?.throttlerName,
      });
    }

    this.logger.warn(`[Throttler] IP ${ip} blocked on ${path} (Throttler: ${throttlerLimitDetail?.throttlerName})`);
    await super.throwThrottlingException(context, throttlerLimitDetail);
  }
}
