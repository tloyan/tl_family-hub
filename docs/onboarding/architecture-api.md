# Architecture de l'API — Family Hub

Comment l'API fonctionne, de la requete du client jusqu'a la reponse.

---

## Vue d'ensemble

L'API est une application **NestJS** qui expose une interface **GraphQL**. Elle recoit des requetes des clients (web, mobile), execute la logique metier, et lit/ecrit dans PostgreSQL via Prisma.

```
Client (Web ou Mobile)
    │
    │  Requete GraphQL (HTTP POST /graphql)
    │  ex: query { health { status } }
    │
    ▼
┌────────────────────────────────────────────────────┐
│  NestJS (main.ts)                                  │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │  Apollo Server (GraphQL)                     │  │
│  │  Recoit la requete, la parse, la route       │  │
│  │  vers le bon resolver                        │  │
│  └─────────────┬────────────────────────────────┘  │
│                │                                   │
│                ▼                                   │
│  ┌──────────────────────────────────────────────┐  │
│  │  Resolver (ex: health.resolver.ts)           │  │
│  │  Point d'entree GraphQL — equivalent du      │  │
│  │  "controller" en REST. Definit les queries   │  │
│  │  et mutations disponibles.                   │  │
│  └─────────────┬────────────────────────────────┘  │
│                │                                   │
│                ▼                                   │
│  ┌──────────────────────────────────────────────┐  │
│  │  Service (ex: health.service.ts — futur)     │  │
│  │  Logique metier. Appele par le resolver.     │  │
│  │  Ne sait rien de GraphQL.                    │  │
│  └─────────────┬────────────────────────────────┘  │
│                │                                   │
│                ▼                                   │
│  ┌──────────────────────────────────────────────┐  │
│  │  Prisma (prisma.service.ts)                  │  │
│  │  ORM — traduit les appels TypeScript en      │  │
│  │  requetes SQL vers PostgreSQL.               │  │
│  └─────────────┬────────────────────────────────┘  │
│                │                                   │
└────────────────┼───────────────────────────────────┘
                 │
                 ▼
           ┌───────────┐
           │ PostgreSQL │
           └───────────┘
```

---

## Comment le serveur demarre

Quand on lance l'API (en local avec `pnpm dev` ou en production avec `node dist/main`), voici ce qui se passe :

### `main.ts` — Le point d'entree

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  const port = process.env['PORT'] ?? 4000;
  await app.listen(port);
}
```

1. **`NestFactory.create(AppModule)`** — NestJS cree l'application en lisant `AppModule`, qui est le module racine. Il initialise tous les modules declares, leurs services, leurs resolvers, etc.
2. **`app.useLogger(app.get(Logger))`** — Configure le logger Pino (logs JSON structures en production, logs colores en dev).
3. **`process.env['PORT'] ?? 4000`** — Lit le port depuis les variables d'environnement. Si `PORT` n'est pas defini (ex: en local sans `.env`), utilise 4000 par defaut. Sur Railway, `PORT=8080` est injecte par Doppler.
4. **`app.listen(port)`** — Le serveur HTTP demarre et ecoute les connexions.

### `app.module.ts` — Le module racine

```typescript
@Module({
  imports: [
    LoggerModule.forRoot({ ... }),     // Logging JSON structure
    GraphQLModule.forRoot({ ... }),     // Apollo Server + auto-generation du schema
    PrismaModule,                      // Connexion base de donnees
    HealthModule,                      // Endpoint /health + query GraphQL health
  ],
})
export class AppModule {}
```

`AppModule` est comme un sommaire : il liste tous les modules que l'API utilise. Quand NestJS demarre, il :

1. Initialise le **LoggerModule** — configure Pino pour les logs
2. Initialise le **GraphQLModule** — demarre Apollo Server, genere automatiquement le fichier `schema.gql` a partir des decorateurs dans le code
3. Initialise le **PrismaModule** — cree la connexion a PostgreSQL
4. Initialise le **HealthModule** — enregistre le health check REST (`/health`) et GraphQL (`query { health }`)

---

## Les modules NestJS — Comment c'est organise

Un module NestJS regroupe tout ce qui concerne un domaine fonctionnel. Actuellement il y a 2 modules :

```
apps/api/src/modules/
├── health/                    ← Verification que l'API fonctionne
│   ├── health.module.ts       ← Declaration du module
│   ├── health.controller.ts   ← Endpoint REST GET /health
│   ├── health.resolver.ts     ← Query GraphQL { health { status } }
│   ├── health.model.ts        ← Type GraphQL HealthStatus
│   └── prisma.health-indicator.ts ← Verifie que la DB repond
│
└── prisma/                    ← Connexion base de donnees
    ├── prisma.module.ts       ← Declaration du module (global)
    └── prisma.service.ts      ← Client Prisma injectable
