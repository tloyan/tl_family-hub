# Invitation Module — Architecture & flux

Module d'invitation des membres au sein du household. Permet aux OWNER/ADMIN d'inviter de nouvelles personnes via un lien tokenise, avec notification email optionnelle et mise a jour temps reel via WebSocket.

## Architecture globale

```
Frontend                           API (NestJS)                          DB / Redis
   |                                  |                                     |
   |-- createInvitation ------------->|                                     |
   |   (Mutation, HouseholdGuard)     | 1. Valide input (Zod)              |
   |                                  | 2. Verifie role OWNER/ADMIN        |
   |                                  | 3. Verifie limites (20 membres,    |
   |                                  |    10 invitations pending)          |
   |                                  | 4. Genere token crypto (32 bytes)  |
   |                                  | 5. Cree invitation en BDD -------->| INSERT invitation
   |                                  | 6. Envoie email (Resend, optionnel)|
   |<-- InvitationModel --------------|                                     |
   |                                  |                                     |
   |-- invitationByToken ------------>|                                     |
   |   (Query, @AllowAnonymous)       | Retourne vue publique ------------>| SELECT (bypassFilter)
   |<-- InvitationPublicModel --------|                                     |
   |                                  |                                     |
   |-- acceptInvitation ------------->|                                     |
   |   (Mutation, auth sans guard)    | 1. Trouve par token                 |
   |                                  | 2. Verifie statut + expiration      |
   |                                  | 3. Verifie pas deja membre          |
   |                                  | 4. Cree/lie le membre ------------>| INSERT/UPDATE member
   |                                  | 5. Met a jour statut ACCEPTED ---->| UPDATE invitation
   |                                  | 6. Publie events PubSub ---------->| Redis PUBLISH
   |<-- HouseholdMemberModel ---------|                                     |
   |                                  |                                     |
   |<== invitationAccepted ===========| <--- Redis SUBSCRIBE               |
   |<== householdMemberChanged ========|     (WebSocket subscription)       |
   |   (Subscriptions temps reel)     |                                     |
```

## Fichiers du module

Tous dans `apps/api/src/modules/household/` :

| Fichier                    | Role                                                                             |
| -------------------------- | -------------------------------------------------------------------------------- |
| `invitation.topics.ts`     | Constantes PubSub (`invitation.accepted`)                                        |
| `household.topics.ts`      | Constantes PubSub (`household.member_changed`)                                   |
| `invitation.model.ts`      | Types GraphQL : `InvitationModel`, `InvitationPublicModel`, `MemberPreviewModel` |
| `invitation.dto.ts`        | Inputs GraphQL : `CreateInvitationInput`, `AcceptInvitationInput`                |
| `invitation.repository.ts` | Couche Prisma, 10 methodes d'acces aux donnees                                   |
| `invitation.service.ts`    | Logique metier : create, accept, cancel, list, getByToken                        |
| `invitation.resolver.ts`   | Endpoints GraphQL : 3 mutations, 2 queries, 1 subscription                       |

Fichiers d'exception dans `apps/api/src/common/exceptions/` :

| Fichier                   | Role                                                 |
| ------------------------- | ---------------------------------------------------- |
| `invitation.exception.ts` | 8 exceptions metier avec codes HTTP et codes machine |

## Endpoints GraphQL

### Mutations

| Mutation                  | Auth                          | Description                                                                |
| ------------------------- | ----------------------------- | -------------------------------------------------------------------------- |
| `createInvitation(input)` | `@Session` + `HouseholdGuard` | Cree une invitation (OWNER/ADMIN uniquement)                               |
| `acceptInvitation(input)` | `@Session` seulement          | Accepte une invitation par token (pas de guard, l'invite n'est pas membre) |
| `cancelInvitation(id)`    | `@Session` + `HouseholdGuard` | Annule une invitation pending (OWNER/ADMIN uniquement)                     |

### Queries

| Query                      | Auth              | Description                                 |
| -------------------------- | ----------------- | ------------------------------------------- |
| `invitationByToken(token)` | `@AllowAnonymous` | Vue publique pour la page `/invite/[token]` |
| `householdInvitations`     | `HouseholdGuard`  | Liste toutes les invitations d'un household |

### Subscriptions

