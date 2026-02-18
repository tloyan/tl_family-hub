# Infrastructure Setup Guide — Family Hub

Guide de mise en place de l'infrastructure cloud pour les 2 environnements (dev + prod).

**Plans :** Tous gratuits/trial pour demarrer.

> **Etat actuel (fevrier 2026) :** L'infrastructure est **pleinement operationnelle en environnement `dev` uniquement**. Les services cloud (Supabase, Upstash, Railway, Vercel) sont configures pour `dev`. L'environnement `production` (`main`) n'est pas encore en place — il necessite la configuration des secrets Doppler `prd`, des integrations Railway/Vercel production, et des domaines custom de production. Voir `docs/backlog-infra.md` pour le detail.

---

## 1. Supabase Free — PostgreSQL (2 projets)

Supabase Free permet 2 projets actifs par organisation.

### Projet DEV

1. https://supabase.com/dashboard → **New Project**
   - **Name :** `family-hub-dev`
   - **Region :** `EU West (eu-west-1)` ou `EU Frankfurt (eu-central-1)`
   - **Plan :** Free
2. **Settings → Database → Connection string** → copier le **Transaction Pooler** (port 6543)
   - Format : `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`

### Projet PROD

1. Meme procedure avec **Name :** `family-hub-prod`
2. Copier le connection string (Transaction Pooler, port 6543)

### Configuration post-creation (chaque projet)

- **Settings → Database → Connection mode** : verifier que le **Transaction Pooler** (PgBouncer) est actif — requis pour Prisma avec `?pgbouncer=true`
- **Authentication → Settings** : on n'utilise PAS Supabase Auth (Better Auth a la place). Laisser la config par defaut.
- **RLS** : active par defaut sur les nouvelles tables. On ne cree PAS de policies Supabase — l'isolation des donnees se fait cote NestJS (guards + Prisma client extension avec `householdId`).

### Limites Free

- Pause apres 1 semaine d'inactivite (cold start ~10s au redemarrage)
- 500 MB de stockage DB
- 2 projets actifs max

---

## 2. Upstash Redis Free

### Instance partagee DEV + PROD (MVP)

1. https://console.upstash.com/ → **Create Database**
   - **Name :** `family-hub`
   - **Region :** `EU-West-1` ou `EU-Central-1`
   - **Type :** Free
   - **TLS :** On (obligatoire pour les URLs `rediss://`)
2. Activer **Eviction** (Settings → eviction des entrees LRU quand le max data est atteint)
3. Copier le `REDIS_URL` (format `redis://default:[token]@[host].upstash.io:6379`)

### Limites Free

- 10 000 commandes/jour
- 256 MB max data
- 1 database

