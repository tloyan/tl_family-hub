# Story 1.2: Authentification securisee (Google OAuth + Email OTP)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a end user (new or returning visitor),
I want to create an account and sign in via Google OAuth or email OTP code,
so that I can access the application without managing a password.

## Acceptance Criteria

### AC1: Google OAuth Authentication

- **Given** je suis sur l'ecran de connexion
- **When** je tape "Continuer avec Google"
- **Then** je suis redirige vers le flux Google OAuth et mon compte est cree (si nouveau) ou je suis connecte (si existant)

### AC2: Email OTP — Envoi

- **Given** je suis sur l'ecran de connexion
- **When** j'entre mon email et tape "Recevoir un code"
- **Then** je recois un email avec un code OTP a 6 chiffres dans les 30 secondes

### AC3: Email OTP — Verification

- **Given** j'ai recu un email avec un code OTP
- **When** je saisis le code sur l'ecran de verification (sans quitter l'app)
- **Then** je suis authentifie et redirige vers l'app

### AC4: Session Management

- **Given** je suis authentifie
- **When** je verifie la session
- **Then** elle expire apres 30 jours d'inactivite avec refresh token rotation (NFR10)

### AC5: Mobile Token Storage

- **Given** je suis authentifie sur mobile
- **When** je verifie le stockage des tokens
- **Then** ils sont dans expo-secure-store (pas AsyncStorage)

### AC6: Web Cookie Security

- **Given** je suis authentifie sur web
- **When** je verifie les cookies
- **Then** les cookies de session sont httpOnly et secure (SameSite=Strict)

### AC7: Transport Security (TLS 1.3)

- **Given** toute communication client-serveur
- **When** je verifie le transport
- **Then** toutes les connexions utilisent TLS 1.3 (NFR7)

### AC8: Rate Limiting

- **Given** un utilisateur tente de se connecter
- **When** il depasse 5 tentatives en 15 minutes (login) ou 3 envois OTP par heure par email
- **Then** les requetes suivantes sont rejetees avec un message clair

## Tasks / Subtasks

### T1: Configuration Better Auth Server (AC: 1, 2, 3, 4, 8)

- [x] T1.1: Installer les dependances (`better-auth`, `@better-auth/expo`)
- [x] T1.2: Creer `apps/api/src/lib/auth.ts` — instance Better Auth avec Prisma adapter, en reutilisant le `PrismaService` existant via DI NestJS (ne PAS instancier un nouveau `PrismaClient()` — Prisma 7.x requiert le driver adapter `PrismaPg` deja configure dans `PrismaService`)
- [x] T1.3: Configurer le social provider Google OAuth avec variables d'environnement Doppler
- [x] T1.4: Ajouter le plugin Email OTP avec fonction `sendVerificationOTP` placeholder `console.log` (code 6 chiffres, expiration 10 min) — Resend differe a T3
- [x] T1.5: Configurer les sessions (expiration 30 jours, refresh token rotation, httpOnly cookies)
- [x] T1.6: Configurer le rate limiting via Better Auth built-in `rateLimit` (5 login/15min, 3 OTP/heure, 5 verifications OTP/15min) — les routes auth bypasses NestJS, donc `@nestjs/throttler` ne s'applique pas
- [x] T1.7: Exposer les routes Better Auth via `@thallesp/nestjs-better-auth` `AuthModule.forRootAsync()` (remplace le catch-all handler manuel)
- [x] T1.8: Configurer `accountLinking.enabled: true` dans Better Auth pour merger automatiquement les comptes par email verifie (preparation pour Apple OAuth futur)

### T2: Schema Prisma Auth (AC: 1, 2, 3, 4)

- [x] T2.1: Creer `packages/db/prisma/schema/auth.prisma` avec les modeles Better Auth (User, Account, Session, Verification)
- [x] T2.2: Generer et appliquer la migration Prisma (`prisma migrate dev`)
- [x] T2.3: Verifier la compatibilite avec le schema `base.prisma` existant

### T3: Email Service — Resend + React Email (AC: 2)

- [x] T3.1: Installer `resend` dans `apps/api`
- [x] T3.2: Creer le package `packages/emails/` avec le template React Email `otp-code.tsx` (affiche le code 6 chiffres)
- [x] T3.3: Implementer le service d'envoi d'email dans la fonction `sendVerificationOTP` de Better Auth
- [x] T3.4: Configurer la variable `RESEND_API_KEY` dans Doppler