| Subscription                          | Filtre                                          | Description                                  |
| ------------------------------------- | ----------------------------------------------- | -------------------------------------------- |
| `invitationAccepted(householdId)`     | `payload.householdId === variables.householdId` | Notifie quand une invitation est acceptee    |
| `householdMemberChanged(householdId)` | `payload.householdId === variables.householdId` | Notifie quand la composition du foyer change |

## Modeles GraphQL

### InvitationModel (vue admin)

```graphql
type Invitation {
  id: ID!
  token: String!
  role: HouseholdRole!
  relation: String!
  status: InvitationStatus!
  email: String
  expiresAt: DateTime!
  acceptedAt: DateTime
  createdAt: DateTime!
  householdId: ID!
  invitedByUserId: ID!
  invitedByUserName: String
  acceptedByUserId: ID
  linkedMemberProfileId: ID
}
```

### InvitationPublicModel (vue anonyme)

```graphql
type InvitationPublic {
  householdName: String!
  inviterName: String!
  role: HouseholdRole!
  relation: String!
  status: InvitationStatus!
  expiresAt: DateTime!
  linkedMemberProfile: MemberPreview
}
```

### InvitationStatus (enum)

```graphql
enum InvitationStatus {
  PENDING
  ACCEPTED
  EXPIRED
  CANCELLED
}
```

## Exceptions

| Exception                            | HTTP | Code                          | Quand                                      |
| ------------------------------------ | ---- | ----------------------------- | ------------------------------------------ |
| `InvitationNotFoundException`        | 404  | `INVITATION_NOT_FOUND`        | Token ou ID invalide                       |
| `InvitationExpiredException`         | 410  | `INVITATION_EXPIRED`          | Delai de 7 jours depasse                   |
| `InvitationAlreadyAcceptedException` | 409  | `INVITATION_ALREADY_ACCEPTED` | Invitation deja utilisee                   |
| `InvitationCancelledException`       | 410  | `INVITATION_CANCELLED`        | Annulee par un admin                       |
| `InvitationLimitReachedException`    | 409  | `INVITATION_LIMIT_REACHED`    | Max 20 membres ou 10 invitations pending   |
| `NotInvitationOwnerException`        | 403  | `NOT_INVITATION_OWNER`        | L'utilisateur n'est pas OWNER/ADMIN        |
| `CannotInviteSelfException`          | 400  | `CANNOT_INVITE_SELF`          | L'utilisateur est deja membre du household |
| `InvitationInputInvalidException`    | 400  | `INVITATION_INPUT_INVALID`    | Input ne passe pas la validation Zod       |

## Logique metier detaillee

### Flux de creation d'invitation

```
createInvitation(userId, householdId, input)
    |
    |--> Zod safeParse(input) --- echec --> InvitationInputInvalidException
    |
    |--> findMemberByUserId(userId, householdId)
    |    |
    |    |--> role != OWNER && role != ADMIN --> NotInvitationOwnerException
    |
    |--> Promise.all([countMembers, countPending])
    |    |
    |    |--> members + pending >= 20 --> InvitationLimitReachedException
    |    |--> pending >= 10 ------------> InvitationLimitReachedException
    |
    |--> crypto.randomBytes(32).toString('base64url') --> token
    |--> uuidv7() --> id
    |--> new Date() + 7 jours --> expiresAt
    |
    |--> repository.create({ id, token, role, relation, status: PENDING, ... })
    |
    |--> Si email fourni :
    |    |--> renderInvitationEmail() depuis @family-hub/emails
    |    |--> resend.emails.send() (try/catch, non-bloquant)
    |
    |--> return toModel(invitation)
```

### Flux d'acceptation d'invitation

Deux cas possibles lors de l'acceptation :

**Case 1 — Nouveau membre** : l'invite n'a pas de profil pre-existant dans le household. On cree un nouveau `HouseholdMember` avec la prochaine couleur disponible.

**Case 2 — Profil lie** : un profil membre a ete pre-cree (ex : un enfant cree par le parent). Le `linkedMemberProfileId` pointe vers ce profil. On rattache simplement l'userId au profil existant.

