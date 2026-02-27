# Story 1.3: Creation de foyer et modele de donnees familial

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a utilisateur authentifie,
I want creer un foyer en renseignant un nom,
so that je puisse commencer a organiser ma famille.

## Acceptance Criteria

### AC1: Creation d'un foyer

- **Given** je suis authentifie et je n'ai pas encore de foyer
- **When** je tape "Creer un foyer" et entre un nom (ex: "Famille Dupont")
- **Then** un foyer est cree en base et je recois automatiquement le role "owner" avec une couleur attribuee automatiquement

### AC2: Modele de donnees familial avec 5 cercles

- **Given** un foyer est cree
- **When** je verifie le schema de donnees
- **Then** le modele inclut les 5 cercles (Personnel, Couple, Foyer, Famille elargie, Connaissances) — seul Foyer est expose en UI au MVP (FR9)

### AC3: Prisma Client Extension — Isolation automatique par foyer

- **Given** un foyer existe avec des donnees
- **When** une requete API est executee par un membre authentifie
- **Then** le Prisma Client Extension injecte automatiquement le `householdId` du contexte courant — aucune donnee cross-foyer ne peut etre retournee (FR32, NFR9)

### AC4: Consultation du foyer

- **Given** je suis owner du foyer
- **When** je consulte mon foyer
- **Then** je vois le nom du foyer, le nombre de membres, et mon profil avec ma couleur attribuee automatiquement

### AC5: Isolation cross-foyer — test automatise

