# CI & Security Pipeline

## Overview

This monorepo uses three GitHub-managed automation systems:

| System         | File                           | Purpose                                 |
| -------------- | ------------------------------ | --------------------------------------- |
| **CI**         | `.github/workflows/ci.yml`     | Validates code quality on every push/PR |
| **CodeQL**     | `.github/workflows/codeql.yml` | Static security analysis                |
| **Dependabot** | `.github/dependabot.yml`       | Automated dependency updates            |

All workflows trigger on branches `main` and `dev`. Dependabot targets `dev` as its base branch.

---

## CI Workflow

### Trigger

- Push to `main` or `dev`
- Pull request targeting `main` or `dev`

### Pipeline

```
checkout → pnpm 10.27.0 → Node 22 (with pnpm cache)
→ cache .turbo → pnpm install --frozen-lockfile
→ format:check → lint → typecheck → test → build
```

Steps run sequentially from fastest to slowest (fail-fast strategy). Turborepo handles internal parallelization of monorepo tasks.

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
