# Cycle de developpement — Family Hub

Ce document explique ce qui se passe a chaque etape du developpement, du moment ou tu ecris du code jusqu'au moment ou il est en ligne.

---

## Vue d'ensemble

```
 Ton code                           GitHub                              Production
┌──────────┐    git push    ┌───────────────────┐    merge     ┌──────────────────┐
│ Modifier │──────────────→ │  Pull Request      │───────────→ │  Deploy auto     │
│ le code  │                │                    │             │                  │
└────┬─────┘                │  CI verifie :      │             │  Railway (API)   │
     │                      │  - format           │             │  Vercel  (Web)   │
     │ git commit           │  - lint             │             │  EAS     (Mobile)│
     │                      │  - types            │             │                  │
     ▼                      │  - tests + coverage │             │  Health checks   │
┌──────────┐                │  - build            │             │  pour verifier   │
│ Husky    │                │  - SonarCloud       │             │                  │
│ verifie  │                │  - CodeQL           │             └──────────────────┘
│ le commit│                └───────────────────┘
└──────────┘
```

---

## Etape 1 : Ecrire du code

### Ou mettre quoi ?

| Tu veux...                                      | Tu modifies...                    |
| ----------------------------------------------- | --------------------------------- |
| Ajouter un endpoint GraphQL                     | `apps/api/src/modules/<domaine>/` |
| Modifier la base de donnees                     | `packages/db/prisma/schema/`      |
| Ajouter une page web                            | `apps/web/app/`                   |
| Ajouter un ecran mobile                         | `apps/mobile/app/`                |
| Ajouter un type partage (utilise par API + Web) | `packages/shared/src/`            |
| Modifier une couleur ou un espacement           | `packages/tokens/src/`            |
| Modifier une regle de lint                      | `packages/config-eslint/`         |

### Conventions de nommage des fichiers

Tous les fichiers TypeScript utilisent le format `kebab-case.role.ts` :

```
health.controller.ts     ← controller REST
health.resolver.ts       ← resolver GraphQL
health.service.ts        ← logique metier
health.module.ts         ← module NestJS (assemble les pieces)
prisma.health-indicator.ts ← indicateur de sante specifique
```

Le "role" apres le dernier point (`controller`, `resolver`, `service`, etc.) indique a quoi sert le fichier sans avoir a l'ouvrir.

---

## Etape 2 : Ce qui se passe quand tu commit

Quand tu tapes `git commit -m "feat(api): add user endpoint"`, une chaine de verifications se declenche automatiquement AVANT que le commit soit cree :

```
git commit
    │
    ▼
┌─────────────────────────────────────────────────┐
│  1. HUSKY (pre-commit hook)                     │
│     Intercepte le commit et lance lint-staged   │
│                                                 │
│  2. LINT-STAGED                                 │
│     Selectionne UNIQUEMENT les fichiers         │
│     que tu as modifies (pas tout le projet)     │
│          │                                      │
│          ├──→ ESLint (*.ts, *.tsx, *.js, *.jsx) │
│          │    Verifie les erreurs de code :      │
│          │    - variables inutilisees            │
│          │    - imports manquants                │
│          │    - mauvaises pratiques              │
│          │    Si erreur → commit BLOQUE          │
│          │                                      │
│          └──→ Prettier (*.ts, *.json, *.md, ...)│
│               Reformate automatiquement :       │
│               - indentation                     │
│               - guillemets simples/doubles       │
│               - sauts de ligne                   │
│               Les fichiers sont modifies et     │
│               re-ajoutes au commit              │
│                                                 │
│  3. COMMITLINT (commit-msg hook)                │
│     Verifie le FORMAT du message de commit :    │
│     ✓ feat(api): add user endpoint              │
│     ✗ fix stuff                                 │
│     ✗ feat(api): Add user endpoint.  (majuscule + point) │
│                                                 │
│     Format obligatoire :                        │
│     type(scope): description                    │
│                                                 │
│     Types autorises :                           │
│     feat, fix, chore, docs, refactor,           │
│     test, ci, style                             │
│                                                 │
│     Scopes autorises :                          │
│     api, web, mobile, shared, db, auth,         │
│     ui, tokens, config-eslint, config-ts, ci    │
│     (ou pas de scope si multi-packages)         │
│                                                 │
│     Si format invalide → commit BLOQUE          │
└─────────────────────────────────────────────────┘
    │
    ▼
  Commit cree ✓
```

