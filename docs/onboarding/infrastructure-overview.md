# Infrastructure — Family Hub

Comment les services sont connectes, comment les secrets circulent, et comment le code arrive en production.

---

## Vue d'ensemble — Qui parle a qui

```
┌────────────────────────────────────────────────────────────────────────────┐
│                           Utilisateurs                                     │
│                                                                            │
│   Navigateur                              Smartphone                       │
│   ┌──────────┐                            ┌──────────┐                     │
│   │   Web    │                            │  Mobile  │                     │
│   │ Next.js  │                            │  Expo    │                     │
│   └────┬─────┘                            └────┬─────┘                     │
│        │                                       │                           │
│        │  HTTPS                                │  HTTPS                    │
│        │                                       │                           │
│        ▼                                       ▼                           │
│   ┌─────────────────────────────────────────────────┐                      │
│   │              Railway (API NestJS)                │                      │
│   │              Port 8080 interne                   │                      │
│   │              HTTPS public via reverse proxy      │                      │
│   │                                                  │                      │
│   │   Recoit les requetes GraphQL                   │                      │
│   │   Execute la logique metier                     │                      │
│   │   Lit/ecrit dans les bases                      │                      │
│   └──────┬──────────────────┬───────────────────────┘                      │
│          │                  │                                              │
│          ▼                  ▼                                              │
│   ┌───────────┐      ┌──────────┐                                         │
│   │ PostgreSQL │      │  Redis   │                                         │
│   │ (Supabase) │      │(Upstash) │                                         │
│   │ EU-West    │      │ EU-West  │                                         │
│   └───────────┘      └──────────┘                                         │
└────────────────────────────────────────────────────────────────────────────┘
```

### Ce que chaque service fait

| Service         | Plateforme | Ce qu'il fait dans le projet                                    |
| --------------- | ---------- | --------------------------------------------------------------- |
| **API GraphQL** | Railway    | Recoit les requetes, logique metier, CRUD base de donnees       |
| **Web**         | Vercel     | Site web Next.js, rendu server-side, deploiement automatique    |
| **Mobile**      | EAS (Expo) | App React Native, mises a jour OTA (sans passer par les stores) |
| **PostgreSQL**  | Supabase   | Base de donnees principale — utilisateurs, foyers, rituels      |
| **Redis**       | Upstash    | Cache, sessions, donnees temporaires (rate limiting futur)      |

### Communication entre les services

Les fleches dans le schema ci-dessus representent les seuls chemins de communication :

1. **Web → API** : Le navigateur envoie des requetes GraphQL (HTTP POST) a l'API. Next.js peut aussi appeler l'API cote serveur (Server Components).
2. **Mobile → API** : L'app mobile envoie les memes requetes GraphQL via Apollo Client.
3. **API → PostgreSQL** : L'API lit/ecrit dans la base via Prisma. La connexion utilise le **Transaction Pooler** de Supabase (PgBouncer) pour gerer les connexions efficacement.
4. **API → Redis** : L'API lit/ecrit dans Redis pour le cache et les sessions. La connexion est chiffree (TLS) via Upstash.

**Ce qui ne communique PAS :**

- Le Web et le Mobile ne se parlent jamais entre eux
- Le Web et le Mobile n'accedent jamais directement a PostgreSQL ou Redis
- PostgreSQL et Redis ne se parlent jamais entre eux

---

## Les environnements

### Etat actuel (fevrier 2026)

| Environnement  | Branche | Statut               | URLs                                    |
| -------------- | ------- | -------------------- | --------------------------------------- |
| **Dev**        | `dev`   | Operationnel         | `tlfamily-hub-dev.up.railway.app` (API) |
| **Production** | `main`  | Pas encore configure | (voir `docs/backlog-infra.md`)          |

Le CI tourne sur les deux branches, mais le deploy ne fonctionne que pour `dev`. La production necessite la configuration des secrets, integrations, et domaines (travail documente dans le backlog).

### Dev local vs deploye

| Aspect          | Dev local                           | Deploye (Railway/Vercel)            |
| --------------- | ----------------------------------- | ----------------------------------- |
| API             | NestJS natif, hot-reload            | Container Docker                    |
| Port API        | 4000                                | 8080                                |
| PostgreSQL      | Docker container `localhost:5432`   | Supabase (EU-West)                  |
| Redis           | Docker container `localhost:6379`   | Upstash (EU-West)                   |
| Web             | Next.js dev server `localhost:3000` | Vercel Edge                         |
| Variables d'env | Doppler `dev_tloyan` ou `.env`      | Doppler `dev` ou `prd` → sync natif |

---

## Comment les secrets circulent

### Le probleme que Doppler resout