```

### Anatomie d'un module

Prenons le `HealthModule` comme exemple :

**`health.module.ts`** — Le "manifeste" du module :

- Declare quels resolvers, controllers, et services existent
- Importe les modules dont il a besoin (ex: `TerminusModule` pour les health checks)

**`health.resolver.ts`** — Le point d'entree GraphQL :

- Definit les queries GraphQL (`@Query()`)
- Chaque methode decoree avec `@Query()` devient une query disponible dans le schema GraphQL
- Appelle les services pour faire le travail

**`health.controller.ts`** — Le point d'entree REST :

- Definit les routes HTTP (`@Get('/health')`)
- Utilise `@nestjs/terminus` pour verifier la sante de l'API et de la DB

**`health.model.ts`** — Le type GraphQL :

- Decorateurs `@ObjectType()` et `@Field()` definissent la forme de la reponse
- NestJS genere automatiquement le schema GraphQL a partir de ces decorateurs (c'est le "code-first")

**`prisma.health-indicator.ts`** — Logique specifique :

- Execute `SELECT 1` sur PostgreSQL pour verifier que la connexion fonctionne

### Injection de dependances

NestJS utilise l'injection de dependances. Ca veut dire que les classes ne creent pas elles-memes leurs dependances — NestJS les fournit automatiquement.

Exemple : le `HealthResolver` a besoin du `HealthService`. Au lieu de faire `new HealthService()`, on le declare dans le constructeur et NestJS l'injecte :

```typescript
@Resolver()
export class HealthResolver {
  constructor(private readonly healthService: HealthService) {}
  //          ↑ NestJS cree et injecte automatiquement le service
}
```

Pourquoi ? Ca rend le code testable (on peut injecter un faux service dans les tests) et decouple les composants.

---

## GraphQL code-first — Comment le schema est genere

Family Hub utilise l'approche **code-first** pour GraphQL. Ca veut dire que le schema GraphQL (`schema.gql`) n'est PAS ecrit a la main — il est genere automatiquement a partir des decorateurs TypeScript.

### Le flux :

```
Decorateurs TypeScript          Schema GraphQL (auto-genere)
─────────────────────          ──────────────────────────────

@ObjectType()                   type HealthStatus {
class HealthStatus {              status: String!
  @Field()                        database: String!
  status: string;               }
  @Field()
  database: string;
}

