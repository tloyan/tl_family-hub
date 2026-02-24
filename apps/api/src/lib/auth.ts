import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { emailOTP } from 'better-auth/plugins';
import { expo } from '@better-auth/expo';
import type { PrismaClient } from '@family-hub/db';
import { renderOtpEmail } from '@family-hub/emails';
import { Resend } from 'resend';

const resend = new Resend(process.env['RESEND_API_KEY']);

export function createAuth(prisma: PrismaClient) {
  return betterAuth({
    basePath: '/api/auth',
    baseURL: process.env['BETTER_AUTH_URL'],
    secret: process.env['BETTER_AUTH_SECRET'],
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
    socialProviders: {
      google: {
        clientId: process.env['GOOGLE_CLIENT_ID'] as string,
        clientSecret: process.env['GOOGLE_CLIENT_SECRET'] as string,
      },
    },
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ['google'],
      },
    },
    session: {
      expiresIn: 2592000, // 30 days in seconds
      updateAge: 86400, // refresh session daily
    },
    advanced: {
      useSecureCookies: process.env['NODE_ENV'] === 'production',
    },
    trustedOrigins: [
      'familyhub://',
      ...(process.env['TRUSTED_ORIGINS']?.split(',') ?? []),
      ...(process.env['NODE_ENV'] !== 'production' ? ['http://localhost:3000'] : []),
    ],
    plugins: [
      emailOTP({
        otpLength: 6,
        expiresIn: 600, // 10 minutes
        sendVerificationOTP: async ({ email, otp, type }) => {
          const { html, subject } = renderOtpEmail({ otp, type });
          await resend.emails.send({
            from: `Family Hub <${process.env['EMAIL_FROM']}>`,
            to: email,
            subject,
            html,
          });
        },
      }),
      expo(),
    ],
    rateLimit: {
      window: 60,
      max: 100,
      customRules: {
        '/sign-in/social': { window: 900, max: 5 }, // 5 attempts / 15 min
        '/email-otp/send-verification-otp': { window: 3600, max: 3 }, // 3 sends / 1 hour
        '/email-otp/verify-email': { window: 900, max: 5 }, // 5 attempts / 15 min
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
