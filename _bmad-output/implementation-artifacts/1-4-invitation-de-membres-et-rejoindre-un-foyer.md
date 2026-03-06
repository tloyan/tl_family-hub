# Story 1.4: Invitation de membres et rejoindre un foyer

Status: in-progress
Story-ID: 1.4
Epic: 1 — Fondation, Authentification & Foyer familial
Date: 2026-03-03
Depends-on: Story 1.2 (Auth), Story 1.3 (Household creation)

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

En tant que parent admin/owner,
Je veux inviter des membres par lien unique, email ou QR code avec un role et une relation pre-assignes,
Afin que ma famille puisse rejoindre le foyer rapidement et sans friction.

## Acceptance Criteria (BDD)

### Cas 1 — Invitation sans profil existant

**AC-1: Creation d'invitation avec role et relation**
```gherkin
Given je suis admin ou owner du foyer
When je tape "Inviter un membre"
Then je choisis le role (admin, adulte, enfant, prestataire)
And je choisis la relation (parent, grand-parent, oncle, ami, etc.)
And le systeme genere un lien unique + QR code avec le role et la relation pre-assignes
```

**AC-2: Ecran d'invitation pour l'invite**
```gherkin
Given un invite recoit le lien d'invitation
When il tape dessus (deep link mobile ou URL web)
Then il arrive sur un ecran "X vous invite a rejoindre le foyer Y en tant que [relation]"
And les options d'authentification (Google OAuth ou Magic Link) sont presentees
```

**AC-3: Acceptation d'invitation et creation de compte**
```gherkin
Given l'invite est sur l'ecran d'invitation
When il s'authentifie via Google OAuth ou Magic Link
Then son compte est cree ou lie
And il rejoint le foyer avec le role pre-assigne
And une couleur membre lui est attribuee automatiquement
And il est redirige vers le Home Hub avec sa colonne prete
```

### Cas 2 — Invitation d'un profil existant

**AC-4: Invitation liee a un profil existant**
```gherkin
Given un profil membre existe dans le foyer sans compte lie
When je tape "Inviter" sur ce profil
Then un lien est genere qui attachera le compte de l'invite au profil existant
And le lien contient le linkedMemberProfileId
```

**AC-5: Acceptation avec preservation des donnees**
```gherkin
Given l'invite tape le lien d'un profil existant
When il s'authentifie
Then son compte est attache au profil existant
And toutes les donnees sont preservees (rituels, couleur, historique)
And le profil n'est pas duplique
```

### Cas 3 — Profil enfant sans compte

**AC-6: Profil enfant sans compte fonctionne**
```gherkin
Given un profil enfant existe sans compte lie
When l'enfant n'a pas besoin de son propre appareil
Then le profil fonctionne sans compte lie (le parent gere tout)
And aucune invitation n'est necessaire
```

**AC-7: Lier un compte a un profil enfant**
```gherkin
Given un profil enfant existe sans compte
When je tape "Lier un compte" sur ce profil
Then un lien d'invitation est genere pour attacher un futur compte a ce profil enfant
```

### Regles generales

**AC-8: Partage multicanal**
```gherkin
Given un lien d'invitation genere
When il n'a pas encore ete utilise
Then il est partageable via SMS, WhatsApp, email ou toute messagerie
And le lien fonctionne sur mobile (deep link familyhub://) et web (HTTPS)
```

**AC-9: Suivi des statuts d'invitation**
```gherkin
Given une invitation creee
When je consulte la liste des invitations
Then je vois son statut : en attente (pending), acceptee (accepted) ou expiree (expired)
And les invitations expirees sont clairement identifiees
```

**AC-10: Limites et securite**
```gherkin
Given le foyer a deja N membres
When je cree une nouvelle invitation
Then le systeme verifie que le nombre total (membres + invitations pending) ne depasse pas MAX_MEMBERS_PER_HOUSEHOLD (20)
And le token d'invitation est cryptographiquement securise
And le token est a usage unique (une fois accepte, il ne peut plus etre reutilise)
And le token expire apres la duree configuree
```

## Tasks / Subtasks

<!-- Review decisions (2026-03-03):
  - Reordonnancement: PubSub infra (now T4) moved before API backend (T5) car le service depend de PubSubService
  - Fusion: ex-subscriptions absorbe dans T5 (API backend) — memes fichiers, evite les allers-retours
  - Fusion: ex-frontend subscriptions absorbe dans T7 (web) et T8 (mobile) — wiring WS fait avec les composants
  - Ajout: T10 (E2E Web Playwright) et T11 (E2E Mobile Maestro) comme taches completes
  - Debats non resolus:
    - D2: Share natif (mobile Share.share() + web navigator.share/clipboard) — sous-tache manquante dans T7/T8
    - D3: Ecrans d'erreur frontend pour les 7 exceptions — sous-tache manquante dans T7/T8
    - D5: Wireframe basique ecran /invite/[token] — premier ecran de l'invite, UX critique
-->

- [x] T1: Schema Prisma — Modele Invitation (AC: 1, 4, 9, 10)
  - [x] T1.1: Creer `packages/db/prisma/schema/invitation.prisma` avec le modele `Invitation` et l'enum `InvitationStatus`
  - [x] T1.2: Ajouter les relations FK vers `Household`, `User` (invitedBy), `User` (acceptedBy nullable), `HouseholdMember` (linkedMemberProfile nullable)
  - [x] T1.3: Ajouter `Invitation[]` a `User` et `Household` dans les schemas existants
  - [x] T1.4: Generer et appliquer la migration Prisma (`npx prisma migrate dev`)
  - [x] T1.5: Ajouter `'Invitation'` a `HOUSEHOLD_SCOPED_MODELS` dans `household-extension.ts`

- [x] T2: Package shared — Enums, schemas Zod, constantes (AC: 1, 10)
  - [x] T2.1: Creer `packages/shared/src/enums/invitation.ts` — `INVITATION_STATUS`, `INVITATION_RELATION`
  - [x] T2.2: Creer `packages/shared/src/schemas/invitation.schema.ts` — schemas Zod pour `createInvitationInput`, `acceptInvitationInput`
  - [x] T2.3: Creer `packages/shared/src/constants/invitation.ts` — `INVITATION_EXPIRY_DAYS` (7), `MAX_PENDING_INVITATIONS_PER_HOUSEHOLD`
  - [x] T2.4: Re-exporter depuis les fichiers index.ts

- [x] T3: Email — Template d'invitation (AC: 1, 8)
  - [x] T3.1: Creer `packages/emails/src/templates/invitation.ts` — template HTML (pattern OTP existant)
  - [x] T3.2: Parametres : `inviterName`, `householdName`, `relation`, `invitationLink`
  - [x] T3.3: Creer `packages/emails/src/templates/invitation.spec.ts` — tests du rendu
  - [x] T3.4: Re-exporter depuis `packages/emails/src/index.ts`

- [x] T4: Infrastructure temps reel — PubSub + WebSocket (AC: 3, 5, 9)
  - [x] T4.1: Installer `graphql-redis-subscriptions` + `ioredis` dans `apps/api` (`graphql-ws` bundled par `@nestjs/graphql@13`)
  - [x] T4.2: Configurer Apollo Server 5 avec `graphql-ws` WebSocket transport dans `app.module.ts`
  - [x] T4.3: Creer `apps/api/src/common/pubsub/pubsub.module.ts` — module global PubSub avec Redis backend
  - [x] T4.4: Creer `apps/api/src/common/pubsub/pubsub.service.ts` — wrapper PubSub injectable (topics `string`, pas de couplage metier)
  - [x] T4.5: Configurer l'authentification WebSocket (cookies lus depuis la requete HTTP upgrade, validation via `authService.api.getSession()`)