```
acceptInvitation(userId, input)
    |
    |--> Zod safeParse(input) --- echec --> InvitationInputInvalidException
    |
    |--> findByToken(token) --- null --> InvitationNotFoundException
    |
    |--> Check statut :
    |    |--> ACCEPTED ----> InvitationAlreadyAcceptedException
    |    |--> CANCELLED ---> InvitationCancelledException
    |    |--> != PENDING --> InvitationExpiredException
    |
    |--> Check expiration :
    |    |--> now > expiresAt --> updateStatus(EXPIRED) + InvitationExpiredException
    |
    |--> findMemberByUserId(userId, householdId)
    |    |--> existe --> CannotInviteSelfException (deja membre)
    |
    |--> Si linkedMemberProfileId (Case 2) :
    |    |--> linkMemberToUser(profileId, userId)
    |
    |--> Sinon (Case 1) :
    |    |--> countMembers --> getNextColor(count)
    |    |--> createMember({ id: uuidv7(), role, color, userId, householdId })
    |
    |--> updateStatus(ACCEPTED, acceptedAt: now, acceptedByUserId: userId)
    |
    |--> pubSubService.publish('invitation.accepted', ...)
    |--> pubSubService.publish('household.member_changed', ...)
    |
    |--> return toMemberModel(member)
```

## Scoping Prisma et bypassHouseholdFilter

Le projet utilise un **scoping automatique** via une extension Prisma : toutes les requetes sur les modeles `HouseholdMember`, `Circle` et `Invitation` sont automatiquement filtrees par `householdId` (injecte via CLS depuis le `HouseholdGuard`).

Probleme : lors de l'acceptation d'une invitation, l'invite **n'est pas encore membre du household**. Le `HouseholdGuard` ne s'applique pas (pas de header `x-household-id`), et le CLS ne contient pas de `householdId`.

Solution : les methodes du repository qui operent hors du contexte household utilisent `this.prisma.bypassHouseholdFilter()` pour acceder au `PrismaClient` non-scope :

| Methode                     | Pourquoi bypass                               |
| --------------------------- | --------------------------------------------- |
| `findByToken()`             | L'invite accede par token, pas par household  |
| `updateStatus()`            | Le flow d'acceptation n'a pas de guard        |
| `countPendingByHousehold()` | Verification de limite globale                |
| `countMembersByHousehold()` | Verification de limite globale                |
| `findMemberByUserId()`      | Verification d'appartenance (guard ou accept) |
| `createMember()`            | Nouveau membre dans le flow d'acceptation     |
| `linkMemberToUser()`        | Case 2 : rattachement de profil               |

Les methodes `create()`, `findByHousehold()`, `findById()` utilisent le Prisma scope car elles sont appelees derriere le `HouseholdGuard` (le CLS contient le `householdId`).

## Constantes et schemas partages

Definis dans `packages/shared/src/` et reutilises cote API et clients :

| Constante / Schema                      | Chemin                         | Valeur                                                              |
| --------------------------------------- | ------------------------------ | ------------------------------------------------------------------- |
| `INVITATION_EXPIRY_DAYS`                | `constants/invitation.ts`      | `7`                                                                 |
| `MAX_PENDING_INVITATIONS_PER_HOUSEHOLD` | `constants/invitation.ts`      | `10`                                                                |
| `MAX_MEMBERS_PER_HOUSEHOLD`             | `constants/household.ts`       | `20`                                                                |
| `createInvitationInput` (Zod)           | `schemas/invitation.schema.ts` | role (enum), relation (1-50 chars), email? , linkedMemberProfileId? |
| `acceptInvitationInput` (Zod)           | `schemas/invitation.schema.ts` | token (string, min 1)                                               |
| `InvitationStatus`                      | `enums/invitation.ts`          | PENDING, ACCEPTED, EXPIRED, CANCELLED                               |
| `getNextColor(count)`                   | `constants/household.ts`       | Couleur cyclique parmi 8 couleurs                                   |

## PubSub et subscriptions temps reel

Les topics sont definis localement dans chaque module (pas de registre central) :

```typescript
// invitation.topics.ts
export const InvitationTopics = {
  ACCEPTED: 'invitation.accepted',
} as const;

// household.topics.ts
export const HouseholdTopics = {
  MEMBER_CHANGED: 'household.member_changed',
} as const;
```

Le `PubSubService` (module global) wrape `graphql-redis-subscriptions` avec Redis :