> **Note :** Pour 2 instances separees, il faudra un plan Pay-as-you-go ($0 de base, facture a l'usage) pour la 2e DB.

---

## 3. Railway — API NestJS (2 environnements)

Railway gere nativement les environnements dans un meme projet.

### Setup initial

1. https://railway.com/dashboard → **New Project → Deploy from GitHub Repo**
2. Selectionner le repo `family-hub`
3. Railway cree l'environnement `production` par defaut

### Creer l'environnement dev

4. Dans le projet → **Environments** (en haut) → **New Environment** → nommer `dev`

### Variables d'environnement

Les variables d'environnement de Railway sont gerees par **Doppler** via integration native (voir section 7 ci-dessous). Doppler synchronise automatiquement les secrets vers Railway — toute modification dans Doppler declenche un redeploy automatique.

> Ne pas ajouter de variables manuellement dans Railway. Utiliser Doppler comme source unique.

### Branches de deploiement

5. Environnement `production` → Settings → **Deploy** → Branch : `main`
6. Environnement `dev` → Settings → **Deploy** → Branch : `dev`

### Domaines publics

7. Service → Settings → **Networking** → **Public Networking** → **Generate Domain**
   - Dev : `xxx.up.railway.app`
   - Prod : `yyy.up.railway.app`

### Limites Trial

- $5 de credit (suffisant pour plusieurs semaines de dev)
- 500h d'execution/mois
- Apres le trial : Hobby a $5/mois

---

## 4. Vercel Hobby — Web Next.js

Vercel gere les environnements nativement : **Production** (branche `main`) + **Preview** (toutes les autres branches dont `dev`).

### Setup

1. https://vercel.com/dashboard → **Add New → Project**
2. Importer le repo `family-hub`
3. Configuration :
   - **Framework :** Next.js
   - **Root Directory :** `apps/web`
   - **Build Command :** `cd ../.. && pnpm turbo run build --filter=@family-hub/web`
   - **Install Command :** `pnpm install`

### Variables d'environnement

Les variables d'environnement de Vercel sont gerees par **Doppler** via integration native (voir section 7 ci-dessous). Doppler synchronise automatiquement les secrets vers les environnements Vercel (Production/Preview).

> Ne pas ajouter de variables manuellement dans Vercel. Utiliser Doppler comme source unique.

### Domaines

Settings → Domains :

- `familyhub.tloyan.com` → Production
- `dev-familyhub.tloyan.com` → Preview (branche `dev`)

### Branche de production

Settings → Git → **Production Branch** : `main`

---

## 5. DNS — Configuration Vercel DNS

`tloyan.com` est gere par Vercel DNS. Ajouter les enregistrements suivants :

Vercel Dashboard → domaine `tloyan.com` → DNS Records :

| Type  | Name                | Value                                  | Usage    |
| ----- | ------------------- | -------------------------------------- | -------- |
| CNAME | `api-familyhub`     | `(Railway prod domain).up.railway.app` | API prod |
| CNAME | `dev-api-familyhub` | `(Railway dev domain).up.railway.app`  | API dev  |

> Les sous-domaines `familyhub.tloyan.com` et `dev-familyhub.tloyan.com` sont geres automatiquement par Vercel quand on les ajoute comme domaines du projet (etape 4).

### TLS

- Vercel : certificats Let's Encrypt automatiques pour les domaines web
- Railway : certificats Let's Encrypt automatiques pour les domaines custom (apres ajout du CNAME)

---

## 6. Doppler — Secrets Management

Doppler centralise tous les secrets applicatifs. Les plateformes (Railway, Vercel) recoivent leurs secrets automatiquement via des integrations natives.

### Projet

- **Workplace :** `tloyan`
- **Project :** `family-hub`
- **Environments :** `dev`, `prd` (ignorer `stg`)
- **Personal config :** `dev_tloyan` (branch de `dev` pour le dev local)

### Secrets geres par Doppler

| Variable                  | dev                                            | prd                                        |
| ------------------------- | ---------------------------------------------- | ------------------------------------------ |
| `NODE_ENV`                | `production`                                   | `production`                               |
| `PORT`                    | `8080`                                         | `8080`                                     |
| `DATABASE_URL`            | Supabase dev connection string                 | Supabase prod connection string            |
| `BETTER_AUTH_SECRET`      | (genere avec `openssl rand -base64 32`)        | (genere DIFFERENT)                         |
| `BETTER_AUTH_URL`         | `https://dev-api-familyhub.tloyan.com`         | `https://api-familyhub.tloyan.com`         |
| `GOOGLE_CLIENT_ID`        | Google OAuth client ID                         | Google OAuth client ID                     |
| `GOOGLE_CLIENT_SECRET`    | Google OAuth client secret                     | Google OAuth client secret                 |
| `REDIS_URL`               | Upstash dev connection string                  | Upstash prod connection string             |
| `NEXT_PUBLIC_GRAPHQL_URL` | `https://dev-api-familyhub.tloyan.com/graphql` | `https://api-familyhub.tloyan.com/graphql` |
| `EXPO_PUBLIC_GRAPHQL_URL` | `https://dev-api-familyhub.tloyan.com/graphql` | `https://api-familyhub.tloyan.com/graphql` |

### Ports

- **Environnements deployes (Railway)** : `PORT=8080` — c'est le port sur lequel Railway route le trafic public via son reverse proxy
- **Dev local** : `PORT=4000` — convention locale, override dans le personal config `dev_tloyan`

Le Dockerfile definit `ENV PORT=4000` comme valeur par defaut, mais Railway injecte `PORT=8080` au runtime qui surcharge cette valeur. Le `main.ts` lit `process.env['PORT'] ?? 4000`.

### Personal config (dev local)

Le config `dev_tloyan` herite de `dev` et override les valeurs pour localhost :

- `NODE_ENV` → `development`
- `PORT` → `4000`
- `DATABASE_URL` → `postgresql://postgres:postgres@localhost:5432/family_hub`
- `REDIS_URL` → `redis://localhost:6379`
- `BETTER_AUTH_URL` → `http://localhost:4000`
- `NEXT_PUBLIC_GRAPHQL_URL` → `http://localhost:4000/graphql`
- `EXPO_PUBLIC_GRAPHQL_URL` → `http://localhost:4000/graphql`

### Integrations natives

| Integration | Mapping Doppler → Plateforme                                  |
| ----------- | ------------------------------------------------------------- |
| Railway     | `dev` → Railway env `dev`, `prd` → Railway env `production`   |
| Vercel      | `dev` → Vercel env `Preview`, `prd` → Vercel env `Production` |

Les modifications dans Doppler declenchent automatiquement un redeploy sur Railway. Vercel utilise les nouvelles valeurs au prochain deploy.

### Service Tokens (GitHub Actions)

| Config | Token name           | GitHub location                                      |
| ------ | -------------------- | ---------------------------------------------------- |
| `dev`  | `github-actions-dev` | Environments → `dev` → Secret `DOPPLER_TOKEN`        |
| `prd`  | `github-actions-prd` | Environments → `production` → Secret `DOPPLER_TOKEN` |

Seul le job `deploy-mobile` utilise ces tokens (Railway/Vercel sync nativement).

### Secrets qui restent dans GitHub

| Secret              | Pourquoi                                               |
| ------------------- | ------------------------------------------------------ |
| `RAILWAY_TOKEN`     | Authentifie le CLI Railway — pas un secret applicatif  |
| `VERCEL_TOKEN`      | Authentifie le CLI Vercel — pas un secret applicatif   |
| `VERCEL_ORG_ID`     | Identifiant Vercel org — pas un secret applicatif      |
| `VERCEL_PROJECT_ID` | Identifiant Vercel project — pas un secret applicatif  |
| `EXPO_TOKEN`        | Authentifie EAS CLI — pas un secret applicatif         |
| `SONAR_TOKEN`       | Authentifie SonarCloud — pas un secret applicatif      |
| `API_URL` (var)     | URL pour le health check deploy — variable, pas secret |

### Dev local

```bash
# Installation (une seule fois)
brew install doppler
doppler login
doppler setup  # selectionner project: family-hub, config: dev_tloyan

# Lancer le dev (injecte les secrets sans fichier .env)
pnpm dev:doppler
```

---

## 7. Verification post-deploiement

```bash
# API dev
curl https://dev-api-familyhub.tloyan.com/health
# Attendu : {"status":"ok","info":{"database":{"status":"up"}}}

# API prod
curl https://api-familyhub.tloyan.com/health
# Attendu : {"status":"ok","info":{"database":{"status":"up"}}}

# Web dev
curl -I https://dev-familyhub.tloyan.com/
# Attendu : HTTP/2 200

# Web prod
curl -I https://familyhub.tloyan.com/
# Attendu : HTTP/2 200

# TLS verification
curl -v https://api-familyhub.tloyan.com/health 2>&1 | grep "TLS"
# Attendu : TLS 1.3
```

---

## 8. Checklist de deploiement

- [x] Supabase : 2 projets crees (dev + prod)
- [x] Upstash : Redis cree avec TLS + Eviction
- [x] Railway : Projet cree avec 2 environnements (dev + production)
- [x] Railway : Branches de deploiement configurees (dev → `dev`, production → `main`)
- [x] Railway : Domaines publics generes
- [x] Vercel : Projet cree avec root directory `apps/web`
- [x] Vercel : Domaines ajoutes (`familyhub.tloyan.com` + `dev-familyhub.tloyan.com`)
- [x] DNS : CNAME `api-familyhub` → Railway prod
- [x] DNS : CNAME `dev-api-familyhub` → Railway dev
- [x] Doppler : Projet `family-hub` cree avec environments `dev` + `prd`
- [x] Doppler : Secrets remplis pour chaque environment
- [x] Doppler : Integration Railway configuree (dev + prd)
- [x] Doppler : Integration Vercel configuree (Preview + Production)
- [x] Doppler : Service tokens crees pour GitHub Actions (dev + prd)
- [x] Doppler : Personal config `dev_tloyan` cree pour le dev local
- [x] GitHub : `SONAR_TOKEN` ajoute comme repo-level secret
- [x] GitHub : `DOPPLER_TOKEN` ajoute dans les environments dev + production
- [x] SonarCloud : Projet importe, Automatic Analysis desactivee
- [ ] Health checks API repondent sur les 2 envs
- [ ] Web charge sur les 2 envs
- [ ] TLS 1.3 actif partout
