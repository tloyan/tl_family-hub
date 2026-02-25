import { config } from 'dotenv';
import { resolve } from 'path';
import { defineConfig } from 'prisma/config';

config({ path: resolve(__dirname, '../../.env') });

export default defineConfig({
  schema: 'prisma/schema',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env['DIRECT_DATABASE_URL'] ?? process.env['DATABASE_URL'] ?? '',
  },
});