- **Given** je tente d'acceder aux donnees d'un autre foyer
- **When** la requete s'execute
- **Then** elle retourne zero resultat (test automatise d'isolation)

### AC6: Support multi-foyer en modele de donnees

- **Given** le modele de donnees est cree
- **When** je verifie la structure
- **Then** un utilisateur peut appartenir a N foyers (FR9) — seul 1 foyer est creeable au MVP, mais le modele supporte le multi-foyer pour la v2.0

## Tasks / Subtasks

### T1: Schema Prisma — Modele de donnees familial (AC: 1, 2, 6)

- [x] T1.1: Creer `packages/db/prisma/schema/household.prisma` avec les modeles `Household`, `HouseholdMember`, `Circle` et les enums `HouseholdRole`, `CircleType`
- [x] T1.2: Ajouter la relation `User` → `HouseholdMember` (un User a N HouseholdMember, chaque HouseholdMember lie un User a un Household)
- [x] T1.3: Definir les 5 cercles comme enum `CircleType` : `PERSONAL`, `COUPLE`, `HOUSEHOLD`, `EXTENDED_FAMILY`, `ACQUAINTANCES`
- [x] T1.4: Definir l'enum `HouseholdRole` : `OWNER`, `ADMIN`, `ADULT`, `CHILD`, `PROVIDER`
- [x] T1.5: Ajouter le champ `color` (String) sur `HouseholdMember` pour la couleur automatique
- [x] T1.6: Ajouter le champ `version` (Int, default 1) sur `Household` et `HouseholdMember` pour l'Optimistic Concurrency Control
- [x] T1.7: Generer et appliquer la migration Prisma (`prisma migrate dev --name household_family_model`)
- [x] T1.8: Verifier la compatibilite avec les schemas `base.prisma` et `auth.prisma` existants

### T2: Shared Types — Enums, schemas Zod et constantes (AC: 1, 2, 4)

- [x] T2.1: Creer `packages/shared/src/enums/household.ts` — exporter les enums `HouseholdRole`, `CircleType` (miroir des enums Prisma pour usage frontend)
- [x] T2.2: Creer `packages/shared/src/schemas/household.schema.ts` — schemas Zod `CreateHouseholdInput` (name: string, min 1 char, max 100 chars)
- [x] T2.3: Creer `packages/shared/src/constants/household.ts` — palette de couleurs membres (8 couleurs predefinies attribuees en round-robin), nombre max de membres par foyer
- [x] T2.4: Mettre a jour les fichiers `index.ts` de chaque dossier pour exporter les nouveaux modules

### T3: Prisma Client Extension — Isolation par foyer (AC: 3, 5)

- [ ] T3.1: Creer `apps/api/src/common/prisma/household-extension.ts` — `Prisma.defineExtension()` qui filtre automatiquement par `householdId` sur toutes les operations des modeles scopes (whitelist de modeles)
- [ ] T3.2: Gerer les operations `create`/`createMany` (injecter `householdId` dans `data`) et les operations de lecture/update/delete (injecter dans `where`)
- [ ] T3.3: Implementer `forHousehold(householdId)` sur `PrismaService` — retourne un client etendu avec le filtre actif
- [ ] T3.4: Implementer `bypassHouseholdFilter()` sur `PrismaService` — retourne le client de base sans filtre (pour les operations systeme/admin)
- [ ] T3.5: Integrer `nestjs-cls` (Continuation Local Storage) pour propager le `householdId` du contexte de requete au `PrismaService` automatiquement

### T4: Module NestJS Household — Backend GraphQL (AC: 1, 4)

- [x] T4.1: Creer `apps/api/src/modules/household/household.module.ts` — module NestJS important `PrismaModule`
- [x] T4.2: Creer `apps/api/src/modules/household/household.model.ts` — `@ObjectType()` GraphQL : `Household` (id, name, membersCount, createdAt), `HouseholdMember` (id, role, color, user, joinedAt)
- [x] T4.3: Creer `apps/api/src/modules/household/household.dto.ts` — `@InputType()` GraphQL : `CreateHouseholdInput` (name: String)
- [x] T4.4: Creer `apps/api/src/modules/household/household.repository.ts` — repository Prisma avec methodes `create`, `findById`, `findByUserId`, `countMembersByHouseholdId`
- [x] T4.5: Creer `apps/api/src/modules/household/household.service.ts` — logique metier : creation foyer + auto-attribution role owner + couleur + creation des 5 cercles
- [x] T4.6: Creer `apps/api/src/modules/household/household.resolver.ts` — mutations `createHousehold(input)`, queries `myHousehold`, `household(id)`
- [x] T4.7: Enregistrer `HouseholdModule` dans `app.module.ts`

### T5: Guard et decorateur Household Context (AC: 3)

- [ ] T5.1: Creer `apps/api/src/common/guards/household.guard.ts` — guard NestJS qui extrait le `householdId` du contexte utilisateur (via `HouseholdMember`) et le stocke dans `nestjs-cls`
- [ ] T5.2: Creer `apps/api/src/common/decorators/current-household.decorator.ts` — decorateur `@CurrentHousehold()` pour injecter le `householdId` courant dans les resolvers
- [ ] T5.3: Appliquer le guard sur les resolvers qui necessitent un contexte foyer (pas global — certaines routes comme `createHousehold` n'ont pas de foyer)

### T6: Client Web — Ecran creation de foyer (AC: 1, 4)

- [ ] T6.1: Creer `apps/web/app/(app)/layout.tsx` — layout de l'app authentifiee (shell minimal pour le MVP)
- [ ] T6.2: Creer `apps/web/app/(app)/household/create/page.tsx` — page creation de foyer (formulaire nom + bouton creer)
- [ ] T6.3: Creer `apps/web/app/(app)/household/page.tsx` — page dashboard foyer (nom, membres, couleurs)
- [ ] T6.4: Configurer les operations GraphQL (`createHousehold` mutation, `myHousehold` query) avec Apollo Client
- [ ] T6.5: Implementer la redirection post-auth : si l'utilisateur n'a pas de foyer → page creation, sinon → dashboard foyer
- [ ] T6.6: Ajouter le composant `Avatar` ShadCN pour l'affichage des membres avec couleur

### T7: Client Mobile — Ecran creation de foyer (AC: 1, 4)

- [ ] T7.1: Creer `apps/mobile/app/(app)/household/create.tsx` — ecran creation de foyer (formulaire nom + bouton creer)
- [ ] T7.2: Creer `apps/mobile/app/(tabs)/household.tsx` — onglet foyer dans le tab navigator (dashboard foyer : nom, membres, couleurs)
- [ ] T7.3: Configurer les operations GraphQL (`createHousehold` mutation, `myHousehold` query) avec Apollo Client
- [ ] T7.4: Implementer la redirection post-auth : si pas de foyer → ecran creation, sinon → tabs
- [ ] T7.5: Creer les composants UI necessaires (avatar membre avec couleur)

### T8: Tests (AC: 3, 5)

- [ ] T8.1: Tests unitaires du `HouseholdService` (Vitest) — creation foyer, attribution role owner, generation couleur, creation des 5 cercles
- [ ] T8.2: Tests unitaires du Prisma Client Extension (Vitest) — verification que le filtre `householdId` est injecte correctement
- [ ] T8.3: Tests d'integration (Supertest) — flux complet : auth → createHousehold → myHousehold → verification isolation cross-foyer
- [ ] T8.4: Test d'isolation cross-foyer automatise — creer 2 foyers, verifier qu'un user du foyer A ne peut pas voir les donnees du foyer B
- [ ] T8.5: Ajouter les variables necessaires au workflow CI si besoin

## Dev Notes

### Architecture & Patterns obligatoires

- **Monolithe modulaire NestJS** : chaque module (`household/`, `member/`) a ses propres resolver, service, repository. Pas de logique metier dans les resolvers.
- **GraphQL code-first** : `@ObjectType()` dans `*.model.ts`, `@InputType()` dans `*.dto.ts`, `@Resolver()` dans `*.resolver.ts`. Le schema SDL est auto-genere par NestJS au demarrage (`schema.gql` — ne pas editer).
- **Dot-notation** pour tous les fichiers : `household.module.ts`, `household.service.ts`, `household.resolver.ts`, `household.repository.ts`, `household.model.ts`, `household.dto.ts`
- **Custom exceptions uniquement** : Jamais `throw new Error()` — utiliser les exceptions NestJS custom avec codes `HOUSEHOLD_*` (ex: `HOUSEHOLD_NOT_FOUND`, `HOUSEHOLD_ALREADY_EXISTS`)
- **UUID v7** pour tous les IDs (chronologiquement ordonnables, generables cote client pour optimistic UI). Utiliser le package `uuid` (v11+) : `import { v7 as uuidv7 } from 'uuid'`
- **Structured logging** : JSON via Pino avec niveaux error/warn/info/debug
- **Optimistic Concurrency Control** : champ `version` (Int, default 1) sur `Household` et `HouseholdMember`
- **Conventions de donnees** : Relay-style pagination, IDs en String (UUID v7), booleans nommes positivement, `null` explicite quand nullable

### Prisma Client Extension — Isolation par foyer (COMPOSANT CRITIQUE)

C'est le composant le plus important de cette story. Il garantit l'isolation des donnees par foyer (FR32, NFR9).

**Pattern retenu : Application-level filtering avec `Prisma.defineExtension()`**

```typescript
// apps/api/src/common/prisma/household-extension.ts
import { Prisma } from '@family-hub/db';

// Whitelist des modeles qui ont un champ householdId
// NE PAS inclure : User, Session, Account, Verification (tables auth sans householdId)
const HOUSEHOLD_SCOPED_MODELS = new Set([
  'Household',       // le foyer lui-meme (filtrage par id, pas householdId)
  'HouseholdMember', // les membres du foyer
  // Ajouter les futurs modeles ici : 'Ritual', 'Invitation', etc.
]);

// Operations qui supportent un `where` clause
const FILTERABLE_OPERATIONS = new Set([
  'findMany', 'findFirst', 'findFirstOrThrow', 'findUnique', 'findUniqueOrThrow',
  'updateMany', 'update', 'deleteMany', 'delete', 'count', 'aggregate', 'groupBy',
]);

export function householdExtension(householdId: string) {
  return Prisma.defineExtension((client) =>
    client.$extends({
      name: 'householdFilter',
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            if (!model || !HOUSEHOLD_SCOPED_MODELS.has(model)) {
              return query(args);
            }
            // Pour Household, filtrer par `id` ; pour les autres, par `householdId`
            const filterField = model === 'Household' ? 'id' : 'householdId';

            if (FILTERABLE_OPERATIONS.has(operation)) {
              (args as any).where = { ...(args as any).where, [filterField]: householdId };
            } else if (operation === 'create') {
              if (model !== 'Household') {
                (args as any).data = { ...(args as any).data, householdId };
              }
            } else if (operation === 'createMany') {
              const data = Array.isArray((args as any).data)
                ? (args as any).data.map((d: any) => ({ ...d, householdId }))
                : { ...(args as any).data, householdId };
              (args as any).data = data;
            }
            return query(args);
          },
        },
      },
    })
  );
}
```

**Integration dans PrismaService :**

```typescript
// Ajouter a apps/api/src/modules/prisma/prisma.service.ts
forHousehold(householdId: string) {
  return this.$extends(householdExtension(householdId));
}

bypassHouseholdFilter() {
  return this; // retourne le client de base sans filtre
}
```

**Propagation du contexte avec `nestjs-cls` :**

- Installer `nestjs-cls` pour propager le `householdId` par requete via AsyncLocalStorage
- Le `HouseholdGuard` extrait le `householdId` du user authentifie et le stocke dans le CLS
- Les services/repositories accedent au client scope via `prisma.forHousehold(householdId)`

> **ATTENTION Prisma 7.x** : `$use()` middleware a ete completement supprime. Seul `$extends` est disponible pour intercepter les queries. L'API `$extends` est stable et identique a Prisma 5/6.

### Auth — Decorateurs disponibles (depuis Story 1.2)

L'auth est geree par `@thallesp/nestjs-better-auth` v2.4.0. Le `AuthGuard` global protege TOUTES les routes par defaut.

| Decorateur | Usage |
|---|---|
| `@Session()` | Extrait `UserSession` du contexte (HTTP + GraphQL). Contient `session.user` (id, name, email) et `session.session` |
| `@AllowAnonymous()` | Bypass l'authentification sur un endpoint |
| `@OptionalAuth()` | Session optionnelle (null si pas authentifie) |

```typescript
import { Session, UserSession } from '@thallesp/nestjs-better-auth';

@Resolver(() => Household)
export class HouseholdResolver {
  @Mutation(() => Household)
  async createHousehold(
    @Session() session: UserSession,
    @Args('input') input: CreateHouseholdInput,
  ): Promise<Household> {
    return this.householdService.create(session.user.id, input);
  }
}
```

### PrismaModule est `@Global()`

Le `PrismaService` est accessible partout sans importer `PrismaModule` dans chaque module. Pattern deja en place depuis Story 1.1.

### Schema Prisma — Modele de donnees cible

```prisma
// packages/db/prisma/schema/household.prisma

enum HouseholdRole {
  OWNER
  ADMIN
  ADULT
  CHILD
  PROVIDER
}

enum CircleType {
  PERSONAL
  COUPLE
  HOUSEHOLD
  EXTENDED_FAMILY
  ACQUAINTANCES
}

model Household {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name      String   @db.VarChar(100)
  version   Int      @default(1)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  members HouseholdMember[]
  circles Circle[]

  @@map("households")
}

model HouseholdMember {
  id        String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  role      HouseholdRole @default(ADULT)
  color     String        @db.VarChar(7) // hex color ex: #FF6B6B
  version   Int           @default(1)
  joinedAt  DateTime      @default(now()) @map("joined_at")

  userId      String    @map("user_id") @db.Uuid
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  householdId String    @map("household_id") @db.Uuid
  household   Household @relation(fields: [householdId], references: [id], onDelete: Cascade)

  @@unique([userId, householdId])
  @@index([householdId], map: "idx_household_members_household")
  @@index([userId], map: "idx_household_members_user")
  @@map("household_members")
}

model Circle {
  id   String     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  type CircleType

  householdId String    @map("household_id") @db.Uuid
  household   Household @relation(fields: [householdId], references: [id], onDelete: Cascade)

  @@unique([householdId, type])
  @@map("circles")
}
```

> **IMPORTANT** : Ajouter la relation inverse `members HouseholdMember[]` sur le modele `User` dans `auth.prisma` (c'est la seule modification au schema auth).

### Couleurs membres — Palette predefinie

Attribution en round-robin selon l'ordre d'ajout au foyer :

```typescript
const MEMBER_COLORS = [
  '#FF6B6B', // rouge corail
  '#4ECDC4', // turquoise
  '#45B7D1', // bleu ciel
  '#96CEB4', // vert sauge
  '#FFEAA7', // jaune doux
  '#DDA0DD', // mauve
  '#98D8C8', // menthe
  '#F7DC6F', // or doux
] as const;

function getNextColor(existingMembersCount: number): string {
  return MEMBER_COLORS[existingMembersCount % MEMBER_COLORS.length];
}
```

### Flux de creation de foyer

1. User authentifie appelle `createHousehold(name)`
2. Service verifie que l'user n'a pas deja un foyer (MVP : 1 foyer max par user)
3. Service cree le `Household` avec le nom
4. Service cree les 5 `Circle` (PERSONAL, COUPLE, HOUSEHOLD, EXTENDED_FAMILY, ACQUAINTANCES)
5. Service cree le `HouseholdMember` avec role `OWNER`, couleur `#FF6B6B` (premiere couleur), et `userId`
6. Retourne le foyer cree avec le membre owner

### Redirection post-auth

- Apres authentification (Google OAuth ou Email OTP), le client appelle `myHousehold`
- Si `null` → rediriger vers l'ecran de creation de foyer
- Si `Household` retourne → rediriger vers le dashboard foyer
- Cette logique vit cote client (web: `proxy.ts` ou layout, mobile: `app/index.tsx`)

### UX — Points critiques

- **Formulaire minimaliste** : un seul champ "Nom du foyer" + bouton "Creer". Pas de wizard, pas de questions supplementaires (l'onboarding complet arrive en Story 3.5)
- **Optimistic UI** : le foyer apparait instantanement dans l'UI avant confirmation serveur (UUID v7 genere cote client)
- **Pas de celebration** : transition silencieuse vers le dashboard foyer apres creation
- **Erreurs inline** : jamais de popups — messages sous les champs avec ton factuel
- **Touch targets** : minimum 48px sur mobile, 44px sur web
- **Accessibilite WCAG 2.1 AA** : contraste 4.5:1, labels visibles, aria-labels, navigation clavier

### Project Structure Notes

```
packages/db/prisma/schema/household.prisma       (nouveau)
packages/db/prisma/schema/auth.prisma             (modifie — ajout relation HouseholdMember[])
packages/shared/src/enums/household.ts            (nouveau)
packages/shared/src/schemas/household.schema.ts   (nouveau)
packages/shared/src/constants/household.ts        (nouveau)
apps/api/src/common/prisma/household-extension.ts (nouveau)
apps/api/src/modules/prisma/prisma.service.ts     (modifie — ajout forHousehold/bypassHouseholdFilter)
apps/api/src/modules/household/household.module.ts    (nouveau)
apps/api/src/modules/household/household.model.ts     (nouveau)
apps/api/src/modules/household/household.dto.ts       (nouveau)
apps/api/src/modules/household/household.service.ts   (nouveau)
apps/api/src/modules/household/household.repository.ts (nouveau)
apps/api/src/modules/household/household.resolver.ts  (nouveau)
apps/api/src/modules/household/__tests__/             (nouveau)
apps/api/src/common/guards/household.guard.ts         (nouveau)
apps/api/src/common/decorators/current-household.decorator.ts (nouveau)
apps/api/src/app.module.ts                            (modifie — ajout HouseholdModule + ClsModule)
apps/web/app/(app)/layout.tsx                         (nouveau)
apps/web/app/(app)/household/create/page.tsx           (nouveau)
apps/web/app/(app)/household/page.tsx                  (nouveau)
apps/mobile/app/(app)/household/create.tsx             (nouveau)
apps/mobile/app/(tabs)/household.tsx                   (nouveau ou modifie)
```

### Dependances a installer

| Package | Ou | Justification |
|---|---|---|
| `uuid` | `packages/shared` | Generation UUID v7 cote client et serveur |
| `nestjs-cls` | `apps/api` | Propagation du householdId par requete via AsyncLocalStorage |
| `zod` | `packages/shared` | Validation schemas (si pas deja present) |

### Compatibilite avec Story 1.2

- **Prisma 7.x ESM-only** : config dans `prisma.config.ts`, driver adapters (`@prisma/adapter-pg` + `pg`) obligatoires. Reutiliser `PrismaService` existant
- **NestJS 11.x + Express v5** : meme patterns que Story 1.2
- **Better Auth** : le `@Session()` decorator donne acces a `session.user.id` pour identifier l'utilisateur creant le foyer
- **TypeScript strict mode** : tous les fichiers
- **Les modules `household/` et `member/` existent deja comme placeholders** (dossiers vides avec `.gitkeep`) — ne pas oublier de supprimer les `.gitkeep` en les remplacant par les vrais fichiers

### Codes d'erreur household

| Code | HTTP | Description |
|------|------|-------------|
| `HOUSEHOLD_NOT_FOUND` | 404 | Foyer introuvable |
| `HOUSEHOLD_ALREADY_EXISTS` | 409 | L'utilisateur a deja un foyer (MVP : 1 seul) |
| `HOUSEHOLD_NAME_INVALID` | 400 | Nom du foyer invalide (vide ou trop long) |
| `HOUSEHOLD_ACCESS_DENIED` | 403 | Tentative d'acces a un foyer non-autorise |

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-1, Story 1.3]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data-Architecture, #Prisma-Client-Extension, #Implementation-Patterns, #Project-Structure]
- [Source: _bmad-output/planning-artifacts/prd.md#FR1, #FR9, #FR32, #NFR9]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Core-User-Experience, #Interactions-Sans-Effort]
- [Source: _bmad-output/implementation-artifacts/1-2-authentification-securisee-google-oauth-email-otp.md#Dev-Notes, #Completion-Notes]
- [Docs: Prisma Client Extensions — https://www.prisma.io/docs/orm/prisma-client/client-extensions]
- [Docs: Prisma Client Extensions Query Component — https://www.prisma.io/docs/orm/prisma-client/client-extensions/query]
- [Docs: NestJS GraphQL Code-First — https://docs.nestjs.com/graphql/resolvers]
- [Docs: Better Auth NestJS Integration — https://www.better-auth.com/docs/integrations/nestjs]
- [Docs: @thallesp/nestjs-better-auth — https://github.com/ThallesP/nestjs-better-auth]
- [Docs: uuid v7 — https://github.com/uuidjs/uuid]
- [Docs: nestjs-cls — https://papooch.github.io/nestjs-cls/]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
