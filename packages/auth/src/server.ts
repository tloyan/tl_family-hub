import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import type { PrismaClient } from "@family-hub/db";

export interface AuthConfig {
  baseURL: string;
  secret: string;
  prisma: PrismaClient;
  google: { clientId: string; clientSecret: string };
  sendOTP: (params: {
    email: string;
    otp: string;
    type: string;
  }) => Promise<void>;
}

export function createAuth(config: AuthConfig) {
  return betterAuth({
    baseURL: config.baseURL,
    secret: config.secret,
    database: prismaAdapter(config.prisma, { provider: "postgresql" }),
    socialProviders: {
      google: {
        clientId: config.google.clientId,
        clientSecret: config.google.clientSecret,
      },
    },
    plugins: [emailOTP({ sendVerificationOTP: config.sendOTP })],
  });
}

export type Auth = ReturnType<typeof createAuth>;
