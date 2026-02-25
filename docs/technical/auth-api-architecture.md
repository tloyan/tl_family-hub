# Auth API — Architecture & flux

Architecture d'authentification de l'API NestJS avec Better Auth. Couvre Google OAuth, Email OTP, gestion des sessions, rate limiting et integration avec l'app mobile Expo.

## Architecture globale

```
Client (web / mobile)
    │
    ▼
┌──────────────────────────────────────────────────┐
│  main.ts — middleware conditionnel               │
│                                                  │
│  if /api/auth/* → pas de body parsing            │
│  else           → express.json() + urlencoded()  │
└──────────────────────────────────────────────────┘
    │                              │
    ▼                              ▼
┌───────────────────┐   ┌────────────────────────┐
│  AuthController   │   │  GraphQL / Health /    │
│  @All('*path')    │   │  futurs endpoints REST │
│  → toNodeHandler  │   │  (body parse normal)   │
└───────────────────┘   └────────────────────────┘
    │
    ▼
┌───────────────────────────────┐
│  Better Auth                  │
│  ├─ Google OAuth              │
│  ├─ Email OTP (placeholder)   │
│  ├─ Sessions (cookies)        │
│  ├─ Rate limiting par route   │
│  ├─ Account linking           │
│  └─ Expo plugin (deep links)  │
└───────────────────────────────┘
    │
    ▼
  PostgreSQL (via PrismaService)
```

## Fichiers cles

| Fichier                                                    | Role                                                      |
| ---------------------------------------------------------- | --------------------------------------------------------- |
| `apps/api/src/lib/auth.ts`                                 | Factory Better Auth — toute la config                     |
| `apps/api/src/modules/auth/auth.service.ts`                | Service NestJS qui wrape l'instance                       |
| `apps/api/src/modules/auth/auth.controller.ts`             | Catch-all `/api/auth/*`                                   |
| `apps/api/src/modules/auth/auth.module.ts`                 | Module NestJS                                             |
| `apps/api/src/common/guards/auth.guard.ts`                 | Guard reutilisable `BetterAuthGuard`                      |
| `apps/api/src/common/decorators/current-user.decorator.ts` | Decorateur `@CurrentUser()`                               |
| `apps/api/src/common/utils/get-request.ts`                 | Helper partage pour extraire `Request` du contexte NestJS |
| `apps/api/src/main.ts`                                     | Body parser conditionnel                                  |

## Probleme central : body parser vs raw stream

Better Auth et NestJS gerent les requetes HTTP differemment :

```
NestJS (par defaut) :
  Request → express.json() consomme le stream → req.body disponible

Better Auth (toNodeHandler) :
  Request → lit le raw stream lui-meme → parse le body en interne
```

Si `express.json()` s'execute avant `toNodeHandler`, le stream est deja consomme. Better Auth recoit un body vide et toutes les requetes POST auth echouent silencieusement.

### Solution : body parser conditionnel dans main.ts

```typescript
// bodyParser: false → desactive le parsing global de NestJS
const app = await NestFactory.create<NestExpressApplication>(AppModule, {
  bodyParser: false,
});

// Middleware custom : skip parsing pour /api/auth, parse normalement pour le reste
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/auth')) {
    next(); // stream brut → Better Auth
    return;
  }
  jsonParser(req, res, (err) => {
    // body parse → GraphQL, REST, etc.
    if (err) {
      next(err);
      return;
    }
    urlencodedParser(req, res, next);
  });
});
```

Resultat : GraphQL, health checks et futurs endpoints REST continuent de fonctionner normalement.

## Factory Better Auth — lib/auth.ts

Fonction synchrone `createAuth(prisma)` appelee une seule fois au demarrage dans le constructeur de `AuthService`.

### Pourquoi une factory ?

NestJS utilise l'injection de dependances. `PrismaService` est fourni par le container NestJS — impossible d'y acceder dans un fichier statique. La factory recoit Prisma en parametre depuis le service NestJS.

