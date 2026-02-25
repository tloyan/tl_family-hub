# Auth API — Explication fichier par fichier

Guide detaille de chaque fichier implemente pour l'authentification Better Auth dans l'API NestJS. Pour chaque fichier : ce qu'il fait (quoi), pourquoi il existe (pourquoi), et comment il fonctionne (comment).

---

## 1. `apps/api/src/lib/auth.ts` — La factory Better Auth

**Quoi :** Une fonction synchrone `createAuth(prisma)` qui retourne une instance Better Auth configuree.

**Pourquoi une factory et pas un export direct ?** Parce que NestJS utilise l'injection de dependances (DI). Le `PrismaService` est fourni par le container NestJS — on ne peut pas y acceder dans un fichier statique. Donc on cree une factory appelee depuis le service NestJS qui, lui, recoit Prisma par DI.

**Ce que configure la factory :**

| Config                                         | Valeur                                              | Pourquoi                                                                                                                                                                            |
| ---------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `basePath`                                     | `/api/auth`                                         | Toutes les routes auth sont prefixees (ex: `/api/auth/sign-in/social`). Doit correspondre au `@Controller('api/auth')`                                                              |
| `baseURL`                                      | `BETTER_AUTH_URL`                                   | URL publique du serveur, utilisee pour construire les callbacks OAuth. Google redirige vers `{baseURL}/api/auth/callback/google`                                                    |
| `secret`                                       | `BETTER_AUTH_SECRET`                                | Cle de signature pour les sessions/cookies. Si elle change, toutes les sessions existantes sont invalidees                                                                          |
| `database`                                     | `prismaAdapter(prisma, { provider: 'postgresql' })` | Reutilise le client Prisma existant au lieu de creer une 2e connexion DB. `provider` indique le dialecte SQL                                                                        |
| `socialProviders.google`                       | Client ID + Secret                                  | Active Google OAuth. Les credentials viennent de la Google Cloud Console                                                                                                            |
| `account.accountLinking`                       | `enabled: true, trustedProviders: ['google']`       | Si un user s'inscrit par email puis se connecte avec Google (meme email), les comptes sont lies automatiquement. Google est "trusted" car il verifie l'email de son cote            |
| `session.expiresIn`                            | 2592000 (30j)                                       | La session dure 30 jours avant expiration                                                                                                                                           |
| `session.updateAge`                            | 86400 (1j)                                          | La session est rafraichie en DB toutes les 24h (pas a chaque requete). Reduit la charge DB sans affecter la securite                                                                |
| `advanced.useSecureCookies`                    | `true` en prod                                      | Cookies avec flag `Secure` en production (HTTPS only), desactive en dev (localhost HTTP). Le flag `httpOnly` est toujours actif par defaut (empeche le JS client de lire le cookie) |
| `trustedOrigins`                               | `['familyhub://', ...TRUSTED_ORIGINS]`              | Autorise les redirects vers l'app mobile Expo (deep linking) + origines additionnelles via variable d'environnement `TRUSTED_ORIGINS` (comma-separated)                             |
| `emailOTP` plugin                              | 6 digits, 600s expiry                               | Genere des codes OTP a 6 chiffres valides 10 min. `sendVerificationOTP` est un placeholder `console.log` — l'integration Resend sera faite dans T3                                  |
| `expo()` plugin                                | —                                                   | Adapte le flow auth pour les apps mobiles Expo (gestion des cookies cross-platform). Compatible avec `@better-auth/expo/client` cote mobile                                         |
| `rateLimit` global                             | 100 req / 60s                                       | Protection generale contre les abus, basee sur l'IP                                                                                                                                 |
| `rateLimit` `/sign-in/social`                  | 5 req / 15 min (900s)                               | Anti-abus OAuth, conforme au spec AC8                                                                                                                                               |
| `rateLimit` `/email-otp/send-verification-otp` | 3 req / 1 heure (3600s)                             | Limite l'envoi d'emails, conforme au spec AC8                                                                                                                                       |
| `rateLimit` `/email-otp/verify-email`          | 5 req / 15 min (900s)                               | Anti-brute-force — avec 6 digits (1M combinaisons), 5 essais/15min rend le brute-force impraticable                                                                                 |

> **Note :** Les limites sont per-IP (limitation Better Auth). Le per-email necessiterait un `customStorage` — accepte comme limitation pour le MVP.

**Pourquoi le rate limiting de Better Auth et pas `@nestjs/throttler` ?** Les routes auth passent par `toNodeHandler()` qui bypass completement le pipeline NestJS (guards, interceptors, pipes). `@nestjs/throttler` est un guard NestJS — il ne s'executerait jamais pour ces routes.

**Type `Auth` :**

