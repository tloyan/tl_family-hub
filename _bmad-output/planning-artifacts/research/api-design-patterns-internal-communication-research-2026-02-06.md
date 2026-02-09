# Recherche : Patterns de Conception d'API et Architecture de Communication Interne

**Date** : 2026-02-06
**Contexte** : Application de gestion familiale "family-hub" avec ecosysteme multi-plateformes. Stack : NestJS (backend), Next.js (web), Expo React Native (mobile), Turborepo monorepo. API GraphQL (primaire) + REST (auth, upload, webhooks). Temps reel via Socket.IO + Redis Pub/Sub + GraphQL Subscriptions. Base de donnees PostgreSQL 18 + Prisma + Redis + BullMQ. Fonctionnalites cles : graphe familial (multi-foyers, 5 cercles de visibilite), rituels/taches, interface conversationnelle IA, mode kiosque.

---

## Table des matieres

1. [GraphQL Code-First avec NestJS : Patterns de Conception de Schema](#1-graphql-code-first-avec-nestjs--patterns-de-conception-de-schema)
2. [Monolithe Modulaire vers Microservices : Patterns de Migration avec NestJS](#2-monolithe-modulaire-vers-microservices--patterns-de-migration-avec-nestjs)
3. [GraphQL Subscriptions avec Redis Pub/Sub : Scalabilite Temps Reel](#3-graphql-subscriptions-avec-redis-pubsub--scalabilite-temps-reel)
4. [CQRS et Event Sourcing avec NestJS](#4-cqrs-et-event-sourcing-avec-nestjs)
5. [BullMQ et NestJS : Gestion de Files d'Attente pour Taches Recurrentes](#5-bullmq-et-nestjs--gestion-de-files-dattente-pour-taches-recurrentes)
6. [API Gateway et Pattern BFF dans un Monorepo NestJS / Next.js / Expo](#6-api-gateway-et-pattern-bff-dans-un-monorepo-nestjs--nextjs--expo)
7. [Synthese et Recommandations Architecturales pour family-hub](#7-synthese-et-recommandations-architecturales-pour-family-hub)

---

## 1. GraphQL Code-First avec NestJS : Patterns de Conception de Schema

### Description du pattern

L'approche **code-first** dans NestJS permet de definir le schema GraphQL directement a partir de classes TypeScript decorees, plutot que d'ecrire manuellement des fichiers `.graphql` (schema-first). Le schema SDL est genere automatiquement a partir des metadonnees des decorateurs `@ObjectType()`, `@Field()`, `@Resolver()`, etc.

Cette approche est nativement supportee par le package `@nestjs/graphql` qui utilise soit Apollo Server soit Mercurius comme driver HTTP.

### Cas d'utilisation dans family-hub

- **Graphe familial** : Les types `FamilyMember`, `Household`, `Relationship`, `VisibilityCircle` sont naturellement exprimes en classes TypeScript avec des relations resolues recursivement.
- **Rituels et taches** : Types `Ritual`, `Task`, `Occurrence` avec des relations complexes (assignation a des membres, recurrence, statut).
- **Interface conversationnelle IA** : Types `Conversation`, `Message`, `AIResponse` avec mutations pour les interactions.
- **Mode kiosque** : Queries specialisees pour le dashboard familial avec agregation de donnees.

### Approche d'implementation avec NestJS

#### Architecture 3 couches : Resolver -> Service -> Repository

```typescript
// === Types GraphQL (ObjectType) ===
@ObjectType()
export class FamilyMember {
  @Field(() => ID)
  id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field(() => [Household])
  households: Household[];

  @Field(() => VisibilityCircle)
  visibilityCircle: VisibilityCircle;

  @Field(() => [Relationship])
  relationships: Relationship[];
}

// === Input Types ===
@InputType()
export class CreateFamilyMemberInput {
  @Field()
  @IsNotEmpty()
  firstName: string;

  @Field()
  @IsNotEmpty()
  lastName: string;

  @Field(() => ID)
  householdId: string;
}

// === Resolver ===
@Resolver(() => FamilyMember)
export class FamilyMemberResolver {
  constructor(
    private readonly memberService: FamilyMemberService,
    private readonly memberLoader: FamilyMemberLoader,
  ) {}

  @Query(() => FamilyMember)
  @UseGuards(GqlAuthGuard)
  async familyMember(@Args('id') id: string): Promise<FamilyMember> {
    return this.memberService.findById(id);
  }

  @ResolveField(() => [Household])
  async households(@Parent() member: FamilyMember): Promise<Household[]> {
    return this.memberLoader.batchHouseholds.load(member.id);
  }

  @Mutation(() => FamilyMember)
  @UseGuards(GqlAuthGuard, RolesGuard)
  async createFamilyMember(
    @Args('input') input: CreateFamilyMemberInput,
    @CurrentUser() user: User,
  ): Promise<FamilyMember> {
    return this.memberService.create(input, user);
  }
}
```

#### Pattern DataLoader pour le probleme N+1

Le probleme N+1 est critique dans GraphQL : si on requete N membres familiaux avec leurs foyers, cela genere N+1 requetes SQL. La solution est l'utilisation de **DataLoader** qui regroupe et met en cache les requetes dans un meme tick d'execution.

```typescript
@Injectable({ scope: Scope.REQUEST })
export class FamilyMemberLoader {
  constructor(private readonly prisma: PrismaService) {}

  public readonly batchHouseholds = new DataLoader<string, Household[]>(
    async (memberIds: readonly string[]) => {
      const memberships = await this.prisma.householdMember.findMany({
        where: { memberId: { in: [...memberIds] } },
        include: { household: true },
      });
      const map = new Map<string, Household[]>();
      memberships.forEach(m => {
        const list = map.get(m.memberId) || [];
        list.push(m.household);
        map.set(m.memberId, list);
      });
      return memberIds.map(id => map.get(id) || []);
    },
  );
}
```

Le DataLoader doit etre enregistre avec `scope: Scope.REQUEST` pour garantir un cache par requete HTTP et eviter les fuites de donnees entre utilisateurs.

#### Pagination Relay (Cursor-based)

Pour les listes de taches, rituels et conversations, la pagination par curseur est recommandee :

```typescript
@ObjectType()
export class TaskEdge {
  @Field(() => Task)
  node: Task;

  @Field()
  cursor: string;
}

@ObjectType()
export class TaskConnection {
  @Field(() => [TaskEdge])
  edges: TaskEdge[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;

  @Field()
  totalCount: number;
}

@ArgsType()
export class TaskPaginationArgs {
  @Field(() => Int, { defaultValue: 20 })
  first: number;

  @Field({ nullable: true })
  after?: string;
}
```

#### Guards et Autorisation

La securisation des resolvers utilise les Guards NestJS, essentiels pour le modele de visibilite a 5 cercles :

```typescript
@UseGuards(GqlAuthGuard, VisibilityCircleGuard)
@Query(() => [FamilyMember])
async familyMembers(
  @Args('circle') circle: VisibilityCircle,
  @CurrentUser() user: User,
): Promise<FamilyMember[]> {
  return this.memberService.findByCircle(user, circle);
}
```

### Avantages

- **Securite de type** : Le schema est derive directement des classes TypeScript, les erreurs sont detectees a la compilation.
- **Colocalisation** : Types et resolvers dans le meme module, maintenance simplifiee.
- **Support IDE** : Auto-completion, refactoring et navigation entre fichiers.
- **Validation integree** : Les decorateurs `class-validator` fonctionnent directement sur les `@InputType()`.
- **Generation automatique du schema** : Le fichier `.graphql` est genere automatiquement, utile pour la documentation et le partage avec les equipes front-end.

### Inconvenients

- **Couplage TypeScript/GraphQL** : Le schema est lie au code serveur, pas de contrat independant.
- **Complexite des decorateurs** : Les classes tres decorees peuvent devenir difficiles a lire.
- **Apprentissage** : Les developpeurs habitues au schema-first doivent s'adapter.
- **Difficulte avec les types graphQL complexes** : Les unions et interfaces necessitent des patterns specifiques (`@createUnionType`).

### Quand utiliser vs quand eviter

**Utiliser quand** :
- L'equipe backend maitrise TypeScript et souhaite un typage fort bout-en-bout.
- Le schema evolue frequemment (ce qui est le cas pour family-hub en phase de developpement actif).
- On veut tirer parti de la validation automatique et de l'injection de dependances NestJS.

**Eviter quand** :
- Le schema doit etre defini contractuellement avant l'implementation (approche API-first avec equipes front separees).
- Le schema est extremement stable et partage entre plusieurs services en differents langages.

### Sources

- [NestJS GraphQL Documentation - Code First](https://docs.nestjs.com/graphql/quick-start)
- [NestJS + GraphQL: A Comprehensive Guide to Code-First API Design - PratikKumar (Medium)](https://medium.com/@pratikkumar2210/nestjs-graphql-a-comprehensive-guide-to-code-first-api-design-9064a581fc10)
- [How to solve the GraphQL N+1 problem in NestJS with Dataloaders - DEV](https://dev.to/tugascript/how-to-solve-the-graphql-n1-problem-in-nestjs-with-dataloaders-and-mikroorm-for-both-apollo-and-mercurius-3klk)
- [Using DataLoader with NestJS - LogRocket](https://blog.logrocket.com/use-dataloader-nestjs/)
- [NestJS GraphQL Resolvers Documentation](https://docs.nestjs.com/graphql/resolvers)
- [Code-first vs. schema-first development in GraphQL - LogRocket](https://blog.logrocket.com/code-first-vs-schema-first-development-graphql/)
- [Schema-First vs Code-Only GraphQL - Apollo Blog](https://www.apollographql.com/blog/schema-first-vs-code-only-graphql)

---

## 2. Monolithe Modulaire vers Microservices : Patterns de Migration avec NestJS

### Description du pattern

Le pattern **monolithe modulaire** (modular monolith) consiste a structurer une application monolithique en modules fortement decouples avec des frontieres bien definies, tout en conservant un seul deploiement. Cette approche offre un chemin d'evolution progressif : Monolithe -> Monolithe Modulaire -> Extraction Selective de Microservices.

Le consensus actuel de l'industrie (2025-2026) est clair : **ne pas commencer par les microservices**. Commencer par un monolithe modulaire bien structure qui peut evoluer selon les besoins reels de scalabilite et d'organisation.

### Cas d'utilisation dans family-hub

- **Phase initiale** : family-hub est un projet en demarrage. Un monolithe modulaire permet une iteration rapide avec une equipe reduite.
- **Modules naturels** : Le domaine se decoupe naturellement en modules — Familles/Foyers, Rituels/Taches, Conversations IA, Notifications, Authentification, Kiosque.
- **Evolution future** : Si un module comme l'IA conversationnelle necessite une scalabilite independante, il pourra etre extrait en microservice.

### Approche d'implementation avec NestJS

#### Structure de modules avec frontieres strictes

NestJS est architecturalement prevu pour le monolithe modulaire grace a son systeme de modules natif :

```
apps/api/src/
  modules/
    family/                   # Module Famille/Foyers
      family.module.ts        # Declaration du module
      public/                 # Interface publique (anti-corruption layer)
        family.public.service.ts
        family.public.dto.ts
      internal/               # Implementation interne
        services/
        repositories/
        entities/
        events/
      family.resolver.ts
    rituals/                  # Module Rituels/Taches
      rituals.module.ts
      public/
        rituals.public.service.ts
        rituals.public.dto.ts
      internal/
        ...
    conversations/            # Module IA Conversationnelle
    notifications/            # Module Notifications
    auth/                     # Module Authentification
    kiosk/                    # Module Kiosque
  shared/                     # Code partage (utils, decorateurs, guards)
    infrastructure/
      database/
      redis/
      events/
```

#### Services publics et couche anti-corruption

La communication entre modules passe exclusivement par des **services publics** qui exposent une interface abstraite. Cela empeche les fuites de logique metier entre modules :

```typescript
// family/public/family.public.service.ts
@Injectable()
export class FamilyPublicService {
  constructor(private readonly familyService: FamilyInternalService) {}

  // Interface publique : seuls les DTOs sortent du module
  async getMemberSummary(memberId: string): Promise<FamilyMemberSummaryDto> {
    const member = await this.familyService.findById(memberId);
    return FamilyMemberSummaryDto.fromEntity(member);
  }

  async getMembersOfHousehold(householdId: string): Promise<FamilyMemberSummaryDto[]> {
    const members = await this.familyService.findByHousehold(householdId);
    return members.map(FamilyMemberSummaryDto.fromEntity);
  }
}

// rituals/internal/services/ritual.service.ts
@Injectable()
export class RitualService {
  constructor(
    // Communication inter-module via le service public uniquement
    private readonly familyPublic: FamilyPublicService,
  ) {}

  async createRitual(dto: CreateRitualDto): Promise<Ritual> {
    // Utilise le service public, pas l'interne
    const members = await this.familyPublic.getMembersOfHousehold(dto.householdId);
    // ...logique de creation
  }
}
```

#### Communication evenementielle entre modules

Le package `@nestjs/event-emitter` (base sur EventEmitter2) permet la communication asynchrone entre modules via des evenements de domaine :

```typescript
// family/internal/services/family.service.ts
@Injectable()
export class FamilyInternalService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async addMemberToHousehold(memberId: string, householdId: string): Promise<void> {
    // ... logique d'ajout
    this.eventEmitter.emit(
      'family.member.added',
      new MemberAddedToHouseholdEvent(memberId, householdId),
    );
  }
}

// rituals/internal/listeners/family-events.listener.ts
@Injectable()
export class FamilyEventsListener {
  constructor(private readonly ritualService: RitualService) {}

  @OnEvent('family.member.added')
  async handleMemberAdded(event: MemberAddedToHouseholdEvent): Promise<void> {
    // Assigner les rituels par defaut du foyer au nouveau membre
    await this.ritualService.assignDefaultRituals(event.memberId, event.householdId);
  }
}
```

#### Regles de frontieres de module

1. **Pas d'acces direct aux repositories d'un autre module** : Jamais d'injection de `FamilyRepository` dans le module `Rituals`.
2. **DTOs de transfert** : Les donnees traversant les frontieres utilisent des DTOs specifiques, jamais les entites internes.
3. **Base de donnees partagee mais schemas logiques** : En monolithe modulaire, la BD est partagee, mais chaque module est proprietaire de ses tables. Cela se materialise dans Prisma par des schemas separes ou des prefixes de tables.
4. **Communication asynchrone privilegiee** : Les evenements de domaine pour les effets de bord, les services publics pour les lectures synchrones.

### Chronologie de migration realiste

D'apres les retours d'experience recents (2025), voici un calendrier pragmatique pour un projet comme family-hub :

| Phase | Duree | Actions |
|-------|-------|---------|
| **Decouverte** | Mois 0-2 | Cartographier les domaines, identifier les frontieres naturelles |
| **Modularisation** | Mois 2-6 | Restructurer en modules avec frontieres strictes, evenements de domaine |
| **Premiere extraction** | Mois 6-8 | Extraire le module le plus independant (ex: Notifications) via Strangler Fig |
| **Evaluations** | Mois 9-12 | Extractions supplementaires la ou les donnees et la scalabilite le justifient |
| **Stabilisation** | Mois 13+ | La majorite des modules reste dans le monolithe |

### Avantages

- **Simplicite de deploiement** : Un seul artefact a deployer, debugger et monitorer.
- **Transactions ACID** : Les transactions transversales restent simples tant que tout est dans un seul processus.
- **Iteration rapide** : Pas de surcharge reseau inter-services, refactoring plus facile.
- **Chemin d'evolution** : Les frontieres modulaires preparent l'extraction future sans l'imposer.

### Inconvenients

- **Discipline requise** : Les frontieres entre modules doivent etre respectees rigoureusement, sinon le monolithe modulaire degenere en monolithe classique (big ball of mud).
- **Scalabilite limitee** : On ne peut pas scaler un module independamment des autres (un seul processus).
- **Risque de couplage involontaire** : En l'absence de frontieres de processus, il est tentant de prendre des raccourcis.
- **Base de donnees partagee** : Les migrations de schema affectent potentiellement tous les modules.

### Quand utiliser vs quand eviter

**Utiliser quand** :
- L'equipe est petite (< 10 developpeurs), ce qui est le cas de family-hub.
- Le projet est en phase de decouverte des frontieres de domaine.
- La vitesse d'iteration prime sur la scalabilite independante.
- Les limites de domaine ne sont pas encore stabilisees.

**Eviter quand** :
- Un module a des exigences de scalabilite radicalement differentes des autres (ex: traitement IA haute charge).
- Plusieurs equipes independantes doivent deployer a des rythmes differents.
- Des contraintes reglementaires imposent l'isolation de certains composants.

### Sources

- [From monolith to modular monolith to microservices: realistic migration patterns - DEV](https://dev.to/sepehr/from-monolith-to-modular-monolith-to-microservices-realistic-migration-patterns-36f2)
- [From Monolith to Microservices: A Strategic Migration Approach with NestJS - Medium](https://medium.com/@asierr/from-monolith-to-microservices-a-strategic-migration-approach-with-nestjs-e9e9d655e42c)
- [Nest.js and Modular Architecture: Principles and Best Practices - Level Up Coding](https://levelup.gitconnected.com/nest-js-and-modular-architecture-principles-and-best-practices-806c2cb008d5)
- [Modulith with NestJS: A Practical Approach - Medium](https://medium.com/@viniciosbiluca.particular/modulith-with-nestjs-a-practical-approach-to-better-monolithic-applications-b1ca89192fde)
- [NestJS Modular Monolith Event-Driven Architecture Template - GitHub](https://github.com/deadislove/nestJS-modular-monolith-event-driven-architecture-template)
- [Modular Monolith NestJS with DDD - GitHub](https://github.com/jsantanders/modular-monolith-nestjs)
- [Microservices vs. Modular Monoliths in 2025 - Java Code Geeks](https://www.javacodegeeks.com/2025/12/microservices-vs-modular-monoliths-in-2025-when-each-approach-wins.html)
- [Bridging Monolith and Microservices: A Modular Monolith Architecture with NestJS - SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6042616)

---

## 3. GraphQL Subscriptions avec Redis Pub/Sub : Scalabilite Temps Reel

### Description du pattern

Les **GraphQL Subscriptions** permettent au serveur de pousser des donnees en temps reel vers les clients via WebSocket. En mode mono-instance, l'implementation par defaut en memoire suffit. Mais des qu'on deploie plusieurs instances du serveur (derriere un load balancer), un evenement publie sur une instance ne sera pas recu par les clients connectes aux autres instances.

La solution est d'utiliser **Redis Pub/Sub** comme couche de transport centralisee. La librairie `graphql-redis-subscriptions` remplace le PubSub en memoire par un PubSub Redis, garantissant que tous les evenements sont distribues a toutes les instances du serveur.

### Cas d'utilisation dans family-hub

- **Statut des rituels en temps reel** : Quand un membre complete un rituel, tous les membres du foyer voient la mise a jour instantanement (mode kiosque compris).
- **Mises a jour du tableau de bord familial** : Le mode kiosque affiche des donnees en direct (taches du jour, statuts, messages).
- **Notifications de conversations IA** : Les reponses de l'IA sont streamees en temps reel via subscriptions.
- **Presence des membres** : Indicateurs en ligne/hors ligne pour les membres de la famille.
- **Multi-foyers** : Les evenements doivent etre routes correctement aux bons foyers et cercles de visibilite.

### Approche d'implementation avec NestJS

#### Configuration de Redis PubSub

```typescript
// shared/infrastructure/pubsub/redis-pubsub.provider.ts
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

export const REDIS_PUB_SUB = 'REDIS_PUB_SUB';

export const redisPubSubProvider = {
  provide: REDIS_PUB_SUB,
  useFactory: () => {
    return new RedisPubSub({
      publisher: new Redis({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10),
        retryStrategy: (times) => Math.min(times * 50, 2000),
      }),
      subscriber: new Redis({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10),
        retryStrategy: (times) => Math.min(times * 50, 2000),
      }),
    });
  },
};
```

#### Resolver avec Subscription

```typescript
// rituals/ritual.resolver.ts
@Resolver(() => Ritual)
export class RitualResolver {
  constructor(
    private readonly ritualService: RitualService,
    @Inject(REDIS_PUB_SUB) private readonly pubSub: RedisPubSub,
  ) {}

  @Mutation(() => Ritual)
  @UseGuards(GqlAuthGuard)
  async completeRitual(
    @Args('ritualId') ritualId: string,
    @CurrentUser() user: User,
  ): Promise<Ritual> {
    const ritual = await this.ritualService.complete(ritualId, user);

    // Publication de l'evenement sur Redis
    await this.pubSub.publish(`ritual.completed.${ritual.householdId}`, {
      ritualCompleted: ritual,
    });

    return ritual;
  }

  @Subscription(() => Ritual, {
    filter: (payload, variables, context) => {
      // Filtrage par cercle de visibilite
      return payload.ritualCompleted.householdId === variables.householdId;
    },
  })
  @UseGuards(GqlAuthGuard)
  ritualCompleted(
    @Args('householdId') householdId: string,
  ) {
    return this.pubSub.asyncIterator(`ritual.completed.${householdId}`);
  }
}
```

#### Combinaison Socket.IO + GraphQL Subscriptions + Redis

L'architecture family-hub utilise a la fois Socket.IO et GraphQL Subscriptions. Voici comment les combiner avec Redis comme backbone commun :

```typescript
// shared/infrastructure/adapters/redis-io.adapter.ts
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}

// main.ts
const app = await NestFactory.create(AppModule);
const redisIoAdapter = new RedisIoAdapter(app);
await redisIoAdapter.connectToRedis();
app.useWebSocketAdapter(redisIoAdapter);
```

#### Pattern de routage par foyer et cercle de visibilite

```typescript
// Strategie de topics Redis pour family-hub
// Format : {domaine}.{action}.{householdId}[.{circleLevel}]

// Exemples :
// ritual.completed.hh_123           -> Tous les membres du foyer
// task.assigned.hh_123.personal     -> Uniquement le membre concerne
// family.member.status.hh_123       -> Presence dans le foyer
// kiosk.dashboard.hh_123            -> Evenements du tableau de bord kiosque
// conversation.message.hh_123.couple -> Message visible uniquement par le couple
```

### Architecture de scalabilite horizontale

```
                    Load Balancer (Nginx/HAProxy)
                    (sticky sessions par WebSocket)
                         |
          +--------------+--------------+
          |              |              |
     NestJS #1      NestJS #2      NestJS #3
     (WS clients)   (WS clients)   (WS clients)
          |              |              |
          +--------------+--------------+
                         |
                   Redis Cluster
                   (Pub/Sub central)
                         |
                   PostgreSQL 18
```

Les **sticky sessions** sont essentielles pour WebSocket : un client WebSocket doit toujours se reconnecter a la meme instance serveur. Le Redis adapter de Socket.IO se charge de broadcaster les evenements entre toutes les instances.

### Avantages

- **Scalabilite horizontale** : Ajout d'instances serveur transparent pour les clients.
- **Haute disponibilite** : Redis Cluster supporte le failover automatique.
- **Unification** : Un seul backbone Redis pour Socket.IO et GraphQL Subscriptions.
- **Performance** : Redis Pub/Sub est extremement rapide (latence sub-milliseconde).
- **Filtrage cote serveur** : Les subscriptions GraphQL permettent un filtrage fin par foyer/cercle.

### Inconvenients

- **Complexite operationnelle** : Redis doit etre administre, monitore et backupe en tant que composant critique.
- **Pas de persistance garantie** : Redis Pub/Sub est "fire and forget" — si un subscriber est deconnecte au moment de la publication, le message est perdu. Pour les messages critiques, coupler avec BullMQ ou Redis Streams.
- **Sticky sessions** : Ajoutent de la complexite au load balancing et peuvent creer un desequilibre de charge.
- **Memoire Redis** : Le nombre de channels et de subscribers consomme de la memoire Redis.
- **Debugging complexe** : Le flux d'evenements distribue est plus difficile a tracer que des appels directs.

### Quand utiliser vs quand eviter

**Utiliser quand** :
- L'application a plusieurs instances serveur (production horizontalement scalee).
- Plusieurs fonctionnalites temps reel coexistent (statuts, notifications, dashboard kiosque).
- La latence de mise a jour doit etre inferieure a la seconde.

**Eviter quand** :
- Une seule instance serveur suffit (prototype, MVP initial).
- Les mises a jour peuvent tolerer du polling periodique (ex: rapports hebdomadaires).
- La garantie de livraison des messages est critique (utiliser plutot Redis Streams ou Kafka).

### Sources

- [graphql-redis-subscriptions - npm](https://www.npmjs.com/package/graphql-redis-subscriptions)
- [Building Real-time Notifications with GraphQL Subscriptions and Redis PubSub in NestJS - Medium](https://medium.com/@sujoy.swe/building-real-time-notifications-with-graphql-subscriptions-and-redis-pubsub-in-nestjs-ed13916dfac1)
- [GraphQL subscriptions with Nest: how to publish across multiple running servers - DEV](https://dev.to/thisdotmedia/graphql-subscriptions-with-nest-how-to-publish-across-multiple-running-servers-15e)
- [NestJS GraphQL Subscriptions Documentation](https://docs.nestjs.com/graphql/subscriptions)
- [GraphQL subscriptions with Redis Pub Sub - Apollo Blog](https://www.apollographql.com/blog/backend/subscriptions/graphql-subscriptions-with-redis-pub-sub/)
- [Scaling GraphQL Subscription with Apollo Server and ElastiCache for Redis - DEV](https://dev.to/kylefoo/scaling-graphql-subscription-with-apollo-server-and-elasticache-for-redis-9n8)
- [WebSockets at Scale: Real-Time Architectures with NestJS and Redis Pub/Sub - Praeclarum Tech](https://praeclarumtech.com/websockets-at-scale-real-time-architectures-with-nestjs-and-redis-pub-sub/)
- [Redis adapter - Socket.IO Documentation](https://socket.io/docs/v4/redis-adapter/)
- [Scalable WebSockets with NestJS and Redis - LogRocket](https://blog.logrocket.com/scalable-websockets-with-nestjs-and-redis/)
- [Mastering Scalable GraphQL Subscriptions: Advanced Patterns - DEV](https://dev.to/vaib/mastering-scalable-graphql-subscriptions-advanced-patterns-for-real-time-applications-j0n)

---

## 4. CQRS et Event Sourcing avec NestJS

### Description du pattern

**CQRS** (Command Query Responsibility Segregation) separe les operations d'ecriture (Commands) des operations de lecture (Queries) dans des modeles distincts. **Event Sourcing** complementaire stocke l'etat de l'application sous forme d'une sequence immuable d'evenements plutot que de l'etat courant.

NestJS fournit le package officiel `@nestjs/cqrs` qui offre des abstractions pour les Commands, Queries, Events, et Sagas.

### Cas d'utilisation dans family-hub

- **Historique des rituels** : Chaque completion, modification, ou saut de rituel est un evenement. L'historique complet est precieux pour les statistiques et l'IA.
- **Graphe familial evolutif** : Les modifications du graphe familial (ajout/retrait de membres, changement de foyer) sont naturellement des evenements.
- **Audit trail** : Pour les actions sensibles (modification des permissions, changement de cercle de visibilite), l'event sourcing fournit un historique complet et immuable.
- **Separation lecture/ecriture pour le kiosque** : Le mode kiosque fait essentiellement des lectures intensives (tableau de bord) tandis que les mobiles font surtout des ecritures (completion de taches). CQRS optimise les deux cotes.
- **Sagas pour les workflows complexes** : La creation d'un nouveau foyer declenche une cascade d'actions (initialisation des rituels par defaut, invitation des membres, configuration du kiosque).

### Approche d'implementation avec NestJS

#### Architecture CQRS simplifiee

```typescript
// === Command ===
export class CompleteRitualCommand {
  constructor(
    public readonly ritualId: string,
    public readonly memberId: string,
    public readonly completedAt: Date,
  ) {}
}

// === Command Handler ===
@CommandHandler(CompleteRitualCommand)
export class CompleteRitualHandler implements ICommandHandler<CompleteRitualCommand> {
  constructor(
    private readonly ritualRepository: RitualRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CompleteRitualCommand): Promise<void> {
    const ritual = await this.ritualRepository.findById(command.ritualId);
    ritual.complete(command.memberId, command.completedAt);
    await this.ritualRepository.save(ritual);

    // Publication de l'evenement de domaine
    this.eventBus.publish(
      new RitualCompletedEvent(
        command.ritualId,
        command.memberId,
        ritual.householdId,
        command.completedAt,
      ),
    );
  }
}

// === Event ===
export class RitualCompletedEvent {
  constructor(
    public readonly ritualId: string,
    public readonly memberId: string,
    public readonly householdId: string,
    public readonly completedAt: Date,
  ) {}
}

// === Event Handler ===
@EventsHandler(RitualCompletedEvent)
export class RitualCompletedHandler implements IEventHandler<RitualCompletedEvent> {
  constructor(
    @Inject(REDIS_PUB_SUB) private readonly pubSub: RedisPubSub,
    private readonly statsService: RitualStatsService,
  ) {}

  async handle(event: RitualCompletedEvent): Promise<void> {
    // Effet 1 : Mise a jour des statistiques
    await this.statsService.incrementCompletion(event.ritualId, event.memberId);

    // Effet 2 : Notification temps reel
    await this.pubSub.publish(`ritual.completed.${event.householdId}`, {
      ritualCompleted: { ritualId: event.ritualId, memberId: event.memberId },
    });
  }
}

// === Query ===
export class GetHouseholdDashboardQuery {
  constructor(
    public readonly householdId: string,
    public readonly date: Date,
  ) {}
}

// === Query Handler ===
@QueryHandler(GetHouseholdDashboardQuery)
export class GetHouseholdDashboardHandler
  implements IQueryHandler<GetHouseholdDashboardQuery>
{
  constructor(private readonly dashboardReadRepo: DashboardReadRepository) {}

  async execute(query: GetHouseholdDashboardQuery): Promise<HouseholdDashboard> {
    // Lecture depuis un modele optimise pour la lecture
    return this.dashboardReadRepo.getDashboard(query.householdId, query.date);
  }
}
```

#### Sagas pour les workflows transversaux

Les sagas dans NestJS/CQRS utilisent RxJS pour orchestrer des sequences d'evenements et emettre de nouvelles commandes :

```typescript
@Injectable()
export class HouseholdSagas {
  @Saga()
  householdCreated = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(HouseholdCreatedEvent),
      mergeMap((event) => [
        // Cascade d'actions declenchees par la creation d'un foyer
        new InitializeDefaultRitualsCommand(event.householdId),
        new CreateKioskConfigCommand(event.householdId),
        new SendWelcomeNotificationCommand(event.householdId, event.creatorId),
      ]),
    );
  };

  @Saga()
  memberAddedToHousehold = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(MemberAddedToHouseholdEvent),
      map((event) =>
        new AssignDefaultRitualsToMemberCommand(event.memberId, event.householdId),
      ),
    );
  };
}
```

#### CQRS sans Event Sourcing complet (approche recommandee pour family-hub)

L'event sourcing complet (ou l'etat est reconstruit uniquement depuis les evenements) est puissant mais complexe. Pour family-hub, l'approche recommandee est un **CQRS leger** :

1. **Etat primaire dans PostgreSQL** (via Prisma) : L'etat courant reste dans des tables relationnelles classiques.
2. **Evenements de domaine** : Publies via `@nestjs/cqrs` EventBus pour les effets de bord et la communication inter-modules.
3. **Journal d'evenements optionnel** : Une table `domain_events` enregistre les evenements importants pour l'audit et l'historique.
4. **Modeles de lecture optimises** : Des vues materialisees ou des tables denormalisees pour les requetes frequentes (dashboard kiosque).

```typescript
// Table d'evenements pour l'audit (pas un event store complet)
model DomainEvent {
  id            String   @id @default(cuid())
  aggregateType String   // 'Ritual', 'Household', 'FamilyMember'
  aggregateId   String
  eventType     String   // 'ritual.completed', 'member.added'
  payload       Json
  metadata      Json     // userId, timestamp, correlationId
  occurredAt    DateTime @default(now())

  @@index([aggregateType, aggregateId])
  @@index([eventType, occurredAt])
}
```

### Avantages

- **Separation des preoccupations** : Les commandes et les requetes sont traitees par des handlers dedies, chaque handler a une responsabilite unique.
- **Testabilite** : Chaque handler est une unite isolee, facilement testable.
- **Evolutivite** : Ajouter un nouvel effet de bord a un evenement = ajouter un nouveau handler, sans modifier le code existant (Open/Closed Principle).
- **Audit naturel** : Les evenements de domaine documentent ce qui s'est passe dans le systeme.
- **Optimisation des lectures** : Les modeles de lecture peuvent etre optimises independamment (vues materialisees, caches Redis).

### Inconvenients

- **Complexite structurelle** : Plus de fichiers, plus de classes, plus d'indirections. Pour une simple CRUD, c'est disproportionne.
- **Courbe d'apprentissage** : L'equipe doit maitriser les patterns CQRS, les evenements de domaine et les sagas.
- **Eventuelle consistance** : Si les modeles de lecture sont asynchrones, il y a un delai entre l'ecriture et la visibilite.
- **Event Sourcing complet tres complexe** : La reconstruction d'etat, les snapshots, la migration de schemas d'evenements ajoutent une complexite significative.
- **Debugging** : Le flux commande -> handler -> evenement -> handler -> effet est plus difficile a tracer.

### Quand utiliser vs quand eviter

**Utiliser quand** :
- Le domaine a des workflows complexes avec des effets de bord multiples (cas de family-hub : rituels, notifications, stats).
- L'audit trail est important (modifications du graphe familial, permissions).
- Les patterns de lecture et d'ecriture sont significativement differents (kiosque vs mobile).
- On prevoit d'extraire des modules en microservices a terme (les evenements deviennent des messages inter-services).

**Eviter quand** :
- L'application est majoritairement CRUD simple.
- L'equipe est petite et ne maitrise pas les patterns CQRS.
- La complexite du projet ne justifie pas l'indirection supplementaire.

**Recommandation pour family-hub** : Adopter un **CQRS leger** des le debut — utiliser les Commands/Queries/Events de `@nestjs/cqrs` sans event sourcing complet. Ajouter le journal d'evenements pour les domaines critiques (graphe familial, rituels). Reserver l'event sourcing complet pour une phase ulterieure si le besoin se confirme.

### Sources

- [NestJS CQRS Documentation](https://docs.nestjs.com/recipes/cqrs)
- [Event Sourcing with Node.js: NestJS (Part 2) - Medium (Jan 2026)](https://medium.com/@vloban/event-sourcing-with-node-js-nestjs-part-2-1fbef625933d)
- [Navigating CQRS and Event Sourcing with NestJS and EventStoreDB - Medium](https://medium.com/digitalfrontiers/navigating-cqrs-and-event-sourcing-my-journey-with-nestjs-and-eventstoredb-part-1-cebbe6bcff2e)
- [CQRS Pattern in Nest.js - DEV](https://dev.to/jacobandrewsky/cqrs-pattern-in-nestjs-4n3p)
- [Implementing CQRS and Event Sourcing in NestJS with TypeORM and Redis - Medium](https://medium.com/@connect.hashblock/implementing-cqrs-and-event-sourcing-in-nestjs-with-typeorm-and-redis-25dafa7fc403)
- [Event Sourcing with NestJS (CQRS, DDD) - GitHub](https://github.com/eliranna/event-sourcing-with-NestJS-example)
- [Building NestJS Applications Following the CQRS Model - Telerik](https://www.telerik.com/blogs/building-nestjs-applications-following-the-cqrs-model)
- [EventBus | nestjs/cqrs - DeepWiki](https://deepwiki.com/nestjs/cqrs/3.4-eventbus)
- [NestJS Saga Pattern Example - GitHub](https://github.com/orhanveli/nestjs-saga-pattern-example)

---

## 5. BullMQ et NestJS : Gestion de Files d'Attente pour Taches Recurrentes

### Description du pattern

**BullMQ** est une librairie de file d'attente (message queue) pour Node.js basee sur Redis. Elle permet de gerer des jobs en arriere-plan, des taches planifiees, et des taches recurrentes avec des patterns cron. Le package `@nestjs/bullmq` integre BullMQ dans l'ecosysteme NestJS avec des decorateurs et l'injection de dependances.

Depuis la version **5.16.0** de BullMQ, l'API des "Repeatable Jobs" est remplacee par les **Job Schedulers**, offrant une API plus robuste et coherente via la methode `upsertJobScheduler`.

### Cas d'utilisation dans family-hub

- **Rituels recurrents** : Un rituel "Brossage de dents" se repete chaque jour a 7h et 20h. Un Job Scheduler cree une occurrence a chaque echeance.
- **Rappels de taches** : Notifications de rappel envoyees X minutes avant l'echeance d'une tache.
- **Generation de rapports hebdomadaires** : Resume des rituels completes par la famille, envoye chaque dimanche soir.
- **Nettoyage periodique** : Purge des sessions expirees, archivage des vieilles conversations IA.
- **Renouvellement des taches rotatives** : Les taches menageres a rotation entre membres (ex: "sortir les poubelles") changent d'assignation chaque semaine.
- **Traitement IA asynchrone** : Les requetes a l'IA conversationnelle qui prennent du temps sont traitees via une queue pour ne pas bloquer la requete HTTP.

### Approche d'implementation avec NestJS

#### Configuration de base

```typescript
// app.module.ts
@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10),
      },
    }),
    BullModule.registerQueue(
      { name: 'rituals' },
      { name: 'notifications' },
      { name: 'reports' },
      { name: 'ai-processing' },
      { name: 'maintenance' },
    ),
  ],
})
export class AppModule {}
```

#### Job Schedulers pour les rituels recurrents

```typescript
// rituals/services/ritual-scheduler.service.ts
@Injectable()
export class RitualSchedulerService {
  constructor(
    @InjectQueue('rituals') private readonly ritualsQueue: Queue,
  ) {}

  /**
   * Cree ou met a jour un scheduler pour un rituel recurrent.
   * Utilise upsertJobScheduler (API BullMQ 5.16+) au lieu de add() avec repeat.
   */
  async scheduleRitual(ritual: Ritual): Promise<void> {
    // Pattern cron derive de la configuration du rituel
    const cronPattern = this.buildCronPattern(ritual.schedule);

    await this.ritualsQueue.upsertJobScheduler(
      `ritual-${ritual.id}`, // ID unique du scheduler
      {
        pattern: cronPattern,   // ex: '0 0 7,20 * * *' pour 7h et 20h
        tz: ritual.household.timezone, // Timezone du foyer
      },
      {
        name: 'create-ritual-occurrence',
        data: {
          ritualId: ritual.id,
          householdId: ritual.householdId,
          assignedMembers: ritual.assignedMemberIds,
        },
        opts: {
          removeOnComplete: { count: 100 },  // Garde les 100 derniers
          removeOnFail: { age: 7 * 24 * 3600 }, // Garde les echecs 7 jours
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      },
    );
  }

  /**
   * Supprime le scheduler quand un rituel est desactive ou supprime.
   */
  async unscheduleRitual(ritualId: string): Promise<void> {
    await this.ritualsQueue.removeJobScheduler(`ritual-${ritualId}`);
  }

  /**
   * Liste tous les schedulers actifs (utile pour le debugging et le monitoring).
   */
  async listActiveSchedulers(): Promise<JobScheduler[]> {
    return this.ritualsQueue.getJobSchedulers();
  }

  private buildCronPattern(schedule: RitualSchedule): string {
    // Conversion de la configuration utilisateur en expression cron
    // Ex: { frequency: 'daily', times: ['07:00', '20:00'] }
    //  -> '0 0 7,20 * * *'
    // Ex: { frequency: 'weekly', dayOfWeek: 1, time: '09:00' }
    //  -> '0 0 9 * * 1'
    // ...
  }
}
```

#### Worker pour traiter les occurrences de rituels

```typescript
// rituals/processors/ritual.processor.ts
@Processor('rituals')
export class RitualProcessor extends WorkerHost {
  constructor(
    private readonly ritualService: RitualService,
    private readonly notificationService: NotificationService,
    private readonly eventBus: EventBus,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case 'create-ritual-occurrence':
        await this.handleCreateOccurrence(job);
        break;
      case 'send-ritual-reminder':
        await this.handleRitualReminder(job);
        break;
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  }

  private async handleCreateOccurrence(job: Job): Promise<void> {
    const { ritualId, householdId, assignedMembers } = job.data;

    // Creer l'occurrence du rituel pour aujourd'hui
    const occurrence = await this.ritualService.createOccurrence({
      ritualId,
      householdId,
      assignedMembers,
      dueDate: new Date(),
    });

    // Programmer un rappel 15 minutes avant l'echeance
    await job.queue.add(
      'send-ritual-reminder',
      {
        occurrenceId: occurrence.id,
        ritualId,
        assignedMembers,
      },
      {
        delay: this.calculateReminderDelay(occurrence),
      },
    );

    // Publier l'evenement
    this.eventBus.publish(new RitualOccurrenceCreatedEvent(occurrence));
  }

  private async handleRitualReminder(job: Job): Promise<void> {
    const { occurrenceId, assignedMembers } = job.data;
    const occurrence = await this.ritualService.getOccurrence(occurrenceId);

    // Ne pas envoyer de rappel si deja complete
    if (occurrence.status === 'completed') return;

    await this.notificationService.sendToMembers(assignedMembers, {
      type: 'ritual_reminder',
      title: `Rappel : ${occurrence.ritual.name}`,
      body: `C'est bientot l'heure !`,
    });
  }
}
```

#### Taches de rotation entre membres

```typescript
// rituals/services/rotation.service.ts
@Injectable()
export class RotationService {
  constructor(
    @InjectQueue('rituals') private readonly ritualsQueue: Queue,
  ) {}

  async scheduleWeeklyRotation(ritual: Ritual): Promise<void> {
    await this.ritualsQueue.upsertJobScheduler(
      `rotation-${ritual.id}`,
      {
        pattern: '0 0 0 * * 1', // Chaque lundi a minuit
        tz: ritual.household.timezone,
      },
      {
        name: 'rotate-assignment',
        data: {
          ritualId: ritual.id,
          memberPool: ritual.assignedMemberIds,
        },
      },
    );
  }
}
```

#### File d'attente pour l'IA conversationnelle

```typescript
// conversations/processors/ai.processor.ts
@Processor('ai-processing', {
  limiter: {
    max: 10,        // Maximum 10 jobs par intervalle
    duration: 1000, // Intervalle de 1 seconde
  },
  concurrency: 5,   // 5 jobs en parallele
})
export class AIProcessor extends WorkerHost {
  async process(job: Job): Promise<AIResponse> {
    const { conversationId, userMessage, context } = job.data;

    // Mise a jour du statut de progression
    await job.updateProgress(10);

    // Appel a l'API IA (OpenAI, Anthropic, etc.)
    const response = await this.aiService.generateResponse(
      userMessage,
      context,
    );

    await job.updateProgress(100);
    return response;
  }
}
```

### Patterns de robustesse

#### Gestion multi-instances (deduplication)

Quand plusieurs instances NestJS tournent, il faut eviter que les memes schedulers soient crees en double. L'API `upsertJobScheduler` gere ce cas nativement : elle cree ou met a jour le scheduler sans duplication.

#### Dead Letter Queue (DLQ)

```typescript
// Pour les jobs critiques, configurer une DLQ
BullModule.registerQueue({
  name: 'rituals',
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: false, // Conserver les echecs pour analyse
  },
});
```

#### Monitoring avec Bull Board

```typescript
// Tableau de bord de monitoring des queues
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

@Module({
  imports: [
    BullBoardModule.forFeature({
      name: 'rituals',
      adapter: BullMQAdapter,
    }),
  ],
})
```

### Avantages

- **Fiabilite** : Les jobs persistent dans Redis, survivent aux redemarrages du serveur.
- **Scalabilite** : Plusieurs workers peuvent traiter la meme queue en parallele sur differentes instances.
- **Rate limiting** : Controle du debit pour les API externes (IA, notifications push).
- **Retry automatique** : Backoff exponentiel et DLQ pour les jobs en echec.
- **Planification precise** : Expressions cron avec support des fuseaux horaires (critique pour une app familiale multi-fuseaux).
- **Monitoring** : Bull Board fournit un tableau de bord visuel des queues.

### Inconvenients

- **Dependance Redis** : Redis devient un point central de l'architecture, sa panne bloque les queues.
- **Complexite de debugging** : Les jobs asynchrones sont plus difficiles a debugger que du code synchrone.
- **Production de jobs** : Le scheduler ne genere un nouveau job que lorsque le precedent commence a etre traite. Si la queue est saturee, les jobs recurrents peuvent etre retardes.
- **Gestion des fuseaux horaires** : Les familles multi-fuseaux necesitent une gestion soigneuse des timezones dans les patterns cron.
- **Cout memoire Redis** : Les jobs en attente et l'historique consomment de la memoire Redis.

### Quand utiliser vs quand eviter

**Utiliser quand** :
- Les taches doivent survivre aux redemarrages du serveur.
- La planification precise (cron) est requise (rituels quotidiens, hebdomadaires).
- Des workers distribues doivent traiter des jobs en parallele.
- Le rate limiting est necessaire (API IA, notifications push).
- Le suivi et le monitoring des taches sont importants.

**Eviter quand** :
- Des taches simples en memoire suffisent (setTimeout, setInterval pour du prototypage).
- La latence sub-seconde est critique (utiliser des evenements directs plutot qu'une queue).
- L'infrastructure ne peut pas supporter Redis.

### Sources

- [BullMQ Job Schedulers Documentation](https://docs.bullmq.io/guide/job-schedulers)
- [BullMQ Repeat Strategies Documentation](https://docs.bullmq.io/guide/job-schedulers/repeat-strategies)
- [BullMQ Repeat Options Documentation](https://docs.bullmq.io/guide/job-schedulers/repeat-options)
- [Job Scheduling in Node.js with BullMQ - Better Stack](https://betterstack.com/community/guides/scaling-nodejs/bullmq-scheduled-tasks/)
- [Using BullMQ with NestJS for Background Job Processing - Medium](https://mahabub-r.medium.com/using-bullmq-with-nestjs-for-background-job-processing-320ab938048a)
- [Mastering BullMQ in NestJS: A Step-by-Step Introduction - NashTech](https://blog.nashtechglobal.com/mastering-bullmq-in-nestjs-a-step-by-step-introduction-part-1/)
- [BullMQ Ultimate Guide 2025 - DragonflyDB](https://www.dragonflydb.io/guides/bullmq)
- [Handling Cron Jobs in NestJS with Multiple Instances using Bull - DEV](https://dev.to/juan_castillo/handling-cron-jobs-in-nestjs-with-multiple-instances-using-bull-3pj2)
- [Manage Job Schedulers - BullMQ Documentation](https://docs.bullmq.io/guide/job-schedulers/manage-job-schedulers)

---

## 6. API Gateway et Pattern BFF dans un Monorepo NestJS / Next.js / Expo

### Description du pattern

Le pattern **API Gateway** fournit un point d'entree unique pour tous les clients (web, mobile, kiosque). Le pattern **BFF** (Backend For Frontend) est une variante ou chaque type de frontend dispose de son propre backend specialise qui adapte les donnees et les interactions aux besoins specifiques de ce frontend.

Dans un monorepo Turborepo avec NestJS (backend), Next.js (web) et Expo (mobile), la question architecturale fondamentale est : **un seul backend GraphQL pour tous, ou des BFF distincts par plateforme ?**

### Cas d'utilisation dans family-hub

- **Clients multiples** : Next.js (web), Expo React Native (mobile), mode kiosque (variante web).
- **Besoins differencies** : Le mobile a besoin de payloads legers, le kiosque de donnees agrégées riches, le web d'un equilibre entre les deux.
- **GraphQL comme couche d'adaptation** : GraphQL permet naturellement a chaque client de demander exactement les champs dont il a besoin.
- **Partage de code** : Le monorepo Turborepo permet de partager types, schemas de validation et logique entre packages.

### Approche d'implementation avec NestJS

#### Option 1 : NestJS unique avec GraphQL (Recommandee pour family-hub)

L'approche la plus pragmatique pour family-hub est un **unique backend NestJS** exposant un endpoint GraphQL unifie. GraphQL agit naturellement comme une couche d'adaptation : chaque client demande exactement les donnees dont il a besoin.

```
packages/
  shared/
    types/              # Types TypeScript partages
    validation/         # Schemas Zod/class-validator partages
    graphql/            # Fragments et operations GraphQL partages
apps/
  api/                  # NestJS - Backend unique
    src/
      modules/
        family/
        rituals/
        conversations/
        notifications/
        kiosk/          # Module specifique kiosque
      graphql/
        schema.gql      # Schema genere (code-first)
  web/                  # Next.js
    src/
      lib/
        graphql/        # Client Apollo/urql
  mobile/               # Expo React Native
    src/
      lib/
        graphql/        # Client Apollo/urql
```

#### Partage de types via le monorepo

```typescript
// packages/shared/types/src/family.ts
// Types partages entre backend et tous les frontends
export interface FamilyMemberBase {
  id: string;
  firstName: string;
  lastName: string;
  householdIds: string[];
}

// packages/shared/graphql/src/fragments/family.ts
import { gql } from 'graphql-tag';

export const FAMILY_MEMBER_CORE_FIELDS = gql`
  fragment FamilyMemberCoreFields on FamilyMember {
    id
    firstName
    lastName
    avatarUrl
  }
`;

// Utilise par le web et le mobile
export const FAMILY_MEMBER_WITH_HOUSEHOLDS = gql`
  ${FAMILY_MEMBER_CORE_FIELDS}
  fragment FamilyMemberWithHouseholds on FamilyMember {
    ...FamilyMemberCoreFields
    households {
      id
      name
    }
  }
`;
```

#### Adaptation par client via GraphQL

Plutot que des BFF distincts, GraphQL permet a chaque client de definir ses propres requetes :

```typescript
// mobile/src/lib/graphql/queries/dashboard.ts
// Le mobile demande un payload leger
export const MOBILE_DASHBOARD = gql`
  query MobileDashboard($householdId: ID!, $date: DateTime!) {
    householdDashboard(householdId: $householdId, date: $date) {
      todayRituals {
        id
        name
        status
      }
      pendingTasksCount
    }
  }
`;

// web/src/lib/graphql/queries/dashboard.ts
// Le web demande plus de details
export const WEB_DASHBOARD = gql`
  query WebDashboard($householdId: ID!, $date: DateTime!) {
    householdDashboard(householdId: $householdId, date: $date) {
      todayRituals {
        id
        name
        description
        status
        assignedMembers {
          id
          firstName
          avatarUrl
        }
        completedAt
        schedule {
          frequency
          times
        }
      }
      pendingTasks {
        id
        title
        priority
        dueDate
        assignee {
          id
          firstName
        }
      }
      familyStats {
        weeklyCompletionRate
        streaks {
          memberId
          count
        }
      }
    }
  }
`;
```

#### Option 2 : Lightweight BFF avec Next.js API Routes (pour cas specifiques)

Pour certains cas ou le web a besoin d'une logique specifique (SSR, ISR, caching cote serveur), Next.js API Routes peut servir de BFF leger :

```typescript
// web/src/app/api/dashboard/route.ts
// BFF leger pour le SSR du tableau de bord web
import { getServerSession } from 'next-auth';
import { graphqlClient } from '@/lib/graphql/client';

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Agregation de plusieurs requetes GraphQL cote serveur
  const [dashboard, notifications, weather] = await Promise.all([
    graphqlClient.query({ query: WEB_DASHBOARD, variables: { ... } }),
    graphqlClient.query({ query: UNREAD_NOTIFICATIONS }),
    fetchWeatherAPI(session.user.location), // API tierce
  ]);

  return Response.json({
    dashboard: dashboard.data,
    notifications: notifications.data,
    weather,
  });
}
```

#### REST pour les cas non-GraphQL

Certains endpoints restent en REST pour des raisons techniques :

```typescript
// apps/api/src/modules/auth/auth.controller.ts
@Controller('auth')
export class AuthController {
  // OAuth callbacks, JWT refresh - REST est plus adapte
  @Post('login')
  async login(@Body() dto: LoginDto) { ... }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) { ... }
}

// apps/api/src/modules/upload/upload.controller.ts
@Controller('upload')
export class UploadController {
  // Upload de fichiers - REST avec multipart/form-data
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) { ... }
}

// apps/api/src/modules/webhooks/webhooks.controller.ts
@Controller('webhooks')
export class WebhooksController {
  // Webhooks externes (Stripe, push notifications) - REST requis
  @Post('stripe')
  async handleStripe(@Body() payload: any) { ... }
}
```

#### Pattern GraphQL Federation (pour l'evolution future)

Si family-hub grandit au point de necessiter des microservices, Apollo Federation permet de composer un supergraph a partir de subgraphs independants :

```typescript
// Chaque module pourrait devenir un subgraph federe
// family-subgraph/src/app.module.ts
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: { federation: 2 },
    }),
  ],
})
export class FamilySubgraphModule {}

// gateway/src/app.module.ts
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      gateway: {
        supergraphSdl: new IntrospectAndCompose({
          subgraphs: [
            { name: 'family', url: 'http://localhost:3001/graphql' },
            { name: 'rituals', url: 'http://localhost:3002/graphql' },
            { name: 'conversations', url: 'http://localhost:3003/graphql' },
          ],
        }),
      },
    }),
  ],
})
export class GatewayModule {}
```

### Structure du monorepo Turborepo

```
family-hub/
  turbo.json
  package.json
  apps/
    api/              # NestJS backend
    web/              # Next.js frontend web
    mobile/           # Expo React Native
  packages/
    shared-types/     # Types TypeScript partages
    shared-validation/# Schemas de validation (Zod)
    shared-graphql/   # Fragments, operations, codegen config
    shared-ui/        # Composants UI partages (via react-native-web)
    eslint-config/    # Configuration ESLint partagee
    tsconfig/         # Configuration TypeScript partagee
```

### Avantages

- **GraphQL comme BFF naturel** : Chaque client demande exactement les donnees necessaires, pas besoin de BFF distinct.
- **Partage de code** : Le monorepo Turborepo permet un partage efficace de types, validations et fragments GraphQL.
- **Un seul deploiement backend** : Simplicite operationnelle avec un seul serveur NestJS.
- **Codegen** : Les outils comme `graphql-codegen` generent des hooks type-safe pour React et React Native a partir du meme schema.
- **Chemin de federation** : Si necessaire, les modules internes peuvent evoluer en subgraphs federes.

### Inconvenients

- **Schema GraphQL monolithique** : Un schema unique qui grandit peut devenir difficile a gerer.
- **Pas d'optimisation plateforme-specifique** : Un seul backend ne peut pas optimiser finement les reponses pour chaque plateforme (compression, format de donnees).
- **Couplage implicite** : Les clients web et mobile dependent du meme schema GraphQL.
- **Complexite du monorepo** : La gestion des dependances, du build et du deploy dans un monorepo Turborepo a sa propre courbe d'apprentissage.
- **Limites de GraphQL pour certains cas** : Upload de fichiers, webhooks et authentification restent en REST.

### Quand utiliser vs quand eviter

**Utiliser (API Gateway unique + GraphQL)** :
- Petite equipe travaillant sur tous les frontends.
- Les clients ont des besoins de donnees similaires mais de granularites differentes.
- La simplicite operationnelle est prioritaire.

**Utiliser (BFF distinct par plateforme)** :
- Des equipes separees travaillent sur web et mobile.
- Les besoins de donnees sont radicalement differents entre plateformes.
- Des optimisations specifiques par plateforme sont necessaires (ex: payloads binaires pour mobile).

**Recommandation pour family-hub** : Commencer avec un **backend NestJS unique exposant GraphQL**, complemente par des endpoints REST pour auth/upload/webhooks. Utiliser les fragments GraphQL partages dans le monorepo. Ajouter des BFF legers via Next.js API Routes uniquement si le SSR le justifie. Prevoir la federation GraphQL comme chemin d'evolution, sans l'implementer des le debut.

### Sources

- [BFF - Backend for Frontend Design Pattern with Next.js - DEV](https://dev.to/adelhamad/bff-backend-for-frontend-design-pattern-with-nextjs-3od0)
- [API Gateway vs Backend for Frontend (BFF): Which One, When to Use? (NestJS) - Medium](https://medium.com/@ylcnfrht/api-gateway-vs-backend-for-frontend-bff-which-one-when-to-use-example-project-with-nestjs-4f1553c33c97)
- [5 Best Practices for Backends-for-Frontends - WunderGraph](https://wundergraph.com/blog/5-best-practices-for-backend-for-frontends)
- [NestJS GraphQL Federation Documentation](https://docs.nestjs.com/graphql/federation)
- [Getting Started with Apollo Federation and NestJS - Medium](https://medium.com/@philonasebastian44/getting-started-with-apollo-federation-and-nestjs-building-a-unified-graphql-supergraph-a02d72e71ff0)
- [Complete Guide to Setting Up NX + Next.js + Expo Project - make-it.run](https://www.make-it.run/blog/complete-guide-to-setting-up-nx-next-js-expo-project-modern-monorepo-architecture)
- [Turborepo Starter with Expo, Next.js, NestJS - GitHub](https://github.com/Marknjo/create-turbo-with-expo)
- [NestJS Turbo Monorepo - GitHub](https://github.com/vndevteam/nestjs-turbo)
- [NestJS + React (Next.js) in One MVC Repo - Medium](https://medium.com/geekculture/nestjs-react-next-js-in-one-mvc-repo-for-rapid-prototyping-faed42a194ca)

---

## 7. Synthese et Recommandations Architecturales pour family-hub

### Vue d'ensemble de l'architecture recommandee

En croisant les six patterns etudies, voici l'architecture de communication interne recommandee pour family-hub :

```
                          Clients
              +-----------+-----------+
              |           |           |
          Next.js      Expo RN     Kiosque
          (web)       (mobile)    (web PWA)
              |           |           |
              +-----+-----+-----------+
                    |
              [GraphQL + REST]
                    |
            +-------+-------+
            |  NestJS API   |    <-- Backend unique (monolithe modulaire)
            |  (Gateway)    |
            +-------+-------+
                    |
        +-----------+-----------+
        |           |           |
   [Resolvers] [Controllers] [WebSocket]
   (GraphQL)    (REST Auth    (Socket.IO
                Upload        + GraphQL
                Webhooks)     Subscriptions)
        |           |           |
        +-----------+-----------+
                    |
            [Couche CQRS Legere]
        Commands | Queries | Events
                    |
        +-----------+-----------+----------+
        |           |           |          |
   [Modules]   [EventBus]  [BullMQ]   [Redis]
   - Family    (domaine)   (queues)   (cache +
   - Rituals               - rituals   PubSub)
   - Convos                - notifs
   - Notifs                - AI
   - Auth                  - maint.
   - Kiosk
        |
   [Prisma ORM]
        |
   [PostgreSQL 18]
```

### Recommandations par phase du projet

#### Phase 1 : MVP (Mois 1-3)

| Pattern | Niveau d'adoption | Justification |
|---------|-------------------|---------------|
| GraphQL Code-First | **Complet** | Base de l'API, iteration rapide sur le schema |
| Monolithe Modulaire | **Structure de base** | Modules separes avec services publics, pas d'anti-corruption layer complet |
| Redis PubSub + Subscriptions | **Basique** | PubSub en memoire suffit pour une instance, preparer l'interface Redis |
| CQRS | **Non** | Trop premature, commencer par des services simples |
| BullMQ | **Minimal** | Queue pour les rituels recurrents uniquement |
| API Gateway/BFF | **Backend unique** | Un seul NestJS, pas de BFF |

#### Phase 2 : Beta (Mois 4-6)

| Pattern | Niveau d'adoption | Justification |
|---------|-------------------|---------------|
| GraphQL Code-First | **Complet + DataLoader** | Resoudre le N+1 des que les requetes se complexifient |
| Monolithe Modulaire | **Renforce** | Anti-corruption layers, DTOs de transfert, evenements de domaine |
| Redis PubSub + Subscriptions | **Complet** | Migration vers Redis PubSub pour preparer le multi-instances |
| CQRS leger | **Partiel** | Commands/Queries pour les modules complexes (rituels, graphe familial) |
| BullMQ | **Complet** | Toutes les queues (rituels, notifications, AI, maintenance) |
| API Gateway/BFF | **Backend unique + fragments partages** | Codegen GraphQL pour web et mobile |

#### Phase 3 : Production (Mois 7+)

| Pattern | Niveau d'adoption | Justification |
|---------|-------------------|---------------|
| GraphQL Code-First | **Complet + pagination Relay** | Pagination cursor-based pour toutes les listes |
| Monolithe Modulaire | **Strict** | Frontieres enforced, pret pour extraction si necessaire |
| Redis PubSub + Subscriptions | **Complet + Socket.IO Redis Adapter** | Scalabilite horizontale reelle |
| CQRS leger | **Complet** | Sagas pour les workflows complexes, journal d'evenements pour l'audit |
| BullMQ | **Complet + monitoring** | Bull Board, DLQ, alertes sur echecs |
| API Gateway/BFF | **Evaluation federation** | Evaluer si un module necessite l'extraction (AI ?) |

### Decisions architecturales cles

1. **GraphQL code-first comme API primaire** : Securite de type bout-en-bout, adaptation naturelle par client, codegen pour web et mobile.

2. **Monolithe modulaire avec evenements de domaine** : Un seul deploiement NestJS, modules decouples communiquant via services publics (synchrone) et EventEmitter2 (asynchrone). Chemin d'evolution vers la federation GraphQL si necessaire.

3. **Redis comme backbone temps reel unifie** : Un seul cluster Redis pour Pub/Sub (subscriptions GraphQL + Socket.IO), cache, et BullMQ. Simplifie l'infrastructure tout en offrant la scalabilite.

4. **CQRS leger sans event sourcing complet** : Separation commandes/queries pour les modules complexes, evenements de domaine pour la communication inter-modules, journal d'evenements pour l'audit. Pas de reconstruction d'etat depuis les evenements.

5. **BullMQ pour toute la planification** : Les rituels recurrents, notifications differees, traitement IA et maintenance passent par des queues BullMQ avec Job Schedulers.

6. **Un backend, pas de BFF** : GraphQL rend les BFF superflus pour family-hub. REST uniquement pour auth, upload et webhooks. Next.js API Routes comme BFF leger uniquement si le SSR le justifie.

### Risques et mitigations

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Redis SPOF | Eleve | Redis Sentinel ou Cluster, backup regulier, fallback gracieux |
| Schema GraphQL trop large | Moyen | Decomposition en modules, directives de deprecation, documentation auto |
| Frontieres de modules violees | Eleve | Lint rules (ESLint + dependency-cruiser), code reviews, tests d'integration |
| BullMQ queue saturee | Moyen | Monitoring (Bull Board), alertes, rate limiting, workers dedies |
| Complexite CQRS prematuree | Moyen | Adoption progressive, commencer par les services simples, migrer les modules complexes |
| Monorepo build lent | Moyen | Turbo cache, builds incrementaux, CI optimise |

---

*Ce document constitue une base de recherche pour les decisions architecturales de l'ecosysteme family-hub. Les patterns recommandes doivent etre adaptes en fonction de l'evolution des besoins, de la taille de l'equipe et des retours d'experience en production.*