**Concretement, les fichiers impliques :**

| Fichier                 | Role                                               |
| ----------------------- | -------------------------------------------------- |
| `.husky/pre-commit`     | Lance `pnpm exec lint-staged`                      |
| `.husky/commit-msg`     | Lance `pnpm exec commitlint --edit $1`             |
| `.lintstagedrc.json`    | Configure quels outils tournent sur quels fichiers |
| `commitlint.config.mjs` | Liste les types et scopes autorises                |

### Pourquoi tout ca ?

- **ESLint** attrape les bugs avant qu'ils arrivent en CI (plus rapide de corriger maintenant que d'attendre 5min de CI).
- **Prettier** garantit que tout le monde a le meme formatage — pas de diff inutile dans les PRs a cause d'un espace en trop.
- **Commitlint** force des messages de commit lisibles. Quand tu fais `git log`, tu comprends immediatement ce que chaque commit a fait. Ces messages sont aussi utilises pour generer les changelogs et calculer les versions.

---

## Etape 3 : Ce qui se passe quand tu push et ouvres une PR

```
git push origin feature/1-2-auth-google
    │
    ▼
GitHub recoit le code
    │
    ├──→ CI workflow (ci.yml) se declenche
    │
    └──→ CodeQL se declenche (en parallele)
```

### Le CI workflow en detail

Le CI (Continuous Integration) est un workflow GitHub Actions qui s'execute sur un serveur Ubuntu chez GitHub. Il verifie que ton code ne casse rien.

```
┌─────────────────────────────────────────────────────────────────────┐
│  CI Workflow (Ubuntu, ~5-8 min)                                     │
│                                                                     │
│  Services demarres automatiquement :                                │
│  ┌──────────────┐                                                   │
│  │ PostgreSQL 17 │ sur localhost:5432                                │
│  └──────────────┘ (pour les tests e2e de l'API)                     │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ 1. Checkout (fetch-depth: 0)                                │    │
│  │    Clone le code avec TOUT l'historique git                 │    │
│  │    (SonarCloud en a besoin pour analyser le "nouveau code") │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │ 2. Setup pnpm 10.27.0 + Node.js 22 + cache                 │    │
│  │    Installe les outils, restaure le cache si disponible     │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │ 3. pnpm install --frozen-lockfile                           │    │
│  │    Installe les dependances exactement comme dans le        │    │
│  │    lockfile. Si le lockfile ne matche pas → ECHEC           │    │
│  │    (empeche les "ca marchait sur ma machine")               │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │ 4. format:check                                             │    │
│  │    Verifie que Prettier a ete lance (ne modifie rien,       │    │
│  │    juste verifie). Si un fichier n'est pas formate → ECHEC  │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │ 5. lint                                                     │    │
│  │    ESLint sur TOUT le projet (pas juste les fichiers        │    │
│  │    modifies comme en local). Attrape les erreurs que le     │    │
│  │    lint-staged local aurait pu rater (ex: fichier non stage)│    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │ 6. typecheck                                                │    │
│  │    `tsc --noEmit` sur chaque app/package. Verifie que       │    │
│  │    TypeScript est satisfait : pas de types manquants,       │    │
│  │    pas d'erreurs de compilation. Ne produit aucun fichier.  │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │ 7. test:coverage                                            │    │
│  │    Lance les tests avec Vitest + collecte la couverture.    │    │
│  │    Actuellement : tests e2e de l'API uniquement.            │    │
│  │    Produit un fichier `apps/api/coverage/lcov.info` qui     │    │
│  │    sera lu par SonarCloud.                                  │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │ 8. build                                                    │    │
│  │    Compile tout le projet pour la production.               │    │
│  │    Si le build echoue → il y a un probleme de code.         │    │
│  │    Turborepo gere l'ordre : packages d'abord, apps ensuite. │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │ 9. SonarCloud Scan                                          │    │
│  │    Envoie le code + le rapport de couverture a SonarCloud.  │    │
│  │    SonarCloud analyse et poste un commentaire sur la PR     │    │
│  │    (voir section dediee ci-dessous).                        │    │
│  │    Skippe si SONAR_TOKEN n'est pas configure.               │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  Les etapes sont sequentielles et "fail-fast" :                     │
│  si format:check echoue, les etapes suivantes ne tournent pas.      │
│  L'ordre va du plus rapide au plus lent pour echouer vite.          │
└─────────────────────────────────────────────────────────────────────┘
```

