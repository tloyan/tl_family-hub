# Infrastructure Setup Guide — Family Hub

Guide de mise en place de l'infrastructure cloud pour les 2 environnements (dev + prod).

**Plans :** Tous gratuits/trial pour demarrer.

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

### Variables d'environnement (chaque environnement)

Cliquer sur le service → **Variables** :

| Variable               | Dev                                    | Prod                               |
| ---------------------- | -------------------------------------- | ---------------------------------- |
| `NODE_ENV`             | `development`                          | `production`                       |
| `DATABASE_URL`         | (Supabase dev pooler)                  | (Supabase prod pooler)             |
| `REDIS_URL`            | (Upstash)                              | (Upstash)                          |
| `BETTER_AUTH_SECRET`   | `openssl rand -base64 32`              | (generer un DIFFERENT)             |
| `BETTER_AUTH_URL`      | `https://dev-api-familyhub.tloyan.com` | `https://api-familyhub.tloyan.com` |
| `GOOGLE_CLIENT_ID`     | (a configurer lors de l'auth)          | (a configurer lors de l'auth)      |
| `GOOGLE_CLIENT_SECRET` | (a configurer lors de l'auth)          | (a configurer lors de l'auth)      |

> `PORT` n'est PAS necessaire — Railway l'injecte automatiquement.

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

Settings → Environment Variables :

| Variable                  | Environments         | Value                                          |
| ------------------------- | -------------------- | ---------------------------------------------- |
| `NEXT_PUBLIC_GRAPHQL_URL` | Production           | `https://api-familyhub.tloyan.com/graphql`     |
| `NEXT_PUBLIC_GRAPHQL_URL` | Preview, Development | `https://dev-api-familyhub.tloyan.com/graphql` |

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

## 6. Verification post-deploiement

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

## 7. Checklist de deploiement

- [ ] Supabase : 2 projets crees (dev + prod)
- [ ] Upstash : Redis cree avec TLS + Eviction
- [ ] Railway : Projet cree avec 2 environnements (dev + production)
- [ ] Railway : Variables d'environnement configurees pour chaque env
- [ ] Railway : Branches de deploiement configurees (dev → `dev`, production → `main`)
- [ ] Railway : Domaines publics generes
- [ ] Vercel : Projet cree avec root directory `apps/web`
- [ ] Vercel : Variables d'environnement configurees
- [ ] Vercel : Domaines ajoutes (`familyhub.tloyan.com` + `dev-familyhub.tloyan.com`)
- [ ] DNS : CNAME `api-familyhub` → Railway prod
- [ ] DNS : CNAME `dev-api-familyhub` → Railway dev
- [ ] Health checks API repondent sur les 2 envs
- [ ] Web charge sur les 2 envs
- [ ] TLS 1.3 actif partout