L'API a besoin de secrets pour fonctionner : l'URL de la base de donnees, la cle de signature des tokens, les identifiants Google OAuth, etc. Ces secrets sont differents selon l'environnement (dev, prod, local).

Sans Doppler, il faudrait les configurer manuellement dans 4 endroits differents (Railway, Vercel, GitHub Actions, et en local). A chaque changement, il faudrait les mettre a jour partout. C'est source d'erreurs.

Doppler est la **source unique** : on definit les secrets une fois, et ils sont automatiquement synchronises vers les plateformes.

### Schema de circulation

```
┌────────────────────────────────────────────────────────────────────┐
│  DOPPLER (source unique de verite)                                 │
│                                                                    │
│  Projet: family-hub                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐                     │
│  │ Config   │  │ Config   │  │ Config        │                     │
│  │ dev      │  │ prd      │  │ dev_tloyan    │                     │
│  │          │  │          │  │ (personal)    │                     │
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘                     │
│       │              │               │                             │
└───────┼──────────────┼───────────────┼─────────────────────────────┘
        │              │               │
   Integration    Integration     CLI locale
   native         native          `doppler run`
        │              │               │
        ▼              ▼               ▼
   ┌─────────┐   ┌─────────┐   ┌──────────────┐
   │ Railway  │   │ Railway  │   │ Terminal     │
   │ env dev  │   │ env prod │   │ process.env  │
   └─────────┘   └─────────┘   └──────────────┘
        │              │
   ┌─────────┐   ┌─────────┐
   │ Vercel   │   │ Vercel   │
   │ Preview  │   │ Prod     │
   └─────────┘   └─────────┘
```

### Les 3 chemins concrets

**1. Dev local → `doppler run`**

```bash
pnpm dev:doppler
# equivalent a : doppler run -- turbo run dev
```

Doppler lit le config `dev_tloyan`, injecte toutes les variables dans `process.env`, et lance la commande. L'API recoit `DATABASE_URL=postgresql://localhost:5432/family_hub`, `PORT=4000`, etc.

Pas besoin de fichier `.env`. Si tu preferes ne pas utiliser Doppler, tu peux copier `.env.example` vers `.env` et remplir les valeurs manuellement.

**2. Railway/Vercel → integration native**

Quand tu modifies un secret dans Doppler (ex: tu changes `REDIS_URL`) :

1. Doppler detecte le changement
2. L'integration native pousse la nouvelle valeur vers Railway
3. Railway detecte le changement de variable et **redeploy automatiquement** le service
4. Le nouveau container demarre avec la nouvelle valeur

Pour Vercel, les nouvelles valeurs sont utilisees au prochain deploiement (pas de redeploy automatique).

**3. GitHub Actions → CLI Doppler**

Seul le job `deploy-mobile` utilise Doppler dans le CI. Les jobs `deploy-api` et `deploy-web` n'en ont pas besoin car Railway et Vercel recoivent leurs secrets directement via les integrations natives.

Pour le mobile, EAS a besoin de `EXPO_PUBLIC_GRAPHQL_URL` au moment du build. Le workflow :

1. Installe le CLI Doppler (`dopplerhq/cli-action@v3`)
2. `doppler secrets download` → injecte les secrets dans `$GITHUB_ENV`
3. EAS update utilise ces variables

### Ce qui n'est PAS dans Doppler

Les **tokens d'authentification des plateformes de deploiement** restent dans GitHub Secrets :

| Secret              | Pourquoi c'est dans GitHub, pas Doppler                        |
| ------------------- | -------------------------------------------------------------- |
| `RAILWAY_TOKEN`     | Sert uniquement a authentifier le CLI Railway dans le workflow |
| `VERCEL_TOKEN`      | Sert uniquement a authentifier le CLI Vercel dans le workflow  |
| `VERCEL_ORG_ID`     | Identifiant Vercel, utilise uniquement dans le workflow        |
| `VERCEL_PROJECT_ID` | Identifiant Vercel, utilise uniquement dans le workflow        |
| `EXPO_TOKEN`        | Sert uniquement a authentifier EAS dans le workflow            |
| `SONAR_TOKEN`       | Sert uniquement a authentifier SonarCloud dans le CI           |

Ces tokens ne sont pas des secrets "applicatifs" (l'API n'en a pas besoin pour tourner). Ce sont des tokens de CI/CD.

---

## Les services cloud en detail

### Railway — API

Railway est une plateforme de deploiement. Quand du code est pousse, Railway :

1. Detecte le `docker/api.Dockerfile` dans le repo
2. Construit l'image Docker (multi-stage build, ~30-40s)
3. Demarre le container avec les variables d'environnement (injectees par Doppler)
4. Fait un health check interne sur `/health`
5. Route le trafic HTTPS public vers le port interne (8080)

