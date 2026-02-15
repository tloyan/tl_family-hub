# Story 1.1 : Initialisation Monorepo, CI/CD et Deploiement

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

En tant que developpeur (Thomas),
Je veux un monorepo initialise avec toutes les apps, packages, et l'infrastructure deployee,
Afin de disposer d'une fondation production-ready pour construire les features.

## Acceptance Criteria

### Scenario 1 : Structure du Monorepo

**Given** le projet n'existe pas encore
**When** j'initialise le monorepo avec Turborepo + pnpm
**Then** la structure contient :
- `apps/` avec `api` (NestJS), `web` (Next.js), `mobile` (Expo)
- `packages/` avec `shared`, `db`, `auth`, `ui`, `ui-native`, `tokens`, `api-client`, `config-eslint`, `config-ts`, `config-tailwind`
- Chaque app et package a son propre `package.json` et `tsconfig.json`
- Les fichiers de config racine sont presents : `turbo.json`, `pnpm-workspace.yaml`, `package.json`, `.gitignore`, `.env.example`, `.prettierrc`, `.eslintrc.js`, `commitlint.config.js`

### Scenario 2 : Docker Compose Local

**Given** Docker est installe
**When** je lance `docker compose up`
**Then** PostgreSQL et Redis demarrent localement et sont accessibles depuis les apps

### Scenario 3 : Pipeline CI/CD

**Given** je push sur main
**When** GitHub Actions s'execute
**Then** lint (ESLint) + TypeScript check (`strict: true`, zero `any`) + build reussissent pour toutes les apps et packages

### Scenario 4 : Deploiement Production