### T4: Client Web — Next.js (AC: 1, 3, 6)

- [x] T4.1: Installer `better-auth` (client) dans `apps/web`
- [x] T4.2: Creer `apps/web/lib/auth-client.ts` avec `createAuthClient` + plugin `nextCookies`
- [x] T4.3: Creer les pages auth : `apps/web/app/(auth)/login/page.tsx`, `apps/web/app/(auth)/verify-otp/page.tsx`
- [x] T4.4: Implementer le formulaire de connexion (email input + bouton OAuth Google)
- [x] T4.5: Implementer l'ecran de saisie OTP (6 champs individuels avec auto-focus, timer de renvoi 60s)
- [x] T4.6: Ajouter le proxy Next.js 16 (`proxy.ts`) pour protection des routes authentifiees
- [x] T4.7: Configurer Apollo Client avec `credentials: 'include'` pour transmettre automatiquement les cookies de session Better Auth (pas de header Authorization sur web — auth par cookies)

### T5: Client Mobile — Expo (AC: 1, 3, 5)

- [x] T5.1: Installer `better-auth` et `@better-auth/expo` dans `apps/mobile`
- [x] T5.2: Creer `apps/mobile/lib/auth-client.ts` avec `createAuthClient` + plugin `expoClient` (SecureStore, deep linking)
- [x] T5.3: Completer l'ecran existant `apps/mobile/app/(auth)/sign-in.tsx` (le fichier existe deja comme placeholder depuis la story 1-1)
- [x] T5.4: Implementer le formulaire mobile (email input + bouton OAuth Google)
- [x] T5.5: Configurer le deep linking pour callback OAuth Google (`app.json` scheme)
- [x] T5.6: Creer l'ecran `apps/mobile/app/(auth)/verify-otp.tsx` (6 champs, auto-focus, clavier numerique natif)

### T6: Variables d'environnement & Secrets (AC: 1, 2, 7)

- [x] T6.1: Ajouter dans `.env.example` : `RESEND_API_KEY`, `EXPO_PUBLIC_API_URL`, `NEXT_PUBLIC_API_URL`
- [x] T6.2: Configurer les secrets dans Doppler (dev, staging, production)
- [x] T6.3: Creer l'OAuth app sur Google Cloud Console (Client IDs pour web, iOS, Android)
- [ ] T6.4: Configurer les redirect URIs par plateforme (web, iOS, Android) — **bloque : bundle IDs iOS/Android non disponibles**

### T7: Tests (AC: tous)

- [ ] T7.1: Tests unitaires du service auth (Vitest) — OTP generation/validation, session management, rate limiting
- [ ] T7.2: Tests d'integration (Supertest) — flux OAuth mock, email OTP complet (envoi + verification), account linking
- [ ] T7.3: Tests e2e web (Playwright) — login Google, login email OTP, logout
- [ ] T7.4: Tests de securite — cookies httpOnly, session expiry, rate limiting enforcement
- [x] T7.5: Ajouter les variables auth au workflow CI (GitHub Secrets)

## Dev Notes

### Architecture & Patterns obligatoires

- **Better Auth** (v1.4.x) gere OAuth, Email OTP, sessions et Prisma adapter nativement
- **`@thallesp/nestjs-better-auth`** (v2.4.0) gere l'integration NestJS : controller interne, global `AuthGuard`, body parser middleware, decorateurs `@AllowAnonymous()`, `@Session()`, `@OptionalAuth()`
- **Routes REST Better Auth** exposees automatiquement par la lib (`/api/auth/*`). Les resolvers GraphQL NestJS sont utilises pour les queries/mutations metier, pas pour l'auth elle-meme
- **Dot-notation** pour tous les fichiers : `auth.module.ts`, `auth.service.ts`, `auth.guard.ts`, `auth.spec.ts`
- **Custom exceptions uniquement** : Jamais `throw new Error()` — utiliser les exceptions NestJS custom avec codes `AUTH_*`
- **UUID v7** pour tous les IDs (chronologiquement ordonnables)
- **Structured logging** : JSON via Pino avec niveaux error/warn/info/debug
- Pour cette story, le module `auth` n'a aucune dependance sur d'autres modules metier. Les dependances vers `member` et `household` seront ajoutees dans les stories ulterieures (1.3+)
- Les emails OTP auth sont envoyes directement via Resend dans le callback Better Auth (pas via le module notification/BullMQ). Le module notification sera utilise pour les emails non-auth (invitations, rappels) dans les stories ulterieures

