import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
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
}
