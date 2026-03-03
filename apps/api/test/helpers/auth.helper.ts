import crypto from 'crypto';
import type { PrismaClient } from '@family-hub/db';

/**
 * Sign a cookie value using the same HMAC-SHA256 algorithm as Hono/better-auth.
 * Format: VALUE.BASE64_SIGNATURE
 */
async function signCookie(value: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await globalThis.crypto.subtle.sign('HMAC', key, encoder.encode(value));
  const signature = btoa(String.fromCharCode(...new Uint8Array(mac)));
  return `${value}.${signature}`;
}

export async function createTestUser(
  prisma: PrismaClient,
  overrides: { name?: string; email?: string } = {},
) {
  const userId = crypto.randomUUID();
  const token = crypto.randomBytes(32).toString('hex');
  const sessionId = crypto.randomUUID();
  const secret = process.env['BETTER_AUTH_SECRET']!;

  await prisma.user.create({
    data: {
      id: userId,
      name: overrides.name ?? `User ${userId.slice(0, 8)}`,
      email: overrides.email ?? `user-${userId.slice(0, 8)}@test.com`,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  await prisma.session.create({
    data: {
      id: sessionId,
      token,
      userId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const signedToken = await signCookie(token, secret);

  return {
    userId,
    headers: {
      Cookie: `better-auth.session_token=${signedToken}`,
    },
  };
}