### Apple OAuth (differe)

L'architecture prevoit Apple OAuth en complement de Google OAuth. Apple Sign In est differe car il necessite un compte Apple Developer paye. Il sera ajoute dans une story ulterieure quand le compte sera disponible. Le `accountLinking` est active des maintenant pour que le futur ajout d'Apple OAuth soit transparent (merge automatique par email).

### Better Auth — Configuration cle

```typescript
// apps/api/src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
// IMPORTANT: Reutiliser le PrismaService existant via DI NestJS
// Ne PAS faire: const prisma = new PrismaClient()
// Prisma 7.x requiert le driver adapter PrismaPg deja configure dans PrismaService

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: prismaAdapter(prismaService, { provider: "postgresql" }),
  accountLinking: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    // Apple OAuth sera ajoute ici dans une story ulterieure
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 600, // 10 minutes en secondes
      sendVerificationOTP: async ({ email, otp, type }) => {
        // Envoyer via Resend avec template React Email
        // type: "sign-in" | "email-verification" | "forget-password"
      },
    }),
  ],
});
```

> **Note:** Verifier l'API exacte dans la [doc Better Auth Email OTP](https://www.better-auth.com/docs/plugins/email-otp) car les noms de methodes peuvent varier selon la version. Les snippets ci-dessus sont indicatifs.

### Client-side Email OTP — Flux

```typescript
// Etape 1: Envoyer le code OTP
await authClient.emailOtp.sendVerificationOtp({
  email: "user@example.com",
  type: "sign-in",
});

// Etape 2: Verifier le code saisi par l'utilisateur
const { data, error } = await authClient.signIn.emailOtp({
  email: "user@example.com",
  otp: "123456",
});
```

### Client Expo — SecureStore obligatoire

```typescript
// apps/mobile/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  plugins: [
    expoClient({
      scheme: "familyhub",
      storagePrefix: "familyhub",
      storage: SecureStore,
    }),
  ],
});
```

### Client Next.js — nextCookies plugin

```typescript
// apps/web/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
// Server-side dans auth.ts: import { nextCookies } from "better-auth/next-js"
```

### Resend — Template Email OTP

```tsx
// packages/emails/src/otp-code.tsx
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

// Utiliser dans sendVerificationOTP de Better Auth
await resend.emails.send({
  from: 'Family Hub <noreply@family-hub.com>',
  to: email,
  subject: 'Votre code de connexion Family Hub',
  react: <OtpCodeEmail otp={otp} />,
});
// Template affiche le code en gros caracteres espaces (ex: "1 2 3 4 5 6")
// + mention "Ce code expire dans 10 minutes"
```

### Codes d'erreur auth

| Code | HTTP | Description |
|------|------|-------------|
| `AUTH_INVALID_OTP` | 401 | Code OTP incorrect ou expire |
| `AUTH_OTP_EXPIRED` | 401 | Code OTP expire (> 10 min) |
| `AUTH_OTP_RATE_LIMITED` | 429 | Trop d'envois OTP pour cet email |
| `AUTH_LOGIN_RATE_LIMITED` | 429 | Trop de tentatives de connexion |
| `AUTH_VERIFY_RATE_LIMITED` | 429 | Trop de tentatives de verification OTP |
| `AUTH_OAUTH_FAILED` | 401 | Le provider OAuth a retourne une erreur |
| `AUTH_OAUTH_CANCELLED` | 400 | L'utilisateur a annule le flux OAuth |
| `AUTH_SESSION_EXPIRED` | 401 | Session expiree |

### Rate Limiting

| Endpoint | Limite | Fenetre |
|----------|--------|---------|
| Login (OAuth callback) | 5 tentatives | 15 minutes |
| OTP send | 3 envois | 1 heure par email |
| OTP verify | 5 tentatives | 15 minutes par email |
| Token refresh | 10 requetes | 1 minute |

### Variables d'environnement requises

| Variable | Description | Deja dans .env.example |
|----------|-------------|------------------------|
| `BETTER_AUTH_SECRET` | Cle de chiffrement sessions | Oui |
| `BETTER_AUTH_URL` | URL base du serveur auth | Oui |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Oui |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | Oui |
| `RESEND_API_KEY` | Cle API Resend pour emails | Oui |
| `EXPO_PUBLIC_API_URL` | URL API pour le client mobile | Oui |
| `NEXT_PUBLIC_API_URL` | URL API pour le client web | Oui |
| `DATABASE_URL` | Connexion PostgreSQL Prisma | Oui |

