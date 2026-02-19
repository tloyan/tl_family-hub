# Auth API — Deep Dive Implementation

Guide detaille de l'implementation de l'authentification dans l'API NestJS avec Better Auth. Ce document explique chaque fichier ligne par ligne, chaque decision d'architecture, et les interactions entre les composants.

Pour une vue d'ensemble rapide, voir [auth-api-architecture.md](./auth-api-architecture.md).

---

## Table des matieres

1. [Le probleme a resoudre](#1-le-probleme-a-resoudre)
2. [Decisions d'architecture](#2-decisions-darchitecture)
3. [lib/auth.ts — Factory Better Auth](#3-libauthts--factory-better-auth)
4. [auth.service.ts — Service NestJS](#4-authservicets--service-nestjs)
5. [auth.controller.ts — Catch-all controller](#5-authcontrollerts--catch-all-controller)
6. [auth.module.ts — Module NestJS](#6-authmodulets--module-nestjs)
7. [main.ts — Body parser conditionnel](#7-maints--body-parser-conditionnel)
8. [app.module.ts — Registration](#8-appmodulets--registration)
9. [get-request.ts — Helper partage](#9-get-requestts--helper-partage)
10. [auth.guard.ts — Guard d'authentification](#10-authguardts--guard-dauthentification)
11. [current-user.decorator.ts — Decorateur @CurrentUser()](#11-current-userdecoratortsdecorateurcurrentuser)
12. [.env.example — Variables d'environnement](#12-envexample--variables-denvironnement)
13. [Flux complets de bout en bout](#13-flux-complets-de-bout-en-bout)
14. [Compatibilite CJS/ESM](#14-compatibilite-cjsesm)
15. [Tester en local](#15-tester-en-local)
16. [Risques et mitigations](#16-risques-et-mitigations)

---

## 1. Le probleme a resoudre

On veut de l'authentification (Google OAuth + Email OTP) pour l'app. On utilise **Better Auth**, une librairie TypeScript framework-agnostic. Le defi : Better Auth a sa propre facon de gerer les requetes HTTP (il lit le body brut du request stream), mais NestJS a la sienne (il parse le body automatiquement avec `express.json()` avant qu'il arrive aux controllers). Ces deux approches sont incompatibles — il faut les faire cohabiter.

Concretement :

- **Better Auth** expose un handler `toNodeHandler(auth)` qui prend un `(IncomingMessage, ServerResponse)` standard Node.js. Il lit le body en consommant le stream `req` lui-meme.
- **NestJS** utilise Express sous le capot. Par defaut, `express.json()` est active globalement : il consomme le stream `req` et met le resultat dans `req.body`. Quand Better Auth essaie ensuite de lire le stream, il est vide.
- **Les routes auth contournent le pipeline NestJS** : pas de guards, pas de pipes, pas d'interceptors. Seul le rate limiting interne de Better Auth s'applique.

---

## 2. Decisions d'architecture

### 2.1 Pourquoi une factory function et pas un export direct ?

Better Auth a besoin de Prisma pour acceder a la DB. Dans NestJS, `PrismaService` est fourni par le container d'injection de dependances (DI) — on ne peut pas y acceder dans un simple fichier qui fait `export const auth = betterAuth(...)`. Il faut un service NestJS qui recoit Prisma par DI, puis appelle une factory function avec ce Prisma.

Le spec demandait `apps/api/src/lib/auth.ts`. On respecte ce chemin en y mettant la factory `createAuth(prisma)`, appelee depuis le constructeur de `AuthService`.

### 2.2 Pourquoi desactiver le body parser global ?

C'est le point le plus critique de l'integration. Si on laisse le body parser global actif, **toutes les requetes POST vers Better Auth echouent silencieusement** car le stream est deja consomme. La solution est de desactiver le parser global et d'en creer un conditionnel qui skip les routes `/api/auth`.

### 2.3 Pourquoi le rate limiting de Better Auth et pas @nestjs/throttler ?

Les routes auth passent par `toNodeHandler()` qui ecrit directement la reponse. Les guards NestJS (dont `@nestjs/throttler`) ne s'executent jamais pour ces routes puisque NestJS est en mode passthrough (`@Res()`). Better Auth a son propre systeme de rate limiting avec granularite par endpoint — c'est la bonne couche pour ca.

### 2.4 Pourquoi le guard n'est PAS applique globalement ?

Le guard `BetterAuthGuard` est cree en avance pour les stories 1.3+. Le mettre global maintenant casserait les endpoints publics (health, auth eux-memes). Il sera utilise avec `@UseGuards(BetterAuthGuard)` sur les resolvers/controllers qui en ont besoin.

### 2.5 Pourquoi factoriser `getRequestFromContext` ?

La logique d'extraction de `Request` depuis un `ExecutionContext` NestJS (HTTP vs GraphQL) etait dupliquee entre le guard et le decorateur `@CurrentUser()`. Factorisee dans `common/utils/get-request.ts` pour eviter la repetition.

---

## 3. lib/auth.ts — Factory Better Auth

**Fichier :** `apps/api/src/lib/auth.ts`

Ce fichier est le coeur de la configuration auth. C'est une fonction synchrone qui cree et retourne une instance Better Auth complete.

### Code complet annote

```typescript
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { emailOTP } from 'better-auth/plugins';
import { expo } from '@better-auth/expo';
import type { PrismaClient } from '@family-hub/db';
```

Imports statiques de Better Auth et ses plugins. On importe uniquement le **type** PrismaClient (pas la valeur). Ca evite une dependance runtime sur `@family-hub/db` dans ce fichier — le vrai client est injecte en parametre.

> **Note CJS/ESM :** Better Auth publie des `.mjs` (ESM). NestJS compile en CommonJS. Sur Node.js 22+, `require()` d'un module ESM synchrone fonctionne. Les imports statiques sont donc suffisants — pas besoin d'imports dynamiques `await import()`. Voir la [section dediee](#14-compatibilite-cjsesm) pour les details.

```typescript
export function createAuth(prisma: PrismaClient) {
```

Fonction synchrone avec un seul parametre : `prisma`, le client Prisma injecte par NestJS DI. Reutilise la connexion DB existante au lieu d'en creer une 2e.

```typescript
  return betterAuth({
    basePath: '/api/auth',
```

**`basePath`** — Prefix de toutes les routes auth. Better Auth genere automatiquement des routes comme `/api/auth/sign-in/social`, `/api/auth/email-otp/send-verification-otp`, etc. Ce prefix doit correspondre a celui du controller NestJS (`@Controller('api/auth')`).

```typescript
    baseURL: process.env['BETTER_AUTH_URL'],
```

**`baseURL`** — URL publique du serveur. Utilisee par Better Auth pour construire les URLs de callback OAuth. En dev c'est `http://localhost:4000`, en prod c'est l'URL Railway. Google redirige vers `{baseURL}/api/auth/callback/google` apres l'authentification.

```typescript
    secret: process.env['BETTER_AUTH_SECRET'],
```

**`secret`** — Cle de signature pour les sessions et cookies. Doit etre min 32 caracteres, generee avec `openssl rand -base64 32`. Si cette cle change, toutes les sessions existantes sont invalidees.

```typescript
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
```

**`database`** — Better Auth utilise l'adapteur Prisma pour stocker les sessions, comptes et verifications en DB. Le `prisma` passe ici est le meme `PrismaService` utilise partout dans l'app — une seule connexion DB partagee. `provider: 'postgresql'` indique a l'adapteur quel dialecte SQL utiliser.

```typescript
    socialProviders: {
      google: {
        clientId: process.env['GOOGLE_CLIENT_ID'] as string,
        clientSecret: process.env['GOOGLE_CLIENT_SECRET'] as string,
      },
    },
```

**`socialProviders.google`** — Active Google OAuth. Les credentials viennent de la Google Cloud Console (OAuth 2.0 Client ID de type "Web application"). Le `as string` est un cast TypeScript puisque `process.env['X']` retourne `string | undefined` mais Better Auth attend `string`.

```typescript
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ['google'],
      },
    },
```

**`accountLinking`** — Scenario : un utilisateur s'inscrit par email OTP (`user@gmail.com`), puis plus tard clique "Se connecter avec Google" (meme email). Sans account linking, Better Auth creerait un 2e compte. Avec `enabled: true` et `trustedProviders: ['google']`, les comptes sont lies automatiquement sans demander confirmation. Google est "trusted" car il verifie l'email de son cote — pas de risque qu'un attaquant utilise un email non verifie via OAuth.

```typescript
    session: {
      expiresIn: 2592000, // 30 days in seconds
      updateAge: 86400, // refresh session daily
    },
```

**`session.expiresIn`** — La session dure 30 jours. Passe ce delai, l'utilisateur doit se re-authentifier. Valeur en secondes (2592000 = 30 _ 24 _ 60 \* 60).

**`session.updateAge`** — Better Auth ne met a jour la session en DB qu'une fois par jour (86400s). Si l'utilisateur fait 100 requetes dans la meme heure, seule la premiere trigger un write DB pour mettre a jour le timestamp. Ca reduit la charge DB sans affecter la securite.

```typescript
    advanced: {
      useSecureCookies: process.env['NODE_ENV'] === 'production',
    },
```

**`useSecureCookies`** — En production, les cookies ont le flag `Secure` (envoyes uniquement via HTTPS). En dev (`NODE_ENV=development`), c'est desactive car on utilise `http://localhost`. Le flag `httpOnly` est toujours actif par defaut dans Better Auth (empeche le JS client de lire le cookie).

```typescript
    trustedOrigins: [
      'familyhub://',
      ...(process.env['TRUSTED_ORIGINS']?.split(',') ?? []),
    ],
```

**`trustedOrigins`** — Autorise Better Auth a rediriger vers le scheme `familyhub://` de l'app mobile Expo et vers les origines additionnelles definies par la variable d'environnement `TRUSTED_ORIGINS` (comma-separated). Sans `familyhub://`, les redirections OAuth vers l'app mobile seraient bloquees comme potentiellement malicieuses. La variable `TRUSTED_ORIGINS` permet d'ajouter des origines cross-domain sans modifier le code (ex: staging, preview deploys).

```typescript
    plugins: [
      emailOTP({
        otpLength: 6,
        expiresIn: 600, // 10 minutes
        sendVerificationOTP: async ({ email, otp }) => {
          console.log(`[OTP] ${email}: ${otp}`);
        },
      }),
```

**`emailOTP` plugin** — Active l'authentification par code OTP envoye par email.

- `otpLength: 6` — code a 6 chiffres (standard UX)
- `expiresIn: 600` — le code expire apres 10 minutes (en secondes)
- `sendVerificationOTP` — callback appelee par Better Auth quand il faut envoyer un code. Better Auth genere le code, on doit juste l'envoyer. **Pour l'instant c'est un placeholder `console.log`** — l'integration Resend + React Email sera implementee dans T3.

```typescript
      expo(),
    ],
```

**`expo()` plugin** — Adapte le flow auth pour les apps mobiles Expo. Les apps mobiles ne gerent pas les cookies comme les navigateurs. Ce plugin ajoute le support pour :

- Deep linking (callbacks OAuth via `familyhub://`)
- Gestion cross-platform des tokens de session
- Compatible avec `@better-auth/expo/client` cote mobile

```typescript
    rateLimit: {
      window: 60,
      max: 100,
      customRules: {
        '/sign-in/social': { window: 900, max: 5 },              // 5 attempts / 15 min
        '/email-otp/send-verification-otp': { window: 3600, max: 3 }, // 3 sends / 1 hour
        '/email-otp/verify-email': { window: 900, max: 5 },      // 5 attempts / 15 min
      },
    },
```

**Rate limiting** — Protection contre les abus, basee sur l'IP.

- **Global** : 100 requetes / 60 secondes par IP. Suffisant pour un usage normal, bloque les scripts qui spamment.
- **`/sign-in/social`** : 5 / 15 min. Empeche un attaquant de tester plein de tokens OAuth. Conforme au spec AC8.
- **`/email-otp/send-verification-otp`** : 3 / 1 heure. Critique car chaque requete (dans T3) coutera un email (facturation Resend) et pourrait spammer la boite de l'utilisateur. Conforme au spec AC8.
- **`/email-otp/verify-email`** : 5 / 15 min. Anti-brute-force — avec 6 digits il y a 1M de combinaisons, mais 5 essais/15min rend le brute-force impraticable.

> **Note :** Les limites sont per-IP (limitation Better Auth). Le per-email necessiterait un `customStorage` — accepte comme limitation pour le MVP.

Pourquoi Better Auth rate limiting et pas `@nestjs/throttler` ? Parce que les routes auth passent par `toNodeHandler` qui bypass completement le pipeline NestJS (guards, interceptors, etc.). Le rate limiting doit etre dans la meme couche que le handler.

```typescript
export type Auth = ReturnType<typeof createAuth>;
```

**Type `Auth`** — Exporte le type de retour de `createAuth()` pour l'utiliser dans le service et le guard sans coupler les autres fichiers aux details d'implementation de Better Auth. `createAuth` est synchrone, donc `ReturnType` suffit (pas besoin de `Awaited`).

---

## 4. auth.service.ts — Service NestJS

**Fichier :** `apps/api/src/modules/auth/auth.service.ts`

Ce service fait le pont entre NestJS (DI) et Better Auth (instance standalone).

### Code complet annote

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { type Auth, createAuth } from '../../lib/auth';
```

- `@Injectable()` — dit a NestJS que cette classe peut etre injectee dans d'autres classes
- `PrismaService` — import concret (pas juste le type) car c'est un token d'injection NestJS
- `type Auth` — import du type seulement (pas de valeur runtime), `createAuth` est la factory

```typescript
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private _auth: Auth;
```

- `private _auth: Auth` — l'instance Better Auth, initialisee dans le constructeur
- `AuthService.name` — passe au Logger pour que les logs soient prefixes avec `[AuthService]`

```typescript
  constructor(private readonly prisma: PrismaService) {
    this._auth = createAuth(this.prisma);
    this.logger.log('Better Auth initialized');
  }
```

NestJS injecte automatiquement `PrismaService` ici. C'est possible parce que `PrismaModule` est `@Global()` — il est accessible depuis n'importe quel module sans import explicite.

`createAuth()` est synchrone — pas besoin de `onModuleInit()`. L'instance est prete des que le constructeur termine.

```typescript
  get auth(): Auth {
    return this._auth;
  }
```

Getter qui expose l'instance Better Auth en lecture seule. Utilise par le controller (pour `toNodeHandler`) et par le guard (pour `auth.api.getSession()`).

---

## 5. auth.controller.ts — Catch-all controller

**Fichier :** `apps/api/src/modules/auth/auth.controller.ts`

Ce controller delegue **toutes** les requetes `/api/auth/*` a Better Auth. NestJS ne fait que le routing — Better Auth gere la logique et la reponse.

### Code complet annote

```typescript
import { All, Controller, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { toNodeHandler } from 'better-auth/node';
```

- `@All` — decorateur NestJS qui match toutes les methodes HTTP (GET, POST, PUT, DELETE, etc.)
- `@Req()`, `@Res()` — decorateurs pour injecter les objets Express dans le handler
- Types Express (`Request`, `Response`) imports comme `type` — pas de valeur runtime
- `toNodeHandler` — import statique depuis `better-auth/node`

```typescript
@Controller('api/auth')
export class AuthController {
  private handler!: ReturnType<typeof toNodeHandler>;
```

- `@Controller('api/auth')` — NestJS route les requetes commencant par `/api/auth` vers ce controller
- `handler` — la fonction `toNodeHandler(auth)`, stockee une seule fois au demarrage.

```typescript
  constructor(private readonly authService: AuthService) {
    this.handler = toNodeHandler(this.authService.auth);
  }
```

NestJS injecte `AuthService` (qui est dans le meme module). Le handler est cree directement dans le constructeur grace aux imports statiques.

`toNodeHandler(auth)` prend l'instance Better Auth et retourne un handler qui :

- Parse le body du stream brut
- Route vers le bon endpoint interne Better Auth
- Ecrit la reponse (JSON, redirect, set-cookie, etc.)
- Gere le rate limiting

```typescript
  @All('*path')
  async handleAuth(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.handler(req, res);
  }
```

**`@All('*path')`** — Match TOUTES les methodes HTTP et TOUS les sous-chemins. Combine avec `@Controller('api/auth')`, ca capture :

- `GET /api/auth/ok`
- `POST /api/auth/sign-in/social`
- `POST /api/auth/email-otp/send-verification-otp`
- `GET /api/auth/callback/google`
- etc.

Le `*path` est la syntaxe Express v5 pour les wildcards nommes (NestJS 11 utilise Express v5).

**`@Req() req`** — L'objet Express Request. C'est un `IncomingMessage` etendu — compatible avec le handler Node.js.

**`@Res() res`** — L'objet Express Response. **Crucial :** quand on utilise `@Res()`, NestJS passe en **mode passthrough**. Il ne tentera PAS d'envoyer une reponse lui-meme. C'est Better Auth qui ecrit directement dans le stream response (status, headers, body). Sans `@Res()`, NestJS essaierait de serializer la valeur de retour du handler comme reponse, ce qui entrerait en conflit avec Better Auth.

---

## 6. auth.module.ts — Module NestJS

**Fichier :** `apps/api/src/modules/auth/auth.module.ts`

### Code complet annote

```typescript
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
```

- **`controllers: [AuthController]`** — enregistre le catch-all controller. NestJS decouvre les routes `@All('*path')` et les ajoute au router Express.
- **`providers: [AuthService]`** — rend `AuthService` injectable dans ce module. NestJS cree une seule instance (singleton par defaut).
- **`exports: [AuthService]`** — rend `AuthService` disponible pour les modules qui importent `AuthModule`. C'est necessaire pour que `BetterAuthGuard` (dans `common/guards/`) puisse injecter `AuthService`. Sans cet export, le guard lancerait une erreur `Nest can't resolve dependencies of BetterAuthGuard`.

**Pourquoi pas d'`imports` ?** `PrismaModule` est `@Global()` — ses exports (`PrismaService`) sont disponibles partout sans import explicite. Si `PrismaModule` n'etait pas global, il faudrait `imports: [PrismaModule]` ici.

---

## 7. main.ts — Body parser conditionnel

**Fichier :** `apps/api/src/main.ts`

C'est le fichier le plus modifie et le plus critique pour l'integration.

### Le probleme en detail

```
Requete HTTP (ex: POST /api/auth/email-otp/send-verification-otp)
    │
    ▼
┌─────────────────────────────────┐
│ express.json()                  │
│ - lit le stream req             │
│ - parse le JSON                 │
│ - met le resultat dans req.body │
│ - le stream est maintenant VIDE │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ toNodeHandler(auth)             │
│ - essaie de lire le stream req  │
│ - le stream est VIDE            │
│ - body = undefined              │
│ - Better Auth ne recoit pas les │
│   donnees (email, otp, etc.)    │
│ - ECHEC SILENCIEUX              │
└─────────────────────────────────┘
```

Un stream Node.js ne peut etre lu qu'une seule fois. C'est un flux de donnees, pas un buffer. Une fois consomme par `express.json()`, il n'y a plus rien a lire.

### Code complet annote

```typescript
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import express from 'express';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
```

- `NestExpressApplication` — type generique pour que `app.use()` soit type correctement avec les types Express
- `express` — import du package Express directement pour acceder a `express.json()` et `express.urlencoded()`

```typescript
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  });
```

- **`bufferLogs: true`** — bufferise les logs pendant l'initialisation, puis les flush avec le logger Pino. Sans ca, les logs de demarrage NestJS utilisent `console.log` au lieu de Pino.
- **`bodyParser: false`** — **desactive completement** le body parser global de NestJS. Par defaut, NestJS ajoute `express.json()` et `express.urlencoded()` en middleware global. En le desactivant, AUCUNE route ne recoit de body parse — on le re-ajoute selectivement juste apres.

```typescript
app.useLogger(app.get(Logger));
```

Remplace le logger par defaut de NestJS par le logger Pino (logs structures, JSON en prod, pretty en dev).

```typescript
const jsonParser = express.json();
const urlencodedParser = express.urlencoded({ extended: true });
```

On cree les parsers une seule fois (pas a chaque requete). Ce sont des middleware Express standards :

- `express.json()` — parse les body `Content-Type: application/json`
- `express.urlencoded({ extended: true })` — parse les body `Content-Type: application/x-www-form-urlencoded` (formulaires HTML). `extended: true` utilise la librairie `qs` pour supporter les objets imbriques.

```typescript
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.originalUrl.startsWith('/api/auth')) {
      next();
      return;
    }
```

Pour les routes `/api/auth/*`, on appelle `next()` directement **sans parser le body**. Le stream reste intact pour que `toNodeHandler` puisse le lire.

`req.originalUrl` est utilise plutot que `req.url` car `req.url` peut etre modifie par des middlewares de rewrite, tandis que `req.originalUrl` garde toujours l'URL originale.

```typescript
    jsonParser(req, res, (err?: unknown) => {
      if (err) {
        next(err);
        return;
      }
      urlencodedParser(req, res, next);
    });
  });
```

Pour toutes les **autres** routes (GraphQL, health, futurs REST), on applique les deux parsers en serie :

1. `jsonParser` — si le Content-Type est JSON, parse le body
2. `urlencodedParser` — sinon, essaie urlencoded
3. `next()` — passe au handler NestJS

Le callback de `jsonParser` est un "next" custom qui chaine vers `urlencodedParser`. Si `jsonParser` echoue (ex: JSON malformed), on passe l'erreur a NestJS qui retournera un 400.

### Impact

| Route                    | Body parse ?                  | Qui gere la reponse ?           |
| ------------------------ | ----------------------------- | ------------------------------- |
| `POST /api/auth/*`       | Non (stream brut)             | Better Auth via `toNodeHandler` |
| `POST /graphql`          | Oui (`req.body` disponible)   | Apollo Server via NestJS        |
| `GET /health`            | Oui (mais pas de body en GET) | HealthController via NestJS     |
| Tout futur endpoint REST | Oui                           | NestJS normalement              |

---

## 8. app.module.ts — Registration

**Fichier :** `apps/api/src/app.module.ts`

Changement minimal : ajout de `AuthModule` dans les imports.

```typescript
imports: [
  LoggerModule.forRoot({ ... }),
  GraphQLModule.forRoot<ApolloDriverConfig>({ ... }),
  PrismaModule,
  AuthModule,     // ← ajoute
  HealthModule,
],
```

NestJS decouvre automatiquement tout ce qui est declare dans `AuthModule` : le controller (routes), le service (DI), les exports (guard). L'ordre des imports n'a pas d'importance pour NestJS — il resout les dependances par le graphe de DI.

---

## 9. get-request.ts — Helper partage

**Fichier :** `apps/api/src/common/utils/get-request.ts`

### Code complet annote

```typescript
import type { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { Request } from 'express';

export function getRequestFromContext(context: ExecutionContext): Request {
  if (context.getType() === 'http') {
    return context.switchToHttp().getRequest<Request>();
  }
  const gqlContext = GqlExecutionContext.create(context);
  return gqlContext.getContext<{ req: Request }>().req;
}
```

**Pourquoi ce helper ?** NestJS a des contextes d'execution differents :

- **HTTP** (controllers REST) : la requete est dans `context.switchToHttp().getRequest()`
- **GraphQL** (resolvers) : la requete est dans `GqlExecutionContext.create(context).getContext().req`

Cette logique etait dupliquee dans le guard et le decorateur `@CurrentUser()`. Factorisee ici pour eviter la repetition.

---

## 10. auth.guard.ts — Guard d'authentification

**Fichier :** `apps/api/src/common/guards/auth.guard.ts`

Ce guard valide qu'une requete a une session Better Auth valide. Il est **reutilisable** sur n'importe quel controller/resolver.

### Code complet annote

```typescript
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';
import type { Request } from 'express';
import { AuthService } from '../../modules/auth/auth.service';
import { getRequestFromContext } from '../utils/get-request';
```

- `CanActivate` — interface NestJS pour les guards. `canActivate()` retourne `true` (requete autorisee) ou throw (requete bloquee).
- `fromNodeHeaders` — import statique, convertit les headers Node.js en headers Web API
- `getRequestFromContext` — helper partage pour extraire `Request` du contexte
- `AuthService` — injecte pour acceder a `auth.api.getSession()`

```typescript
@Injectable()
export class BetterAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
```

Le guard est `@Injectable()` donc il participe au systeme DI. Il recoit `AuthService` par injection. Pour que ca fonctionne, le module qui utilise le guard doit importer `AuthModule` (qui exporte `AuthService`).

```typescript
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = getRequestFromContext(context);
```

Utilise le helper partage pour extraire la `Request`, que ce soit un contexte HTTP ou GraphQL.

```typescript
const session = await this.authService.auth.api.getSession({
  headers: fromNodeHeaders(req.headers),
});
```

`fromNodeHeaders` convertit les headers Node.js (`IncomingHttpHeaders`, un objet `{ [key: string]: string | string[] }`) en headers Web API (`Headers`, l'objet standard du Fetch API). Better Auth utilise l'API Web standard en interne.

`auth.api.getSession()` est une methode server-side de Better Auth. Elle :

1. Lit le cookie de session depuis les headers
2. Cherche la session en DB via Prisma
3. Verifie que la session n'est pas expiree
4. Retourne `{ session, user }` ou `null`

```typescript
if (!session) {
  throw new UnauthorizedException({
    message: 'Invalid or expired session',
    code: 'AUTH_SESSION_EXPIRED',
  });
}
```

Si pas de session (cookie absent, session expiree, token invalide), NestJS retourne un 401 avec le code `AUTH_SESSION_EXPIRED`. Ce code permet au client de distinguer "pas authentifie" d'autres erreurs et de rediriger vers le login.

```typescript
    (req as Request & { session: typeof session.session; user: typeof session.user }).session =
      session.session;
    (req as Request & { user: typeof session.user }).user = session.user;

    return true;
  }
```

On attache `session` et `user` sur l'objet `req`. Le cast `as Request & { ... }` est necessaire parce que le type Express `Request` ne connait pas ces proprietes. C'est le mecanisme standard NestJS — le decorateur `@CurrentUser()` viendra les lire ensuite.

`return true` autorise la requete a continuer vers le handler.

---

## 11. current-user.decorator.ts — Decorateur @CurrentUser()

**Fichier :** `apps/api/src/common/decorators/current-user.decorator.ts`

### Code complet annote

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { getRequestFromContext } from '../utils/get-request';

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const req = getRequestFromContext(context);
  return (req as Request & { user: unknown }).user;
});
```

`createParamDecorator` cree un decorateur de parametre NestJS. `_data` serait un argument optionnel (ex: `@CurrentUser('email')` passerait `'email'` dans `_data`), mais on ne l'utilise pas ici.

Utilise `getRequestFromContext()` pour supporter les deux contextes NestJS (HTTP et GraphQL). Retourne `req.user` qui a ete attache par `BetterAuthGuard`.

**Utilisation typique (future) :**

```typescript
@Resolver(() => Household)
export class HouseholdResolver {
  @UseGuards(BetterAuthGuard) // 1. valide la session, attache user
  @Query(() => Household)
  myHousehold(@CurrentUser() user) {
    // 2. extrait user de req
    return this.householdService.findByUser(user.id);
  }
}
```

Le guard s'execute AVANT le resolver. Il valide la session et attache `user` sur `req`. Le decorateur `@CurrentUser()` extrait ensuite ce `user` et le passe comme parametre au resolver. Sans le guard, `req.user` serait `undefined`.

---

## 12. .env.example — Variables d'environnement

Variables liees a l'auth dans T1 :

| Variable                                    | Valeur exemple                | Pourquoi                                                                                                                                       |
| ------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `TRUSTED_ORIGINS`                           | `https://staging.example.com` | Optionnel, comma-separated. Origines additionnelles pour les redirections auth. `familyhub://` est toujours inclus par defaut.                 |
| `NEXT_PUBLIC_API_URL=http://localhost:4000` | URL de base de l'API          | Utilisee par le client web (Next.js) pour les redirections auth (OAuth callback, liens de verification)                                        |
| `EXPO_PUBLIC_API_URL=http://localhost:4000` | URL de base de l'API          | Utilisee par le client mobile (Expo) pour les memes raisons. Prefixe `EXPO_PUBLIC_` requis par Expo pour exposer la variable au bundle client. |

> **Note :** `RESEND_API_KEY` et `SENDER_EMAIL` seront ajoutes dans T3 quand l'integration email sera implementee.

---

## 13. Flux complets de bout en bout

### 13.1 Flux Google OAuth (web)

```
1. User clique "Se connecter avec Google"
   │
2. Client web → GET /api/auth/sign-in/social?provider=google&callbackURL=/dashboard
   │
3. NestJS route matching
   ├─ main.ts : /api/auth → skip body parser
   └─ AuthController @All('*path') → toNodeHandler
   │
4. Better Auth
   ├─ Rate limit check (5 req/15min sur /sign-in/social)
   ├─ Genere un state token (anti-CSRF)
   └─ Redirect 302 → https://accounts.google.com/o/oauth2/auth?...
   │
5. User se connecte sur Google, autorise l'app
   │
6. Google → GET /api/auth/callback/google?code=xxx&state=yyy
   │
7. Better Auth
   ├─ Verifie le state token
   ├─ Echange le code contre un access token (serveur → Google)
   ├─ Recupere le profil Google (email, nom, avatar)
   ├─ Cherche un user existant avec cet email en DB
   │   ├─ Existe (email OTP) → account linking (lie le compte Google)
   │   └─ N'existe pas → cree user + account
   ├─ Cree une session en DB (expire dans 30 jours)
   ├─ Set cookie `better-auth.session_token` (httpOnly, secure en prod)
   └─ Redirect 302 → /dashboard (callbackURL)
   │
8. Client web recoit le cookie, les requetes suivantes sont authentifiees
```

### 13.2 Flux Email OTP (mobile)

```
1. User entre son email dans l'app mobile
   │
2. Client Expo → POST /api/auth/email-otp/send-verification-otp
   Body: { "email": "user@example.com", "type": "sign-in" }
   │
3. NestJS route matching
   ├─ main.ts : /api/auth → skip body parser (stream brut)
   └─ AuthController → toNodeHandler
   │
4. Better Auth
   ├─ Rate limit check (3 req/1h sur /email-otp/send-verification-otp)
   ├─ Genere un code a 6 chiffres
   ├─ Stocke le code en DB (hash, expire dans 10 min)
   └─ Appelle sendVerificationOTP callback
   │
5. [T1] console.log affiche le code en console
   [T3] Resend enverra l'email avec le code
   │
6. User recoit le code (en dev: depuis les logs), entre le code dans l'app
   │
7. Client Expo → POST /api/auth/email-otp/verify-email
   Body: { "email": "user@example.com", "otp": "123456" }
   │
8. Better Auth
   ├─ Rate limit check (5 req/15min sur /email-otp/verify-email)
   ├─ Verifie le code (compare hash, check expiration)
   │   ├─ Invalide → 400 error
   │   └─ Valide → continue
   ├─ Cherche/cree le user en DB
   ├─ Cree une session
   └─ Retourne session token dans la reponse
   │
9. Expo client stocke le token (SecureStore) via le plugin expo
```

### 13.3 Flux requete authentifiee (future)

```
1. Client → POST /graphql
   Headers: Cookie: better-auth.session_token=xxx
   Body: { "query": "{ myHousehold { name } }" }
   │
2. main.ts : /graphql → body parse normal (express.json())
   │
3. Apollo Server → HouseholdResolver.myHousehold()
   │
4. @UseGuards(BetterAuthGuard) s'execute AVANT le resolver
   ├─ BetterAuthGuard.canActivate()
   ├─ getRequestFromContext(context) → Request
   ├─ fromNodeHeaders(req.headers) → Headers Web API
   ├─ auth.api.getSession({ headers })
   │   ├─ Lit le cookie
   │   ├─ Cherche la session en DB
   │   ├─ Session expiree ? → UnauthorizedException
   │   └─ Session valide → { session, user }
   ├─ req.user = user
   ├─ req.session = session
   └─ return true (autorise)
   │
5. @CurrentUser() extrait req.user via getRequestFromContext()
   │
6. HouseholdResolver.myHousehold(user) s'execute
   └─ Retourne les donnees du household
```

---

## 14. Compatibilite CJS/ESM

### Le probleme

|                   | NestJS (notre code)             | Better Auth (dependance)   |
| ----------------- | ------------------------------- | -------------------------- |
| **Format module** | CommonJS (`require()`)          | ESM-only (`.mjs`)          |
| **Pourquoi**      | tsconfig `"module": "commonjs"` | Package publie sans `.cjs` |

TypeScript transforme notre code source :

- `import { betterAuth } from 'better-auth'` → `const { betterAuth } = require('better-auth')`

A runtime, Node.js execute `require('better-auth')` qui pointe vers un `.mjs`.

### Pourquoi ca marche

**Node.js 22+** supporte `require()` de modules ESM synchrones (sans top-level `await`). Puisque le projet utilise Node.js 25, `require('better-auth')` charge le `.mjs` et retourne les exports correctement.

On utilise des **imports statiques** dans le code source (`import { betterAuth } from 'better-auth'`). TypeScript les transforme en `require()`, et Node.js 25 les gere nativement. Pas besoin d'imports dynamiques `await import()`.

### Verification

```bash
# Ces commandes prouvent que require() des modules ESM fonctionne
node -e "require('better-auth'); console.log('OK')"
node -e "require('better-auth/node'); console.log('OK')"
node -e "require('better-auth/adapters/prisma'); console.log('OK')"
node -e "require('better-auth/plugins'); console.log('OK')"
node -e "require('@better-auth/expo'); console.log('OK')"
```

---

## 15. Tester en local

### Prerequis

L'erreur `PrismaConfigEnvError: Cannot resolve environment variable: DATABASE_URL` vient de `@family-hub/db:build` (Prisma generate), pas de notre code auth. C'est le pipeline Turbo qui build les dependances avant l'API.

### Option A — Doppler (recommande)

```bash
doppler run -- pnpm build --filter @family-hub/api
doppler run -- pnpm dev --filter @family-hub/api
```

### Option B — Fichier .env

```bash
cp .env.example .env
# Remplir les valeurs dans .env
pnpm build --filter @family-hub/api
pnpm dev --filter @family-hub/api
```

### Option C — Validation rapide sans DB

```bash
# Typecheck seul (ne depend pas de DATABASE_URL si le client Prisma est deja genere)
cd apps/api && npx tsc --noEmit

# Build seul (idem)
cd apps/api && npx nest build

# Lint
cd apps/api && pnpm lint
```

### Endpoints a tester

```bash
# Better Auth status
curl http://localhost:4000/api/auth/ok
# Attendu : 200 { "status": "ok" }

# GraphQL (body parser fonctionne)
curl -X POST http://localhost:4000/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ health { status } }"}'
# Attendu : 200 { "data": { "health": { "status": "ok" } } }

# Health check REST
curl http://localhost:4000/health
# Attendu : 200 { "status": "ok", ... }
```

---

## 16. Risques et mitigations

| Risque                    | Detail                                                                 | Mitigation                                                                               | Comment detecter                                                   |
| ------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **CJS/ESM**               | Better Auth est ESM-only, NestJS compile en CJS                        | Node.js 22+ supporte `require()` de modules ESM synchrones. Imports statiques suffisent. | L'app crashe au demarrage avec `ERR_REQUIRE_ESM`                   |
| **Body parser**           | Le middleware conditionnel doit skip `/api/auth` mais parser le reste  | Test : `POST /api/auth/...` fonctionne ET `POST /graphql` fonctionne                     | Les POST auth echouent silencieusement (body vide)                 |
| **Express v5 wildcard**   | `@All('*path')` syntaxe Express v5 pour NestJS 11                      | Si ca ne matche pas, essayer `@All('{*path}')`                                           | 404 sur les sous-routes auth (ex: `/api/auth/sign-in/social`)      |
| **Session cookie en dev** | `useSecureCookies: false` en dev car HTTP                              | Jamais deployer avec `NODE_ENV=development`                                              | Cookies non envoyes si HTTPS attendu mais HTTP utilise             |
| **Account linking**       | Un attaquant pourrait creer un compte Google avec l'email de quelqu'un | `trustedProviders: ['google']` — Google verifie les emails                               | Theoriquement impossible car Google requiert la verification email |
| **Rate limit per-IP**     | Les limites sont per-IP, pas per-email (limitation Better Auth)        | Acceptable pour le MVP. Le per-email necessiterait un `customStorage`.                   | Un attaquant avec plusieurs IPs pourrait contourner                |
