import { All, Controller, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { toNodeHandler } from 'better-auth/node';

@Controller('api/auth')
export class AuthController {
  private handler!: ReturnType<typeof toNodeHandler>;
  constructor(private readonly authService: AuthService) {
    this.handler = toNodeHandler(this.authService.auth);
  }

  @All('*path')
  async handleAuth(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.handler(req, res);
  }
}
