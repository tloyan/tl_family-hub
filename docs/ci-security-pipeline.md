# CI & Security Pipeline

## Overview

This monorepo uses five GitHub-managed automation systems:

| System         | File                           | Purpose                                      |
| -------------- | ------------------------------ | -------------------------------------------- |
| **CI**         | `.github/workflows/ci.yml`     | Validates code quality + coverage on push/PR |
| **Deploy**     | `.github/workflows/deploy.yml` | Deploys API, Web, Mobile after CI passes     |
| **SonarCloud** | (step in `ci.yml`)             | Quality gate + coverage analysis             |
| **CodeQL**     | `.github/workflows/codeql.yml` | Static security analysis                     |
| **Dependabot** | `.github/dependabot.yml`       | Automated dependency updates                 |

All workflows trigger on branches `main` and `dev`. Dependabot targets `dev` as its base branch.

> **Etat actuel (fevrier 2026) :** La CI/CD est **pleinement operationnelle sur `dev` uniquement**. Le CI (lint, tests, build, SonarCloud) tourne sur les deux branches, mais le deploy workflow n'a ete teste et valide qu'en environnement `dev`. Le deploiement vers `main`/production n'est pas encore en place — les environments GitHub (`production`), les secrets Doppler (`prd`), les integrations Railway/Vercel production, et les domaines custom de production ne sont pas encore tous configures. Voir `docs/backlog-infra.md` pour le detail.

---

## CI Workflow

### Trigger

- Push to `main` or `dev`
- Pull request targeting `main` or `dev`

### Pipeline

```
checkout (fetch-depth: 0) → pnpm 10.27.0 → Node 22 (with pnpm cache)
→ cache .turbo → pnpm install --frozen-lockfile
→ format:check → lint → typecheck → test:coverage → build → SonarCloud scan
```

Steps run sequentially from fastest to slowest (fail-fast strategy). Turborepo handles internal parallelization of monorepo tasks.

`fetch-depth: 0` is required for SonarCloud to access the full git history for blame and new code detection.

### Infrastructure

- **Runner:** `ubuntu-latest`
- **PostgreSQL 17-alpine** service container on `localhost:5432` — required by Prisma (schema introspection) and API e2e tests
- **Timeout:** 15 minutes
- **Concurrency:** one run per branch; new pushes cancel in-progress runs

### Environment Variables

| Variable                  | Value                                                           | Why                                        |
| ------------------------- | --------------------------------------------------------------- | ------------------------------------------ |
| `DATABASE_URL`            | `postgresql://postgres:postgres@localhost:5432/family_hub_test` | Real connection to service container       |
| `REDIS_URL`               | `redis://localhost:6379`                                        | Dummy — no Redis service yet               |
| `BETTER_AUTH_SECRET`      | `ci-dummy-secret-for-build-only-32chars`                        | Dummy — Better Auth reads it at build time |
| `BETTER_AUTH_URL`         | `http://localhost:4000`                                         | Dummy — required at build time             |
| `NEXT_PUBLIC_GRAPHQL_URL` | `http://localhost:4000/graphql`                                 | Dummy — Next.js inlines it at build time   |

These are not secrets. They exist only because certain packages fail to build without them.

### Adding a Real Secret

If a step needs a real secret (e.g., an API key for integration tests):

1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Add the secret (e.g., `STRIPE_TEST_KEY`)
3. Reference it in the workflow: `${{ secrets.STRIPE_TEST_KEY }}`

---

## Test Coverage

### Current Scope

Coverage is collected for **`apps/api` only** (the only app with tests at this stage). Other apps/packages will be added as tests are written.

### Configuration

| File                        | What it does                                              |
| --------------------------- | --------------------------------------------------------- |
| `apps/api/vitest.config.ts` | Coverage config: `v8` provider, `lcov` + `text` reporters |
| `apps/api/package.json`     | `test:coverage` script: `vitest run --coverage`           |
| `turbo.json`                | `test:coverage` task with `coverage/**` outputs           |
| Root `package.json`         | `test:coverage` script: `turbo run test:coverage`         |