### Que verifie SonarCloud ?

SonarCloud est un service qui analyse la qualite du code. Apres chaque CI, il poste un commentaire directement sur la PR avec ses resultats :

**Ce qu'il detecte :**

- **Bugs** — Code qui va probablement planter (ex: null pointer, division par zero)
- **Vulnerabilites** — Failles de securite (ex: injection SQL, XSS)
- **Code smells** — Code qui fonctionne mais qui est mal ecrit (ex: fonction trop longue, duplication)
- **Duplications** — Code copie-colle qui devrait etre factorise
- **Couverture de tests** — Quel pourcentage du nouveau code est couvert par des tests

**Le Quality Gate "Sonar way" :**

SonarCloud applique un "quality gate" — un ensemble de regles qui doivent etre respectees. Ici on utilise le gate par defaut appele "Sonar way". Il s'applique uniquement au **nouveau code** (le code modifie dans la PR), pas a tout le projet :

| Regle                      | Seuil | Ce que ca veut dire                                     |
| -------------------------- | ----- | ------------------------------------------------------- |
| Coverage >= 80%            | 80%   | Au moins 80% du nouveau code doit avoir des tests       |
| Duplications <= 3%         | 3%    | Pas plus de 3% de code duplique dans les modifications  |
| Maintainability Rating = A | A     | Le code est facile a maintenir (pas de dette technique) |
| Reliability Rating = A     | A     | Pas de bugs detectes                                    |
| Security Rating = A        | A     | Pas de vulnerabilites detectees                         |

Si une de ces regles n'est pas respectee → le quality gate est en echec. Ca n'empeche pas le merge (pas de blocage), mais c'est un signal d'alerte visible sur la PR.

### Que fait CodeQL ?

CodeQL tourne en parallele du CI. C'est l'analyseur de securite de GitHub. Il construit un modele semantique du code et cherche des patterns de vulnerabilite connus :

- Injection SQL
- Cross-site scripting (XSS)
- Prototype pollution
- Secrets en dur dans le code
- Command injection

Les alertes apparaissent dans l'onglet **Security** du repo GitHub.

### Dependabot

Dependabot n'est pas lie a tes PRs, mais il tourne chaque lundi automatiquement. Il verifie si des dependances ont des mises a jour disponibles et ouvre des PRs automatiques :

- Les mises a jour mineures/patch sont **groupees** par ecosysteme (NestJS, Next.js, Expo, Prisma, etc.) pour eviter 50 PRs individuelles
- Les mises a jour majeures (breaking changes) restent des PRs individuelles pour etre reviewees attentivement
- Le CI tourne sur chaque PR Dependabot — si ca passe, c'est safe de merger

---

## Etape 4 : Ce qui se passe quand tu merge