- [x] T5: API Backend — Module invitation + subscriptions (AC: 1-5, 7, 9, 10)
  - [x] T5.1: Creer `invitation.model.ts` — `@ObjectType()` GraphQL (`Invitation`, `InvitationStatus`)
  - [x] T5.2: Creer `invitation.dto.ts` — `@InputType()` (`CreateInvitationInput`, `AcceptInvitationInput`)
  - [x] T5.3: Creer `invitation.repository.ts` — acces Prisma (create, findByToken, findByHousehold, update status)
  - [x] T5.4: Creer `invitation.service.ts` — logique metier :
    - `createInvitation()` : validation role OWNER/ADMIN, verification limite membres, generation token (`crypto.randomBytes(32).toString('base64url')`), creation en DB, envoi email (Resend)
    - `acceptInvitation()` : validation token (existe, PENDING, non expire), creation HouseholdMember OU liaison profil existant, update statut ACCEPTED, publish events (`INVITATION_ACCEPTED` + `HOUSEHOLD_MEMBER_CHANGED`)
    - `cancelInvitation()` : validation owner, update statut CANCELLED
    - `listInvitations()` : invitations du foyer courant
    - `getInvitationByToken()` : query publique pour l'ecran d'invitation (@AllowAnonymous)
  - [x] T5.5: Creer `invitation.resolver.ts` — mutations, queries GraphQL + subscriptions :
    - Subscription `invitationAccepted(householdId)` — notifie l'admin quand un invite rejoint
    - Subscription `householdMemberChanged(householdId)` — notifie tous les membres
  - [x] T5.6: Creer `apps/api/src/common/exceptions/invitation.exception.ts` — exceptions custom
  - [x] T5.7: Enregistrer les providers dans `household.module.ts`
  - [x] T5.8: Ajouter subscription `householdMemberChanged(householdId)` dans `household.resolver.ts` (retro Story 1.3)
  - [x] T5.9: Publier `HOUSEHOLD_MEMBER_CHANGED` depuis `household.service.ts` lors de la creation du foyer (retro 1.3)

- [x] T6: Tests unitaires backend (AC: tous)
  - [x] T6.1: `__tests__/invitation.service.spec.ts` — creation, acceptation (3 cas), annulation, expiration, limites, publish events
  - [x] T6.2: `__tests__/invitation.resolver.spec.ts` — delegation vers le service + subscriptions (subscribe au bon topic)
  - [x] T6.3: `__tests__/invitation.repository.spec.ts` — appels Prisma
  - [x] T6.4: `common/pubsub/__tests__/pubsub.service.spec.ts` — publish et subscribe

- [x] T7: Frontend Web + Subscriptions — Flow d'invitation (AC: 1-5, 7-9)
  - [x] T7.1: Creer `apps/web/features/household/graphql.ts` — ajouter queries, mutations, subscriptions invitation
  - [x] T7.2: Creer `apps/web/app/(app)/household/invite/page.tsx` — formulaire de creation d'invitation (RSC + client form)
  - [x] T7.3: Creer `apps/web/app/(public)/invite/[token]/page.tsx` — ecran d'accueil invitation (public, hors layout auth)
  - [x] T7.4: Creer `apps/web/features/household/components/invitation-list.tsx` — liste des invitations du foyer
  - [x] T7.5: Integrer la liste des invitations dans le dashboard foyer existant
  - [x] T7.6: Configurer Apollo Client web avec `GraphQLWsLink` + split link (HTTP queries/mutations, WS subscriptions)
  - [x] T7.7: `useSubscription(HOUSEHOLD_MEMBER_CHANGED)` dans le dashboard foyer — mise a jour temps reel de la liste membres
  - [x] T7.8: `useSubscription(INVITATION_ACCEPTED)` dans la liste des invitations — mise a jour statut en temps reel

- [ ] T8: Frontend Mobile + Subscriptions — Flow d'invitation (AC: 1-5, 7-9)
  - [ ] T8.1: Mettre a jour `apps/mobile/features/household/graphql.ts` — queries, mutations, subscriptions invitation
  - [ ] T8.2: Creer `apps/mobile/app/household/invite.tsx` — formulaire de creation d'invitation
  - [ ] T8.3: Creer `apps/mobile/app/invite/[token].tsx` — ecran d'accueil invitation (deep link)
  - [ ] T8.4: Configurer le deep linking Expo pour `familyhub://invite/{token}`
  - [ ] T8.5: Creer `apps/mobile/features/household/components/invitation-list.tsx` — liste des invitations
  - [ ] T8.6: Configurer Apollo Client mobile avec `GraphQLWsLink` (split link HTTP/WS)
  - [ ] T8.7: `useSubscription(HOUSEHOLD_MEMBER_CHANGED)` dans l'ecran foyer
  - [ ] T8.8: `useSubscription(INVITATION_ACCEPTED)` dans la liste des invitations

- [ ] T9: Tests E2E API — Flow complet backend (AC: tous)
  - [ ] T9.1: Ajouter `invitations` au `cleanDatabase()` dans `test/helpers/db.helper.ts`
  - [ ] T9.2: Test E2E API : creation invitation → acceptation → membre rejoint le foyer
  - [ ] T9.3: Test E2E API : invitation liee a un profil existant → preservation des donnees
  - [ ] T9.4: Test E2E API : subscription `householdMemberChanged` recoit l'event apres acceptation
  - [ ] T9.5: Test E2E API : invitation expiree → rejet avec erreur appropriee
  - [ ] T9.6: Test E2E API : cross-household isolation — admin foyer A ne voit pas les invitations du foyer B

- [ ] T10: Tests E2E Web — Playwright (AC: 1-5, 8-9)
  - [ ] T10.1: Setup Playwright — install, config (`playwright.config.ts`), integration monorepo
  - [ ] T10.2: Helpers auth — login programmatique (bypass UI via API)
  - [ ] T10.3: Helpers DB — seed data, cleanup between tests
  - [ ] T10.4: CI — GitHub Actions job avec browser headless
  - [ ] T10.5: E2E — creation invitation (admin → formulaire → lien + QR affiches)
  - [ ] T10.6: E2E — acceptation Cas 1 (lien → ecran invite → auth → dashboard avec colonne)
  - [ ] T10.7: E2E — acceptation Cas 2 (lien profil existant → donnees preservees)
  - [ ] T10.8: E2E — lien expire → ecran d'erreur
  - [ ] T10.9: E2E — liste invitations + statuts (pending, accepted, expired)

- [ ] T11: Tests E2E Mobile — Maestro (AC: 1-5, 8-9)
  - [ ] T11.1: Setup Maestro — install, config, `.maestro/` directory
  - [ ] T11.2: Helpers auth — flow login automatise
  - [ ] T11.3: Helpers DB — seed data, cleanup
  - [ ] T11.4: CI — GitHub Actions avec emulator Android
  - [ ] T11.5: E2E — creation invitation (formulaire → lien + QR)
  - [ ] T11.6: E2E — deep link `familyhub://invite/{token}` → ecran invite
  - [ ] T11.7: E2E — acceptation → navigation vers Home Hub
  - [ ] T11.8: E2E — lien expire → message d'erreur

## Dev Notes

### Contexte metier critique

Cette story est **critique pour le KPI "Family Activation Rate"** : pourcentage de foyers avec >= 2 membres actifs dans les 7 premiers jours. Sans invitations, l'app reste mono-utilisateur. L'objectif UX est **< 30 secondes** entre le tap sur le lien et la premiere colonne visible pour l'invite.

### Trois cas d'invitation a implementer