**Reverse proxy :** Les utilisateurs accedent a `https://tlfamily-hub-dev.up.railway.app`. Railway recoit le trafic sur le port 443 (HTTPS) et le redirige vers le port 8080 du container. C'est pour ca que l'API ecoute sur 8080 en deploye mais que l'URL n'a pas de port visible.

**Environments :** Railway supporte plusieurs environnements dans un meme projet. Actuellement seul `dev` est configure (branch `dev`). Le deploiement est automatique via le workflow GitHub Actions.

### Vercel — Web

Vercel est specialise dans le deploiement de frameworks frontend (Next.js, React, etc.). Pour Family Hub :

1. Le workflow GitHub construit Next.js localement (`vercel build`)
2. Pousse le build pre-compile vers Vercel (`vercel deploy --prebuilt`)
3. Vercel distribue le site sur son CDN global (Edge network)

**Preview vs Production :**

- Chaque push sur `dev` genere un deploiement **Preview**
- Un push sur `main` genere un deploiement **Production**
- Les URLs de preview sont uniques par deploiement

### EAS (Expo Application Services) — Mobile

EAS est la plateforme de deploiement d'Expo pour les apps React Native.

**Deux modes de deploiement :**

- **`eas build`** — Construit un binaire natif (APK/IPA). Necessaire pour les changements natifs (nouvelles permissions, nouveau SDK). Lent (~15-30min).
- **`eas update`** — Pousse une mise a jour **OTA** (Over-The-Air). L'app telecharge le nouveau code JavaScript sans passer par les stores. Rapide (~1-2min). C'est ce qu'utilise le workflow actuel.

**Channels :** EAS utilise des "channels" pour cibler les bons appareils. `eas update --channel dev` pousse l'update vers les appareils configures sur le channel `dev`.

### Supabase — PostgreSQL

Supabase est un service qui fournit une base de donnees PostgreSQL managee. On utilise uniquement la partie PostgreSQL (pas l'auth Supabase, pas le realtime, pas le storage).

**Connection string :** `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`

Le `:6543` (pas le port standard 5432) indique qu'on passe par le **Transaction Pooler** (PgBouncer). Ca gere un pool de connexions a la DB pour eviter de saturer le nombre de connexions simultanees — important pour une app serverless ou avec beaucoup de requetes.

### Upstash — Redis

Upstash est un service Redis serverless. Redis est une base de donnees en memoire, ultra-rapide, utilisee pour :

- Le cache (eviter de requeter PostgreSQL pour des donnees qui changent rarement)
- Les sessions utilisateur
- Le rate limiting (futur)

La connexion est chiffree (TLS) — l'URL commence par `rediss://` (avec deux "s").

---

## DNS et domaines

### Comment une requete arrive a l'API

```
Navigateur tape : https://tlfamily-hub-dev.up.railway.app/graphql
    │
    │  1. Le navigateur demande au DNS : "quelle IP pour ce domaine ?"
    │     DNS repond : 66.33.22.57 (IP du reverse proxy Railway)
    │
    │  2. Le navigateur se connecte en HTTPS (TLS 1.3)
    │     Railway fournit automatiquement un certificat Let's Encrypt
    │
    │  3. Le reverse proxy Railway recoit la requete sur le port 443
    │     et la redirige vers le container sur le port 8080
    │
    │  4. NestJS recoit la requete et la traite
    │
    ▼
   Reponse JSON
```

### Domaines actuels

| Service | Domaine                           | Type           |
| ------- | --------------------------------- | -------------- |
| API dev | `tlfamily-hub-dev.up.railway.app` | Railway genere |
| Web dev | (URL Vercel generee)              | Vercel genere  |

### Domaines futurs (production)

| Service  | Domaine futur                  | Configuration necessaire       |
| -------- | ------------------------------ | ------------------------------ |
| API prod | `api-familyhub.tloyan.com`     | CNAME vers Railway dans le DNS |
| Web prod | `familyhub.tloyan.com`         | Domaine Vercel                 |
| API dev  | `dev-api-familyhub.tloyan.com` | CNAME vers Railway dans le DNS |
| Web dev  | `dev-familyhub.tloyan.com`     | Domaine Vercel                 |

Les custom domains necessitent Cloudflare (pas encore configure — voir `docs/backlog-infra.md`).

---

## Ce qui manque pour la production

Voir `docs/backlog-infra.md` pour la liste complete. En resume :

- [ ] Secrets Doppler `prd` remplis
- [ ] Integrations Doppler → Railway prod / Vercel prod configurees
- [ ] GitHub Environment `production` avec tous les secrets
- [ ] Cloudflare pour DNS, CDN, WAF
- [ ] Rollback automatique sur echec de health check
- [ ] Monitoring et notifications de deploy