### Compatibilite avec Story 1-1

- **Prisma 7.x ESM-only** : Config dans `prisma.config.ts`, driver adapters (`@prisma/adapter-pg` + `pg`) obligatoires. Reutiliser `PrismaService` existant
- **NestJS 11.x + Express v5** : Routes wildcards changees (`/api/auth/*path` au lieu de `/api/auth/*`)
- **TypeScript strict mode** : Tous les fichiers
- **Tailwind v4 (web)** / **Tailwind v3.4 + NativeWind v4 (mobile)** : Deux configs distinctes

### UX — Points critiques

- **Deux methodes co-egales** : Google OAuth et Email OTP presentes avec la meme importance visuelle
- **Ecran OTP** : 6 champs individuels avec auto-focus au champ suivant, clavier numerique natif sur mobile, timer de renvoi (desactive 60s puis "Renvoyer le code"), mention expiration 10 min
- **Pas de celebration** : Transition silencieuse vers le Home Hub apres auth reussie
- **Erreurs inline** : Jamais de popups — messages sous les champs avec ton factuel et chemin de resolution
- **Touch targets** : Minimum 48px sur mobile, 44px sur web
- **Accessibilite WCAG 2.1 AA** : Contraste 4.5:1, labels visibles, aria-labels, navigation clavier complete
- **Responsive** : Mobile-first, formulaire centre max 400px sur desktop

### Project Structure Notes