```typescript
export type Auth = ReturnType<typeof createAuth>;
```

Exporte le type de retour pour l'utiliser dans le service et le guard. `createAuth` est synchrone, donc pas besoin de `Awaited<>`.

---

## 2. `apps/api/src/modules/auth/auth.service.ts` — Le service NestJS

**Quoi :** Un `@Injectable()` qui wrape l'instance Better Auth.

**Pourquoi ?** C'est le pont entre NestJS (DI) et Better Auth (instance standalone). Il recoit `PrismaService` par injection et cree l'instance Better Auth.

**Comment ca marche :**

1. NestJS cree le service et injecte `PrismaService` via le constructeur
2. Le constructeur appelle `createAuth(this.prisma)` et stocke le resultat dans `_auth`
3. L'instance est exposee via le getter `auth` (pour le controller et le guard)

**Pourquoi le constructeur et pas `onModuleInit()` ?** Parce que `createAuth()` est synchrone (imports statiques). Pas besoin d'un lifecycle hook async.

---

## 3. `apps/api/src/modules/auth/auth.controller.ts` — Le catch-all controller

**Quoi :** Un controller NestJS qui delegue **toutes** les requetes `/api/auth/*` a Better Auth.

**Pourquoi ?** Better Auth a son propre routeur interne (sign-in, callback, OTP, etc.). On n'a pas besoin de routes NestJS individuelles pour chaque endpoint auth. Un seul catch-all suffit.

**Comment ca marche :**

```
Client → GET /api/auth/sign-in/social?provider=google
      → NestJS route matching → AuthController.handleAuth()
      → handler(req, res)
      → Better Auth gere tout (redirect OAuth, set cookies, etc.)
```

- `@Controller('api/auth')` — match le prefix
- `@All('*path')` — match toutes les methodes (GET, POST, etc.) et tous les sous-chemins. `*path` est la syntaxe Express v5 pour les wildcards nommes (NestJS 11 utilise Express v5)
- `@Req() req` — l'objet Express Request, compatible avec le handler Node.js
- `@Res() res` — **crucial** : quand on utilise `@Res()`, NestJS passe en **mode passthrough**. Il ne tentera PAS d'envoyer une reponse lui-meme. Better Auth ecrit directement dans le response stream (status, headers, body). Sans `@Res()`, NestJS essaierait de serializer la valeur de retour comme reponse, ce qui entrerait en conflit avec Better Auth

Le handler `toNodeHandler(auth)` est cree dans le constructeur (import statique de `better-auth/node`).

---

## 4. `apps/api/src/modules/auth/auth.module.ts` — Le module NestJS

**Quoi :** Declare le controller et le service, exporte `AuthService`.

**Pourquoi exporter `AuthService` ?** Pour que d'autres modules puissent utiliser le guard `BetterAuthGuard` qui depend de `AuthService`. Sans l'export, le guard ne pourrait pas etre injecte en dehors du module auth — NestJS lancerait `Nest can't resolve dependencies of BetterAuthGuard`.

**Pourquoi pas d'imports ?** `PrismaModule` est `@Global()` — il est disponible partout sans import explicite.

---

## 5. `apps/api/src/main.ts` — Le body parser conditionnel

**Quoi :** Desactive le body parser global de NestJS et ajoute un middleware qui parse le body uniquement pour les routes non-auth.

**Pourquoi c'est le point le plus critique ?**

Better Auth et NestJS gerent le body HTTP differemment :

- **NestJS** : `express.json()` consomme le stream `req` et met le resultat dans `req.body`
- **Better Auth** : `toNodeHandler` lit le raw stream `req` lui-meme

