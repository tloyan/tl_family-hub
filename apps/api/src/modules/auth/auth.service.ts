import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { type Auth, createAuth } from '../../lib/auth';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private _auth: Auth;

  constructor(private readonly prisma: PrismaService) {
    this._auth = createAuth(this.prisma);
    this.logger.log('Better Auth initialized');
  }

  get auth(): Auth {
    return this._auth;
  }
}