1. **Cas 1 — Nouveau membre** : Invitation generique, l'invite cree son compte et rejoint avec le role pre-assigne. Nouveau `HouseholdMember` cree.
2. **Cas 2 — Profil existant sans compte** : L'admin a deja cree un profil (avec rituels, couleur). Le lien contient `linkedMemberProfileId`. A l'acceptation, le compte s'attache au `HouseholdMember` existant (update `userId`), pas de duplication.
3. **Cas 3 — Profil enfant** : Fonctionne sans compte (le parent gere). Optionnellement, un lien peut etre genere pour lier un compte futur (meme mecanisme que Cas 2).

### Architecture du flow d'invitation

```
CREATION (cote admin) :
  Admin → Apollo mutation createInvitation
    → InvitationResolver (@Session + @UseGuards(HouseholdGuard))
    → InvitationService : valide role OWNER/ADMIN, verifie limites, genere token
    → InvitationRepository : persist en DB
    → Resend : envoi email (optionnel, si email fourni)
    → Return : Invitation avec lien + token

ACCEPTATION (cote invite) :
  Invite clique lien → Deep link / URL web avec token
    → Frontend : query getInvitationByToken (@AllowAnonymous) → affiche ecran invitation
    → Invite s'authentifie (Better Auth : Google OAuth ou Email OTP)
    → Frontend : mutation acceptInvitation (token)
    → InvitationService :
      1. Valide token (existe, PENDING, non expire)
      2. Si linkedMemberProfileId → update HouseholdMember.userId (attache compte au profil)
      3. Sinon → cree nouveau HouseholdMember (role pre-assigne, couleur auto)
      4. Update invitation.status = ACCEPTED
    → Return : membre + household mis a jour
```

### Decision sur les tokens d'invitation

Utiliser `crypto.randomBytes(32).toString('base64url')` (Node.js natif) plutot que `nanoid` pour eviter une dependance supplementaire. Produit un token de 43 caracteres, URL-safe, 256 bits d'entropie. Le token est stocke en clair en DB (pas de hachage — app familiale, risque faible, et on a besoin de recuperer les infos de l'invitation par token pour l'ecran d'accueil).

### Decision sur l'envoi d'emails