### Coverage Rules

- **Provider:** `v8` (native V8 code coverage — fast, no instrumentation)
- **Reporters:** `text` (console summary) + `lcov` (for SonarCloud)
- **Output:** `apps/api/coverage/lcov.info`
- **Included:** `src/**/*.ts`
- **Excluded:** `*.spec.ts`, `*.module.ts`, `main.ts`

### Running Locally

```bash
pnpm test:coverage
```

### Adding Coverage for a New App

1. Install `@vitest/coverage-v8` as a devDependency in the app
2. Add `coverage` config to the app's `vitest.config.ts` (same pattern as API)
3. Add `test:coverage` script to the app's `package.json`
4. Add the lcov path to `sonar-project.properties` → `sonar.javascript.lcov.reportPaths` (comma-separated)

---

## SonarCloud

### What It Does

SonarCloud performs static analysis on every PR and reports: bugs, vulnerabilities, code smells, duplications, and test coverage. Results appear as a **PR comment** (PR decoration) and on the [SonarCloud dashboard](https://sonarcloud.io).

### Analysis Method

**CI-based** (not Automatic Analysis). The CI workflow runs tests with coverage, generates `lcov.info`, and the SonarCloud scan step uploads everything. CI-based is required to include test coverage in the analysis — Automatic Analysis cannot access coverage reports.

> **Important:** Automatic Analysis must be **disabled** in SonarCloud (Administration → Analysis Method) to avoid duplicate analyses.

### Configuration

| File                       | What it does                                                           |
| -------------------------- | ---------------------------------------------------------------------- |
| `sonar-project.properties` | Project key, organization, sources, exclusions, lcov paths             |
| `.github/workflows/ci.yml` | `SonarSource/sonarqube-scan-action@v6` step (skipped if token missing) |

**Project properties:**

- **Organization:** `tloyan`
- **Project key:** `tloyan_tl_family-hub`
- **Sources:** `apps/api/src`, `apps/web/app`, `apps/web/components`, `apps/web/lib`, `apps/mobile/app`, `apps/mobile/components`, `apps/mobile/lib`, `packages/shared/src`, `packages/db/src`, `packages/tokens/src`
- **Tests:** `apps/api/test`
- **Exclusions:** `node_modules`, `dist`, `.next`, `coverage`, `*.config.*`, `generated`, `prisma/migrations`

### Quality Gate

Uses the default **"Sonar way"** gate, applied to **new code only** (not the entire codebase):

| Metric          | Threshold |
| --------------- | --------- |
| Coverage        | >= 80%    |
| Duplications    | <= 3%     |
| Maintainability | Rating A  |
| Reliability     | Rating A  |
| Security        | Rating A  |

### Secret

`SONAR_TOKEN` must be set as a **repository-level** secret in GitHub (not environment-level — the CI job does not use a GitHub Environment).

The SonarCloud step includes `if: env.SONAR_TOKEN != ''` so CI still passes if the token is not configured.

---

## Deploy Workflow

> **Etat actuel :** Operationnel sur `dev` uniquement. Le workflow se declenche aussi pour `main` mais les secrets et environments de production ne sont pas encore configures (voir `docs/backlog-infra.md`).

### Trigger

Runs after CI succeeds on `main` or `dev` via `workflow_run`.

### Jobs

```
setup (determine environment: dev or production)
→ deploy-api (Railway)
→ deploy-web (Vercel) — depends on deploy-api
→ deploy-mobile (EAS Update) — depends on deploy-api
```

### deploy-api (Railway)

1. Checkout at the exact SHA
2. Install Railway CLI
3. `railway up --detach` — Railway builds from the Dockerfile
4. Wait 30s + health check (`GET /health`, 10 retries × 15s)

### deploy-web (Vercel)

1. Checkout + pnpm + Node.js setup
2. `vercel pull` → `vercel build` → `vercel deploy --prebuilt`
3. Health check on the deployed URL (accepts 200 or 401)

### deploy-mobile (EAS Update)

1. Checkout + pnpm + Node.js setup
2. **Fetch Doppler secrets** (injects `EXPO_PUBLIC_GRAPHQL_URL` and other env vars needed by the Expo build)
3. Install dependencies + build workspace packages (tokens)
4. `eas update --channel <environment>`

### Secrets par job

| Job           | Secrets used                                         | Source             |
| ------------- | ---------------------------------------------------- | ------------------ |
| deploy-api    | `RAILWAY_TOKEN`                                      | GitHub Environment |
| deploy-web    | `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` | GitHub Environment |
| deploy-mobile | `EXPO_TOKEN`, `DOPPLER_TOKEN`                        | GitHub Environment |

---

## Doppler (Secrets Management)

### What It Does

Doppler centralizes application secrets across all environments. Instead of managing env vars separately in Railway, Vercel, and GitHub, secrets are defined once in Doppler and synced automatically.

### Architecture

```
Doppler (source of truth)
├── dev config → Railway dev (native integration, auto-sync)
│                → Vercel preview (native integration, auto-sync)
│                → GitHub Actions deploy-mobile (via DOPPLER_TOKEN + CLI)
├── prd config → Railway production (native integration, auto-sync)
│                → Vercel production (native integration, auto-sync)
│                → GitHub Actions deploy-mobile (via DOPPLER_TOKEN + CLI)
└── dev_tloyan → Local development (doppler run --)
```

### What goes in Doppler (application secrets)

| Variable                  | Environments |
| ------------------------- | ------------ |
| `DATABASE_URL`            | dev, prd     |
| `BETTER_AUTH_SECRET`      | dev, prd     |
| `BETTER_AUTH_URL`         | dev, prd     |
| `GOOGLE_CLIENT_ID`        | dev, prd     |
| `GOOGLE_CLIENT_SECRET`    | dev, prd     |
| `REDIS_URL`               | dev, prd     |
| `NEXT_PUBLIC_GRAPHQL_URL` | dev, prd     |
| `EXPO_PUBLIC_GRAPHQL_URL` | dev, prd     |
| `NODE_ENV`                | dev, prd     |
| `PORT`                    | dev, prd     |

### What stays in GitHub (deployment tokens)

`RAILWAY_TOKEN`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `EXPO_TOKEN`, `API_URL` (var), `SONAR_TOKEN`

These are platform tokens that authenticate the CI/CD runner to the deployment platform. They don't belong in Doppler because they're only used in GitHub Actions, not by the applications.

### Native Integrations

- **Railway:** Doppler → Integrations → Railway. Secrets are auto-synced; Railway redeploys automatically when a secret changes.
- **Vercel:** Doppler → Integrations → Vercel. Secrets are auto-synced to the correct environment (Preview/Production).

### CI Usage

Only `deploy-mobile` uses Doppler in CI (Railway and Vercel sync natively). The step installs the Doppler CLI via `dopplerhq/cli-action@v3`, then fetches secrets into `$GITHUB_ENV`.

### Local Development

```bash
# First time setup
brew install doppler
doppler login
doppler setup  # select project: family-hub, config: dev_tloyan

# Run dev with Doppler-injected secrets (no .env file needed)
pnpm dev:doppler
```

The personal config `dev_tloyan` inherits from `dev` and overrides values for local development (localhost URLs, local DB, etc.).

### CI does NOT use Doppler

The CI workflow uses hardcoded dummy env vars (see Environment Variables table above). This is intentional — CI runs against a local PostgreSQL service container, not real infrastructure.

---

## Rollback — Current Limitations

### No Automated Rollback Mechanism

The current deploy pipeline does **not** include automated rollback. If a deployment breaks production:

| Platform | Manual Rollback Procedure                                                           |
| -------- | ----------------------------------------------------------------------------------- |
| Railway  | Dashboard → Deployments → click on previous healthy deployment → **Redeploy**       |
| Vercel   | Dashboard → Deployments → click on previous deployment → **Promote to Production**  |
| Mobile   | EAS does not support rollback — must push a new `eas update` with the previous code |

### What's Missing

1. **No automatic rollback on health check failure.** If the health check fails after deployment, the workflow exits with an error but leaves the broken deployment live.
2. **No version tracking in deploys.** The deploy workflow does not tag commits or record which SHA is deployed to which environment.
3. **No canary or blue-green strategy.** Deployments are all-or-nothing replacements.

### Planned Improvements

These should be addressed before going to production with real users:

- **Health check failure → automatic rollback** via Railway API (`POST /v2/deployments/{id}/rollback`) and Vercel CLI (`vercel rollback`)
- **Deploy annotations** — tag successful deploys with `deployed/<env>` git tags or GitHub Deployments API
- **Slack/Discord notifications** on deploy success/failure

---

## CodeQL Workflow

### What It Does

CodeQL is GitHub's static analysis engine. It builds a semantic database from the source code, then runs ~300 security queries against it to find vulnerabilities like:

- SQL injection
- Cross-site scripting (XSS)
- Prototype pollution
- Hardcoded secrets
- Insecure cookie configuration
- Command injection

### Trigger

- Push to `main` or `dev`
- Pull request targeting `main` or `dev`
- **Scheduled:** every Monday at 06:00 UTC (catches new vulnerability patterns in existing code)

### Configuration

- **Language:** `javascript-typescript`
- **Query suite:** `security-and-quality` (broader than the default `security` — includes quality-related security bugs)
- **Timeout:** 20 minutes

### Results

Alerts appear in the GitHub repo → **Security** tab → **Code scanning**. Each alert includes the vulnerability type, affected file/line, data flow path, and remediation guidance.

### Permissions

The workflow requests minimal permissions:

- `security-events: write` — publish results to the Security tab
- `contents: read` — read the source code
- `actions: read` — read workflow metadata

---

## Dependabot

### What It Does

Dependabot monitors dependency versions and opens PRs when updates are available. It runs on GitHub's infrastructure (not GitHub Actions minutes).

### Configuration

**npm ecosystem** (weekly, Monday):

- Target branch: `dev`
- Max open PRs: 10
- Commit prefix: `chore(deps)`
- **Minor/patch updates** are grouped to reduce PR noise:
  - `dev-dependencies` — all devDeps
  - `turborepo` — turbo, @turbo/\*
  - `nestjs` — @nestjs/\*
  - `nextjs` — next, @next/\*
  - `expo` — expo, expo-_, @expo/_, react-native
  - `prisma` — prisma, @prisma/\*
  - `linting` — eslint, prettier, @typescript-eslint/\*
- **Major updates** remain individual PRs (breaking changes need careful review)

**GitHub Actions ecosystem** (weekly, Monday):

- Target branch: `dev`
- Commit prefix: `ci`
- Updates actions like `actions/checkout`, `actions/setup-node`, etc.

### Handling Dependabot PRs

1. CI runs automatically on each Dependabot PR
2. If CI passes → safe to merge (squash merge into `dev`)
3. If CI fails → Dependabot may auto-rebase, or close and re-open if the conflict is resolved upstream

---

## Secret Scanning

Not a workflow file — must be enabled manually:

1. GitHub repo → **Settings** → **Code security and analysis**
2. Enable **Secret scanning**
3. Optionally enable **Push protection** (blocks pushes that contain detected secrets)

This scans every commit for accidentally committed tokens, API keys, and credentials (AWS, Stripe, GitHub tokens, etc.).

---

## Maintenance

### Adding a New Package/App

No workflow changes needed. Turborepo auto-discovers packages via `pnpm-workspace.yaml`. As long as the new package defines the standard scripts (`lint`, `typecheck`, `test`, `build`), CI will pick it up.

### Adding a New Service (e.g., Redis)

Add a service container block in `ci.yml` under `services:`, similar to the PostgreSQL block. Update the corresponding env var to point to the real service.

### Updating Node/pnpm Versions

Update in two places:

1. `ci.yml` → `node-version` and pnpm `version`
2. Root `package.json` → `packageManager` field
