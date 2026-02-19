import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';
import type { Request } from 'express';
import { AuthService } from '../../modules/auth/auth.service';
import { getRequestFromContext } from '../utils/get-request';

@Injectable()
export class BetterAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = getRequestFromContext(context);

    const session = await this.authService.auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      throw new UnauthorizedException({
        message: 'Invalid or expired session',
        code: 'AUTH_SESSION_EXPIRED',
      });
    }

    (req as Request & { session: typeof session.session; user: typeof session.user }).session =
      session.session;
    (req as Request & { user: typeof session.user }).user = session.user;

    return true;
  }
}