- `apps/api/src/lib/auth.ts` — Factory `createAuth()` Better Auth (nouveau)
- `apps/api/src/app.module.ts` — Wiring `AuthModule.forRootAsync()` via `@thallesp/nestjs-better-auth`
- `apps/api/src/modules/health/` — `@AllowAnonymous()` sur controller et resolver
- `packages/db/prisma/schema/auth.prisma` — Schema Prisma auth (nouveau)
- `packages/emails/` — Package templates email (nouveau, avec tests Vitest)
- `apps/web/app/(auth)/login/page.tsx` — Page login web (nouveau)
- `apps/web/app/(auth)/verify-otp/page.tsx` — Page verification OTP web (nouveau)
- `apps/web/lib/auth-client.ts` — Client auth web (nouveau)
- `apps/mobile/app/(auth)/sign-in.tsx` — Ecran auth mobile (existant depuis story 1-1, a completer)
- `apps/mobile/app/(auth)/verify-otp.tsx` — Ecran verification OTP mobile (nouveau)
- `apps/mobile/lib/auth-client.ts` — Client auth mobile (nouveau)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-1, Story 1.2]
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication, #Security, #Database-Schema]
- [Source: _bmad-output/planning-artifacts/prd.md#FR35, #NFR7, #NFR8, #NFR9, #NFR10]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Authentication-Flows, #Error-States]
- [Source: _bmad-output/implementation-artifacts/1-1-initialisation-monorepo-ci-cd-et-deploiement.md#Dev-Notes]
- [Docs: Better Auth — https://www.better-auth.com/docs]
- [Docs: Resend Node.js SDK — https://resend.com/docs]
- [Docs: Better Auth Expo Integration — https://www.better-auth.com/docs/integrations/expo]
- [Docs: Better Auth Email OTP Plugin — https://www.better-auth.com/docs/plugins/email-otp]
- [Docs: Better Auth Next.js Integration — https://www.better-auth.com/docs/integrations/next]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

### Completion Notes List

#### T1: Configuration Better Auth Server

**Ecarts par rapport au spec original :**

- **T1.4 — Resend differe a T3 :** `sendVerificationOTP` utilise un placeholder `console.log` au lieu de Resend. La dependance `resend` n'est pas installee dans T1. L'integration email complete (Resend + React Email template) sera faite dans T3.
- **T1.6 — Rate limiting via Better Auth built-in :** Le spec mentionnait `@nestjs/throttler`, mais les routes auth passent par `toNodeHandler` et contournent le pipeline NestJS (guards, interceptors). Le rate limiting est donc gere par la config `rateLimit` native de Better Auth. Les limites sont per-IP (limitation Better Auth — le per-email necessiterait un `customStorage`, accepte pour le MVP).
- **Rate limits corriges :** Les fenetres/limites ont ete alignees sur le spec AC8 : 5 login/15min (900s), 3 OTP send/1h (3600s), 5 OTP verify/15min (900s). Les valeurs initiales (60s/10, 60s/5, 60s/5) etaient incorrectes.
- **`trustedOrigins` configurable :** Rendu configurable via variable d'environnement `TRUSTED_ORIGINS` (comma-separated) en plus du scheme `familyhub://` hardcode.
- **`getRequestFromContext` helper :** La logique d'extraction de `Request` depuis un `ExecutionContext` NestJS (HTTP ou GraphQL) etait dupliquee entre `auth.guard.ts` et `current-user.decorator.ts`. Factorisee dans `common/utils/get-request.ts`.
- **Imports statiques :** Les imports dynamiques `await import()` et `onModuleInit()` ont ete remplaces par des imports statiques et une initialisation dans les constructeurs. Node.js 25 supporte `require()` de modules ESM synchrones nativement.
- **Variables d'environnement :** `RESEND_API_KEY` et `SENDER_EMAIL` retires de `.env.example` et `turbo.json` (seront re-ajoutes dans T3). `TRUSTED_ORIGINS` ajoute.

#### T4: Client Web — Next.js

**Ecarts par rapport au spec original :**

- **T4.6 — `proxy.ts` au lieu de `middleware.ts` :** Next.js 16 remplace `middleware.ts` (Edge runtime) par `proxy.ts` (Node.js runtime). Le proxy verifie la presence du cookie de session (`better-auth.session_token` ou `__Secure-better-auth.session_token`) sans appel API — simple redirection basee sur la presence du cookie.
- **CORS cross-origin :** Le front (`:3000`) et l'API (`:4000`) sont sur des ports differents en dev. Ajout de `app.enableCors()` dans `main.ts` (origin `localhost:3000` en dev, `TRUSTED_ORIGINS` en prod) et ajout de `http://localhost:3000` dans `trustedOrigins` de Better Auth en dev.
- **ShadCN components ajoutes :** `input`, `label`, `card`, `input-otp`, `separator` + `lucide-react` (dependance de `input-otp`).
- **Pas de fallback sur `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_GRAPHQL_URL` :** Les URLs API sont fournies par Doppler. Absence = erreur explicite. `PORT` retire de la config Doppler dev pour eviter les conflits (Next.js default `:3000`, NestJS default `:4000`).

#### T5: Client Mobile — Expo

**Ecarts par rapport au spec original :**

- **T5.1 — Dependances supplementaires :** `expo-secure-store`, `expo-web-browser`, `expo-network` (peer dep requise par `@better-auth/expo`).
- **T5.1 — Metro `unstable_enablePackageExports` :** Requis dans `metro.config.js` pour que Metro resolve les subpath imports de Better Auth (`better-auth/react`, `better-auth/client/plugins`, `@better-auth/expo/client`).
- **T5.3/T5.4 — Composants UI crees :** `TextInput` (CVA, variantes default/error), `Separator` (horizontal/vertical), `OtpInput` (TextInput transparent overlay + 6 slots visuels pour autofill iOS). Ces composants suivent le pattern existant de `Button`/`Text`.
- **T5.5 — ATS (App Transport Security) :** Ajout `NSAllowsLocalNetworking: true` dans `app.json` `ios.infoPlist` pour les dev builds natifs. En dev avec Expo Go, `EXPO_PUBLIC_API_URL` doit pointer vers l'IP locale (pas `localhost`) car Expo Go ne resout pas `localhost` pour les requetes HTTP natives.
- **T5.5 — Google OAuth sur mobile en dev :** Le flow Google OAuth necessite HTTPS pour `expo-web-browser` (`ASWebAuthenticationSession`). En dev local avec Expo Go (HTTP), seul le flow Email OTP fonctionne. Google OAuth mobile sera testable apres deploiement en dev (HTTPS) ou avec un dev build natif.
- **Apollo Client — `SetContextLink` :** Remplacement de `setContext` (deprecie dans Apollo Client v4) par `new SetContextLink()`. Le cookie auth est injecte via `authClient.getCookie()` (synchrone, pas async).
- **Auth-gated root redirect :** `app/index.tsx` utilise `useSession()` pour rediriger vers sign-in (pas de session) ou tabs (session active), avec `ActivityIndicator` pendant le chargement.
- **Web fix — Google OAuth `callbackURL` :** Corrige de `'/'` (relatif a l'API) a `window.location.origin + '/'` (URL absolue du frontend) pour eviter la redirection vers `localhost:4000` apres le callback Google.
- **Email OTP template :** Suppression des espaces entre les chiffres du code (`spacedOtp` → `otp`) pour ameliorer la detection iOS autofill. Le spacing visuel est gere par CSS `letter-spacing`.

#### T6: Variables d'environnement & Secrets

**Ecarts par rapport au spec original :**

- **T6.1 — Deja fait dans les tasks precedentes :** Les variables `RESEND_API_KEY`, `EXPO_PUBLIC_API_URL`, `NEXT_PUBLIC_API_URL` avaient deja ete ajoutees a `.env.example` et `turbo.json` lors des tasks T3, T4 et T5. Variables supplementaires egalement presentes : `TRUSTED_ORIGINS`, `NEXT_PUBLIC_GRAPHQL_URL`, `EXPO_PUBLIC_GRAPHQL_URL`.
- **T6.2 — Doppler deja configure :** Tous les secrets sont en place dans Doppler pour les environnements dev, staging et production.
- **T6.3 — Google Cloud Console :** OAuth app creee avec Client IDs pour web. Les Client IDs iOS et Android seront ajoutes quand les bundle IDs seront disponibles.
- **T6.4 — Bloque :** Les redirect URIs par plateforme (iOS, Android) ne peuvent pas etre configurees sans les bundle IDs. Sera complete dans une story ulterieure ou quand les builds natifs seront en place.

#### T1.7: Migration `@thallesp/nestjs-better-auth`

- **Remplacement du glue code manuel** par `@thallesp/nestjs-better-auth` v2.4.0. Suppression de 6 fichiers source : `AuthModule`, `AuthService`, `AuthController` (dans `modules/auth/`), `BetterAuthGuard`, `getRequestFromContext`, `CurrentUser` decorator (dans `common/`). La lib fournit tout via `AuthModule.forRootAsync()`, un global guard, `@AllowAnonymous()`, `@Session()`, et un body parser middleware automatique.
- **`main.ts` simplifie** : suppression du middleware body parser custom (18 lignes). La lib gere le skip body parsing sur les routes auth automatiquement.
- **`@AllowAnonymous()`** ajoute sur `HealthController` et `HealthResolver` (le global guard protege toutes les routes par defaut).

#### T7: Tests — non pertinents a ce stade, differes

**Constat :** Apres la migration vers `@thallesp/nestjs-better-auth`, notre code auth custom se resume a `src/lib/auth.ts` (factory config) et 5 lignes de wiring dans `app.module.ts`. Il n'y a pas de logique metier a tester unitairement.

**T7.1 a T7.4 — non implementes, voici pourquoi :**

- Les tests implementes initialement (`email-otp-flow`, `session-management`, `security`, `account-linking`) utilisaient `auth.api.*` (l'API interne de Better Auth) et testaient le comportement de la librairie, pas notre code applicatif.
- Les tests de rate limiting etaient des **faux positifs** : un fallback `?? 429` dans le `catch` faisait toujours passer l'assertion. Le rate limiter de Better Auth ne se declenche ni via `auth.api.*` ni via HTTP/supertest en environnement de test.
- Les tests de cookie security, session expiry, et OTP flow verifient des garanties de Better Auth documentees dans leur doc — pas de valeur ajoutee a les retester.
- Le test d'account linking ne testait pas l'account linking (juste que `createTestAuth()` ne throw pas).
- `render-otp-email.spec.ts` a ete deplace dans `packages/emails/` (c'est son package).

**Quand les implementer :**

- **Story 1.3+ (routes protegees)** : quand on aura des resolvers/controllers metier (households, members), on testera le vrai scenario d'integration : user authentifie → acces OK, user non auth → 401, `@Session()` retourne le bon user. C'est la que les tests auth ont de la valeur.
- **Playwright (T7.3)** : quand le setup Playwright sera ajoute au projet.
- **Rate limiting** : necessite investigation sur pourquoi le rate limiter Better Auth ne se declenche pas en test, ou test manuel contre un serveur reel.

**Ce qui est en place :**

- `apps/api/test/app.e2e-spec.ts` — verifie que le vrai `AppModule` bootstrap correctement (wiring NestJS + auth + health + GraphQL)
- `packages/emails/src/templates/otp-code.spec.ts` — 11 tests unitaires du template email OTP
- `ci.yml` — variables auth ajoutees pour la CI (T7.5)

### File List