- `publish(topic, payload)` — publie un message
- `asyncIterableIterator(topic)` — retourne un iterateur pour les subscriptions GraphQL
- `reviver` — reconvertit les strings ISO 8601 en objets `Date` lors de la deserialisation (necessaire car `JSON.stringify` convertit les `Date` en string, et le scalar GraphQL `DateTime` refuse de serialiser une string)

Les subscriptions utilisent un **filtre par householdId** pour que chaque client ne recoive que les events de son propre household :

```typescript
@Subscription(() => InvitationModel, {
  filter: (payload, variables) =>
    payload.invitationAccepted.householdId === variables.householdId,
})
```

### Authentification WebSocket

L'authentification WebSocket utilise les cookies de la requete HTTP upgrade — le browser les envoie automatiquement lors de l'ouverture d'un WebSocket vers le meme domaine.

```
Browser                          API (NestJS)
   |                                |
   |-- new WebSocket(ws://...)  --->|
   |   (HTTP upgrade request)       |
   |   Cookie: better-auth...=xxx   |
   |                                |-- onConnect:
   |                                |   ctx.extra.request.headers.cookie
   |                                |   → getSession({ headers: { cookie } })
   |                                |   → session stockee dans ctx.extra
   |<-- connection_ack -------------|
   |                                |
   |-- subscribe { query, vars } -->|
   |                                |-- AuthGuard:
   |                                |   req.headers.cookie (depuis ctx.extra)
   |                                |   → getSession() → session valide
   |                                |
   |<== next { data } ==============| (quand un event est publie)
```

Le `nestjs-better-auth` `AuthGuard` appelle toujours `getSession` avec `req.headers`. Le contexte GraphQL pour les connexions WS inclut donc le cookie header dans `req.headers` pour que le guard puisse resoudre la session :

```typescript
context: ({ req, extra }) => {
  if (extra?.['session']) {
    return {
      req: {
        session: extra['session'],
        headers: { cookie: extra['cookieHeader'] },
      },
    };
  }
  return { req };
},
```

### Mise a jour du cache Apollo (client)

Les subscriptions mettent a jour le cache Apollo directement via `cache.updateQuery` plutot que `refetchQueries` pour eviter les re-renders et le flicker UI :

```typescript
useSubscription(INVITATION_ACCEPTED_SUBSCRIPTION, {
  variables: { householdId },
  onData({ client, data: subData }) {
    if (!subData.data) return;
    const accepted = subData.data.invitationAccepted;
    client.cache.updateQuery({ query: HOUSEHOLD_INVITATIONS_QUERY }, (existing) => {
      if (!existing) return existing;
      return {
        householdInvitations: existing.householdInvitations.map((inv) =>
          inv.id === accepted.id ? { ...inv, ...accepted } : inv,
        ),
      };
    });
  },
});
```

## Fichiers modifies (retro-fit household)

| Fichier                     | Modification                                                                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `household.model.ts`        | Ajout du champ `householdId` sur `HouseholdMemberModel` (necessaire pour le filtre des subscriptions)                                      |
| `household.module.ts`       | Enregistrement des providers : `InvitationResolver`, `InvitationService`, `InvitationRepository`                                           |
| `household.resolver.ts`     | Injection de `PubSubService`, ajout de la subscription `householdMemberChanged`                                                            |
| `household.service.ts`      | Injection de `PubSubService`, publication de `MEMBER_CHANGED` lors de la creation d'un household, mapping de `householdId` sur les membres |
| `test/helpers/db.helper.ts` | Ajout de `invitations` dans le TRUNCATE des tests e2e                                                                                      |

## Email d'invitation

L'email est optionnel. S'il est fourni dans `CreateInvitationInput.email` :

1. Le service genere le lien d'invitation : `{NEXT_PUBLIC_API_URL}/invite/{token}`
2. Le template HTML est genere par `renderInvitationEmail()` depuis `@family-hub/emails`
3. L'envoi se fait via **Resend** dans un try/catch (non-bloquant : si l'email echoue, l'invitation est quand meme creee, seul un warning est log)

Le template est en francais et contient : nom de l'inviteur, nom du household, relation, bouton CTA, mention d'expiration a 7 jours.

## Schema de donnees (Prisma)

