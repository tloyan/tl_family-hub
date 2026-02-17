# Docker Infrastructure

Infrastructure Docker du projet : Docker Compose pour le developpement local et Dockerfile multi-stage pour le deploiement production sur Railway.

## Architecture

```
Developpement local
───────────────────────────────────────────
│           Machine locale (natif)        │
│                                         │
│  NestJS API (:4000)   Next.js (:3000)   │
│       │         │                       │
│       ▼         ▼                       │
│  ┌──────────┐  ┌───────┐               │
│  │ PostgreSQL│  │ Redis │    Docker     │
│  │  :5432   │  │ :6379 │               │
│  └──────────┘  └───────┘               │
───────────────────────────────────────────

Production (Railway)
───────────────────────────────────────────
│  Container Docker                       │
│  ┌────────────────────┐                 │
│  │ node dist/main     │  Image API     │
│  │ user: nestjs (1001)│                 │
│  └────────┬───────────┘                 │
│           │                             │
│     ▼           ▼                       │
│  PostgreSQL   Redis      Services       │
│  (Railway)    (Railway)  manages        │
───────────────────────────────────────────
```

**En local**, l'API tourne nativement sur la machine pour le hot-reload instantane (`nest start --watch`). Seules les dependances d'infrastructure (PostgreSQL, Redis) tournent dans des containers Docker. Containeriser l'API en dev ajouterait de la latence (volumes montes, rebuild de container) sans benefice.

**En production**, l'API est packagee dans une image Docker optimisee deployee sur Railway. Les services manages (PostgreSQL, Redis) sont provisionnes par Railway.

## Docker Compose — Services locaux

**Fichier** : `docker/docker-compose.yml`

### PostgreSQL 17

```yaml
postgres:
  image: postgres:17-alpine
  container_name: family-hub-postgres
  ports:
    - '5432:5432'
  environment:
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
    POSTGRES_DB: family_hub
  volumes:
    - postgres_data:/var/lib/postgresql/data
  healthcheck:
    test: ['CMD-SHELL', 'pg_isready -U postgres -d family_hub']
    interval: 10s
    timeout: 5s
    retries: 5
    start_period: 10s
```

- **Alpine** (`postgres:17-alpine`) — image minimale (~80 MB vs ~400 MB pour la version complete). Suffisant pour le dev, pas de modules supplementaires necessaires.
- **Credentials** — `postgres/postgres/family_hub` correspondent exactement au `DATABASE_URL` de `.env.example`. Un nouveau dev n'a rien a configurer.
- **Named volume** (`postgres_data`) — persiste les donnees entre `docker compose down` et `up`. Sans volume nomme, chaque arret de container efface la base.
- **Healthcheck** (`pg_isready`) — permet a Docker de distinguer "le container tourne" de "PostgreSQL accepte des connexions". Le `start_period: 10s` laisse le temps a PostgreSQL de s'initialiser (creation de la DB, chargement en memoire) avant de commencer les verifications.

### Redis 7.4

```yaml
redis:
  image: redis:7.4-alpine
  container_name: family-hub-redis
  ports:
    - '6379:6379'
  volumes:
    - redis_data:/data
  healthcheck:
    test: ['CMD', 'redis-cli', 'ping']
    interval: 10s
    timeout: 5s
    retries: 5
    start_period: 5s
```

- Meme logique Alpine pour la taille.
- `redis-cli ping` comme healthcheck — Redis repond `PONG` quand il est operationnel.
- Volume `redis_data` pour la persistance du cache entre restarts.
- `start_period: 5s` plus court que PostgreSQL car Redis demarre quasi instantanement.

### Nom du projet

```yaml
name: family-hub
```

Definit le nom du projet Docker Compose. Sans ca, Docker utiliserait le nom du dossier parent (`docker`), ce qui donnerait des noms de containers comme `docker-postgres-1` au lieu de `family-hub-postgres`.

## Dockerfile — Build de production

**Fichier** : `docker/api.Dockerfile`

Dockerfile multi-stage en 4 etapes. Chaque etape produit une image intermediaire dont seuls les artefacts necessaires sont copies dans la suivante. L'image finale ne contient ni les sources TypeScript, ni les outils de build, ni les devDependencies.

### Stage 1 — base

```dockerfile
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate
RUN apk add --no-cache wget
```

Image de reference reutilisee par les stages pruner et builder.

