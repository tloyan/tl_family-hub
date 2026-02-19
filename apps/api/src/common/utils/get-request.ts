import type { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { Request } from 'express';

export function getRequestFromContext(context: ExecutionContext): Request {
  if (context.getType() === 'http') {
    return context.switchToHttp().getRequest<Request>();
  }
  const gqlContext = GqlExecutionContext.create(context);
  return gqlContext.getContext<{ req: Request }>().req;
}