```prisma
model Invitation {
  id                    String           @id @default(uuid()) @db.Uuid
  token                 String           @unique @db.VarChar(64)
  role                  HouseholdRole
  relation              String           @db.VarChar(50)
  status                InvitationStatus @default(PENDING)
  email                 String?          @db.VarChar(255)
  expiresAt             DateTime
  acceptedAt            DateTime?
  createdAt             DateTime         @default(now())
  updatedAt             DateTime         @updatedAt
  householdId           String           @db.Uuid
  invitedByUserId       String
  acceptedByUserId      String?
  linkedMemberProfileId String?          @unique @db.Uuid

  household           Household        @relation(...)
  invitedBy           User             @relation("InvitedBy", ...)
  acceptedBy          User?            @relation("AcceptedBy", ...)
  linkedMemberProfile HouseholdMember? @relation(...)

  @@index([householdId])
  @@index([token])
  @@index([status])
  @@map("invitations")
}
```

Le modele `Invitation` est enregistre dans `householdExtension` comme modele scope — les requetes via le Prisma scope sont automatiquement filtrees par `householdId`.

## Flow d'invitation — Acces public et redirection post-login

### Middleware (proxy.ts)

Le proxy Next.js 16 (`apps/web/proxy.ts`) definit trois categories de routes :

| Categorie | Routes                  | Comportement                                                      |
| --------- | ----------------------- | ----------------------------------------------------------------- |
| Auth      | `/login`, `/verify-otp` | Accessibles sans auth. Si authentifie, redirect vers `/household` |
| Public    | `/invite`               | Accessibles a tous, aucune redirection                            |
| Protege   | Tout le reste           | Si non authentifie, redirect vers `/login?redirect={pathname}`    |

Le `?redirect=` est preserve a travers tout le flow d'authentification :

- `login-form.tsx` le lit via `searchParams.get('redirect')` et le passe a Google OAuth (`callbackURL`) et a la page OTP
- `verify-otp-form.tsx` le lit et redirige vers `redirectTo` apres verification reussie

### Flow complet (utilisateur non connecte)

```
1. Clic sur /invite/TOKEN
   → proxy.ts: route publique → NextResponse.next()
   → Page publique affichee (nom du foyer, inviteur, role, relation)

2. Clic "Se connecter pour rejoindre"
   → localStorage.pendingInviteToken = TOKEN
   → router.push('/login?redirect=/invite/TOKEN')

3. Connexion (Email OTP ou Google OAuth)
   → redirect preserve dans le flow
   → Apres auth: router.replace('/invite/TOKEN')

4. Retour sur /invite/TOKEN (authentifie)
   → Bouton "Rejoindre le foyer" affiche
   → acceptInvitation mutation
   → localStorage.removeItem('pendingInviteToken')
   → router.replace('/household')
```

### Page /household sans foyer

Quand un utilisateur authentifie n'a pas de foyer, la page `/household` affiche une page d'accueil avec :

- `PendingInviteBanner` : si `localStorage.pendingInviteToken` existe, affiche un lien vers l'invitation
- Bouton CTA "Creer un foyer" vers `/household/create`

Cela remplace l'ancien `redirect('/household/create')` qui empechait l'affichage du banner d'invitation.

### inviterName — Resolution depuis HouseholdMember.displayName

Le champ `inviterName` dans `InvitationPublicModel` utilise le `displayName` du `HouseholdMember` de l'inviteur (recupere via `findMemberByUserId`), avec fallback sur `User.name`. Cela est necessaire car `User.name` n'est pas collecte par Better Auth lors de l'inscription par email OTP — seul Google OAuth le remplit automatiquement. Le `displayName` est le nom que l'utilisateur a choisi d'afficher dans le foyer.

### Securite des invitations sans email

L'email sur l'invitation est un canal de distribution (envoi du lien), pas une verification d'identite. N'importe quel utilisateur authentifie possedant le lien peut accepter l'invitation, meme si son email differe de celui cible. La securite repose sur :

- Token 256 bits (`crypto.randomBytes(32).toString('base64url')`) — impossible a deviner
- Usage unique (statut passe a ACCEPTED)
- Expiration configurable (`INVITATION_EXPIRY_DAYS = 7`)
- Annulable par OWNER/ADMIN a tout moment
- Limite de 10 invitations pending par foyer
