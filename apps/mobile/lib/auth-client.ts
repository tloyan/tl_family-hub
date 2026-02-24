import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import { emailOTPClient } from 'better-auth/client/plugins';
import * as SecureStore from 'expo-secure-store';

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000',
  plugins: [
    emailOTPClient(),
    expoClient({
      scheme: 'familyhub',
      storagePrefix: 'familyhub',
      storage: SecureStore,
    }),
  ],
});

export const { signIn, signOut, useSession, emailOtp } = authClient;
