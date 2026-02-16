import { createAuthClient as createBetterAuthClient } from "better-auth/client";
import { emailOTPClient } from "better-auth/client/plugins";

export interface AuthClientConfig {
  baseURL: string;
}

export function createAuthClient(config: AuthClientConfig) {
  return createBetterAuthClient({
    baseURL: config.baseURL,
    plugins: [emailOTPClient()],
  });
}

export type AuthClient = ReturnType<typeof createAuthClient>;
