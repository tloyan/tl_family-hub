# Family Hub — Guide Developpeur

Guide d'onboarding pour un nouveau developpeur. Ce document explique ce qu'est le projet, comment il est structure, et comment le lancer en local.

---

## C'est quoi Family Hub ?

Family Hub est un SaaS FamTech pour l'organisation familiale. C'est un monorepo qui contient 3 applications et plusieurs packages partages :

```
┌─────────────────────────────────────────────────────────────────┐
│                        Utilisateur                              │
│                     ┌──────┐  ┌──────┐                          │
│                     │ Web  │  │Mobile│                          │
│                     └──┬───┘  └──┬───┘                          │
│                        │         │                              │
│                        ▼         ▼                              │
│              ┌────────────────────────┐                         │
│              │    API GraphQL         │                         │
│              │    (NestJS)            │                         │
│              └────┬──────────┬───────┘                         │
│                   │          │                                  │
│              ┌────▼───┐ ┌───▼────┐                             │
│              │PostgreSQL│ │ Redis  │                             │
│              └─────────┘ └────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

**Le Web** (Next.js) et le **Mobile** (Expo/React Native) sont les deux interfaces utilisateur. Ils ne se parlent jamais directement entre eux. Ils communiquent uniquement avec l'**API** via des requetes GraphQL.

L'**API** (NestJS) est le cerveau du projet. Elle recoit les requetes, applique la logique metier, et lit/ecrit dans **PostgreSQL** (base de donnees principale) et **Redis** (cache, sessions).

---

## Structure du projet

```
family-hub/
├── apps/
│   ├── api/          ← API GraphQL (NestJS 11, TypeScript)
│   ├── web/          ← Site web (Next.js 16, App Router)
│   └── mobile/       ← App mobile (Expo SDK 54, React Native)
│
├── packages/
│   ├── shared/       ← Types, constantes, validations partages entre apps
│   ├── db/           ← Schema Prisma, migrations, client de base de donnees
│   ├── tokens/       ← Design tokens (couleurs, typo, spacing → CSS/TS)
│   ├── config-eslint/ ← Configuration ESLint partagee
│   └── config-ts/    ← Configuration TypeScript partagee
│
├── docker/
│   ├── docker-compose.yml  ← PostgreSQL + Redis pour le dev local
│   └── api.Dockerfile      ← Image Docker de l'API pour la production
│
├── .github/
│   └── workflows/
│       ├── ci.yml          ← Pipeline de validation (lint, tests, build)
│       ├── deploy.yml      ← Pipeline de deploiement (Railway, Vercel, EAS)
│       └── codeql.yml      ← Analyse de securite statique
│
├── turbo.json        ← Configuration Turborepo (pipelines de build)
├── pnpm-workspace.yaml ← Declaration des packages du monorepo
├── package.json      ← Scripts racine, dependances globales
├── .env.example      ← Template des variables d'environnement
└── sonar-project.properties ← Configuration SonarCloud
```

### Pourquoi un monorepo ?

Un monorepo signifie que tout le code du projet (API, Web, Mobile, packages partages) vit dans un seul depot Git. L'alternative serait d'avoir un repo par app.

**Avantages concrets :**

- Quand tu modifies un type dans `packages/shared`, les 3 apps le voient immediatement — pas besoin de publier un package npm et d'attendre que chaque app le mette a jour.
- Un seul `pnpm install` installe tout. Un seul `pnpm build` build tout dans le bon ordre.
- Le CI valide tout d'un coup : si ta modification de l'API casse le build du web, tu le sais avant de merger.

**Turborepo** gere l'orchestration : il comprend les dependances entre packages et build/lint/test dans le bon ordre. Il cache aussi les resultats — si un package n'a pas change, il ne le rebuild pas.

**pnpm** est le gestionnaire de paquets. Il est plus rapide et plus strict que npm/yarn. Le `pnpm-workspace.yaml` declare quels dossiers sont des packages du monorepo (`apps/*` et `packages/*`).

### Comment les packages dependent les uns des autres

```
apps/api ──→ packages/db ──→ (Prisma, PostgreSQL)
    │
    └──→ packages/shared (types, constantes)

apps/web ──→ packages/shared
    │
    └──→ packages/tokens (design tokens)

apps/mobile ──→ packages/shared
    │
    └──→ packages/tokens

packages/tokens → (aucune dependance interne)
packages/config-eslint → (aucune dependance interne)
packages/config-ts → (aucune dependance interne)
```

Quand tu lances `pnpm build`, Turborepo lit ce graphe et build d'abord les packages sans dependances (`shared`, `tokens`, `config-*`), puis `db` (qui depend de rien d'interne mais a besoin de `prisma generate`), puis les apps.

---

## Installer et lancer le projet

### Prerequis

| Outil   | Version | Installation                                                  | Pourquoi                              |
| ------- | ------- | ------------------------------------------------------------- | ------------------------------------- |
| Node.js | 22.x    | `brew install node@22`                                        | Runtime JavaScript/TypeScript         |
| pnpm    | 10.27.0 | `corepack enable && corepack prepare pnpm@10.27.0 --activate` | Gestionnaire de paquets du monorepo   |
| Docker  | latest  | https://docker.com/get-started                                | Pour PostgreSQL et Redis en local     |
| Doppler | latest  | `brew install doppler`                                        | Pour injecter les secrets (optionnel) |

### Etape par etape

**1. Cloner et installer les dependances**

```bash
git clone git@github.com:tloyan/tl_family-hub.git
cd tl_family-hub
pnpm install
```

`pnpm install` lit le `pnpm-lock.yaml` (le lockfile qui fige les versions exactes de chaque dependance) et installe tout dans `node_modules/`. Ca prend du temps la premiere fois (~30s-1min) car il y a beaucoup de dependances (NestJS, Next.js, Expo, Prisma, etc.).

**2. Demarrer les services Docker**

```bash
pnpm docker:up
```

Ca lance Docker Compose qui demarre 2 containers :

- **PostgreSQL** sur `localhost:5432` — la base de donnees
- **Redis** sur `localhost:6379` — le cache

L'API et le Web ne tournent PAS dans Docker en dev. Ils tournent nativement sur ta machine pour avoir le hot-reload instantane (quand tu modifies un fichier, l'app se recharge automatiquement).

**3. Configurer les variables d'environnement**

**Option A — Avec Doppler (recommande) :**

```bash
doppler login
doppler setup    # selectionner project: family-hub, config: dev_tloyan
```

Doppler injectera les variables automatiquement au lancement.

**Option B — Sans Doppler :**

```bash
cp .env.example .env
# Editer .env avec tes valeurs locales
```

**4. Initialiser la base de donnees**

```bash
pnpm db:generate    # Genere le client Prisma (types TypeScript pour la DB)
pnpm db:push        # Applique le schema sur la DB locale
```

**5. Lancer le projet**

```bash
# Avec Doppler :
pnpm dev:doppler

# Sans Doppler (utilise le fichier .env) :
pnpm dev
```

Ca lance les 3 apps en parallele :

- API → http://localhost:4000 (+ GraphQL Playground sur http://localhost:4000/graphql)
- Web → http://localhost:3000
- Mobile → Metro bundler (scanner le QR code avec Expo Go)

**6. Verifier que tout tourne**

```bash
# L'API repond ?
curl http://localhost:4000/health
# Attendu : {"status":"ok","info":{"database":{"status":"up"}}}
```

---

## Les scripts disponibles

Tous les scripts se lancent depuis la racine du projet avec `pnpm <script>`.

### Developpement

| Script        | Commande                       | Ce qu'il fait                                |
| ------------- | ------------------------------ | -------------------------------------------- |
| `dev`         | `turbo run dev`                | Lance les 3 apps en mode developpement       |
| `dev:doppler` | `doppler run -- turbo run dev` | Idem mais injecte les secrets depuis Doppler |
| `build`       | `turbo run build`              | Compile toutes les apps pour la production   |

### Qualite de code

| Script          | Commande                  | Ce qu'il fait                                      |
| --------------- | ------------------------- | -------------------------------------------------- |
| `lint`          | `turbo run lint`          | Verifie le code avec ESLint (erreurs, style)       |
| `typecheck`     | `turbo run typecheck`     | Verifie les types TypeScript (sans compiler)       |
| `format`        | `prettier --write ...`    | Reformate tous les fichiers automatiquement        |
| `format:check`  | `prettier --check ...`    | Verifie le formatage sans modifier (utilise en CI) |
| `test`          | `turbo run test`          | Lance les tests unitaires et d'integration         |
| `test:coverage` | `turbo run test:coverage` | Lance les tests + genere un rapport de couverture  |

### Base de donnees

| Script           | Commande             | Ce qu'il fait                                |
| ---------------- | -------------------- | -------------------------------------------- |
| `db:generate`    | `prisma generate`    | Genere le client TypeScript depuis le schema |
| `db:migrate:dev` | `prisma migrate dev` | Cree et applique une migration               |
| `db:push`        | `prisma db push`     | Pousse le schema directement (dev seulement) |
| `db:seed`        | `prisma db seed`     | Insere des donnees de test                   |
| `db:studio`      | `prisma studio`      | Interface web pour voir/editer la DB         |

### Docker

| Script         | Commande                     | Ce qu'il fait                                  |
| -------------- | ---------------------------- | ---------------------------------------------- |
| `docker:up`    | `docker compose ... up -d`   | Demarre PostgreSQL + Redis en arriere-plan     |
| `docker:down`  | `docker compose ... down`    | Arrete les containers (donnees conservees)     |
| `docker:reset` | `docker compose ... down -v` | Arrete + supprime les donnees (repart de zero) |