- **`PNPM_HOME="/pnpm"`** — Alpine ne fournit pas de repertoire global pour pnpm. Sans cette variable, `pnpm add -g` echoue avec `ERR_PNPM_NO_GLOBAL_BIN_DIR`.
- **`corepack prepare pnpm@10.27.0`** — verrouille la meme version de pnpm que dans `package.json` (`"packageManager": "pnpm@10.27.0"`).
- **`wget`** — installe ici car reutilise dans le stage runner pour le healthcheck. `wget` est plus leger que `curl` et n'est pas inclus par defaut dans Alpine.

### Stage 2 — pruner

```dockerfile
FROM base AS pruner
WORKDIR /app
RUN pnpm add -g turbo@^2
COPY . .
RUN turbo prune @family-hub/api --docker
```

**Etape la plus importante pour l'optimisation.** `turbo prune --docker` analyse le graphe de dependances du monorepo et extrait uniquement les packages necessaires pour builder `@family-hub/api`. Resultat pour ce projet :

```
@family-hub/api
├── @family-hub/db          (dependance directe)
├── @family-hub/shared      (dependance directe)
├── @family-hub/config-eslint (devDependency)
└── @family-hub/config-ts     (devDependency)
```

Les packages `web`, `mobile`, `tokens` et tout ce qui n'est pas dans l'arbre de dependances de l'API sont exclus du contexte Docker.

Le flag `--docker` produit deux dossiers :

| Dossier     | Contenu                                     | Role                        |
| ----------- | ------------------------------------------- | --------------------------- |
| `out/json/` | `package.json` de chaque package + lockfile | Layer cache des dependances |
| `out/full/` | Code source complet des packages extraits   | Build                       |

Cette separation est la cle du **Docker layer caching** : tant que les `package.json` ne changent pas, Docker reutilise le layer `pnpm install` meme si le code source change. Sur un projet actif, ca transforme un build de ~30s en ~5s pour les changements de code.

### Stage 3 — builder

```dockerfile
FROM base AS builder
WORKDIR /app

COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
    pnpm turbo run build --filter=@family-hub/api
RUN CI=true pnpm prune --prod --no-optional --ignore-scripts
```

L'ordre des operations est intentionnel :

1. **Copier les `package.json` d'abord, installer les dependances** — Ce layer Docker est cache tant que les `package.json` et le lockfile ne changent pas. Modifier du code source ne l'invalide pas.
2. **Copier le source et builder** — `turbo run build` respecte le graphe de dependances : `@family-hub/shared` → `@family-hub/db` → `@family-hub/api`.
3. **Supprimer les devDependencies** — `pnpm prune --prod` retire eslint, typescript, vitest, etc. Seules les dependances de production restent.

**`DATABASE_URL` dummy** — `prisma generate` (dans le script `build` de `@family-hub/db`) ne se connecte jamais a la base de donnees. Il lit les fichiers `.prisma` et genere du code TypeScript (types, query builder). Mais `prisma.config.ts` appelle `env("DATABASE_URL")` au chargement de la configuration, ce qui leve une erreur si la variable n'existe pas. La valeur dummy satisfait ce check sans jamais etre utilisee pour une connexion.

**Flags de `pnpm prune`** :

- `CI=true` — pnpm refuse de supprimer `node_modules` en environnement non-interactif (pas de TTY dans Docker) sans cette variable.
- `--ignore-scripts` — empeche le script `prepare` du `package.json` racine (qui lance `husky`) de s'executer. Husky est une devDependency qui vient d'etre supprimee par le prune ; sans `--ignore-scripts`, le script echoue avec `sh: husky: not found`.
- `--no-optional` — exclut les dependances optionnelles (binaires natifs non necessaires en production Alpine).

### Stage 4 — runner

```dockerfile
FROM node:22-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nestjs && \
    adduser --system --uid 1001 nestjs
```

**Repart d'une image Alpine vierge.** Rien des stages precedents n'est present sauf ce qui est explicitement copie.

**Fichiers copies** :

| Source                                 | Destination                                                               | Raison                                                        |
| -------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `node_modules` (root, api, db)         | `./node_modules`, `./apps/api/node_modules`, `./packages/db/node_modules` | Dependances de production                                     |
| `apps/api/dist`                        | `./apps/api/dist`                                                         | Code compile de l'API                                         |
| `packages/db/dist`                     | `./packages/db/dist`                                                      | Client Prisma genere                                          |
| `packages/db/prisma`                   | `./packages/db/prisma`                                                    | Fichiers de migration pour `prisma migrate deploy` au runtime |
| `packages/shared/dist`                 | `./packages/shared/dist`                                                  | Types et utilitaires partages                                 |
| `package.json` + `pnpm-workspace.yaml` | racine                                                                    | Resolution des imports `workspace:*` par Node.js              |