@Resolver()                     type Query {
class HealthResolver {            health: HealthStatus!
  @Query(() => HealthStatus)    }
  health() { ... }
}
```

**Avantage** : le schema et le code sont toujours synchronises. Pas de risque d'avoir un schema qui ne correspond pas au code. NestJS regenere `schema.gql` a chaque demarrage du serveur.

**Le fichier `schema.gql`** est auto-genere et commite dans le repo (pour reference). Il ne faut **jamais** le modifier a la main.

---

## Prisma — Comment la base de donnees fonctionne

### Qu'est-ce que Prisma ?

Prisma est un **ORM** (Object-Relational Mapping). Il traduit les operations TypeScript en requetes SQL.

Au lieu d'ecrire :

```sql
SELECT * FROM users WHERE household_id = '123';
```

On ecrit :

```typescript
await prisma.user.findMany({ where: { householdId: '123' } });
```

Prisma genere un **client TypeScript** a partir du schema de la base de donnees. Ce client est type — si tu essaies d'acceder a un champ qui n'existe pas, TypeScript te previent avant meme de lancer le code.

### Le schema Prisma

Le schema vit dans `packages/db/prisma/schema/`. Il definit la structure de la base de donnees :

```prisma
model User {
  id          String   @id @default(uuid())
  email       String   @unique
  name        String
  householdId String   @map("household_id")
  createdAt   DateTime @default(now()) @map("created_at")

  @@map("users")  // nom de la table dans PostgreSQL
}
```

### Les commandes Prisma

| Commande         | Quand l'utiliser                                                       |
| ---------------- | ---------------------------------------------------------------------- |
| `db:generate`    | Apres avoir modifie le schema — regenere le client TypeScript          |
| `db:migrate:dev` | En dev — cree un fichier de migration SQL + l'applique sur la DB       |
| `db:push`        | En dev rapide — applique le schema directement sans creer de migration |
| `db:studio`      | Ouvre une interface web pour voir/editer les donnees                   |

### `prisma generate` vs `prisma migrate`

- **`prisma generate`** ne touche PAS a la base de donnees. Il lit le schema `.prisma` et genere du code TypeScript (le client Prisma). C'est pour ca que le Dockerfile peut le lancer avec une `DATABASE_URL` dummy — il n'a pas besoin de se connecter.
- **`prisma migrate dev`** modifie la base de donnees. Il compare le schema actuel avec la DB, genere un fichier SQL de migration, et l'execute.

---

## Le health check — Exemple complet d'une requete

Pour concretiser tout ce qui precede, suivons le parcours complet d'un health check :

### Via REST (utilise par Railway pour le monitoring)

```
curl http://localhost:4000/health
```

1. La requete HTTP arrive sur le serveur NestJS
2. NestJS la route vers `HealthController` (match `GET /health`)
3. Le controller appelle `TerminusModule.check()` avec les indicateurs configures
4. `PrismaHealthIndicator` execute `SELECT 1` sur PostgreSQL
5. Si la DB repond → `{ "status": "ok", "info": { "database": { "status": "up" } } }`
6. Si la DB ne repond pas → `{ "status": "error", "error": { "database": { "status": "down" } } }`

### Via GraphQL (disponible pour les clients)

```graphql
query {
  health {
    status
    database
  }
}
```

1. La requete HTTP POST arrive sur `/graphql`
2. Apollo Server parse la query et identifie qu'il faut appeler `HealthResolver.health()`
3. Le resolver verifie la sante de la DB
4. Retourne `{ "data": { "health": { "status": "ok", "database": "up" } } }`

---

## Variables d'environnement de l'API

| Variable             | Dev local               | Deploye (Railway)                      | Role                                         |
| -------------------- | ----------------------- | -------------------------------------- | -------------------------------------------- |
| `PORT`               | `4000`                  | `8080`                                 | Port d'ecoute du serveur HTTP                |
| `NODE_ENV`           | `development`           | `production`                           | Active les logs colores en dev, JSON en prod |
| `DATABASE_URL`       | `localhost:5432/...`    | Supabase connection string             | URL de connexion PostgreSQL                  |
| `REDIS_URL`          | `localhost:6379`        | Upstash connection string              | URL de connexion Redis (cache, sessions)     |
| `BETTER_AUTH_SECRET` | (genere localement)     | (different par env, dans Doppler)      | Cle de signature pour les tokens d'auth      |
| `BETTER_AUTH_URL`    | `http://localhost:4000` | `https://dev-api-familyhub.tloyan.com` | URL publique de l'API (pour les callbacks)   |

### Comment elles arrivent dans l'app

```
En local :
  Doppler (config dev_tloyan) ──→ doppler run ──→ process.env ──→ NestJS
  ou
  fichier .env ──→ process.env ──→ NestJS

Sur Railway :
  Doppler (config dev ou prd) ──sync natif──→ Railway env vars ──→ container Docker ──→ process.env ──→ NestJS
```

---

## Le Dockerfile de production

En production, l'API ne tourne pas directement sur la machine — elle tourne dans un **container Docker**. Le `docker/api.Dockerfile` definit comment construire ce container.

### Pourquoi Docker en production mais pas en dev ?

- **En dev** : l'API tourne nativement sur ta machine. Quand tu modifies un fichier, NestJS le detecte et recharge immediatement (hot-reload). Mettre l'API dans Docker en dev ajouterait de la latence sans benefice.
- **En production** : Docker garantit que l'API tourne dans un environnement identique partout. Pas de "ca marchait sur ma machine".

### Les 5 etapes du build

Le Dockerfile utilise un **multi-stage build** — chaque etape produit une image intermediaire dont seuls les artefacts utiles sont copies dans l'etape suivante. L'image finale est minimale.

```
Stage 1: base          Node.js 22 Alpine + pnpm
                            │
Stage 2: pruner         turbo prune @family-hub/api --docker
                        → extrait UNIQUEMENT l'API et ses dependances
                        → ignore web, mobile, et tout ce qui n'est pas necessaire
                            │
Stage 3: builder        pnpm install → compile TypeScript → produit dist/
                            │
Stage 4: prod-deps      pnpm install --prod → uniquement les deps de production
                        (pas de vitest, eslint, typescript, etc.)
                            │
Stage 5: runner         Image Alpine vierge + node_modules prod + dist/
                        → utilisateur non-root (securite)
                        → healthcheck wget sur /health
                        → CMD node dist/main
```

L'image finale ne contient ni le code source TypeScript, ni les outils de build, ni les devDependencies. Resultat : une image legere et securisee.