Un stream Node.js ne peut etre lu qu'une seule fois. Si `express.json()` s'execute avant `toNodeHandler`, le stream est deja consomme. Better Auth recoit un body vide et **toutes les requetes POST auth echouent silencieusement** (pas d'erreur visible, juste des donnees manquantes).

**Comment :**

1. `bodyParser: false` — desactive completement le body parser global de NestJS
2. Un middleware custom verifie `req.originalUrl` :
   - Si `/api/auth` → `next()` directement, stream brut preserve pour Better Auth
   - Sinon → `express.json()` puis `express.urlencoded()` normalement

`req.originalUrl` est utilise plutot que `req.url` car `req.url` peut etre modifie par des middlewares de rewrite.

**Impact sur les routes protegees :** Aucun. Le `BetterAuthGuard` lit les **cookies dans les headers** (`auth.api.getSession({ headers })`), pas le body. Les headers sont toujours disponibles, que le body soit parse ou non. Les routes GraphQL et REST protegees par le guard ont leur body parse normalement puisqu'elles ne commencent pas par `/api/auth`.

---

## 6. `apps/api/src/app.module.ts` — Registration du module

**Quoi :** `AuthModule` ajoute dans les imports de `AppModule`.

**Comment :** NestJS decouvre automatiquement le controller et le service declares dans `AuthModule`. L'ordre des imports n'a pas d'importance — NestJS resout les dependances par le graphe de DI.

---

## 7. `apps/api/src/common/utils/get-request.ts` — Helper partage

**Quoi :** Une fonction `getRequestFromContext(context)` qui extrait l'objet Express `Request` depuis un `ExecutionContext` NestJS, qu'il soit HTTP ou GraphQL.

**Pourquoi ?** La logique d'extraction etait dupliquee entre le guard (`auth.guard.ts`) et le decorateur (`current-user.decorator.ts`). Factorisee ici pour eviter la repetition.

**Comment :**

- Contexte HTTP → `context.switchToHttp().getRequest<Request>()`
- Contexte GraphQL → `GqlExecutionContext.create(context).getContext<{ req: Request }>().req`

---

## 8. `apps/api/src/common/guards/auth.guard.ts` — Le guard d'authentification

**Quoi :** Un guard `BetterAuthGuard` reutilisable pour proteger des routes.

**Pourquoi ?** Pour les futures stories (1.3+), on aura besoin de verifier qu'un utilisateur est authentifie avant d'acceder a certains resolvers GraphQL ou controllers REST.

**Pourquoi il n'est PAS applique globalement ?** Le mettre global maintenant casserait les endpoints publics (health, auth eux-memes). Il sera utilise au cas par cas avec `@UseGuards(BetterAuthGuard)`.

**Comment ca marche :**

1. Appelle `getRequestFromContext(context)` pour extraire la `Request` (supporte HTTP et GraphQL)
2. Appelle `auth.api.getSession({ headers: fromNodeHeaders(req.headers) })` — `fromNodeHeaders()` convertit les `IncomingHttpHeaders` Node.js en `Headers` Web API (format attendu par Better Auth)
3. Si pas de session valide → `UnauthorizedException` avec code `AUTH_SESSION_EXPIRED` (permet au client de distinguer "pas authentifie" d'autres erreurs)
4. Si session valide → attache `session` et `user` sur l'objet `req` pour que le handler y accede via `@CurrentUser()`

**Comment Better Auth valide une session :**

1. Lit le cookie `better-auth.session_token` depuis les headers
2. Cherche la session en DB via Prisma
3. Verifie que la session n'est pas expiree (30 jours)
4. Retourne `{ session, user }` ou `null`

---

## 9. `apps/api/src/common/decorators/current-user.decorator.ts` — Le decorateur @CurrentUser()

**Quoi :** Un decorateur de parametre qui extrait le `user` attache par le guard.

**Pourquoi ?** Pour eviter de caster manuellement `req.user` dans chaque handler. Sans decorateur :

```typescript
handleRequest(@Req() req: Request) {
  const user = (req as any).user; // pas type-safe, verbose
}
```

Avec :

```typescript
handleRequest(@CurrentUser() user: User) { // propre
}
```

**Comment :** Utilise `getRequestFromContext()` en interne pour supporter les deux contextes NestJS. Retourne `req.user` attache par `BetterAuthGuard`. Si le guard ne s'est pas execute avant, `req.user` sera `undefined`.

**Utilisation typique (future) :**

```typescript
@UseGuards(BetterAuthGuard)          // 1. valide la session, attache user
@Query(() => Household)
myHousehold(@CurrentUser() user) {   // 2. extrait user de req
  return this.householdService.findByUser(user.id);
}
```

---

## 10. `.env.example` — Variables d'environnement

| Variable              | Usage                                              | Pourquoi                                                                                                                                                                     |
| --------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TRUSTED_ORIGINS`     | Origines additionnelles pour les redirections auth | Optionnel, comma-separated (ex: `https://staging.example.com`). `familyhub://` est toujours inclus par defaut pour le deep linking Expo                                      |
| `NEXT_PUBLIC_API_URL` | URL de l'API pour le client web                    | Utilisee par Next.js pour les redirections auth (OAuth callback, liens de verification). Prefixe `NEXT_PUBLIC_` requis par Next.js pour exposer la variable au bundle client |
| `EXPO_PUBLIC_API_URL` | URL de l'API pour l'app mobile                     | Meme usage. Prefixe `EXPO_PUBLIC_` requis par Expo pour exposer la variable au bundle client                                                                                 |

> **Note :** `RESEND_API_KEY` et `SENDER_EMAIL` seront ajoutes dans T3 quand l'integration email sera implementee. En attendant, les OTP sont logges en console via `console.log`.