**Utilisateur non-root** (`nestjs`, UID 1001) — le process Node.js ne tourne jamais en root. Si un attaquant exploite une vulnerabilite dans l'API, il n'a pas les privileges root dans le container. C'est une pratique de securite standard pour les images de production.

**Variables d'environnement** :

```dockerfile
ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000
```

- `ENV PORT=4000` est une **valeur par defaut surchargeable**. Railway injecte sa propre variable `PORT` au runtime qui ecrase celle-ci. Dans `main.ts`, `process.env['PORT'] ?? 4000` lit la valeur au moment de l'execution.
- `EXPOSE 4000` est purement **documentaire** — ca ne publie aucun port. Le mapping reel se fait via la configuration Railway ou `docker run -p`.
- `DATABASE_URL`, `REDIS_URL` et les autres secrets ne sont pas dans l'image. Ils sont injectes au runtime par l'orchestrateur.

**Healthcheck** :

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1
```

Permet a Railway (ou tout orchestrateur) de verifier que l'API repond. `wget --spider` fait une requete HEAD sans telecharger le body. Si `/health` ne repond pas apres 3 echecs, le container est marque comme unhealthy et l'orchestrateur peut le redemarrer.

## .dockerignore

**Fichier** : `.dockerignore` (racine du projet)

Quand `docker build` est lance, Docker envoie l'integralite du repertoire courant au daemon comme "contexte de build". Sans `.dockerignore`, ca inclut :

| Exclu                     | Taille estimee | Raison                                                 |
| ------------------------- | -------------- | ------------------------------------------------------ |
| `node_modules`            | ~500 MB+       | Reinstalle dans le container via `pnpm install`        |
| `.git`                    | Variable       | Historique complet inutile pour le build               |
| `dist`, `build`, `.next`  | Variable       | Artefacts de build locaux, rebuildes dans le container |
| `.env`, `.env.*`          | Quelques KB    | Contiennent des secrets reels                          |
| `.turbo`                  | Variable       | Cache Turborepo local                                  |
| `_bmad-output`, `.claude` | Variable       | Artefacts de planification/tooling                     |

Exception : `!.env.example` est explicitement garde car il ne contient pas de secrets et peut etre utile comme reference.

## Scripts npm

**Fichier** : `package.json` (racine)

```json
"docker:up": "docker compose -f docker/docker-compose.yml up -d",
"docker:down": "docker compose -f docker/docker-compose.yml down",
"docker:reset": "docker compose -f docker/docker-compose.yml down -v"
```

| Script         | Comportement                                         | Donnees                        |
| -------------- | ---------------------------------------------------- | ------------------------------ |
| `docker:up`    | Demarre les containers en arriere-plan (`-d`)        | —                              |
| `docker:down`  | Arrete les containers                                | Conservees (volumes persistes) |
| `docker:reset` | Arrete les containers et supprime les volumes (`-v`) | Effacees                       |

Le flag `-f docker/docker-compose.yml` est necessaire car le fichier Compose est dans un sous-repertoire `docker/` plutot qu'a la racine. Convention choisie pour garder la racine du projet propre.

## Problemes rencontres et solutions

### PNPM_HOME manquant dans Alpine

**Probleme** : `pnpm add -g turbo` echoue avec `ERR_PNPM_NO_GLOBAL_BIN_DIR`.

**Cause** : Alpine Linux n'a pas de repertoire global pnpm preconfigure. Corepack active pnpm mais ne configure pas le repertoire pour les packages globaux.

**Solution** : Definir `ENV PNPM_HOME="/pnpm"` et l'ajouter au `PATH` dans le stage base.

### DATABASE_URL requis par Prisma au build

**Probleme** : `prisma generate` echoue avec `PrismaConfigEnvError: Cannot resolve environment variable: DATABASE_URL`.

**Cause** : `prisma.config.ts` appelle `env("DATABASE_URL")` au chargement du module, avant meme de savoir si la commande est `generate` (pas besoin de DB) ou `migrate` (besoin de DB).

**Solution** : Fournir une valeur dummy inline dans le `RUN` du builder. La valeur n'est jamais utilisee pour une connexion.

### pnpm prune en environnement non-interactif

**Probleme** : `pnpm prune --prod` echoue avec deux erreurs successives :

1. `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY` — pnpm refuse de supprimer `node_modules` sans TTY
2. `sh: husky: not found` — le script `prepare` tente d'executer `husky` qui vient d'etre supprime

**Cause** : pnpm demande une confirmation interactive pour les operations destructives. Apres suppression des devDependencies, les lifecycle scripts tentent d'executer des outils qui n'existent plus.

**Solution** : `CI=true` desactive la confirmation interactive. `--ignore-scripts` empeche l'execution des lifecycle scripts post-prune.
