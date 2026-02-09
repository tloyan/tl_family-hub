# Recherche : Workflows de Developpement, Strategies de Test et Qualite du Code

**Projet** : family-hub -- Application de gestion familiale
**Date** : 2026-02-06
**Stack** : Turborepo + pnpm | NestJS (backend) | Next.js (web) | Expo React Native (mobile) | GraphQL | PostgreSQL 18 | Prisma | Redis | BullMQ
**Deploiement** : Hetzner + Coolify
**Contexte** : Developpeur solo (Thomas) -- Premiere release a venir

---

## Table des matieres

1. [Workflow de developpement Turborepo/pnpm](#1-workflow-de-developpement-turborepopnpm)
2. [Strategie de test pour NestJS](#2-strategie-de-test-pour-nestjs)
3. [Tests GraphQL (resolvers, subscriptions)](#3-tests-graphql-resolvers-subscriptions)
4. [Tests mobile Expo/React Native](#4-tests-mobile-exporeact-native)
5. [Tests base de donnees avec Prisma et PostgreSQL](#5-tests-base-de-donnees-avec-prisma-et-postgresql)
6. [Qualite du code : linting, formatting, hooks](#6-qualite-du-code--linting-formatting-hooks)
7. [Choix du framework de test : Vitest vs Jest](#7-choix-du-framework-de-test--vitest-vs-jest)
8. [Synthese et plan d'action recommande](#8-synthese-et-plan-daction-recommande)

---

## 1. Workflow de developpement Turborepo/pnpm

### 1.1 Structure recommandee du monorepo

```
family-hub/
  apps/
    api/          # NestJS backend (GraphQL)
    web/          # Next.js frontend
    mobile/       # Expo React Native
  packages/
    @family/ui          # Composants UI partages (React Native + Web)
    @family/shared      # Types, constantes, validations partages
    @family/graphql     # Schema GraphQL, types generes, fragments
    @family/config-ts   # tsconfig.json partages
    @family/config-biome # Configuration Biome partagee
  tooling/
    biome/        # Config Biome root
  turbo.json
  pnpm-workspace.yaml
  package.json
```

**Bonnes pratiques** :
- Utiliser un namespace `@family/` pour tous les packages internes afin d'eviter les conflits avec npm
- Chaque package est une "mini-projet" avec son propre `package.json`, ses exports explicites via le champ `exports`
- Ne jamais utiliser `../` pour acceder a un autre package -- toujours installer la dependance et importer
- Privilegier les **Internal Packages** (packages qui ne sont pas publies sur npm, consommes directement dans le monorepo)

### 1.2 Configuration pnpm-workspace.yaml

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tooling/*"
```

**pnpm Catalogs** (pnpm v9.5+) : Definir les versions de dependances comme des constantes reutilisables pour garder tout le workspace sur les memes versions.

### 1.3 Configuration turbo.json

```jsonc
{
  "$schema": "https://turborepo.dev/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "test:unit": {
      "outputs": ["coverage/**"]
    },
    "test:e2e": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "check": {
      "outputs": []
    },
    "db:generate": {
      "cache": false
    },
    "db:migrate": {
      "cache": false
    }
  }
}
```

**Points cles** :
- `^build` dans `dependsOn` signifie "attendre que les dependances du package aient fini leur build"
- `persistent: true` sur `dev` car les serveurs de dev restent actifs
- `cache: false` sur les taches de base de donnees (migrations, generation Prisma)
- Turborepo parallelise automatiquement tout ce qui peut l'etre

### 1.4 Scripts de developpement

```jsonc
// package.json racine
{
  "scripts": {
    "dev": "turbo run dev",
    "dev:api": "turbo run dev --filter=api",
    "dev:web": "turbo run dev --filter=web",
    "dev:mobile": "turbo run dev --filter=mobile",
    "build": "turbo run build",
    "test": "turbo run test",
    "test:unit": "turbo run test:unit",
    "test:e2e": "turbo run test:e2e",
    "lint": "turbo run lint",
    "check": "turbo run check",
    "db:generate": "turbo run db:generate --filter=api",
    "db:migrate": "turbo run db:migrate --filter=api",
    "clean": "turbo run clean"
  }
}
```

### 1.5 Considerations Expo en monorepo

- Expo supporte les monorepos mais necessite une configuration specifique
- Mettre `node-linker=hoisted` dans `.npmrc` si des problemes d'installation isolee surviennent avec pnpm
- Attention : les versions dupliquees de React Native dans un meme monorepo ne sont **pas supportees**
- Consulter la documentation officielle Expo pour les monorepos : configuration `metro.config.js` avec `getDefaultConfig` adapte

### 1.6 Evaluation pour developpeur solo

| Aspect | Investissement | Valeur | Priorite |
|--------|---------------|--------|----------|
| Structure monorepo initiale | 1-2 jours | Tres haute | P0 |
| turbo.json configure | 2-3 heures | Tres haute | P0 |
| Packages partages (@family/shared) | 1 jour | Haute | P1 |
| pnpm Catalogs | 1 heure | Moyenne | P2 |

### Sources

- [Turborepo -- Structuring a repository](https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository)
- [Turborepo -- Creating an Internal Package](https://turborepo.dev/docs/crafting-your-repository/creating-an-internal-package)
- [Turborepo -- Configuring tasks](https://turborepo.dev/docs/crafting-your-repository/configuring-tasks)
- [Turborepo -- Managing dependencies](https://turborepo.dev/docs/crafting-your-repository/managing-dependencies)
- [Expo -- Work with monorepos](https://docs.expo.dev/guides/monorepos/)
- [2025 Monorepo That Actually Scales: Turborepo + PNPM for Next.js (Medium)](https://medium.com/@TheblogStacker/2025-monorepo-that-actually-scales-turborepo-pnpm-for-next-js-ab4492fbde2a)
- [How we configured pnpm and Turborepo for our monorepo (Nhost)](https://nhost.io/blog/how-we-configured-pnpm-and-turborepo-for-our-monorepo)
- [byCedric/expo-monorepo-example (GitHub)](https://github.com/byCedric/expo-monorepo-example)
- [Expo + Next.js + NestJS + Turborepo (GitHub)](https://github.com/ax-at/expo-nextjs-nestjs-trpc-turborepo)

---

## 2. Strategie de test pour NestJS

### 2.1 La pyramide de tests pragmatique (developpeur solo)

Pour un developpeur solo visant une premiere release, la strategie recommandee est une **pyramide inversee pragmatique** :

```
        /  E2E (quelques tests critiques)  \
       /  Integration (focus principal)     \
      /  Unitaires (logique metier isolee)   \
```

**Repartition recommandee** :
- **Tests d'integration** (50-60%) : Le meilleur rapport effort/valeur pour NestJS. Ils verifient que les modules, les injections de dependances, le routage et les resolvers sont correctement cables.
- **Tests unitaires** (30-40%) : Pour la logique metier pure (services de calcul, validations, transformations de donnees). Ne pas tester les controllers/resolvers en unitaire -- les tests d'integration couvrent cela bien mieux.
- **Tests E2E** (5-10%) : Uniquement pour les parcours critiques complets (inscription, connexion, flux principal de l'application).

### 2.2 Tests unitaires NestJS

**Ce qu'il faut tester** :
- Services contenant de la logique metier (calculs, transformations, validations)
- Guards et interceptors personnalises
- Pipes de validation complexes
- Fonctions utilitaires pures

**Ce qu'il ne faut PAS tester en unitaire** :
- Les controllers/resolvers simples (CRUD pass-through) -- l'integration le couvre
- Le cablage des modules NestJS
- Les decorateurs standard de NestJS

**Approche** :
```typescript
// Exemple de test unitaire NestJS
describe('FamilyMemberService', () => {
  let service: FamilyMemberService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        FamilyMemberService,
        { provide: PrismaService, useValue: mockDeep<PrismaClient>() },
      ],
    }).compile();

    service = module.get(FamilyMemberService);
    prisma = module.get(PrismaService);
  });

  it('devrait calculer le budget familial mensuel', () => {
    // Tester la logique metier, pas l'appel Prisma
  });
});
```

### 2.3 Tests d'integration NestJS

**Approche recommandee** : Utiliser `@nestjs/testing` avec `Test.createTestingModule()` pour bootstrapper un module reel (ou quasi-reel) et tester le flux complet requete -> resolver/controller -> service -> (mock ou vraie DB).

```typescript
describe('FamilyModule (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [FamilyModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('devrait creer un membre de famille via GraphQL', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation { createFamilyMember(input: { ... }) { id name } }`,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.createFamilyMember).toBeDefined();
      });
  });
});
```

### 2.4 Tests E2E NestJS

- Tester contre l'application complete (main.ts -> service)
- Verifier les flux critiques de bout en bout
- Utiliser une vraie base de donnees (voir section 5 sur Testcontainers)
- Garder ces tests **peu nombreux mais significatifs**

### 2.5 Evaluation pour developpeur solo

| Aspect | Investissement | Valeur | Priorite |
|--------|---------------|--------|----------|
| Tests integration modules NestJS | 2-3 jours setup + continu | Tres haute | P0 |
| Tests unitaires logique metier | 1 jour setup + continu | Haute | P1 |
| Tests E2E flux critiques | 1-2 jours | Moyenne | P2 |
| Tests guards/interceptors | Quelques heures | Moyenne | P2 |

### Sources

- [Best Practices for Testing NestJS Applications in 2025 (Toxigon)](https://toxigon.com/best-practices-for-testing-nestjs-applications)
- [How to Write Unit Tests and E2E Tests for NestJS Applications (freeCodeCamp)](https://www.freecodecamp.org/news/nestjs-unit-testing-e2e-testing-guide/)
- [Improving Integration/E2E testing using NestJS and TestContainers (DEV)](https://dev.to/medaymentn/improving-intergratione2e-testing-using-nestjs-and-testcontainers-3eh0)
- [End-to-End Testing in NestJS -- The Real Way with Vitest + PostgreSQL (Medium)](https://medium.com/@aymankaddioui/end-to-end-testing-in-nestjs-the-real-way-with-vitest-postgresql-99afd4c25f65)
- [testing-nestjs -- jmcdo29 (GitHub)](https://github.com/jmcdo29/testing-nestjs)

---

## 3. Tests GraphQL (resolvers, subscriptions)

### 3.1 Strategie par couche

#### Couche 1 : Tests unitaires des services
- Tester la logique metier dans les services GraphQL
- Mocker les appels Prisma/base de donnees
- Rapides, nombreux, focus sur les edge cases

#### Couche 2 : Tests d'integration des resolvers
- Tester le flux complet : requete GraphQL -> schema -> resolver -> service -> (mock DB)
- Utiliser `supertest` avec l'app NestJS bootstrappee
- Verifier que le schema, les resolvers et le cablage fonctionnent ensemble

```typescript
describe('TaskResolver (Integration)', () => {
  it('devrait retourner les taches d\'une famille', async () => {
    const query = `
      query GetFamilyTasks($familyId: ID!) {
        familyTasks(familyId: $familyId) {
          id
          title
          assignee { name }
          status
        }
      }
    `;

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query, variables: { familyId: 'test-family-id' } })
      .expect(200);

    expect(response.body.data.familyTasks).toHaveLength(3);
    expect(response.body.errors).toBeUndefined();
  });
});
```

#### Couche 3 : Tests des subscriptions GraphQL (WebSocket)

Les subscriptions GraphQL sont plus complexes a tester. Points cles :

- Verifier que le protocole `graphql-ws` est correctement configure des deux cotes (client et serveur)
- Les resolvers de subscription doivent retourner un `AsyncIterable` (pas un `Promise` ou `Observable`)
- Utiliser `graphql-ws` cote client de test pour se connecter au WebSocket

```typescript
import { createClient } from 'graphql-ws';
import WebSocket from 'ws';

describe('Subscriptions (Integration)', () => {
  it('devrait recevoir les notifications de nouvelles taches', (done) => {
    const client = createClient({
      url: `ws://localhost:${port}/graphql`,
      webSocketImpl: WebSocket,
    });

    const subscription = client.subscribe(
      {
        query: `subscription { taskCreated(familyId: "test") { id title } }`,
      },
      {
        next: (data) => {
          expect(data.data.taskCreated).toBeDefined();
          done();
        },
        error: done,
        complete: () => {},
      },
    );

    // Declencher la creation d'une tache apres connexion
    setTimeout(() => triggerTaskCreation(), 100);
  });
});
```

### 3.2 Ce qu'il faut prioriser

Pour un developpeur solo avec GraphQL + NestJS :

1. **Tests d'integration des queries/mutations principales** via supertest (meilleur ROI)
2. **Tests unitaires des services** avec logique metier complexe
3. **Tests de subscriptions** : reporter a plus tard sauf si c'est une fonctionnalite critique de la v1. Le test manuel suffit souvent pour une premiere release.

### 3.3 Evaluation pour developpeur solo

| Aspect | Investissement | Valeur | Priorite |
|--------|---------------|--------|----------|
| Tests integration queries/mutations | 1-2 jours setup + continu | Tres haute | P0 |
| Tests unitaires services | Continu | Haute | P1 |
| Tests subscriptions WebSocket | 1 jour | Basse (v1) | P3 |
| Tests schema validation | Quelques heures | Moyenne | P2 |

### Sources

- [Continuous integration for NestJS GraphQL projects (CircleCI)](https://circleci.com/blog/testing-nestjs-graphql/)
- [Testing Approaches -- GraphQL.js](https://www.graphql-js.org/docs/testing-approaches/)
- [NestJS GraphQL API with unit and e2e tests (GitHub)](https://github.com/flrnd/nestjs-graphql-example)
- [Unit Testing GraphQL resolver in NestJS (GitHub Gist)](https://gist.github.com/jamal-abbasi/4b144ade6598a9e2fd3080fb86ba6d61)
- [Integration Testing -- Apollo GraphQL Docs](https://www.apollographql.com/docs/apollo-server/testing/testing)
- [Debugging GraphQL Subscription Issues in NestJS (Moldstud)](https://moldstud.com/articles/p-effective-strategies-for-debugging-graphql-subscription-issues-in-nestjs-applications)
- [Testing WebSockets in NestJS (Moldstud)](https://moldstud.com/articles/p-effective-strategies-for-testing-websockets-in-nestjs-e2e-insights-and-best-practices)

---

## 4. Tests mobile Expo/React Native

### 4.1 Outils recommandes

| Outil | Type | Usage |
|-------|------|-------|
| **Jest + jest-expo** | Unit/Component | Framework de test officiel Expo |
| **@testing-library/react-native** | Component | Tests de composants avec approche user-centric |
| **Detox** | E2E | Tests end-to-end sur simulateur/emulateur |

### 4.2 Tests de composants (priorite pour solo dev)

**Setup** :
```bash
npx expo install jest-expo jest @testing-library/react-native -- --save-dev
```

**Configuration jest.config.js** :
```javascript
module.exports = {
  preset: 'jest-expo/universal', // teste iOS, Android, Web, Node (SSR)
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg)',
  ],
  setupFilesAfterSetup: ['<rootDir>/jest.setup.ts'],
};
```

**Important** : `@testing-library/react-native` remplace le deprecie `react-test-renderer` qui ne supporte plus React 19+.

**Exemple de test composant** :
```typescript
import { render, screen, fireEvent } from '@testing-library/react-native';
import { TaskCard } from './TaskCard';

describe('TaskCard', () => {
  it('devrait afficher le titre et le statut de la tache', () => {
    render(<TaskCard title="Faire les courses" status="pending" />);

    expect(screen.getByText('Faire les courses')).toBeTruthy();
    expect(screen.getByText('En attente')).toBeTruthy();
  });

  it('devrait appeler onComplete quand on appuie sur le bouton', () => {
    const onComplete = jest.fn();
    render(<TaskCard title="Test" status="pending" onComplete={onComplete} />);

    fireEvent.press(screen.getByRole('button', { name: /terminer/i }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
```

### 4.3 Tests avec Expo Router

Si un composant utilise `expo-router`, utiliser `renderRouter` au lieu de `render` pour fournir le contexte de navigation.

### 4.4 Tests E2E avec Detox

**Considerations importantes pour Expo** :
- Detox n'est **pas officiellement supporte** par Expo
- Fonctionne uniquement en mode **release** (pas debug) avec Expo
- Necessite une configuration specifique dans `eas.json` pour les builds de test
- La boucle de feedback est lente (build + execution sur simulateur)

**Recommandation pour developpeur solo** : Reporter Detox a apres la v1. Les tests de composants avec `@testing-library/react-native` couvrent la majorite des besoins. Le test manuel sur simulateur/device physique est suffisant pour une premiere release.

### 4.5 Strategie par plateforme (jest-expo/universal)

`jest-expo/universal` execute les tests sur toutes les plateformes supportees par Expo (iOS, Android, Web, Node SSR). Cela permet de detecter les regressions specifiques a une plateforme sans infrastructure E2E complexe.

### 4.6 Evaluation pour developpeur solo

| Aspect | Investissement | Valeur | Priorite |
|--------|---------------|--------|----------|
| Jest + @testing-library/react-native | 2-3 heures setup | Haute | P1 |
| Tests composants UI principaux | Continu | Haute | P1 |
| jest-expo/universal (multi-plateforme) | 30 min config | Moyenne | P2 |
| Detox E2E | 2-3 jours setup | Basse (v1) | P3 |

### Sources

- [Unit testing with Jest -- Expo Documentation](https://docs.expo.dev/develop/unit-testing/)
- [jest-expo (npm)](https://www.npmjs.com/package/jest-expo)
- [Unit Testing Expo Apps With Jest (Nx Blog)](https://nx.dev/blog/unit-testing-expo-apps-with-jest)
- [Testing React Native Applications: Best practices (DEV)](https://dev.to/aimes/testing-react-native-applications-best-practices-and-frameworks-5hca)
- [Detox for React Native E2E Testing 2026 (Medium)](https://medium.com/@svbala99/simple-step-by-step-setup-detox-for-react-native-android-e2e-testing-2026-ed497fd9d301)
- [Mocking native calls in Expo modules (Expo Docs)](https://docs.expo.dev/modules/mocking/)
- [How to Unit Test React Native Components with Jest (OneUptime)](https://oneuptime.com/blog/post/2026-01-15-react-native-jest-testing/view)

---

## 5. Tests base de donnees avec Prisma et PostgreSQL

### 5.1 Approche par niveaux

#### Niveau 1 : Mocks Prisma (tests unitaires) -- PRIORITAIRE

Utiliser `prisma-mock` ou `jest-mock-extended` / `vitest-mock-extended` pour mocker `PrismaClient`.

```typescript
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
// ou avec Vitest :
// import { mockDeep, DeepMockProxy } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';

const prismaMock = mockDeep<PrismaClient>();

// Le mock est type -- autocompletion sur toutes les methodes
prismaMock.user.findUnique.mockResolvedValue({
  id: '1',
  name: 'Thomas',
  email: 'thomas@family.home',
});
```

**Avantages** : Rapide, pas de base de donnees necessaire, isole, ideal pour la logique metier.
**Limites** : Ne teste pas les vraies requetes SQL, les migrations, ni les contraintes de la DB.

#### Niveau 2 : Testcontainers + PostgreSQL (tests d'integration) -- A INTEGRER

Testcontainers lance un conteneur Docker PostgreSQL ephemere pour chaque suite de tests.

```typescript
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';

let container: StartedPostgreSqlContainer;

beforeAll(async () => {
  // Demarrer un conteneur PostgreSQL
  container = await new PostgreSqlContainer('postgres:18')
    .withDatabase('family-hub_test')
    .start();

  // Configurer l'URL de connexion
  process.env.DATABASE_URL = container.getConnectionUri();

  // Appliquer les migrations Prisma
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: container.getConnectionUri() },
  });
}, 60000); // timeout 60s pour le demarrage du conteneur

afterAll(async () => {
  await container.stop();
});

beforeEach(async () => {
  // Nettoyer les donnees entre chaque test
  const prisma = new PrismaClient();
  await prisma.$executeRawUnsafe(`
    DO $$ DECLARE r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
      LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
      END LOOP;
    END $$;
  `);
});
```

**Optimisation critique** : Lancer **un seul conteneur** pour toute la suite de tests, et nettoyer la base entre chaque test (truncate + re-seed), plutot que de creer un nouveau conteneur par test.

#### Niveau 3 : Base de donnees schema-isolated (alternative legere)

Au lieu de Testcontainers, utiliser un **schema PostgreSQL separe** par suite de tests :

```typescript
beforeAll(async () => {
  const schemaName = `test_${Date.now()}`;
  await prisma.$executeRawUnsafe(`CREATE SCHEMA "${schemaName}"`);
  // Configurer Prisma pour utiliser ce schema
  process.env.DATABASE_URL = `${baseUrl}?schema=${schemaName}`;
});
```

### 5.2 Gestion des migrations pendant les tests

- Utiliser `prisma migrate deploy` (pas `prisma migrate dev`) dans les tests pour appliquer les migrations existantes sans interaction
- Prisma `db push` est une alternative plus rapide pour les tests (pas de creation de fichier migration)
- Gerer le seed des donnees de test avec des factories/fixtures dediees

### 5.3 Pieges courants

1. **IDs auto-incrementes** : Ne jamais tester sur la valeur exacte d'un ID auto-genere
2. **Contraintes d'unicite** : Generer des donnees uniques par test (utiliser `faker` ou des UUIDs)
3. **Ordre d'execution** : Les tests doivent etre independants -- ne jamais dependre de l'etat laisse par un test precedent
4. **Performance** : Un conteneur Testcontainers met 5-15 secondes a demarrer -- mutualiser entre tests

### 5.4 Evaluation pour developpeur solo

| Aspect | Investissement | Valeur | Priorite |
|--------|---------------|--------|----------|
| Mocks Prisma pour tests unitaires | 1-2 heures | Haute | P0 |
| Testcontainers setup | 1 jour | Haute | P1 |
| Factories/fixtures de donnees | 1/2 journee | Haute | P1 |
| Schema-isolated testing | 2-3 heures | Moyenne | P2 (alternative a Testcontainers) |

### Sources

- [The Ultimate Guide to Testing with Prisma: Mocking Prisma Client (Prisma Blog)](https://www.prisma.io/blog/testing-series-1-8eRB5p0Y8o)
- [The Ultimate Guide to Testing with Prisma: Integration Testing (Prisma Blog)](https://www.prisma.io/blog/testing-series-3-aBUyF8nxAn)
- [Unit testing with Prisma ORM (Prisma Docs)](https://www.prisma.io/docs/orm/prisma-client/testing/unit-testing)
- [Integration testing with Prisma (Prisma Docs)](https://www.prisma.io/docs/orm/prisma-client/testing/integration-testing)
- [Improving Integration/E2E testing using NestJS and TestContainers (DEV)](https://dev.to/medaymentn/improving-intergratione2e-testing-using-nestjs-and-testcontainers-3eh0)
- [NestJS + Prisma + TestContainers demo (GitHub)](https://github.com/medaymenTN/Nest-Prisma-testContainers)
- [Blazing fast Prisma and Postgres tests in Vitest (Codepunkt)](https://codepunkt.de/writing/blazing-fast-prisma-and-postgres-tests-in-vitest/)
- [nest-postgres-testcontainers demo (GitHub)](https://github.com/andredesousa/nest-postgres-testcontainers)
- [Speed Up NestJS Tests with Testcontainers in GitHub Actions (Medium)](https://medium.com/@tkxa7064/speed-up-node-js-nestjs-tests-with-testcontainers-in-github-actions-bd10144b436c)

---

## 6. Qualite du code : linting, formatting, hooks

### 6.1 Biome vs ESLint + Prettier : le choix en 2026

#### Recommandation : Biome 2.x

**Biome** est desormais le choix recommande pour un nouveau projet monorepo TypeScript en 2026.

| Critere | Biome 2.x | ESLint + Prettier |
|---------|-----------|-------------------|
| Performance | 10-25x plus rapide | Baseline |
| Configuration | 1 fichier `biome.json` | 3-4 fichiers (.eslintrc, .prettierrc, etc.) |
| Installation | 1 binaire Rust | 127+ packages npm |
| Linting | 423+ regles (v2.3) | ~300 regles (core + plugins) |
| Formatting | Integre | Via Prettier (outil separe) |
| Support TypeScript type-aware | Depuis v2.0 (juin 2025) | Via typescript-eslint |
| Import sorting | Integre | Via plugin eslint-plugin-import |
| Support monorepo | Natif depuis v2.0 | Via configs partagees |
| Couverture type-aware | ~85% de typescript-eslint | 100% |

**Pourquoi Biome pour family-hub** :
- Un seul outil = moins de configuration, moins de maintenance
- Performance cruciale en monorepo (lint d'un monorepo 10k lignes : ~200ms vs 3-5s avec ESLint)
- Support monorepo natif avec `"extends": "//"` dans les configs enfants
- Developpeur solo = simplicite > customisation extreme

### 6.2 Configuration Biome pour le monorepo

**Root `biome.json`** :
```jsonc
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "organizeImports": {
    "enabled": true
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "complexity": {
        "noExcessiveCognitiveComplexity": "warn"
      },
      "correctness": {
        "noUnusedImports": "error",
        "noUnusedVariables": "warn"
      },
      "style": {
        "useConst": "error",
        "noNonNullAssertion": "warn"
      },
      "suspicious": {
        "noExplicitAny": "warn"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "all",
      "semicolons": "always"
    }
  }
}
```

**Config enfant (ex: `apps/api/biome.json`)** :
```jsonc
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "extends": "//",
  "root": false,
  "linter": {
    "rules": {
      // Regles specifiques au backend NestJS si necessaire
    }
  }
}
```

**Config enfant (ex: `apps/mobile/biome.json`)** :
```jsonc
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "extends": "//",
  "root": false,
  "linter": {
    "rules": {
      // Regles specifiques React Native si necessaire
    }
  }
}
```

### 6.3 Pre-commit hooks : Husky + lint-staged

**Setup** :
```bash
# Installation a la racine du monorepo
pnpm add -D -w husky lint-staged
pnpm exec husky init
```

**`.husky/pre-commit`** :
```bash
pnpm exec lint-staged
```

**Root `package.json` (ajout lint-staged)** :
```jsonc
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx,json,css}": [
      "biome check --write --no-errors-on-unmatched"
    ]
  }
}
```

**Points cles pour monorepo** :
- Installer Husky et lint-staged a la **racine** du monorepo
- lint-staged utilise automatiquement la configuration Biome la plus proche du fichier staged
- `biome check --write` fait le linting ET le formatting en une seule commande
- `--no-errors-on-unmatched` evite les erreurs si aucun fichier ne matche un pattern

### 6.4 Integration avec Turborepo

Ajouter une tache `check` dans `turbo.json` :
```jsonc
{
  "tasks": {
    "check": {
      "outputs": []
    }
  }
}
```

Script dans chaque `package.json` :
```jsonc
{
  "scripts": {
    "check": "biome check .",
    "check:fix": "biome check --write ."
  }
}
```

### 6.5 Note sur ESLint : quand le garder

**Conserver ESLint en parallele si** :
- Utilisation de `next lint` (Next.js a sa propre config ESLint integree) -- mais on peut le desactiver en faveur de Biome
- Besoin de regles type-aware tres specifiques non couvertes par Biome (15% restants)
- Plugins ESLint sans equivalent Biome (ex: eslint-plugin-nestjs)

**Pour family-hub** : Commencer avec Biome seul. Ajouter ESLint uniquement si un besoin specifique non couvert se presente.

### 6.6 Evaluation pour developpeur solo

| Aspect | Investissement | Valeur | Priorite |
|--------|---------------|--------|----------|
| Biome setup root + enfants | 1-2 heures | Tres haute | P0 |
| Husky + lint-staged | 30 minutes | Tres haute | P0 |
| Integration IDE (VS Code/Cursor) | 15 minutes | Tres haute | P0 |
| Regles personnalisees | Continu | Moyenne | P2 |

### Sources

- [Biome -- Use Biome in big projects](https://biomejs.dev/guides/big-projects/)
- [Biome v2 -- Biotype release blog](https://biomejs.dev/blog/biome-v2/)
- [Biome Roadmap 2025](https://biomejs.dev/blog/roadmap-2025/)
- [Biome Configuration Reference](https://biomejs.dev/reference/configuration/)
- [Biome vs ESLint: The Ultimate 2025 Showdown (Medium)](https://medium.com/@harryespant/biome-vs-eslint-the-ultimate-2025-showdown-for-javascript-developers-speed-features-and-3e5130be4a3c)
- [Biome: The ESLint and Prettier Killer? Migration Guide for 2026 (DEV)](https://dev.to/pockit_tools/biome-the-eslint-and-prettier-killer-complete-migration-guide-for-2026-27m)
- [Biome vs ESLint + Prettier: The 2025 Linting Revolution (Medium)](https://medium.com/better-dev-nextjs-react/biome-vs-eslint-prettier-the-2025-linting-revolution-you-need-to-know-about-ec01c5d5b6c8)
- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged (GitHub)](https://github.com/lint-staged/lint-staged)
- [Setting Up Pre-Commit Hooks: Husky + lint-staged for TypeScript Monorepos (Syskool)](https://syskool.com/setting-up-pre-commit-hooks-husky-lint-staged-for-typescript-monorepos/)

---

## 7. Choix du framework de test : Vitest vs Jest

### 7.1 Comparaison

| Critere | Vitest | Jest (v30+, juin 2025) |
|---------|--------|------------------------|
| Performance (cold run) | 4x plus rapide | Baseline |
| Performance (watch mode) | 10x plus rapide (HMR) | Baseline |
| Memoire | ~800 MB (50k lignes) | ~1.2 GB (50k lignes) |
| Support ESM natif | Oui | Ameliore en v30 |
| Support TypeScript | Natif (via esbuild/Vite) | Via ts-jest ou @swc/jest |
| API compatible Jest | Oui (migration simple) | N/A |
| Ecosysteme | Croissant rapidement | Tres mature |
| NestJS support officiel | Non (communaute) | Oui (par defaut) |
| Expo/React Native | Experimental | Supporte via jest-expo |

### 7.2 Recommandation pour family-hub

**Backend NestJS : Vitest** (recommande)

Avantages :
- Performance significativement meilleure, surtout en watch mode pendant le developpement
- Support ESM natif (important pour un projet moderne)
- API quasi-identique a Jest (migration simple)
- Reduction du temps CI de 60-75%

Attention :
- NestJS utilise beaucoup de decorateurs et metadata Reflect -- s'assurer que le transformer les gere correctement
- Utiliser `unplugin-swc` ou configurer correctement la resolution des decorateurs
- Remplacer `jest.fn()` par `vi.fn()`, `jest.spyOn()` par `vi.spyOn()`

**Configuration Vitest pour NestJS** :
```typescript
// vitest.config.ts
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts', '**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  plugins: [swc.vite()], // Necessaire pour les decorateurs NestJS
});
```

**Frontend Next.js : Vitest** (recommande)

Next.js supporte Vitest nativement depuis les versions recentes. Coherent avec le backend.

**Mobile Expo : Jest** (recommande -- pour l'instant)

- `jest-expo` est le preset officiel d'Expo, activement maintenu
- `@testing-library/react-native` est optimise pour Jest
- L'ecosysteme React Native/Expo est encore centre sur Jest
- Migrer vers Vitest uniquement quand le support Expo sera mature

### 7.3 Configuration unifiee dans le monorepo

Il est tout a fait possible d'utiliser Vitest pour le backend et le web, et Jest pour le mobile, dans le meme monorepo. Turborepo gere cela naturellement :

```jsonc
// turbo.json
{
  "tasks": {
    "test": {
      "outputs": ["coverage/**"]
    }
  }
}
```

Chaque app definit sa propre commande `test` dans son `package.json` :
- `apps/api`: `"test": "vitest run"`
- `apps/web`: `"test": "vitest run"`
- `apps/mobile`: `"test": "jest"`

### 7.4 Evaluation pour developpeur solo

| Aspect | Investissement | Valeur | Priorite |
|--------|---------------|--------|----------|
| Vitest pour NestJS (backend) | 2-3 heures setup | Haute | P1 |
| Vitest pour Next.js (web) | 1-2 heures setup | Haute | P1 |
| Jest pour Expo (mobile) | 1 heure setup | Haute | P1 |
| Migration Jest -> Vitest (si existant) | 1/2 journee | Moyenne | P2 |

### Sources

- [Vitest vs Jest (Better Stack)](https://betterstack.com/community/guides/scaling-nodejs/vitest-vs-jest/)
- [Jest vs Vitest: Which Test Runner Should You Use in 2025? (Medium)](https://medium.com/@ruverd/jest-vs-vitest-which-test-runner-should-you-use-in-2025-5c85e4f2bda9)
- [Vitest vs Jest 30: Why 2026 is the Year of Browser-Native Testing (DEV)](https://dev.to/dataformathub/vitest-vs-jest-30-why-2026-is-the-year-of-browser-native-testing-2fgb)
- [Switching from Jest to Vitest in a NestJS backend (Ablo Blog)](https://blog.ablo.ai/jest-to-vitest-in-nestjs)
- [Vitest Migration Guide](https://vitest.dev/guide/migration.html)
- [Convert Jest to Vitest: A Complete Migration Guide (TatvaSoft)](https://www.tatvasoft.com/outsourcing/2025/06/convert-jest-to-vitest.html)
- [From Jest to Vitest -- Migration and Benchmark (DEV)](https://dev.to/mbarzeev/from-jest-to-vitest-migration-and-benchmark-23pl)

---

## 8. Synthese et plan d'action recommande

### 8.1 Vision globale de l'outillage

```
+-------------------------------------------------------------------+
|                     MONOREPO family-hub                          |
+-------------------------------------------------------------------+
|                                                                   |
|  Qualite du code:                                                 |
|    Biome 2.x (linting + formatting + import sorting)              |
|    Husky + lint-staged (pre-commit hooks)                         |
|                                                                   |
|  Tests:                                                           |
|    apps/api     -> Vitest + @nestjs/testing + Testcontainers      |
|    apps/web     -> Vitest + @testing-library/react                |
|    apps/mobile  -> Jest + jest-expo + @testing-library/react-native|
|                                                                   |
|  Orchestration:                                                   |
|    Turborepo (turbo.json) + pnpm workspaces                      |
|                                                                   |
+-------------------------------------------------------------------+
```

### 8.2 Plan d'action par phase

#### Phase 0 : Fondations (Jour 1-2) -- AVANT tout code metier

1. **Initialiser le monorepo** avec la structure Turborepo + pnpm
2. **Configurer Biome** a la racine + configs enfants
3. **Installer Husky + lint-staged** (pre-commit hooks)
4. **Configurer turbo.json** avec les taches de base
5. **Configurer l'IDE** (extension Biome pour VS Code/Cursor)

Investissement : **1-2 jours** | ROI : Tres eleve (evite la dette technique des le depart)

#### Phase 1 : Infrastructure de test (Semaine 1-2)

1. **Vitest pour apps/api** : setup avec unplugin-swc pour les decorateurs NestJS
2. **Vitest pour apps/web** : setup avec Next.js
3. **Jest pour apps/mobile** : setup avec jest-expo
4. **Mocks Prisma** : configurer jest-mock-extended ou vitest-mock-extended
5. **Premier test d'integration NestJS** : un module complet (ex: AuthModule)

Investissement : **2-3 jours** | ROI : Eleve (base solide pour tous les tests futurs)

#### Phase 2 : Tests au fil du developpement (Continu)

- Ecrire des tests d'integration pour chaque nouveau module NestJS
- Ecrire des tests unitaires pour la logique metier complexe
- Tester les composants UI critiques (mobile + web)
- Tester les queries/mutations GraphQL principales

Investissement : **+20-30% du temps de dev par feature** | ROI : Eleve (confiance, regressions evitees)

#### Phase 3 : Solidification pre-release (Avant v1)

1. **Testcontainers** : setup pour les tests d'integration avec vraie DB
2. **Tests E2E** : 5-10 parcours critiques (inscription, login, flux principal)
3. **Tests de performance** basiques (temps de reponse GraphQL)

Investissement : **2-3 jours** | ROI : Moyen-Haut (confiance pour la release)

#### Phase 4 : Post-release (Apres v1 stable)

1. **Detox** pour tests E2E mobile (si besoin identifie)
2. **Tests de subscriptions** GraphQL WebSocket
3. **Coverage CI/CD** avec seuils minimaux
4. **Tests de charge** (optionnel pour un usage familial)

Investissement : **Variable** | ROI : Progressif

### 8.3 Ce qu'il faut absolument eviter (anti-patterns)

1. **Ne pas tester du tout** en se disant "je rajouterai les tests plus tard" -- c'est une dette qui explose
2. **Tester trop tot des choses complexes** (E2E mobile, subscriptions WS) au detriment des fondamentaux
3. **Viser 100% de coverage** -- pour un solo dev, 60-70% sur la logique metier est largement suffisant
4. **Mocker absolument tout** -- les tests d'integration avec vrais modules NestJS sont plus utiles que des mocks partout
5. **Dupliquer la configuration** -- utiliser les packages partages du monorepo pour les configs communes
6. **Ignorer les pre-commit hooks** -- Biome + Husky prend 30 minutes et evite des heures de debuggage de formatage

### 8.4 Metriques cibles pour la v1

| Metrique | Cible | Justification |
|----------|-------|---------------|
| Coverage logique metier (services) | 70-80% | Les services sont le coeur de l'application |
| Coverage resolvers/controllers | 50-60% | Via tests d'integration |
| Coverage composants UI critiques | 40-50% | Les flux principaux |
| Temps d'execution tests CI | < 5 minutes | Feedback rapide |
| Tests E2E parcours critiques | 5-10 scenarios | Confiance pour la release |

---

*Document genere le 2026-02-06 -- Recherche basee sur les pratiques et outils actuels.*
