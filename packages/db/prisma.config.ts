import { config } from 'dotenv';
import { resolve } from 'path';
import { defineConfig, env } from 'prisma/config';

config({ path: resolve(__dirname, '../../.env') });

export default defineConfig({
  schema: 'prisma/schema',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
