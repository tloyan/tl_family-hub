import { createAuthClient } from 'better-auth/react';
import { emailOTPClient } from 'better-auth/client/plugins';
import { nextCookies } from 'better-auth/next-js';

export const authClient = createAuthClient({
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- provided by Doppler, absence = visible runtime error
  baseURL: process.env.NEXT_PUBLIC_API_URL!,
  plugins: [emailOTPClient(), nextCookies()],
});

export const { signIn, signOut, useSession, emailOtp } = authClient;