### Configuration

| Parametre                   | Valeur                                              | Explication                                                                                        |
| --------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `basePath`                  | `/api/auth`                                         | Prefix de toutes les routes auth                                                                   |
| `baseURL`                   | `BETTER_AUTH_URL`                                   | URL publique du serveur (callbacks OAuth)                                                          |
| `secret`                    | `BETTER_AUTH_SECRET`                                | Cle de signature sessions/cookies                                                                  |
| `database`                  | `prismaAdapter(prisma, { provider: 'postgresql' })` | Reutilise le PrismaService existant (pas de 2e connexion DB)                                       |
| `socialProviders.google`    | env vars                                            | Active Google OAuth                                                                                |
| `account.accountLinking`    | `trustedProviders: ['google']`                      | Lie automatiquement les comptes si meme email (ex: inscription email puis login Google)            |
| `session.expiresIn`         | 2592000 (30 jours)                                  | Duree de vie de la session                                                                         |
| `session.updateAge`         | 86400 (1 jour)                                      | Rafraichit la session en DB toutes les 24h (reduit les writes)                                     |
| `advanced.useSecureCookies` | `true` en prod                                      | Flag `Secure` sur les cookies en production (HTTPS only)                                           |
| `trustedOrigins`            | `['familyhub://', ...TRUSTED_ORIGINS]`              | Autorise les redirects vers l'app mobile (deep linking Expo) + origines additionnelles via env var |

### Plugins

| Plugin     | Config                | Role                                                                                                                   |
| ---------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `emailOTP` | 6 digits, 600s expiry | Genere des codes OTP. `sendVerificationOTP` est un placeholder `console.log` — l'integration Resend sera faite dans T3 |
| `expo()`   | —                     | Adapte le flow auth pour les apps mobiles Expo (gestion cookies cross-platform)                                        |

### Rate limiting

| Route                              | Limite  | Fenetre         | Raison                  |
| ---------------------------------- | ------- | --------------- | ----------------------- |
| Global                             | 100 req | 60s             | Protection generale     |
| `/sign-in/social`                  | 5 req   | 15 min (900s)   | Anti-abus OAuth         |
| `/email-otp/send-verification-otp` | 3 req   | 1 heure (3600s) | Limite l'envoi d'emails |
| `/email-otp/verify-email`          | 5 req   | 15 min (900s)   | Anti-brute-force OTP    |

Le rate limiting est gere par Better Auth (pas `@nestjs/throttler`) parce que les routes auth passent par `toNodeHandler` et contournent les guards NestJS. Les limites sont per-IP (limitation Better Auth — le per-email necessiterait un `customStorage`).

## AuthService — injection de dependances

```
NestJS DI container
    │
    ├─ PrismaService (global)
    │       │
    │       ▼
    ├─ AuthService
    │    constructor(prisma) ← injection → createAuth(prisma) → stocke _auth
    │    get auth() → retourne l'instance
    │       │
    │       ▼
    └─ AuthController
         constructor(authService) ← injection → toNodeHandler(authService.auth) → stocke handler
         @All('*path') → handler(req, res)
```

`createAuth()` est synchrone — l'initialisation se fait directement dans les constructeurs, sans besoin de `onModuleInit()`.

## AuthController — catch-all

```
Client → POST /api/auth/email-otp/send-verification-otp
      → NestJS route matching (@Controller('api/auth') + @All('*path'))
      → AuthController.handleAuth(req, res)
      → toNodeHandler(auth)(req, res)
      → Better Auth gere tout (validation, envoi OTP, response)
```

- `@All('*path')` — match toutes les methodes HTTP et tous les sous-chemins
- `@Res() res` — mode passthrough : NestJS ne touche pas a la reponse, Better Auth ecrit directement dans le stream
- `toNodeHandler()` — convertit le handler interne Better Auth en handler Node.js `(IncomingMessage, ServerResponse) => Promise<void>`