```
PR approuvee → Squash merge dans dev
    │
    │  (tous les commits de la branche sont
    │   combines en un seul commit propre)
    │
    ▼
Push sur dev
    │
    ├──→ CI tourne a nouveau (push event sur dev)
    │
    └──→ Si CI passe :
              │
              ▼
         Deploy workflow (deploy.yml) se declenche
              │
              ├──→ 1. Setup : detecte l'environnement
              │        (dev branch → env "dev")
              │        (main branch → env "production")
              │
              ├──→ 2. Deploy API (Railway)
              │        Railway recoit le code → build
              │        le Dockerfile → demarre le container
              │        → health check sur /health
              │
              ├──→ 3. Deploy Web (Vercel) [attend que l'API soit ok]
              │        Vercel pull → build Next.js → deploy
              │        → health check sur l'URL deployee
              │
              └──→ 4. Deploy Mobile (EAS) [attend que l'API soit ok]
                       Fetch secrets Doppler → build tokens
                       → eas update (OTA update)
```

### Comment Railway deploie l'API

Quand le deploy workflow se declenche :

1. Railway recoit le code et detecte le `docker/api.Dockerfile`
2. Docker construit l'image en 5 etapes (voir `docs/technical/docker-infrastructure.md`)
3. Railway demarre le container avec les variables d'environnement injectees par Doppler
4. Le container lance `node dist/main` qui demarre NestJS
5. Railway fait un health check interne sur `/health`
6. Le workflow GitHub fait aussi un health check externe (10 tentatives, 15s entre chaque)
7. Si le health check passe → deploiement reussi
8. Si le health check echoue → le workflow echoue mais le deploiement casse **reste en ligne** (pas de rollback automatique)

### Comment Vercel deploie le Web

1. Le workflow installe Vercel CLI
2. `vercel pull` telecharge la configuration du projet
3. `vercel build` compile Next.js localement
4. `vercel deploy --prebuilt` pousse le build vers Vercel
5. Health check sur l'URL deployee (accepte 200 ou 401)

### Comment EAS deploie le Mobile

Les mises a jour mobile sont des **OTA updates** (Over-The-Air) — l'app se met a jour sans passer par les stores (App Store/Google Play). C'est beaucoup plus rapide qu'un build natif complet.

1. Le workflow installe les dependances + build les packages workspace (tokens)
2. **Doppler** injecte les secrets (notamment `EXPO_PUBLIC_GRAPHQL_URL` que l'app mobile utilise pour savoir ou envoyer les requetes GraphQL)
3. `eas update --channel dev` pousse la mise a jour vers les appareils connectes au channel `dev`

### Ports et URLs

| Environnement | API                                        | Port interne |
| ------------- | ------------------------------------------ | ------------ |
| Local         | `http://localhost:4000`                    | 4000         |
| Dev (Railway) | `https://tlfamily-hub-dev.up.railway.app`  | 8080         |
| Prod          | `https://api-familyhub.tloyan.com` (futur) | 8080         |

En local, l'API ecoute sur le port 4000. Sur Railway, elle ecoute sur le port 8080 (configure via la variable `PORT` dans Doppler). Le domaine public Railway (`*.up.railway.app`) route le trafic HTTPS (port 443) vers le port interne automatiquement.

---

## Etape 5 : Ce qui ne se passe PAS (encore)

### Pas de rollback automatique

Si un deploiement casse l'application, le workflow echoue mais l'application cassee reste en ligne. Il faut intervenir manuellement :

| Plateforme | Procedure manuelle                                                        |
| ---------- | ------------------------------------------------------------------------- |
| Railway    | Dashboard → Deployments → cliquer sur le precedent → **Redeploy**         |
| Vercel     | Dashboard → Deployments → cliquer sur le precedent → **Promote to Prod**  |
| Mobile     | Pas de rollback natif — pousser un nouvel `eas update` avec l'ancien code |

### Pas de deploiement production

La branche `main` n'a pas encore de deploiement configure. Actuellement tout le flux (CI + deploy) fonctionne sur `dev` uniquement. La mise en place de la production est documentee dans `docs/backlog-infra.md`.

### Pas de notifications

Personne n'est notifie quand un deploy reussit ou echoue (pas de Slack/Discord/email).