Envoi direct via Resend dans `InvitationService` (meme pattern que l'OTP dans `auth.ts`). BullMQ n'est pas encore installe et l'ajout d'une queue asynchrone pour cette story serait du sur-engineering. L'email est optionnel : l'admin peut aussi partager le lien manuellement.

### QR Code — Generation cote client

Le QR code est genere cote client a partir de l'URL d'invitation. Pas de generation server-side. Utiliser une librairie comme `qrcode` (web) ou `react-native-qrcode-svg` (mobile). L'URL encodee dans le QR est identique au lien d'invitation.

### ADR-7 : Temps reel — GraphQL Subscriptions completes

**Decision** : Implementer les subscriptions GraphQL completes dans cette story pour poser l'infrastructure temps reel reutilisable.

| Aspect | Choix |
|---|---|
| **Protocole** | `graphql-ws` (standard actuel, `subscriptions-transport-ws` est deprecated) |
| **Transport** | WebSocket sur le meme serveur NestJS (Apollo Server 5 supporte `graphql-ws` nativement) |
| **Pub/Sub backend** | Redis (Upstash) via `graphql-redis-subscriptions` pour multi-instances |
| **Auth WebSocket** | Cookies lus depuis la requete HTTP upgrade WebSocket, valides via `getSession()` |
| **Subscriptions invitation** | `invitationAccepted(householdId)` — notifie l'admin quand un invite rejoint |
| **Subscriptions household** | `householdMemberChanged(householdId)` — notifie tous les membres (retro Story 1.3) |
| **Client web** | `GraphQLWsLink` + split link Apollo (HTTP pour queries/mutations, WS pour subscriptions) |
| **Client mobile** | Meme setup Apollo avec `graphql-ws` (compatible React Native) |

**Rationale** : Poser l'infra maintenant rend la Story 2.3 (temps reel rituels) triviale — il suffira d'ajouter de nouveaux topics. Redis Upstash est deja provisionne.

### ADR-8 : Strategie de tests frontend

**Decision** : Tester le comportement (flows), pas l'apparence (visuels). Les maquettes ne sont pas encore stabilisees.

| Niveau | Inclus | Rationale |
|---|---|---|
| Tests unitaires backend | Oui | Stables, independants de l'UI |
| Tests E2E backend (API) | Oui | Valident la logique metier end-to-end |
| **Tests E2E Web (Playwright)** | **Oui** | **Flow navigation complet, browser headless en CI** |
| **Tests E2E Mobile (Maestro)** | **Oui** | **Flow deep link + navigation, emulator en CI** |
| Tests de composants visuels | Non — differes | Designs pas encore stabilises, tests fragiles |
| Tests snapshot UI | Non — differes | Maquettes en evolution |

**Rationale** : Les tests de flow sont stables meme si le design change. Les tests visuels seront ecrits quand les maquettes seront validees.

### Exigences techniques

#### Schema DB — Modele Invitation

```prisma
// packages/db/prisma/schema/invitation.prisma

enum InvitationStatus {
  PENDING
  ACCEPTED
  EXPIRED
  CANCELLED
}

model Invitation {
  id                    String           @id @default(uuid()) @db.Uuid
  token                 String           @unique @db.VarChar(64)
  role                  HouseholdRole
  relation              String           @db.VarChar(50)
  status                InvitationStatus @default(PENDING)
  email                 String?          @db.VarChar(255)
  expiresAt             DateTime         @map("expires_at")
  acceptedAt            DateTime?        @map("accepted_at")
  createdAt             DateTime         @default(now()) @map("created_at")
  updatedAt             DateTime         @updatedAt @map("updated_at")

  householdId           String           @map("household_id") @db.Uuid
  household             Household        @relation(fields: [householdId], references: [id], onDelete: Cascade)

  invitedByUserId       String           @map("invited_by_user_id")
  invitedBy             User             @relation("InvitedBy", fields: [invitedByUserId], references: [id])

  acceptedByUserId      String?          @map("accepted_by_user_id")
  acceptedBy            User?            @relation("AcceptedBy", fields: [acceptedByUserId], references: [id])

  linkedMemberProfileId String?          @map("linked_member_profile_id") @db.Uuid
  linkedMemberProfile   HouseholdMember? @relation(fields: [linkedMemberProfileId], references: [id])

  @@index([householdId])
  @@index([token])
  @@index([status])
  @@map("invitations")
}
```

**Relations a ajouter dans les schemas existants :**
- `User` (auth.prisma) : `invitationsSent Invitation[] @relation("InvitedBy")` + `invitationsAccepted Invitation[] @relation("AcceptedBy")`
- `Household` (household.prisma) : `invitations Invitation[]`
- `HouseholdMember` (household.prisma) : `invitation Invitation?`

#### GraphQL API — Mutations et Queries

```graphql
# Mutations
type Mutation {
  createInvitation(input: CreateInvitationInput!): Invitation!    # @Session + @HouseholdGuard, role OWNER/ADMIN
  acceptInvitation(input: AcceptInvitationInput!): HouseholdMember! # @Session (pas de HouseholdGuard — l'invite n'est pas encore membre)
  cancelInvitation(id: ID!): Invitation!                           # @Session + @HouseholdGuard, role OWNER/ADMIN
}

# Queries
type Query {
  invitationByToken(token: String!): InvitationPublic!  # @AllowAnonymous — ecran d'accueil invitation
  householdInvitations: [Invitation!]!                   # @Session + @HouseholdGuard
}

# Subscriptions
type Subscription {
  invitationAccepted(householdId: ID!): Invitation!          # Notifie quand une invitation est acceptee
  householdMemberChanged(householdId: ID!): HouseholdMember! # Notifie quand la liste des membres change
}

# Types
input CreateInvitationInput {
  role: HouseholdRole!
  relation: String!
  email: String            # Optionnel — si fourni, envoie un email
  linkedMemberProfileId: ID # Optionnel — Cas 2 : lier a un profil existant
}

input AcceptInvitationInput {
  token: String!
}

type InvitationPublic {
  id: ID!
  householdName: String!
  inviterName: String!
  role: HouseholdRole!
  relation: String!
  status: InvitationStatus!
  expiresAt: DateTime!
  linkedMemberProfile: MemberPreview # Nom + couleur si profil existant (Cas 2)
}

type MemberPreview {
  name: String!
  color: String!
}
```

#### Exceptions custom

| Code | HTTP | Description |
|---|---|---|
| `INVITATION_NOT_FOUND` | 404 | Token invalide ou invitation inexistante |
| `INVITATION_EXPIRED` | 410 | Invitation depassee |
| `INVITATION_ALREADY_ACCEPTED` | 409 | Invitation deja utilisee |
| `INVITATION_CANCELLED` | 410 | Invitation annulee |
| `INVITATION_LIMIT_REACHED` | 422 | MAX_MEMBERS_PER_HOUSEHOLD atteint (membres + pending) |
| `NOT_INVITATION_OWNER` | 403 | Tentative d'annulation par un non-admin |
| `CANNOT_INVITE_SELF` | 422 | L'admin tente de s'inviter lui-meme |

#### Constantes

```typescript
// packages/shared/src/constants/invitation.ts
export const INVITATION_EXPIRY_DAYS = 7;
export const MAX_PENDING_INVITATIONS_PER_HOUSEHOLD = 10;
```

#### Infrastructure temps reel — Packages a installer

```bash
# apps/api
pnpm add graphql-ws graphql-redis-subscriptions ioredis

# apps/web + apps/mobile
pnpm add graphql-ws
```

#### Variables d'environnement requises

| Variable | Usage | Exemple |
|---|---|---|
| `APP_URL` | URL de base pour les liens d'invitation web | `https://app.familyhub.io` |
| `REDIS_URL` | Connexion Redis pour pub/sub (deja existant pour cache/sessions) | `rediss://...upstash.io:6379` |

**Note** : `REDIS_URL` est probablement deja configure pour Upstash (sessions Better Auth). Verifier si une connexion dediee est necessaire pour le pub/sub ou si on reutilise la meme.

### Conformite architecture

#### Patterns obligatoires (etablis Story 1.3)

| Pattern | Application a cette story | Reference |
|---|---|---|
| **Dot-notation fichiers** | `invitation.module.ts`, `invitation.service.ts`, `invitation.resolver.ts`, etc. | [Source: architecture.md#File-Naming] |
| **Module dans household/** | Fichiers `invitation.*` co-localises dans `apps/api/src/modules/household/` (meme bounded context) | [Source: architecture.md#Module-Boundaries] |
| **GraphQL code-first** | `@ObjectType()` dans `invitation.model.ts`, `@InputType()` dans `invitation.dto.ts`, `@Resolver()` + `@Subscription()` dans resolvers | [Source: architecture.md#GraphQL] |
| **Custom exceptions** | Classes dans `common/exceptions/invitation.exception.ts`, codes `INVITATION_*`, jamais `throw new Error()` | [Source: 1-3 Dev Notes] |
| **UUID v7 pour IDs** | `import { v7 as uuidv7 } from 'uuid'` dans le service, pas `@default(uuid())` du schema | [Source: architecture.md#IDs] |
| **Zod validation** | `.safeParse()` + exception custom (jamais `.parse()` qui throw ZodError brut) | [Source: 1-3 Code Review fix H3] |
| **Household scoping** | Ajouter `'Invitation'` a `HOUSEHOLD_SCOPED_MODELS` dans `household-extension.ts` | [Source: household-extension.ts:7 commentaire existant] |
| **Guard-only pour household context** | `@UseGuards(HouseholdGuard)` sur les resolvers scopes foyer, pas de middleware CLS | [Source: 1-3 ADR] |
| **Owner/Admin check dans le service** | Le resolver recoit `@Session()`, le service verifie `role === OWNER \|\| ADMIN` et throw `NotInvitationOwnerException` si non autorise | [Source: 1-3 pattern owner check] |
| **Logger NestJS** | Ajouter `private readonly logger = new Logger(InvitationService.name)` — log business events et security failures, pas les happy paths | [Source: 1-3 Code Review fix L3] |
| **PrismaModule est @Global()** | Pas besoin d'importer PrismaModule dans HouseholdModule | [Source: 1-3 Dev Notes] |
| **AuthModule bypass** | `acceptInvitation` et `invitationByToken` : l'invite n'est pas encore membre du foyer → `bypassHouseholdFilter()` pour les queries cross-household | [Source: household-extension.ts] |

#### Patterns frontend (etablis Story 1.3)

| Pattern | Application | Reference |
|---|---|---|
| **RSC-first (web)** | Pages dans `app/` sont des Server Components. Data fetching server-side via `registerApolloClient`. Mutations dans des Client Components avec `'use client'` | [Source: 1-3 RSC migration] |
| **`router.refresh()` apres mutations (web)** | Apres `createInvitation`, `acceptInvitation` → `router.refresh()` pour re-render RSC | [Source: 1-3 pattern] |
| **`refetchQueries` (mobile)** | Apres mutations → `refetchQueries: ['HouseholdInvitations']` | [Source: 1-3 pattern] |
| **Features directory** | `features/household/graphql.ts`, `features/household/components/invitation-list.tsx` | [Source: 1-3 file structure] |
| **Apollo Client imports (mobile)** | Hooks depuis `@apollo/client/react`, types depuis `@apollo/client/core` | [Source: 1-3 fix Apollo 4.x] |
| **Pas de HSL en React Native** | Couleurs hex uniquement pour les icones/SVG dans le mobile | [Source: 1-3 fix SVG] |

#### Anti-patterns a eviter

| Anti-pattern | Ce qu'il faut faire | Source |
|---|---|---|
| `throw new Error()` | Utiliser les custom exceptions `Invitation*Exception` | Story 1.3 review |
| `.parse()` Zod | `.safeParse()` + custom exception | Story 1.3 review fix H3 |
| `git add .` / `git add -A` | `git add` fichiers specifiques | .claude/rules/git-workflow.md |
| Logger dans le repository | Pas de logger dans `invitation.repository.ts` (Prisma couvre les logs DB) | Story 1.3 decision |
| Manual `where: { householdId }` | Laisser le Prisma extension injecter automatiquement via CLS | Story 1.3 household scoping |
| `useQuery`/`useEffect` pour data fetching web | RSC server-side fetch + `registerApolloClient` | Story 1.3 RSC migration |

### Librairies et frameworks — Versions et specifiques

| Package | Version | Usage dans cette story | Notes |
|---|---|---|---|
| `@nestjs/graphql` | ^13.0.0 | Decorateurs `@Resolver`, `@Mutation`, `@Query`, `@Subscription` | Deja installe |
| `@nestjs/apollo` | ^13.0.0 | Apollo Driver + config subscriptions | Deja installe |
| `@apollo/server` | ^5.0.0 | Apollo Server avec support natif `graphql-ws` | Deja installe |
| `better-auth` | ^1.4.18 | Auth pour le flow d'acceptation (Google OAuth / Magic Link) | Deja installe |
| `@thallesp/nestjs-better-auth` | ^2.4.0 | Decorateurs `@Session()`, `@AllowAnonymous()`, `@OptionalAuth()` | Deja installe |
| `resend` | ^4.0.0 | Envoi d'email d'invitation | Deja installe |
| `uuid` | ^13.0.0 | UUID v7 pour les IDs d'invitation (`v7 as uuidv7`) | Deja installe |
| `nestjs-cls` | ^6.2.0 | CLS store pour household context + future pub/sub context | Deja installe |
| `graphql-ws` | latest | Protocole WebSocket pour subscriptions GraphQL | **A installer (api + web + mobile)** |
| `graphql-redis-subscriptions` | latest | Pub/Sub Redis backend pour subscriptions multi-instances | **A installer (api)** |
| `ioredis` | latest | Client Redis pour `graphql-redis-subscriptions` | **A installer (api)** |
| `qrcode` | latest | Generation QR code cote client (web) | **A installer (web)** |
| `react-native-qrcode-svg` | latest | Generation QR code cote client (mobile) | **A installer (mobile)** |
| `@playwright/test` | latest | Tests E2E Web — flow invitation complet (T10) | **A installer (web, devDependencies)** |
| `maestro` | latest | Tests E2E Mobile — flow deep link et navigation (T11) | **A installer (CLI, pas npm)** |

**Node.js natif (pas de package) :**
- `crypto.randomBytes(32).toString('base64url')` — generation de tokens d'invitation

### Structure de fichiers — Fichiers a creer et modifier

#### Nouveaux fichiers

```
packages/db/prisma/schema/
  invitation.prisma                                    # Modele Invitation + enum InvitationStatus

packages/shared/src/
  enums/invitation.ts                                  # INVITATION_STATUS, INVITATION_RELATION const objects
  schemas/invitation.schema.ts                         # Zod: createInvitationInput, acceptInvitationInput
  constants/invitation.ts                              # INVITATION_EXPIRY_DAYS, MAX_PENDING_INVITATIONS_PER_HOUSEHOLD

packages/emails/src/templates/
  invitation.ts                                        # Template HTML email invitation (pattern OTP)
  invitation.spec.ts                                   # Tests rendu email

apps/api/src/common/
  pubsub/pubsub.module.ts                              # Module global PubSub (Redis backend)
  pubsub/pubsub.service.ts                             # Wrapper PubSub injectable avec topics types
  pubsub/__tests__/pubsub.service.spec.ts              # Tests unitaires PubSub service
  exceptions/invitation.exception.ts                   # 7 exceptions custom INVITATION_*

apps/api/src/modules/household/
  invitation.model.ts                                  # @ObjectType() GraphQL (Invitation, InvitationPublic, MemberPreview)
  invitation.dto.ts                                    # @InputType() (CreateInvitationInput, AcceptInvitationInput)
  invitation.service.ts                                # Logique metier (create, accept, cancel, list, getByToken)
  invitation.repository.ts                             # Acces Prisma
  invitation.resolver.ts                               # Queries, Mutations, Subscriptions GraphQL
  __tests__/invitation.service.spec.ts                 # Tests unitaires service
  __tests__/invitation.resolver.spec.ts                # Tests unitaires resolver
  __tests__/invitation.repository.spec.ts              # Tests unitaires repository

apps/api/test/
  invitation.e2e-spec.ts                               # Tests E2E flow complet

apps/web/
  app/invite/[token]/page.tsx                           # Ecran d'accueil invitation (public, hors layout auth)
  app/(app)/household/invite/page.tsx                   # Formulaire creation invitation (RSC + client form)
  features/household/components/invitation-list.tsx     # Liste des invitations du foyer

apps/mobile/
  app/invite/[token].tsx                                # Ecran d'accueil invitation (deep link)
  app/household/invite.tsx                              # Formulaire creation invitation
  features/household/components/invitation-list.tsx     # Liste des invitations du foyer

apps/web/
  playwright.config.ts                                  # Config Playwright (base URL, browser, CI)
  e2e/
    helpers/auth.helper.ts                              # Login programmatique (bypass UI via API)
    helpers/db.helper.ts                                # Seed data, cleanup between tests
    invitation.spec.ts                                  # 5 scenarios E2E invitation

apps/mobile/.maestro/
  config.yaml                                           # Config Maestro
  helpers/login.yaml                                    # Flow login automatise
  helpers/seed.yaml                                     # Seed data
  flows/
    invitation-create.yaml                              # Creation invitation
    invitation-deeplink.yaml                            # Deep link familyhub://invite/{token}
    invitation-accept.yaml                              # Acceptation → Home Hub
    invitation-expired.yaml                             # Lien expire → erreur
```

#### Fichiers a modifier

```
packages/db/prisma/schema/
  auth.prisma                          # + invitationsSent Invitation[] @relation("InvitedBy")
                                       # + invitationsAccepted Invitation[] @relation("AcceptedBy") sur User
  household.prisma                     # + invitations Invitation[] sur Household
                                       # + invitation Invitation? sur HouseholdMember

packages/shared/src/
  enums/index.ts                       # + export invitation enums
  schemas/index.ts                     # + export invitation schemas
  constants/index.ts                   # + export invitation constants

packages/emails/src/
  index.ts                             # + export renderInvitationEmail

apps/api/src/
  app.module.ts                        # + PubSubModule dans imports
                                       # + Config WebSocket/subscriptions Apollo Server
  common/prisma/household-extension.ts # + 'Invitation' dans HOUSEHOLD_SCOPED_MODELS
  modules/household/household.module.ts # + InvitationResolver, InvitationService, InvitationRepository dans providers
  modules/household/household.resolver.ts # + subscription householdMemberChanged
  modules/household/household.service.ts  # + publish HOUSEHOLD_MEMBER_CHANGED a la creation (retro 1.3)

apps/api/test/helpers/
  db.helper.ts                         # + invitations dans cleanDatabase() TRUNCATE

apps/web/
  lib/apollo-client.ts ou equivalent   # + GraphQLWsLink + split link (HTTP/WS)
  features/household/graphql.ts        # + queries/mutations/subscriptions invitation
  app/(app)/household/page.tsx         # + integration invitation-list dans le dashboard

apps/mobile/
  app/_layout.tsx                      # + Stack.Screen invite/[token] + household/invite
  app.json                             # + deep link scheme familyhub://invite/*
  features/household/graphql.ts        # + queries/mutations/subscriptions invitation
  app/(tabs)/index.tsx ou foyer        # + integration invitation-list

.github/workflows/
  ci.yml (ou equivalent)               # + job Playwright headless
                                       # + job Maestro emulator Android
```

#### Migrations

```bash
npx prisma migrate dev --name invitation_model
# Genere: packages/db/prisma/migrations/YYYYMMDDHHMMSS_invitation_model/migration.sql
```

### Exigences de tests

#### Strategie (ADR-8)

- **Tests unitaires backend** : Oui — stables, independants de l'UI
- **Tests E2E backend (API)** : Oui — valident la logique metier end-to-end
- **Tests E2E Web (Playwright)** : Oui — flow navigation complet, browser headless en CI
- **Tests E2E Mobile (Maestro)** : Oui — flow deep link + navigation, emulator en CI
- **Tests de composants visuels** : Non — differes (maquettes pas stabilisees)
- **Tests snapshot UI** : Non — differes
- **Couverture cible** : >80% sur les chemins critiques (NFR28)

#### Tests unitaires — `invitation.service.spec.ts`

Pattern : Vitest + mocks manuels (`vi.fn()`), meme structure que `household.service.spec.ts`.

| Test | AC | Description |
|---|---|---|
| `createInvitation` — happy path | AC-1 | Admin cree une invitation → token genere, statut PENDING, email envoye |
| `createInvitation` — avec email | AC-1, 8 | Email fourni → Resend appele avec le bon template |
| `createInvitation` — sans email | AC-1, 8 | Email absent → Resend non appele, invitation creee quand meme |
| `createInvitation` — linked profile (Cas 2) | AC-4 | linkedMemberProfileId fourni → verifier qu'il existe et appartient au foyer |
| `createInvitation` — role non autorise | AC-10 | User ADULT tente d'inviter → `NotInvitationOwnerException` |
| `createInvitation` — limite atteinte | AC-10 | membres + pending >= 20 → `InvitationLimitReachedException` |
| `createInvitation` — auto-invitation | AC-10 | Admin s'invite lui-meme → `CannotInviteSelfException` |
| `acceptInvitation` — Cas 1 (nouveau membre) | AC-3 | Token valide, pas de linked profile → nouveau HouseholdMember cree, couleur auto, statut ACCEPTED |
| `acceptInvitation` — Cas 2 (profil existant) | AC-5 | Token avec linkedMemberProfileId → HouseholdMember.userId mis a jour, donnees preservees |
| `acceptInvitation` — token inexistant | AC-10 | Token invalide → `InvitationNotFoundException` |
| `acceptInvitation` — token expire | AC-10 | Token expire → `InvitationExpiredException` |
| `acceptInvitation` — deja accepte | AC-10 | Token deja utilise → `InvitationAlreadyAcceptedException` |
| `acceptInvitation` — publie events | AC-3, 5 | Apres acceptation → PubSub publie `INVITATION_ACCEPTED` + `HOUSEHOLD_MEMBER_CHANGED` |
| `cancelInvitation` — happy path | AC-9 | Admin annule → statut CANCELLED |
| `cancelInvitation` — non admin | AC-9 | User non-admin tente d'annuler → `NotInvitationOwnerException` |
| `listInvitations` — filtre household | AC-9 | Retourne uniquement les invitations du foyer courant |
| `getInvitationByToken` — happy path | AC-2 | Token valide → retourne InvitationPublic (householdName, inviterName, role, relation) |
| `getInvitationByToken` — expire | AC-2 | Token expire → `InvitationExpiredException` |

#### Tests unitaires — `invitation.resolver.spec.ts`

| Test | Description |
|---|---|
| `createInvitation` | Delegue au service avec session.user.id et input |
| `acceptInvitation` | Delegue au service avec session.user.id et token |
| `cancelInvitation` | Delegue au service avec session.user.id et id |
| `householdInvitations` | Delegue au service avec householdId du CLS |
| `invitationByToken` | Delegue au service, pas de session requise |
| `invitationAccepted` subscription | Subscribe au topic `INVITATION_ACCEPTED` filtre par householdId |
| `householdMemberChanged` subscription | Subscribe au topic `HOUSEHOLD_MEMBER_CHANGED` filtre par householdId |

#### Tests unitaires — `invitation.repository.spec.ts`

| Test | Description |
|---|---|
| `create` | Appelle `prisma.invitation.create` avec les bons champs |
| `findByToken` | Appelle `prisma.invitation.findUnique` avec include household + invitedBy |
| `findByHousehold` | Appelle `prisma.invitation.findMany` filtre par householdId |
| `updateStatus` | Appelle `prisma.invitation.update` avec le bon statut |
| `countPendingByHousehold` | Appelle `prisma.invitation.count` avec `status: PENDING` |

#### Tests unitaires — `pubsub.service.spec.ts`

| Test | Description |
|---|---|
| `publish` | Delegue a `RedisPubSub.publish` avec le bon topic et payload |
| `subscribe` | Delegue a `RedisPubSub.asyncIterableIterator` avec le bon topic |

#### Tests email — `invitation.spec.ts` (packages/emails)

| Test | Description |
|---|---|
| `renderInvitationEmail` — happy path | Genere HTML avec inviterName, householdName, relation, lien |
| `renderInvitationEmail` — subject | Subject contient le nom du foyer |
| `renderInvitationEmail` — lien present | HTML contient le lien d'invitation cliquable |

#### Tests E2E API — `invitation.e2e-spec.ts` (T9)

Pattern : Supertest + TestingModule complet (meme pattern que `household.e2e-spec.ts`). Helpers `createTestUser()` + `cleanDatabase()`.

| Test | AC | Description |
|---|---|---|
| Flow complet Cas 1 | AC-1→3 | Auth admin → createInvitation → auth invite → acceptInvitation → verifier HouseholdMember cree avec bon role |
| Flow complet Cas 2 | AC-4→5 | Creer profil membre → createInvitation avec linkedMemberProfileId → acceptInvitation → verifier userId attache, donnees preservees |
| Invitation expiree | AC-10 | Creer invitation avec expiresAt passe → acceptInvitation → erreur INVITATION_EXPIRED |
| Limite membres | AC-10 | Remplir le foyer a 20 membres → createInvitation → erreur INVITATION_LIMIT_REACHED |
| Subscription receive event | AC-3, 9 | Admin subscribe → invite accepte → admin recoit event |
| Cross-household isolation | AC-10 | Admin foyer A ne voit pas les invitations du foyer B |

#### Mocks et helpers

```typescript
// Mock Resend (dans les tests unitaires)
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: vi.fn().mockResolvedValue({ id: 'email-id' }) },
  })),
}));

// Mock crypto (dans les tests unitaires)
vi.mock('crypto', async () => {
  const actual = await vi.importActual('crypto');
  return {
    ...actual,
    randomBytes: vi.fn(() => Buffer.from('test-token-32-bytes-exactly-here!')),
  };
});

// Mock PubSub (dans les tests unitaires)
const mockPubSub = {
  publish: vi.fn(),
  asyncIterableIterator: vi.fn(),
};
```

#### Tests E2E Web — Playwright (T10)

Pattern : `@playwright/test`, config dans `apps/web/playwright.config.ts`, helpers auth + DB.

| Test | AC | Description |
|---|---|---|
| Creation invitation | AC-1 | Admin → formulaire → lien + QR affiches |
| Acceptation Cas 1 | AC-2→3 | Lien → ecran invite → auth → dashboard avec colonne |
| Acceptation Cas 2 | AC-4→5 | Lien profil existant → donnees preservees |
| Lien expire | AC-10 | Lien expire → ecran d'erreur |
| Liste invitations | AC-9 | Statuts pending, accepted, expired affiches |

Setup CI : GitHub Actions job avec browser headless (`npx playwright install --with-deps chromium`).

#### Tests E2E Mobile — Maestro (T11)

Pattern : Maestro YAML flows, `.maestro/` directory, helpers login + seed.

| Test | AC | Description |
|---|---|---|
| Creation invitation | AC-1 | Formulaire → lien + QR |
| Deep link | AC-2, 8 | `familyhub://invite/{token}` → ecran invite |
| Acceptation | AC-3 | Acceptation → navigation vers Home Hub |
| Lien expire | AC-10 | Lien expire → message d'erreur |

Setup CI : GitHub Actions avec emulator Android.

### Intelligence Story 1.3 — Learnings a appliquer

#### Problemes rencontres et solutions (Story 1.3)

| Probleme | Solution appliquee | Impact Story 1.4 |
|---|---|---|
| Zod `.parse()` throw ZodError brut | `.safeParse()` + custom exception | **Appliquer** : tous les schemas Zod invitation doivent utiliser `.safeParse()` |
| Logger manquant | Ajouter `Logger` NestJS au service et guard | **Appliquer** : `InvitationService` doit avoir un logger. Pas dans le repository. |
| OCC non implemente | Differe a un story dedie (champ `version` present mais pas le mecanisme) | **Ignorer** : pas de champ `version` sur `Invitation` (pas de concurrence d'edition sur une invitation) |
| RSC migration complexe | Refactor vers server components + `registerApolloClient` | **Appliquer** : l'ecran `/invite/[token]` peut etre un RSC (data fetching server-side). Le formulaire de creation est un client component. |
| Mobile routing sans `(app)` group | Screen place a `app/household/create.tsx` + `Stack.Screen` dans `_layout.tsx` | **Appliquer** : `app/invite/[token].tsx` et `app/household/invite.tsx` + enregistrer dans `_layout.tsx` |
| SVG pas de HSL en React Native | Hex colors uniquement | **Appliquer** : couleurs en hex dans les composants mobile |
| Apollo Client 4.x imports mobile | Hooks depuis `@apollo/client/react`, types depuis `@apollo/client/core` | **Appliquer** : meme imports pour les nouveaux fichiers graphql |
| Guard vs middleware pour household context | Guard-only (plus securise) | **Appliquer** : pas de nouveau middleware. `HouseholdGuard` pour les resolvers scopes foyer. |
| `bypassHouseholdFilter()` pour auth | AuthModule recoit le client non-scope | **Appliquer** : `acceptInvitation` doit utiliser `bypassHouseholdFilter()` car l'invite n'est pas encore membre |
| GraphQL duplication web/mobile | Accepte temporairement (tech debt M1) | **Accepter** : `graphql.ts` duplique entre web et mobile pour l'instant |

#### Patterns de code a reproduire

```typescript
// Pattern service — validation Zod + custom exception (Story 1.3 fix)
const result = createInvitationSchema.safeParse(input);
if (!result.success) {
  throw new InvitationInputInvalidException(result.error.issues);
}

// Pattern service — owner/admin check (Story 1.3 pattern)
const member = await this.repository.findMemberByUserId(userId, householdId);
if (member.role !== HouseholdRole.OWNER && member.role !== HouseholdRole.ADMIN) {
  throw new NotInvitationOwnerException();
}

// Pattern service — generation token
const token = crypto.randomBytes(32).toString('base64url');

// Pattern service — couleur auto (Story 1.3 pattern)
const membersCount = await this.householdRepository.countMembers(householdId);
const color = getNextColor(membersCount);

// Pattern service — email non-bloquant
try {
  await this.sendInvitationEmail(invitation);
} catch (error) {
  this.logger.warn(`Failed to send invitation email: ${error.message}`, { invitationId: invitation.id });
  // Ne pas faire echouer la mutation — l'invitation est creee, le lien est retourne
}

// Pattern resolver — subscription (nouveau)
@Subscription(() => InvitationModel, {
  filter: (payload, variables) => payload.invitationAccepted.householdId === variables.householdId,
})
invitationAccepted(@Args('householdId') householdId: string) {
  return this.pubSubService.subscribe('INVITATION_ACCEPTED');
}
```

#### Review items non resolus (Story 1.3) a ne pas oublier

| Item | Severite | Impact |
|---|---|---|
| **H2 — OCC non implemente** | HIGH | Pas d'impact direct sur Story 1.4 (pas d'edition concurrente d'invitations). Ne pas ajouter de champ `version` sur `Invitation`. |
| **M1 — GraphQL duplique web/mobile** | MEDIUM | Continuer la duplication pour cette story. Resolution dans un story dedie. |

### Intelligence Git — Patterns recents

#### 5 derniers commits

```
92b8040 fix(api): address code review findings for story 1-3 (#45)
04ea370 fix(ci): copy shared package node_modules in api dockerfile
93a840d fix(ci): build shared package before mobile eas update
45c158e fix(ci): restore onlyBuiltDependencies for prisma and native packages
2781c2b feat: add household creation and data model (Story 1-3)
```

#### Observations pour cette story

- **Conventional commits** strictement respectes : `type(scope): description` en anglais
- **Scope `api`** pour les changements backend, pas de scope pour les changements multi-packages
- **CI/CD** : le Dockerfile API et le build mobile (EAS) ont eu des problemes avec les packages shared → verifier que `@family-hub/shared` et `@family-hub/emails` sont correctement copies/buildes
- **PR squash merge** vers `dev` avec reference au numero de PR (#45)
- **Branche** a creer : `feature/1-4-invitation-members` depuis `dev`

### Informations techniques recentes

#### graphql-ws (v6.x, 2025-2026)

- Protocole standard pour les subscriptions GraphQL (remplace `subscriptions-transport-ws`)
- Compatible Apollo Server 5 nativement via `ApolloServerPluginDrainHttpServer`
- Authentification via cookies de la requete HTTP upgrade dans le `onConnect` handler (`ctx.extra.request.headers.cookie`)
- Pattern NestJS : configurer dans `GraphQLModule.forRoot()` avec `subscriptions: { 'graphql-ws': { onConnect } }`

#### graphql-redis-subscriptions

- Wrapper `PubSub` utilisant Redis comme backend (compatible `ioredis`)
- Necessaire pour les deployments multi-instances (Railway peut scaler horizontalement)
- Pattern : creer un `RedisPubSub` instance dans un module global, injecter via DI

#### Prisma 7.x — Points d'attention

- `prisma migrate dev` ne lance plus `prisma generate` automatiquement → executer `prisma generate` explicitement apres migration
- Client Extensions : `$use()` middleware completement supprime, uniquement `$extends`
- Le household extension existant utilise `$extends` → compatible

#### Better Auth — Flow d'acceptation

- L'invite qui clique le lien n'est pas encore authentifié
- Le frontend doit d'abord afficher l'ecran d'invitation (query `@AllowAnonymous`)
- Puis proposer l'auth (Google OAuth ou Magic Link) via Better Auth
- Apres auth, le frontend appelle `acceptInvitation` avec le token
- Better Auth gere la creation de compte si l'utilisateur est nouveau

#### Playwright (v1.x, 2025-2026)

- Framework E2E officiel Microsoft, cross-browser (Chromium, Firefox, WebKit)
- API `test.describe/test` compatible avec les patterns Vitest
- `page.goto()`, `page.click()`, `page.waitForSelector()` pour les flows
- Authentification reuse : `storageState` pour persister les cookies entre tests
- CI : `npx playwright install --with-deps chromium` pour le mode headless

#### Maestro (v1.x, 2025-2026)

- Outil E2E mobile declaratif (YAML), supporte iOS + Android
- Deep link testing : `- openLink: "familyhub://invite/{token}"`
- Pas besoin de build specifique — fonctionne sur le build Expo dev/preview
- CI : GitHub Actions avec `reactivecircus/android-emulator-runner`

### Project Structure Notes

- **Alignement monorepo** : cette story touche 5 packages (`db`, `shared`, `emails`, `api`, `web`, `mobile`) — respecter les frontieres de chaque package
- **Pas de nouveau package** : tout s'integre dans les packages existants
- **Module invitation dans household/** : pas de nouveau module NestJS, fichiers `invitation.*` co-localises (meme bounded context FR1-9)
- **PubSub module** : nouveau module `common/pubsub/` — global et reutilisable pour toute l'app (rituels, notifications futures)
- **Deep link mobile** : configurer dans `app.json` le scheme `familyhub://`, route `/invite/[token]` accessible sans auth
- **Page web publique** : `/invite/[token]` hors du layout `(app)` pour etre accessible sans session
- **Playwright (web)** : config `playwright.config.ts` a la racine de `apps/web/`, tests dans `apps/web/e2e/`
- **Maestro (mobile)** : flows YAML dans `apps/mobile/.maestro/`, helpers dans `.maestro/helpers/`
- **CI** : nouveaux jobs dans le workflow GitHub Actions pour Playwright headless et Maestro emulator

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-1, Story 1.4] — Acceptance criteria, user story, technical requirements
- [Source: _bmad-output/planning-artifacts/architecture.md#GraphQL, #Database, #Auth, #Modules] — Patterns techniques, stack, conventions
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Flux-2, #InvitationScreen] — UX flow invitation Marc, composant InvitationScreen (3 variantes)
- [Source: _bmad-output/implementation-artifacts/1-3-creation-de-foyer-et-modele-de-donnees-familial.md] — Learnings, patterns, review findings
- [Source: apps/api/src/common/prisma/household-extension.ts] — Household scoping, HOUSEHOLD_SCOPED_MODELS
- [Source: apps/api/src/modules/household/] — Pattern module existant (model, dto, service, repository, resolver)
- [Source: apps/api/src/common/exceptions/household.exception.ts] — Pattern custom exceptions
- [Source: packages/emails/src/templates/otp-code.ts] — Pattern template email
- [Source: packages/shared/src/constants/household.ts] — MAX_MEMBERS_PER_HOUSEHOLD, getNextColor()
- [Source: apps/api/src/lib/auth.ts] — Pattern envoi email Resend
- [Source: apps/api/test/household.e2e-spec.ts] — Pattern tests E2E

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (claude-opus-4-6)

### Debug Log References

N/A

### Completion Notes List

#### Fix: Flow d'invitation pour utilisateurs non connectes (2026-03-05)

**Probleme** : Un utilisateur non connecte cliquant sur `/invite/TOKEN` etait redirige vers `/login` par le proxy (middleware Next.js 16) sans preservation de l'URL de retour. Apres connexion, il atterrissait sur `/household/create` au lieu de la page d'invitation.

**Cause racine** : Le proxy (`apps/web/proxy.ts`) traitait toutes les routes non-auth comme protegees, sans notion de routes publiques. De plus, la redirection vers `/login` ne preservait pas l'URL d'origine via un query param `?redirect=`.

**Corrections appliquees** :

1. **`apps/web/proxy.ts`** — Ajout de `PUBLIC_ROUTES = ['/invite', '/api']` pour permettre l'acces sans auth. Ajout de `?redirect={pathname}` lors de la redirection vers `/login` pour les routes protegees.

2. **`apps/web/app/(app)/household/page.tsx`** — Remplacement de `redirect('/household/create')` par une page d'accueil inline avec `PendingInviteBanner` et bouton CTA "Creer un foyer". Permet a l'utilisateur de voir l'invitation en attente avant de creer un foyer.

3. **`apps/web/app/(app)/layout.tsx`** — Le fallback auth client-side preserve maintenant l'URL courante : `router.replace(\`/login?redirect=...\`)`.

4. **`apps/web/app/(auth)/verify-otp/verify-otp-form.tsx`** — Le lien "Utiliser une autre adresse email" preserve le param `?redirect=` lors du retour a `/login`.

5. **`apps/api/src/modules/household/invitation.service.ts`** — `getInvitationByToken` recupere maintenant le `displayName` du `HouseholdMember` de l'inviteur (via `findMemberByUserId`) et l'utilise comme `inviterName` dans `toPublicModel`. Fallback sur `User.name` si le displayName est absent. Corrige le champ "Invite par:" qui etait vide car `User.name` n'est pas collecte par Better Auth lors de l'inscription OTP.

**Design decisions** :
- L'email sur l'invitation sert uniquement de canal de distribution (envoi du lien), pas de verification d'identite. Pas de verification de correspondance email a l'acceptation — un utilisateur peut s'inscrire avec un email different de celui cible par l'invitation. C'est le meme modele que Slack, Notion, etc.
- La securite repose sur le token (256 bits, usage unique, expiration 7j, annulable par admin).
- L'invitation sans email (lien seul) est un cas d'usage valide pour le contexte familial (partage via WhatsApp, SMS, en personne, QR code).

### File List

#### Fichiers modifies (flow d'invitation)

| Fichier | Changement |
|---------|-----------|
| `apps/web/proxy.ts` | Ajout `PUBLIC_ROUTES`, preservation `?redirect=` |
| `apps/web/app/(app)/household/page.tsx` | Page d'accueil avec CTA au lieu du redirect |
| `apps/web/app/(app)/layout.tsx` | Preservation redirect URL dans fallback auth |
| `apps/web/app/(auth)/verify-otp/verify-otp-form.tsx` | Preservation redirect sur lien "changer d'email" |
| `apps/api/src/modules/household/invitation.service.ts` | Resolution `inviterName` via `HouseholdMember.displayName` |

#### Fix: WebSocket subscriptions et authentification (2026-03-06)

**Probleme** : Les subscriptions GraphQL ne fonctionnaient pas. Trois causes identifiees :

1. **Auth WS via Bearer echouait** : Le endpoint `/api/ws-token` (Next.js) exposait la valeur du cookie httpOnly de session au JS client, puis l'envoyait via `connectionParams`. Le `onConnect` utilisait `Authorization: Bearer <token>` mais le cookie contient `token.hmacSignature` — Better Auth Bearer plugin n'accepte que le token seul.

2. **AuthGuard rejetait les subscriptions** : Le `AuthGuard` de `nestjs-better-auth` appelle toujours `getSession` avec `req.headers`, mais le contexte WS ne contenait pas de headers — d'ou `Unauthorized`.

3. **Redis PubSub serialise les Date en string** : `JSON.stringify` convertit `Date` en string ISO, mais `JSON.parse` ne reconvertit pas. Le scalar GraphQL `DateTime` refusait de serialiser une string → erreur silencieuse `DateTime.serialize() returned null`.

**Corrections appliquees** :

1. **`apps/api/src/app.module.ts`** — `onConnect` lit les cookies directement depuis la requete HTTP upgrade (`ctx.extra.request.headers.cookie`) et appelle `getSession` avec le header cookie. Le contexte GraphQL inclut le cookie header pour que le `AuthGuard` puisse aussi resoudre la session. Plus besoin de `connectionParams` ni de token exchange.

2. **`apps/api/src/common/pubsub/pubsub.service.ts`** — Ajout d'un `reviver` au constructeur `RedisPubSub` qui reconvertit les strings ISO 8601 en objets `Date` lors de la deserialisation des messages Redis.

3. **`apps/web/components/providers/apollo-provider.tsx`** — Suppression de `connectionParams` et du `fetch('/api/ws-token')`. Le `createClient` est maintenant minimal (`url` + `lazy: true`), les cookies sont envoyes automatiquement par le browser sur la requete upgrade.

4. **Supprime** : `apps/web/app/api/ws-token/route.ts` — endpoint inutile qui exposait le cookie httpOnly au JS client (faille de securite).

5. **`apps/web/proxy.ts`** — Retire `/api` des `PUBLIC_ROUTES` (plus de routes API Next.js).

6. **Cache Apollo** — Remplacement de `refetchQueries` par `cache.updateQuery` dans `invitation-list.tsx` et `members-list.tsx` pour eviter le clipping/flicker lors des mises a jour temps reel.

**Design decisions** :
- L'auth WebSocket utilise les cookies de la requete HTTP upgrade — standard HTTP, pas d'exposition du cookie httpOnly, pas d'endpoint intermediaire.
- Le `reviver` dans `RedisPubSub` reconvertit generiquement toutes les strings ISO 8601 en `Date`, applicable a tous les futurs topics sans modification.
- Les subscriptions mettent a jour le cache Apollo directement plutot que de refetch pour une UX fluide.