**Given** le CI est vert
**When** je deploie
**Then** NestJS est deploye sur Railway (EU-West), Next.js sur Vercel, les deux repondent a un health check (`/health` pour l'API, `/` pour le web)

### Scenario 5 : Configuration Cloudflare

**Given** l'infrastructure est deployee
**When** je verifie Cloudflare
**Then** DNS + CDN + WAF sont configures pour le domaine, TLS 1.3 actif

### Scenario 6 : Secrets et Outils de Developpement

**Given** le monorepo est initialise
**When** je verifie la configuration
**Then** :
- Doppler est configure pour la gestion des secrets (integration GitHub Actions + Railway + Vercel)
- Husky + commitlint sont actifs (pre-commit lint-staged, commit-msg commitlint)
- `.env.example` est present avec les variables necessaires documentees
- SonarCloud est configure pour le quality gate

## Tasks / Subtasks

- [x] **Task 1 : Initialisation Monorepo Turborepo + pnpm** (AC: #1)
  - [x] 1.1 Creer le monorepo : `npx create-turbo@latest family-hub --package-manager pnpm`
  - [x] 1.2 Configurer `pnpm-workspace.yaml` avec `apps/*` et `packages/*`
  - [x] 1.3 Configurer `turbo.json` avec les pipelines `build`, `dev`, `lint`, `typecheck`, `test`
  - [x] 1.4 Ajouter le champ `packageManager` dans le `package.json` racine (pnpm 10.x)
  - [x] 1.5 Creer `.gitignore`, `.prettierrc`, `.env.example` a la racine

- [x] **Task 2 : Creer les 3 applications** (AC: #1)
  - [x] 2.1 `apps/api/` — NestJS avec TypeScript strict, GraphQL code-first (`@nestjs/graphql` + `autoSchemaFile`)
  - [x] 2.2 `apps/web/` — Next.js 16 avec App Router, Tailwind CSS v4, ShadCN UI
  - [x] 2.3 `apps/mobile/` — Expo SDK 54 avec Expo Router, NativeWind v4, React Native Reusables

- [ ] **Task 3 : Creer les 10 packages partages** (AC: #1)
  - [ ] 3.1 `packages/shared/` — Types, constantes, validations Zod, enums partages
  - [ ] 3.2 `packages/db/` — Schema Prisma organise par domaine (`prismaSchemaFolder`), `base.prisma` + migrations + seed.ts
  - [ ] 3.3 `packages/auth/` — Configuration Better Auth partagee (OAuth Google + Magic Link)
  - [ ] 3.4 `packages/ui/` — Setup ShadCN UI (composants web, Radix UI, Lucide Icons)
  - [ ] 3.5 `packages/ui-native/` — Setup React Native Reusables + NativeWind
  - [ ] 3.6 `packages/tokens/` — Design tokens (colors, typography, spacing, moments temporels)
  - [ ] 3.7 `packages/api-client/` — Apollo Client 4 configuration + `graphql-codegen`
  - [x] 3.8 `packages/config-eslint/` — Config ESLint partagee (regle dot-notation fichiers)
  - [x] 3.9 `packages/config-ts/` — Config TypeScript partagee (`strict: true`, zero `any`)
  - [ ] 3.10 `packages/config-tailwind/` — Config Tailwind partagee avec tokens custom

- [ ] **Task 4 : Docker Compose local** (AC: #2)
  - [ ] 4.1 Creer `docker/docker-compose.yml` avec PostgreSQL + Redis
  - [ ] 4.2 Creer `docker/api.Dockerfile` pour build NestJS (Railway)
  - [ ] 4.3 Verifier que `docker compose up` demarre correctement et que les services sont accessibles

- [ ] **Task 5 : CI/CD GitHub Actions** (AC: #3)
  - [ ] 5.1 Creer `.github/workflows/ci.yml` : Push/PR → Lint + TS check + Tests + Build
  - [ ] 5.2 Creer `.github/workflows/deploy-api.yml` : Deploy NestJS → Railway
  - [ ] 5.3 Creer `.github/workflows/deploy-web.yml` : Deploy Next.js → Vercel (auto)
  - [ ] 5.4 Creer `.github/workflows/codeql.yml` : Security scanning
  - [ ] 5.5 Configurer Dependabot + Secret Scanning

- [ ] **Task 6 : Deploiement Infrastructure Cloud** (AC: #4, #5)
  - [ ] 6.1 Configurer Supabase Pro (EU Frankfurt) — PostgreSQL + Storage
  - [ ] 6.2 Configurer Upstash Redis Fixed 250MB (EU Frankfurt)
  - [ ] 6.3 Deployer NestJS sur Railway Pro (EU-West) avec health check `/health`
  - [ ] 6.4 Deployer Next.js sur Vercel Pro (Edge global)
  - [ ] 6.5 Configurer Cloudflare Free : DNS + CDN + WAF + TLS 1.3

- [ ] **Task 7 : Secrets et Outils Dev** (AC: #6)
  - [ ] 7.1 Configurer Doppler pour secrets management (integration GitHub Actions + Railway + Vercel)
  - [ ] 7.2 Configurer Husky : pre-commit (lint-staged) + commit-msg (commitlint)
  - [ ] 7.3 Creer `commitlint.config.js` avec conventional commits
  - [ ] 7.4 Configurer SonarCloud pour quality gate + couverture
  - [ ] 7.5 Documenter `.env.example` avec toutes les variables necessaires

- [ ] **Task 8 : Validation finale** (AC: #1-6)
  - [ ] 8.1 `pnpm install` sans erreur
  - [ ] 8.2 `pnpm lint` passe sur toutes les apps/packages
  - [ ] 8.3 `pnpm typecheck` passe en mode strict
  - [ ] 8.4 `pnpm build` compile toutes les apps
  - [ ] 8.5 `docker compose up` fonctionne
  - [ ] 8.6 Health checks repondent en production (Railway + Vercel)

## Dev Notes

### Stack Technique et Versions (Fevrier 2026)

| Technologie | Version | Notes Critiques |
|---|---|---|
| **Turborepo** | 2.8.x | Devtools + composable configs stables |
| **pnpm** | 10.x | Drop Node 16. Ajouter `packageManager` dans package.json racine |
| **NestJS** | 11.x | **BREAKING:** Express v5 par defaut. Path matching modifie (`/users/*` → `/users/*path`). CacheModule utilise Keyv |
| **Next.js** | 16.x | **BREAKING:** APIs async obligatoires (cookies, headers, params). AMP supprime. Turbopack FS caching stable |
| **Expo SDK** | 54 (stable) | SDK 55 en beta. Utiliser SDK 54 pour la production |
| **Prisma** | 7.x | **BREAKING:** Reecrit en TypeScript (plus de Rust). ESM-only. Config dans `prisma.config.ts`. Driver adapters requis |
| **Better Auth** | 1.4.x | Stable. OAuth Google + Magic Link/OTP |
| **Apollo Client** | 4.x | **BREAKING:** Imports React dans `@apollo/client/react`. RxJS en peer dep. Codemod dispo |
| **Vitest** | 4.x | Requiert Vite 7. Browser Mode stable |
| **Playwright** | 1.58.x | Stable, pas de breaking changes |
| **ShadCN UI** | CLI 3.8.x | `npx shadcn@latest add`. Package `radix-ui` unifie |
| **Tailwind CSS** | 4.x | **BREAKING:** Plus de `tailwind.config.js`. Config via CSS `@theme`. Oxide engine (5x plus rapide) |
| **NativeWind** | 4.2.x | **ATTENTION:** v4.x requiert Tailwind CSS **v3.4.x** (PAS v4). Config Tailwind separee pour mobile |
| **TypeScript** | 5.9.x | Stable. TS 7 (Go) en preview, pas encore pret |
| **Docker Compose** | v5.x | Identique a v2 en CLI, SDK Go ajoute |
| **GraphQL Codegen** | CLI 6.x | `@graphql-codegen/client-preset` pour typed document nodes |

### Alertes Compatibilite Critiques

1. **NativeWind v4 + Tailwind CSS** : NativeWind v4.x necessite Tailwind CSS **v3.4.x**, PAS v4. Le web utilise Tailwind v4, le mobile utilise Tailwind v3.4 via `packages/config-tailwind`. Maintenir deux configs Tailwind distinctes.

2. **Prisma v7 ESM-only** : Plus de `require()`. Toute la config migre vers `prisma.config.ts`. Les driver adapters sont obligatoires pour tous les DB.

3. **NestJS 11 + Express v5** : Le path matching a change. Verifier les routes avec wildcards.

4. **Apollo Client 4 + React** : Les imports React sont dans `@apollo/client/react` (plus dans `@apollo/client`). Utiliser le codemod : `npx @apollo/client-codemod-migrate-3-to-4`.

### Conventions de Nommage (OBLIGATOIRES)

**Fichiers TypeScript :** `kebab-case.role.ts(x)` (dot-notation)
- Exemples : `ritual.service.ts`, `ritual.card.tsx`, `household.schema.ts`
- Suffixes de role : `.module`, `.resolver`, `.service`, `.repository`, `.model`, `.dto`, `.guard`, `.decorator`, `.filter`, `.event`, `.command`, `.handler`, `.query`, `.card`, `.form`, `.hooks`, `.schema`, `.store`, `.spec`

**Classes :** `PascalCase` — `RitualService`, `HouseholdMemberResolver`
**Fonctions/methodes :** `camelCase` — `createRitual()`, `getHouseholdMembers()`
**Variables :** `camelCase` — `ritualStatus`, `householdId`
**Constantes :** `UPPER_SNAKE_CASE` — `MAX_HOUSEHOLD_MEMBERS`
**Interfaces/Types :** `PascalCase` sans prefixe `I` — `RitualStatus`, `HouseholdMember`
**React Components :** `PascalCase` export, dot-notation fichier — `ritual.card.tsx` → `export function RitualCard()`
**Zustand stores :** `domain.store.ts` → `useDomainStore`
**Zod schemas :** `domain.schema.ts`

**Prisma → PostgreSQL :**
- Models : `PascalCase` singulier — `HouseholdMember`
- Tables : `snake_case` pluriel via `@@map()` — `household_members`
- Colonnes : `snake_case` via `@map()` — `created_at`
- IDs : UUID v7 pour tous les identifiants

**GraphQL (conventions identiques en code-first) :**
- Types : `PascalCase` singulier — `Ritual`
- Queries : `camelCase` — `ritual`, `rituals`
- Mutations : `camelCase` verbe+nom — `createRitual`
- Subscriptions : `camelCase` on+nom — `onRitualUpdated`
- Inputs : `PascalCase` suffixe Input — `CreateRitualInput`
- Enums : `UPPER_SNAKE_CASE` — `RITUAL_STATUS`

### Patterns Architecturaux a Respecter

**Architecture Modulaire NestJS :**
- 8 modules : `household`, `member`, `ritual`, `ai`, `auth`, `notification`, `compliance`, `admin`
- Chaque module avec : `module.ts`, `resolver.ts`, `service.ts`, `repository.ts`, `__tests__/`
- Communication inter-modules uniquement via injection du service OU events CQRS
- JAMAIS d'import direct du repository d'un autre module

**GraphQL Code-First :**
- Decorateurs TypeScript (`@ObjectType`, `@Field`, `@Query`) = source de verite
- NestJS auto-genere `schema.gql` au demarrage
- `graphql-codegen` genere les hooks Apollo Client (frontend uniquement)

**CQRS Progressif :**
- MVP : `@nestjs/cqrs` EventBus in-process
- Rituels et Activity implementent CQRS en premier
- Autres modules utilisent des services classiques
- Chaque event CQRS inclut : `householdId` + `triggeredBy` + `occurredAt`

**Error Handling :**
- Custom exceptions NestJS (JAMAIS `throw new Error()` brut)
- `ExceptionFilter` global → format `{ message, extensions: { code, statusCode } }`
- Codes d'erreur : `UPPER_SNAKE_CASE` avec prefixe domaine — `RITUAL_NOT_FOUND`

**Tests :**
- Co-localises dans `__tests__/` avec suffixe `.spec.ts(x)`
- Backend unit : `modules/domain/__tests__/domain.service.spec.ts`
- Frontend unit : `features/domain/__tests__/domain.card.spec.tsx`
- E2E web : `apps/web/e2e/`
- E2E mobile : `apps/mobile/e2e/`
- API integration : `apps/api/test/`

**Logging :**
- Format JSON structure via `pino`
- Niveaux : `error` (crash), `warn` (anormal gere), `info` (evenement metier), `debug` (detail technique)

### Securite Infrastructure

- **TLS 1.3** via Cloudflare reverse proxy devant Railway
- **AES-256** encryption at rest via Supabase natif
- **Doppler** pour tous les secrets (JAMAIS de secrets en dur ou dans `.env` committe)
- **Prisma Client Extension** avec `householdId` auto-injecte pour isolation foyer (a implementer dans Story 1.3)
- **Rate limiting** via `@nestjs/throttler` (a configurer dans Story 1.2)

### NFRs Impactant cette Story

| NFR | Critere | Impact Story 1.1 |
|---|---|---|
| NFR7 | TLS 1.3 toutes connexions | Cloudflare + HTTPS partout |
| NFR14 | 5 a 5000 foyers sans changement d'archi | Architecture modulaire, scaling vertical → horizontal |
| NFR27 | TypeScript strict E2E, zero `any` | `strict: true` dans tous les tsconfig, CI check |
| NFR29 | CI/CD valide build+tests+lint avant deploy | GitHub Actions pipeline obligatoire |
| NFR17 | Infra < 0.05 EUR/foyer/mois | Choix Supabase Pro + Railway Pro + Vercel Pro + Cloudflare Free |
| NFR20 | Recovery auto < 5min | Health checks + auto-restart Railway |

### Design Tokens a Initialiser (packages/tokens)

**Couleurs Neutres :**
- `--bg-primary`: `#FAFAFA` | `--bg-secondary`: `#F5F5F5` | `--bg-elevated`: `#FFFFFF`
- `--text-primary`: `#1A1A1A` | `--text-secondary`: `#6B7280` | `--text-muted`: `#9CA3AF`
- `--border-default`: `#E5E7EB` | `--border-subtle`: `#F3F4F6`

**Couleurs Membres :**
- Membre 1: `#3B82F6` (Bleu) | Membre 2: `#8B5CF6` (Violet) | Membre 3: `#F59E0B` (Ambre)
- Membre 4: `#10B981` (Emeraude) | Membre 5: `#EF4444` (Rouge) | Membre 6+: `#6366F1` (Indigo)

**Couleurs Semantiques :**
- `--success`: `#10B981` | `--warning`: `#F59E0B` | `--error`: `#EF4444` | `--info`: `#3B82F6`

**Theme Temporel :**
- Matin (6h-12h) : fond `#FFFBF5`, tons dores
- Midi (12h-17h) : fond `#FAFAFA`, palette par defaut
- Soir (17h-21h) : fond `#FFF8F0`, tons chauds attenues
- Nuit (21h-6h) : fond `#0F172A`, dark mode, couleurs desaturees

**Typographie : Inter (variable font)**

| Token | Taille | Poids | Usage |
|---|---|---|---|
| `--text-xs` | 12px | 400 | Badges, metadata |
| `--text-sm` | 14px | 400 | Labels, texte secondaire |
| `--text-base` | 16px | 400 | Corps de texte |
| `--text-lg` | 18px | 500 | Sous-titres |
| `--text-xl` | 20px | 600 | Titres de sections |
| `--text-2xl` | 24px | 600 | Titres principaux |

**Spacing (base 4px) :**
- `--space-1`: 4px | `--space-2`: 8px | `--space-3`: 12px | `--space-4`: 16px
- `--space-5`: 20px | `--space-6`: 24px | `--space-8`: 32px | `--space-10`: 40px

**Arrondis :**
- `--radius-sm`: 4px | `--radius-md`: 8px | `--radius-lg`: 12px | `--radius-xl`: 16px | `--radius-full`: 9999px

### Accessibilite (des le depart)

- WCAG 2.1 AA : contraste minimum 4.5:1 texte, 3:1 graphiques
- Cibles tactiles minimum 44x44px
- HTML semantique (`<nav>`, `<main>`, `<button>`, pas de `<div onClick>`)
- ARIA : `role`, `aria-label`, `aria-checked` sur composants custom
- Support `prefers-reduced-motion`
- Dark mode avec contraste maintenu

### i18n (infrastructure posee des le depart)

- `i18next` + `react-i18next` + `expo-localization`
- MVP en francais uniquement, mais infrastructure multi-langue prete
- Fichiers de traduction dans chaque app

### Project Structure Notes

```
family-hub/                          # Racine monorepo
├── apps/
│   ├── api/                         # NestJS 11 — Backend GraphQL
│   │   ├── src/
│   │   │   ├── modules/             # Modules NestJS par domaine
│   │   │   │   ├── household/
│   │   │   │   │   ├── household.module.ts
│   │   │   │   │   ├── household.resolver.ts
│   │   │   │   │   ├── household.service.ts
│   │   │   │   │   ├── household.repository.ts
│   │   │   │   │   └── __tests__/
│   │   │   │   ├── member/
│   │   │   │   ├── ritual/
│   │   │   │   ├── ai/
│   │   │   │   ├── auth/
│   │   │   │   ├── notification/
│   │   │   │   ├── compliance/
│   │   │   │   └── admin/
│   │   │   ├── common/
│   │   │   │   ├── guards/
│   │   │   │   ├── decorators/
│   │   │   │   └── filters/
│   │   │   ├── schema.gql            # Auto-generated by NestJS code-first (do not edit)
│   │   │   └── main.ts
│   │   ├── test/                     # Integration API (NestJS convention)
│   │   ├── codegen.ts
│   │   ├── nest-cli.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/                          # Next.js 16 — Frontend Web
│   │   ├── app/
│   │   │   ├── (public)/             # Pages publiques (landing, pricing, legal)
│   │   │   ├── (auth)/               # Pages authentification
│   │   │   └── (app)/                # App authentifiee
│   │   ├── features/                 # Logique metier par domaine
│   │   ├── components/               # Composants UI generiques
│   │   ├── lib/                      # Utils, config, providers
│   │   ├── e2e/                      # Tests E2E Playwright
│   │   ├── codegen.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── mobile/                       # Expo SDK 54 — React Native
│       ├── app/
│       │   ├── (auth)/               # Routes auth
│       │   ├── (tabs)/               # Navigation tabs
│       │   └── (modals)/             # Routes modales
│       ├── features/                 # Logique metier par domaine
│       ├── components/               # Composants UI
│       ├── lib/                      # Utils, offline queue, push notifs
│       ├── e2e/                      # Tests E2E Maestro (YAML)
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── shared/                       # Types, constantes, validations Zod, enums
│   │   └── src/
│   ├── db/                           # Prisma 7 schema + migrations
│   │   ├── prisma/
│   │   │   ├── schema/
│   │   │   │   ├── base.prisma       # Datasource + generator
│   │   │   │   ├── household.prisma
│   │   │   │   ├── member.prisma
│   │   │   │   ├── ritual.prisma
│   │   │   │   ├── notification.prisma
│   │   │   │   ├── auth.prisma
│   │   │   │   └── compliance.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   └── prisma.config.ts          # Prisma 7 config (ESM)
│   ├── auth/                         # Better Auth 1.4 config partagee
│   ├── ui/                           # ShadCN UI composants web
│   ├── ui-native/                    # React Native Reusables + NativeWind
│   ├── tokens/                       # Design tokens partages
│   │   └── src/
│   │       ├── colors.ts
│   │       ├── typography.ts
│   │       ├── spacing.ts
│   │       ├── moments.ts            # Theming temporel
│   │       └── index.ts
│   ├── api-client/                   # Apollo Client 4 + graphql-codegen
│   ├── config-eslint/                # Config ESLint partagee
│   ├── config-ts/                    # Config TypeScript partagee (strict: true)
│   └── config-tailwind/              # Config Tailwind partagee
│
├── docker/
│   ├── docker-compose.yml            # Dev local : PostgreSQL + Redis
│   └── api.Dockerfile                # Build NestJS pour Railway
│
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Lint + TS check + Tests + Build
│       ├── deploy-api.yml            # Deploy NestJS → Railway
│       ├── deploy-web.yml            # Deploy Next.js → Vercel
│       └── codeql.yml                # Security scanning
│
├── .husky/
│   ├── pre-commit                    # lint-staged
│   └── commit-msg                    # commitlint
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── .gitignore
├── .env.example
├── .prettierrc
├── .eslintrc.js
└── commitlint.config.js
```

**Dependances entre modules NestJS (respecter strictement) :**
- `household` → aucune dependance
- `member` → household
- `ritual` → member, household
- `notification` → ritual, member, household
- `ai` → ritual, member, household (read-only)
- `compliance` → tous (acces pour export/suppression)
- `admin` → tous (read-only metriques)
- `auth` → member, household

**Regle stricte :** Un module ne peut JAMAIS importer le repository d'un autre module. Communication inter-modules via :
1. Injection du **service** de l'autre module (queries synchrones)
2. **Events CQRS** (side effects asynchrones)

**Flux de donnees :**
```
User Action → Apollo Client (optimistic UI) → GraphQL → NestJS Resolver
  → Guard (RBAC + household isolation) → Service → Command (CQRS)
  → Handler → Prisma persist → Event emit → Response rapide au client
  → Event Handler (async) : Notification + Read model update + Subscription broadcast
```

### References

- [Source: _bmad-output/planning-artifacts/architecture.md] — Stack technique, structure monorepo, conventions, patterns
- [Source: _bmad-output/planning-artifacts/epics.md#Epic-1] — Epic 1 complet, Story 1.1 BDD
- [Source: _bmad-output/planning-artifacts/prd.md] — Exigences fonctionnelles/non-fonctionnelles, conformite RGPD
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md] — Design tokens, composants, accessibilite
- [Source: _bmad-output/implementation-artifacts/sprint-status.yaml] — Suivi sprint

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

### File List
