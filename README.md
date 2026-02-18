# Family Hub

FamTech SaaS for family organization — monorepo with API, web app, and mobile app.

> **Status (February 2026):** CI/CD is fully operational on `dev`. Production (`main`) is not yet deployed. See [Backlog Infra](docs/backlog-infra.md).

## Tech Stack

| Layer    | Technology                                       |
| -------- | ------------------------------------------------ |
| API      | NestJS 11, GraphQL (code-first), Apollo Server 5 |
| Web      | Next.js, React 19                                |
| Mobile   | Expo, React Native                               |
| Database | PostgreSQL 17, Prisma 7                          |
| Cache    | Redis 7.4                                        |
| Auth     | Better Auth (Google OAuth)                       |
| Monorepo | Turborepo, pnpm workspaces                       |
| Secrets  | Doppler                                          |
| CI/CD    | GitHub Actions, SonarCloud, CodeQL, Dependabot   |
| Hosting  | Railway (API), Vercel (Web), EAS Update (Mobile) |

## Project Structure

```
family-hub/
├── apps/
│   ├── api/              # NestJS GraphQL API
│   ├── web/              # Next.js web app
│   └── mobile/           # Expo React Native app
├── packages/
│   ├── db/               # Prisma schema, migrations, client
│   ├── shared/           # Shared types and utilities
│   ├── tokens/           # Design tokens
│   ├── config-eslint/    # Shared ESLint configuration
│   └── config-ts/        # Shared TypeScript configuration
├── docker/
│   ├── docker-compose.yml  # PostgreSQL + Redis (local dev)
│   └── api.Dockerfile      # Production build (Railway)
└── docs/                   # Project documentation
```

## Prerequisites

- [Node.js](https://nodejs.org/) >= 22
- [pnpm](https://pnpm.io/) 10.27.0 (managed via corepack)
- [Docker](https://www.docker.com/) >= 27
- [Doppler CLI](https://docs.doppler.com/docs/cli) (optional, for secrets injection)

## Getting Started

### Option 1 — With Doppler (recommended)

```bash
pnpm install
doppler setup            # select project: family-hub, config: dev_<your-name>
pnpm docker:up           # start PostgreSQL + Redis
pnpm db:generate && pnpm db:migrate:dev
pnpm dev:doppler         # start all apps with Doppler-injected secrets
```

### Option 2 — With .env file

```bash
pnpm install
cp .env.example .env     # fill in the values
pnpm docker:up
pnpm db:generate && pnpm db:migrate:dev
pnpm dev
```

The API runs on `http://localhost:4000/graphql`, the web app on `http://localhost:3000`.

## Scripts

| Command               | Description                           |
| --------------------- | ------------------------------------- |
| `pnpm dev`            | Start all apps in watch mode          |
| `pnpm dev:doppler`    | Same, with Doppler-injected secrets   |
| `pnpm build`          | Build all packages and apps           |
| `pnpm lint`           | Lint all packages                     |
| `pnpm typecheck`      | Type-check all packages               |
| `pnpm test`           | Run tests                             |
| `pnpm test:coverage`  | Run tests with coverage (lcov + text) |
| `pnpm format`         | Format code with Prettier             |
| `pnpm format:check`   | Check code formatting                 |
| `pnpm db:generate`    | Generate Prisma client from schema    |
| `pnpm db:migrate:dev` | Create and apply migrations           |
| `pnpm db:push`        | Push schema changes without migration |
| `pnpm db:seed`        | Seed the database                     |
| `pnpm db:studio`      | Open Prisma Studio GUI                |
| `pnpm docker:up`      | Start PostgreSQL + Redis containers   |
| `pnpm docker:down`    | Stop containers (data preserved)      |
| `pnpm docker:reset`   | Stop containers and delete all data   |

## Architecture

```
Local development:

  NestJS API (:4000)    Next.js (:3000)    Expo (device/simulator)
       │                     │                      │
       ▼                     │                      │
  ┌──────────┐               │                      │
  │PostgreSQL│  ┌───────┐    │                      │
  │  :5432   │  │ Redis │    │                      │
  └──────────┘  │ :6379 │    │                      │
     Docker     └───────┘    │                      │
                             └──────────────────────┘
                              Connect to API via GraphQL

Deployed (dev):

  Users ──→ Vercel (Web) ──→ Railway (API) ──→ Supabase (PostgreSQL)
       ──→ EAS (Mobile) ──↗                ──→ Upstash (Redis)
```

- **Local dev**: Apps run natively for fast hot-reload. Only PostgreSQL and Redis run in Docker.
- **Deployed**: API on Railway (Docker), Web on Vercel, Mobile via EAS Update. Secrets managed by Doppler.

## Environment Variables

Secrets are managed by [Doppler](docs/infrastructure-setup.md#6-doppler--secrets-management). For local dev without Doppler, copy `.env.example` to `.env`.

| Variable               | Description                    | Local default                                                            |
| ---------------------- | ------------------------------ | ------------------------------------------------------------------------ |
| `DATABASE_URL`         | PostgreSQL connection string   | `postgresql://postgres:postgres@localhost:5432/family_hub?schema=public` |
| `REDIS_URL`            | Redis connection string        | `redis://localhost:6379`                                                 |
| `BETTER_AUTH_SECRET`   | Auth secret key (min 32 chars) | —                                                                        |
| `BETTER_AUTH_URL`      | Auth base URL                  | `http://localhost:4000`                                                  |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID         | —                                                                        |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret     | —                                                                        |

`DATABASE_URL` and `REDIS_URL` defaults match the Docker Compose configuration — no changes needed for local dev.

## Documentation

### Onboarding

| Document                                                              | Description                                           |
| --------------------------------------------------------------------- | ----------------------------------------------------- |
| [Developer Guide](docs/onboarding/developer-guide.md)                 | Project overview, structure, setup, scripts           |
| [Development Workflow](docs/onboarding/development-workflow.md)       | Full cycle: commit → CI → deploy                      |
| [API Architecture](docs/onboarding/architecture-api.md)               | Request lifecycle, NestJS modules, Prisma, Dockerfile |
| [Infrastructure Overview](docs/onboarding/infrastructure-overview.md) | Cloud services, secrets (Doppler), DNS                |

### Operations

| Document                                               | Description                                        |
| ------------------------------------------------------ | -------------------------------------------------- |
| [CI & Security Pipeline](docs/ci-security-pipeline.md) | CI, deploy, SonarCloud, CodeQL, Dependabot         |
| [Infrastructure Setup](docs/infrastructure-setup.md)   | Step-by-step cloud setup guide                     |
| [Backlog Infra](docs/backlog-infra.md)                 | Remaining infra tasks (prod, rollback, monitoring) |