## Helper getRequestFromContext

La logique d'extraction de `Request` depuis un `ExecutionContext` NestJS (HTTP ou GraphQL) est factorisee dans `common/utils/get-request.ts`. Utilisee par le guard et le decorateur.

```typescript
function getRequestFromContext(context: ExecutionContext): Request {
  if (context.getType() === 'http') {
    return context.switchToHttp().getRequest<Request>();
  }
  const gqlContext = GqlExecutionContext.create(context);
  return gqlContext.getContext<{ req: Request }>().req;
}
```

## Guard & decorateur (pour les futurs stories)

### BetterAuthGuard

```
Requete protegee → BetterAuthGuard.canActivate()
    │
    ├─ getRequestFromContext(context) → Request
    ├─ auth.api.getSession({ headers: fromNodeHeaders(req.headers) })
    │
    ├─ Session invalide → UnauthorizedException (code: AUTH_SESSION_EXPIRED)
    └─ Session valide → attache session + user sur req → return true
```

`fromNodeHeaders()` convertit les `IncomingHttpHeaders` Node.js en `Headers` Web API (format attendu par Better Auth).

### @CurrentUser()

Decorateur de parametre qui extrait le `user` attache par le guard :

```typescript
// Utilisation future (stories 1.3+)
@UseGuards(BetterAuthGuard)
@Query(() => Household)
myHousehold(@CurrentUser() user: User) {
  // user est deja valide et type
}
```

Utilise `getRequestFromContext()` en interne pour supporter les deux contextes NestJS : HTTP (`req`) et GraphQL (`ctx.req`).

## Variables d'environnement

| Variable               | Obligatoire | Description                                                          |
| ---------------------- | ----------- | -------------------------------------------------------------------- |
| `BETTER_AUTH_SECRET`   | oui         | Cle de signature (min 32 chars, `openssl rand -base64 32`)           |
| `BETTER_AUTH_URL`      | oui         | URL publique de l'API (`http://localhost:4000` en dev)               |
| `GOOGLE_CLIENT_ID`     | oui         | OAuth Client ID (Google Cloud Console)                               |
| `GOOGLE_CLIENT_SECRET` | oui         | OAuth Client Secret                                                  |
| `TRUSTED_ORIGINS`      | non         | Origines additionnelles pour les redirections auth (comma-separated) |
| `NEXT_PUBLIC_API_URL`  | non         | URL API pour le client web (auth redirects)                          |
| `EXPO_PUBLIC_API_URL`  | non         | URL API pour l'app mobile (auth redirects)                           |

> **Note :** `RESEND_API_KEY` sera ajoute dans T3 quand l'integration email sera implementee. En attendant, les OTP sont logges en console.

## Tester en local

```bash
# Demarrer l'API (avec Doppler pour les secrets)
doppler run -- pnpm dev --filter @family-hub/api

# Verifier que Better Auth repond
curl http://localhost:4000/api/auth/ok
# → 200 { "status": "ok" }

# Verifier que GraphQL marche toujours
curl -X POST http://localhost:4000/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ health { status } }"}'

# Verifier les health checks
curl http://localhost:4000/health
```

## Risques connus

| Risque                                                                                             | Mitigation                                                                                      |
| -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| CJS/ESM — Better Auth est ESM-only, NestJS compile en CJS                                          | Node.js 22+ supporte `require()` de modules ESM synchrones. Les imports statiques fonctionnent. |
| Body parser — le middleware conditionnel doit correctement distinguer les routes                   | Test : verifier que `/api/auth` POST fonctionne ET que `/graphql` POST fonctionne               |
| Express v5 wildcard — `@All('*path')` peut necessiter `@All('{*path}')` selon la version NestJS 11 | A verifier si erreur 404 sur les sous-routes auth                                               |
