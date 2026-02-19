import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { getRequestFromContext } from '../utils/get-request';

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const req = getRequestFromContext(context);
  return (req as Request & { user: unknown }).user;
});
