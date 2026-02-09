# Rapport de Recherche : Patrons d'Architecture Systeme et Domain-Driven Design pour family-hub

**Date** : 2026-02-06
**Contexte** : Application de gestion familiale "family-hub" -- NestJS backend, Next.js web, Expo React Native mobile, Turborepo monorepo. Architecture monolithe modulaire avec API GraphQL, PostgreSQL 18, Redis, BullMQ. Domaines cles : graphe familial (multi-foyers, 5 cercles de visibilite), rituels/taches, interface conversationnelle IA.

---

## Table des matieres

1. [Monolithe Modulaire et Domain-Driven Design avec NestJS](#1-monolithe-modulaire-et-domain-driven-design-avec-nestjs)
2. [Architecture Hexagonale / Clean Architecture dans NestJS](#2-architecture-hexagonale--clean-architecture-dans-nestjs)
3. [Multi-Tenancy par Foyer : Isolation des Donnees](#3-multi-tenancy-par-foyer--isolation-des-donnees)
4. [Frontieres de Modules et Communication Inter-Modules](#4-frontieres-de-modules-et-communication-inter-modules)
5. [Modelisation du Graphe Familial en PostgreSQL](#5-modelisation-du-graphe-familial-en-postgresql)
6. [Feature Flags et Activation de Modules par Foyer](#6-feature-flags-et-activation-de-modules-par-foyer)
7. [Patterns Transversaux Complementaires](#7-patterns-transversaux-complementaires)
8. [Synthese et Recommandations pour family-hub](#8-synthese-et-recommandations-pour-family-hub)

---

## 1. Monolithe Modulaire et Domain-Driven Design avec NestJS

### 1.1 Description du Pattern

Le **monolithe modulaire** est une architecture ou l'application est deployee comme une seule unite, mais structuree en **modules autonomes** correspondant chacun a un **Bounded Context** du DDD. Chaque module encapsule sa propre logique de domaine, ses services applicatifs et ses preoccupations d'infrastructure, garantissant une separation nette et une maintenabilite accrue.

L'idee fondamentale est que **chaque module NestJS est un microservice potentiel** : on construit un monolithe avec des frontieres claires entre contextes metier, permettant un refactoring progressif vers une architecture distribuee si et quand cela devient necessaire.

### 1.2 Les Building Blocks DDD dans NestJS

#### Aggregate Roots
Un aggregate est un "cluster d'objets associes traites comme une unite pour les modifications de donnees". L'**Aggregate Root** est l'entite principale qui detient les references vers les autres entites et constitue le seul point d'acces pour les recherches directes.

```typescript
// Exemple : Aggregate Root "Household"
export class Household extends AggregateRoot {
  private members: FamilyMember[];
  private circles: VisibilityCircle[];

  addMember(member: FamilyMember): void {
    // Logique metier + emission d'evenement domaine
    this.members.push(member);
    this.apply(new MemberAddedEvent(this.id, member.id));
  }
}
```

#### Entites
Les entites representent des objets du domaine avec une **identite distincte et un cycle de vie**. Contrairement aux Value Objects, les entites sont distinguees par leur identite qui reste coherente dans le temps. Elles doivent etre **orientees comportement**, exposant des methodes expressives qui communiquent les comportements du domaine plutot que l'etat.

#### Value Objects
Les Value Objects sont **immutables** et bases sur l'egalite par valeur. Ils servent a mesurer ou decrire des choses (nom, description, date, adresse, cercle de visibilite, etc.).

```typescript
// Exemple : Value Object "VisibilityLevel"
export class VisibilityLevel {
  private constructor(private readonly level: number, private readonly name: string) {}

  static SELF = new VisibilityLevel(0, 'self');
  static NUCLEUS = new VisibilityLevel(1, 'nucleus');       // foyer immediat
  static INNER_FAMILY = new VisibilityLevel(2, 'inner');     // famille proche
  static EXTENDED_FAMILY = new VisibilityLevel(3, 'extended'); // famille elargie
  static TRUSTED_CIRCLE = new VisibilityLevel(4, 'trusted');  // cercle de confiance
  static COMMUNITY = new VisibilityLevel(5, 'community');    // communaute

  isVisibleTo(requesterLevel: VisibilityLevel): boolean {
    return requesterLevel.level <= this.level;
  }
}
```

#### Pattern Repository
Le pattern Repository permet d'isoler la logique de persistance du domaine. Une strategie recommandee est de **separer les entites de persistance des entites de domaine** : le modele de domaine reste propre et independant de la couche de persistance, les entites de persistance sont utilisees strictement pour les operations en base de donnees.

### 1.3 Application au Domaine family-hub

| Bounded Context         | Module NestJS        | Aggregates principaux            |
|------------------------|---------------------|----------------------------------|
| Graphe Familial        | `FamilyGraphModule` | `Household`, `FamilyMember`, `Relationship` |
| Rituels & Taches       | `RitualsModule`     | `Ritual`, `Task`, `Schedule`     |
| Interface IA           | `AIAssistantModule` | `Conversation`, `Intent`, `Action` |
| Authentification       | `AuthModule`        | `User`, `Session`                |
| Notifications          | `NotificationModule`| `Notification`, `Preference`     |
| Cercles de Visibilite  | `CirclesModule`     | `Circle`, `Permission`, `AccessPolicy` |

### 1.4 Structure de Module Recommandee

```
src/modules/family-graph/
  domain/
    entities/          # Household, FamilyMember
    value-objects/     # VisibilityLevel, RelationType
    events/            # MemberAddedEvent, HouseholdCreatedEvent
    repositories/      # IHouseholdRepository (interface)
    services/          # FamilyGraphDomainService
  application/
    commands/          # AddMemberCommand, CreateHouseholdCommand
    queries/           # GetFamilyTreeQuery, GetCircleMembersQuery
    handlers/          # CommandHandlers, QueryHandlers
    dto/               # Input/Output DTOs
  infrastructure/
    persistence/       # TypeORM/Prisma implementations
    adapters/          # Adaptateurs externes
    mappers/           # Domain <-> Persistence mappers
  presentation/
    resolvers/         # GraphQL resolvers
    guards/            # Guards specifiques au module
  family-graph.module.ts
```

### 1.5 Compromis et Risques

**Avantages :**
- Couplage lache : le refactoring interne d'un module est facilite car le monde exterieur ne depend que de l'interface publique du module
- Transition facilitee vers les microservices si necessaire
- Testabilite amelioree grace a l'isolation

**Risques :**
- **Surconception initiale** : le DDD tactique (aggregates, value objects) ajoute de la complexite ; il faut l'appliquer uniquement aux domaines complexes (graphe familial, rituels) et non aux modules CRUD simples (preferences, notifications)
- **Courbe d'apprentissage** : l'equipe doit maitriser les concepts DDD
- **Performances** : la separation entites domaine / persistance implique des couts de mapping

### 1.6 Sources

- [NestJS Modular Monolith CQRS Event Sourcing Template](https://github.com/deadislove/nestJS-modular-monolith-cqrs-event-sourcing-architecture-template)
- [Applying DDD principles to a NestJS project - DEV Community](https://dev.to/bendix/applying-domain-driven-design-principles-to-a-nest-js-project-5f7b)
- [Structuring a NestJS Project with DDD and Onion Architecture - Medium](https://medium.com/@patrick.cunha336/structuring-a-nestjs-project-with-ddd-and-onion-architecture-65b04b7f2754)
- [NestJS DDD Library - @nestjslatam/ddd](https://github.com/nestjslatam/ddd)
- [Modular Monolith NestJS - jsantanders](https://github.com/jsantanders/modular-monolith-nestjs)
- [NestJS Nx Modular Monolith - felipfr](https://app.daily.dev/posts/felipfr-nestjs-nx-modular-monolith-microservices-this-project-is-a-modular-monolith-built-with-nest-4jhwmowng)
- [TypeScript DDD Architecture - zhuravlevma](https://github.com/zhuravlevma/typescript-ddd-architecture)
- [Mastering DDD with NestJS - Codanyks](https://codanyks.hashnode.dev/mastering-ddd-with-nestjs-a-final-reflection)
- [DDD Tactical Design Patterns - DEV Community](https://dev.to/minericefield/ddd-tactical-design-patterns-part-1-domain-layer-j38)
- [Types-DDD npm package](https://www.npmjs.com/package/types-ddd)

---

## 2. Architecture Hexagonale / Clean Architecture dans NestJS

### 2.1 Description du Pattern

L'**Architecture Hexagonale** (ou Ports et Adaptateurs), introduite par Alistair Cockburn, vise a creer un systeme plus maintenable et flexible en **decouplant la logique metier des dependances externes**. Le coeur applicatif reste ignorant des technologies specifiques utilisees par ses adaptateurs.

Les trois composants fondamentaux sont :
- **Domaine** : le coeur de la logique metier, sans dependance externe
- **Ports** : interfaces qui connectent le domaine au monde exterieur (ports entrants pour les cas d'utilisation, ports sortants pour les dependances)
- **Adaptateurs** : implementations des ports (controleurs HTTP, services BDD, brokers de messages)

### 2.2 Adequation Naturelle avec NestJS

NestJS est particulierement adapte a l'architecture hexagonale grace a :
- Son **systeme d'injection de dependances** integre qui facilite la gestion des dependances et le remplacement des implementations
- Son **systeme de modules** qui mappe naturellement les bounded contexts
- Ses **providers** qui implementent naturellement le pattern adaptateur

```typescript
// PORT (Interface sortante) - dans domain/
export interface IFamilyMemberRepository {
  findById(id: string): Promise<FamilyMember | null>;
  findByHousehold(householdId: string): Promise<FamilyMember[]>;
  save(member: FamilyMember): Promise<void>;
}

// ADAPTATEUR (Implementation) - dans infrastructure/
@Injectable()
export class PostgresFamilyMemberRepository implements IFamilyMemberRepository {
  constructor(
    @InjectRepository(FamilyMemberEntity)
    private readonly repo: Repository<FamilyMemberEntity>,
    private readonly mapper: FamilyMemberMapper,
  ) {}

  async findById(id: string): Promise<FamilyMember | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByHousehold(householdId: string): Promise<FamilyMember[]> {
    const entities = await this.repo.find({ where: { householdId } });
    return entities.map(e => this.mapper.toDomain(e));
  }

  async save(member: FamilyMember): Promise<void> {
    const entity = this.mapper.toPersistence(member);
    await this.repo.save(entity);
  }
}

// ENREGISTREMENT dans le module
@Module({
  providers: [
    {
      provide: 'IFamilyMemberRepository',
      useClass: PostgresFamilyMemberRepository,
    },
  ],
  exports: ['IFamilyMemberRepository'],
})
export class FamilyGraphInfraModule {}
```

### 2.3 Application au Domaine family-hub

| Couche       | Contenu pour family-hub                                     |
|-------------|--------------------------------------------------------------|
| **Domaine**  | Entites `Household`, `FamilyMember`, `Ritual` ; Value Objects `VisibilityLevel`, `RelationType` ; Interfaces de repositories |
| **Application** | Use cases : `CreateHousehold`, `AddFamilyMember`, `AssignRitual`, `ProcessAIQuery` ; CQRS Commands/Queries |
| **Ports Entrants** | Resolvers GraphQL, Handlers de commandes BullMQ, Ecouteurs d'evenements |
| **Ports Sortants** | `IHouseholdRepository`, `IAIService`, `INotificationGateway`, `ICalendarService` |
| **Adaptateurs** | `PostgresHouseholdRepository`, `OpenAIService`, `FirebaseNotificationGateway`, `GoogleCalendarAdapter` |

### 2.4 Compromis et Risques

**Avantages :**
- **Testabilite superieure** : les dependances peuvent etre facilement remplacees par des doublures de test (mocks, fakes, stubs)
- **Interchangeabilite** : on peut remplacer une base relationnelle par NoSQL, ou changer de fournisseur IA, sans alterer la logique metier
- **Longevite du code** : le domaine survit aux changements technologiques

**Risques :**
- **Complexite accrue** : les couches d'abstraction supplementaires et les interfaces augmentent la complexite et le temps de developpement
- **Sur-ingenierie** : pour les modules simples (CRUD), l'architecture hexagonale complete est disproportionnee
- **Cout de mapping** : la conversion entre modeles de domaine et de persistance a un cout en performance et en lignes de code

**Recommandation pour family-hub** : Appliquer l'architecture hexagonale complete uniquement aux bounded contexts riches en logique metier (`FamilyGraph`, `Rituals`, `AIAssistant`). Pour les modules plus simples (`Notifications`, `Auth`), une architecture en couches classique suffit.

### 2.5 Sources

- [Hexagonal Architecture with NestJS - Medium (Lucas)](https://medium.com/@phamtuanchip/nestjs-boosting-web-development-speed-with-hexagonal-architecture-5a5a9a04be0d)
- [NestJS Hexagonal Example - GitHub](https://github.com/tim-hub/nestjs-hexagonal-example)
- [NestJS Clean code using Hexagonal Architecture - Rida Kaddir](https://ridakaddir.com/blog/post/nestjs-clean-code-using-hexagonal-architecture)
- [Hexagonal, Onion, and Clean Architecture in NestJS - Medium](https://medium.com/@lamjed.gaidi070/hexagonal-onion-and-clean-architecture-in-nestjs-c58b526d9f3f)
- [Building Flexible Applications with Hexagonal and Event-Driven Architecture in NestJS - DEV](https://dev.to/geampiere/building-flexible-applications-with-hexagonal-and-event-driven-architecture-in-nestjs-578i)
- [Domain-Driven Hexagon Guide - DEV Community](https://dev.to/sairyss/domain-driven-hexagon-18g5)
- [Building Robust Applications with Hexagonal Architecture - Leapcell](https://leapcell.io/blog/building-robust-applications-with-hexagonal-architecture-in-nestjs-and-asp-net-core)
- [Hexagonal Architecture with NestJS and TypeScript - Medium (Slomka)](https://kisztof.medium.com/hexagonal-architecture-with-nest-js-and-typescript-f181cc7b6452)

---

## 3. Multi-Tenancy par Foyer : Isolation des Donnees

### 3.1 Description du Pattern

Dans le contexte de family-hub, chaque **foyer (household)** est un "tenant" logique. La multi-tenancy permet a une seule instance applicative de servir plusieurs foyers avec des donnees isolees, optimisant l'utilisation des ressources et simplifiant la maintenance.

### 3.2 Trois Strategies d'Isolation

#### Strategie A : Base de donnees par foyer
- **Isolation maximale** : chaque foyer a sa propre base
- **Cout eleve** : multiplication des instances PostgreSQL
- **NON RECOMMANDE** pour family-hub (trop de foyers potentiels)

#### Strategie B : Schema par foyer
- Chaque foyer obtient son propre schema PostgreSQL avec des donnees isolees
- Offre un bon equilibre entre isolation et cout
- Migration de schema a appliquer pour chaque nouveau foyer
- **Adapte pour les cas B2B** mais potentiellement lourd pour une app grand public familiale

#### Strategie C : Base partagee avec Row-Level Security (RLS) -- RECOMMANDE
- Tous les foyers partagent les memes tables avec une colonne `household_id`
- PostgreSQL RLS applique automatiquement les filtres de securite au niveau de la base de donnees
- Approche la plus economique et la plus simple a maintenir

### 3.3 Implementation RLS pour family-hub

```sql
-- Activation RLS sur les tables cles
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE rituals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Politique d'isolation par foyer
CREATE POLICY household_isolation ON family_members
  FOR ALL
  USING (household_id = current_setting('app.current_household_id')::uuid);

CREATE POLICY household_isolation ON rituals
  FOR ALL
  USING (household_id = current_setting('app.current_household_id')::uuid);
```

```typescript
// Middleware NestJS pour definir le contexte du foyer
@Injectable()
export class HouseholdContextMiddleware implements NestMiddleware {
  constructor(private readonly dataSource: DataSource) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const householdId = req.user?.currentHouseholdId;
    if (householdId) {
      await this.dataSource.query(
        `SET LOCAL app.current_household_id = '${householdId}'`
      );
    }
    next();
  }
}

// Guard pour valider l'appartenance au foyer
@Injectable()
export class HouseholdMemberGuard implements CanActivate {
  constructor(private readonly memberService: FamilyMemberService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;
    const householdId = request.user.currentHouseholdId;
    return this.memberService.isMemberOf(userId, householdId);
  }
}
```

### 3.4 Particularite family-hub : Multi-Foyers et Cercles

family-hub a une specificite majeure : un utilisateur peut **appartenir a plusieurs foyers** (famille recomposee, colocation, etc.) et les donnees doivent etre visibles selon des **cercles concentriques de visibilite**. Cela va au-dela du multi-tenancy classique.

**Architecture recommandee :**

```
Utilisateur (User)
  |-- appartient a --> Foyer A (Household) [role: parent]
  |-- appartient a --> Foyer B (Household) [role: enfant]
  |
  |-- Cercle 0 : Soi-meme
  |-- Cercle 1 : Noyau (membres du foyer actif)
  |-- Cercle 2 : Famille proche (foyers lies)
  |-- Cercle 3 : Famille elargie
  |-- Cercle 4 : Cercle de confiance (amis proches, nounous)
  |-- Cercle 5 : Communaute
```

**Implementation hybride :**
- **RLS pour l'isolation inter-foyers** : chaque requete est scopee au foyer actif
- **Logique applicative pour les cercles** : les cercles de visibilite sont geres au niveau de la couche application/domaine car ils traversent les frontieres des foyers
- **Contexte de session** : un utilisateur selectionne son "foyer actif" a la connexion, et peut basculer entre ses foyers

```typescript
// Service de resolution de contexte multi-foyers
@Injectable({ scope: Scope.REQUEST })
export class HouseholdContext {
  private _currentHouseholdId: string;
  private _userId: string;
  private _visibilityCircle: VisibilityLevel;

  setContext(userId: string, householdId: string) {
    this._currentHouseholdId = householdId;
    this._userId = userId;
  }

  get currentHouseholdId(): string {
    return this._currentHouseholdId;
  }

  // Determiner les foyers visibles selon le cercle
  async getVisibleHouseholds(circle: VisibilityLevel): Promise<string[]> {
    // Cercle 1 : foyer actif uniquement
    // Cercle 2 : foyers des parents/enfants directs
    // Cercle 3 : foyers de la famille elargie
    // etc.
  }
}
```

### 3.5 Compromis et Risques

**Avantages :**
- RLS offre une isolation au niveau base de donnees, impossible a contourner par le code applicatif
- Un seul schema de migration pour tous les foyers
- Performance excellente (pas de jointure supplementaire pour le filtrage)

**Risques :**
- **Complexite multi-foyers** : le RLS standard suppose un tenant unique par requete ; family-hub necessite parfois de voir les donnees de plusieurs foyers (cercles 2-5), ce qui requiert une approche hybride
- **SET LOCAL et transactions** : le `SET LOCAL` ne fonctionne que dans une transaction ; il faut s'assurer que chaque requete est bien encadree
- **Performances avec REQUEST scope** : l'injection `Scope.REQUEST` en NestJS peut impacter les performances car les providers sont reinstancies a chaque requete
- **Risque de fuite de donnees** : si le middleware de contexte est mal configure, les donnees d'un foyer peuvent etre exposees

### 3.6 Sources

- [Multi-tenant applications with NestJS and Prisma - DEV](https://dev.to/murilogervasio/how-to-make-multi-tenant-applications-with-nestjs-and-a-prisma-proxy-to-automatically-filter-tenant-queries--4kl2)
- [Schema-based multitenancy with NestJS, TypeORM and PostgreSQL](https://thomasvds.com/schema-based-multitenancy-with-nest-js-type-orm-and-postgres-sql/)
- [Build Multi-Tenant SaaS with NestJS: RLS and Prisma](https://js.elitedev.in/js/build-multi-tenant-saas-with-nestjs-complete-guide-to-row-level-security-and-prisma-implementation/)
- [Multi Tenancy with NestJS - Fabian Isele](https://fabian.ski/posts/nestjs-tenants/)
- [NestJS TypeORM and Multi-Tenancy - Medium](https://medium.com/nestjs-ninja/nestjs-typeorm-and-multi-tenancy-a7f6176e8319)
- [RLS package for TypeORM and NestJS - GitHub (Avallone)](https://github.com/Avallone-io/rls)
- [NestJS and TypeORM Schema-Level Multi-Tenancy - DEV](https://dev.to/logeek/nestjs-and-typeorm-efficient-schema-level-multi-tenancy-with-auto-generated-migrations-a-dx-approach-jla)
- [Multi-Tenant Architecture with NestJS and MongoDB - Medium](https://medium.com/@thisha.me/implementing-multi-tenant-architecture-with-nestjs-and-mongodb-d488c8760143)

---

## 4. Frontieres de Modules et Communication Inter-Modules

### 4.1 Description du Pattern

Dans un monolithe modulaire, les **frontieres de modules** sont cruciales pour maintenir le decouplage. La communication entre modules doit passer par des **interfaces publiques bien definies** et non par des acces directs aux implementations internes. Deux mecanismes principaux sont utilises : la **couche anti-corruption (ACL)** et les **evenements de domaine**.

### 4.2 Couche Anti-Corruption (ACL)

L'ACL cree une frontiere entre votre systeme et les systemes externes (ou entre modules), traduisant entre deux modeles de domaine differents et empechant les concepts externes de fuir dans votre code.

**Principe cle** : L'interaction entre modules est isolee dans la couche anti-corruption, placee dans la couche Infrastructure car elle est traitee comme une interaction avec une couche externe.

```typescript
// Interface dans la couche Application du module Rituals
export interface IFamilyMemberLookup {
  getMemberName(memberId: string): Promise<string>;
  getMembersByHousehold(householdId: string): Promise<SimpleMemberDto[]>;
}

// Implementation ACL dans la couche Infrastructure du module Rituals
@Injectable()
export class FamilyMemberACL implements IFamilyMemberLookup {
  constructor(
    @Inject('FamilyGraphPublicAPI')
    private readonly familyGraphAPI: FamilyGraphPublicAPI,
  ) {}

  async getMemberName(memberId: string): Promise<string> {
    // Traduction du modele FamilyGraph vers le modele Rituals
    const member = await this.familyGraphAPI.findMember(memberId);
    return member ? `${member.firstName} ${member.lastName}` : 'Inconnu';
  }

  async getMembersByHousehold(householdId: string): Promise<SimpleMemberDto[]> {
    const members = await this.familyGraphAPI.listMembers(householdId);
    return members.map(m => ({
      id: m.id,
      displayName: `${m.firstName} ${m.lastName}`,
      role: m.householdRole,
    }));
  }
}
```

### 4.3 Evenements de Domaine avec EventEmitter2

Le module `@nestjs/event-emitter` (base sur `eventemitter2`) permet une communication **asynchrone et decouplé** entre modules. Les composants emettent des evenements quand quelque chose d'important se produit, et d'autres composants ecoutent et reagissent a ces evenements.

```typescript
// Evenement de domaine emis par FamilyGraphModule
export class MemberJoinedHouseholdEvent {
  constructor(
    public readonly memberId: string,
    public readonly householdId: string,
    public readonly role: string,
    public readonly occurredAt: Date = new Date(),
  ) {}
}

// Emission dans le service du module FamilyGraph
@Injectable()
export class FamilyGraphService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async addMemberToHousehold(command: AddMemberCommand): Promise<void> {
    // ... logique metier ...
    this.eventEmitter.emit(
      'family-graph.member.joined',
      new MemberJoinedHouseholdEvent(command.memberId, command.householdId, command.role),
    );
  }
}

// Ecouteur dans le module Rituals (reaction a l'evenement)
@Injectable()
export class RitualsEventListener {
  constructor(private readonly ritualsService: RitualsService) {}

  @OnEvent('family-graph.member.joined')
  async handleMemberJoined(event: MemberJoinedHouseholdEvent): Promise<void> {
    // Assigner les rituels par defaut au nouveau membre
    await this.ritualsService.assignDefaultRituals(
      event.memberId,
      event.householdId,
    );
  }
}

// Ecouteur dans le module Notifications
@Injectable()
export class NotificationEventListener {
  @OnEvent('family-graph.member.joined')
  async handleMemberJoined(event: MemberJoinedHouseholdEvent): Promise<void> {
    // Notifier les autres membres du foyer
    await this.notifyHouseholdMembers(event.householdId, event.memberId);
  }
}
```

### 4.4 Orchestration avec BullMQ et Pattern Saga

Pour les workflows complexes impliquant plusieurs modules (ex: "creation d'un foyer" qui necessite la creation du foyer, l'ajout du createur comme admin, l'initialisation des rituels par defaut, et l'envoi de notifications), le **pattern Saga** avec BullMQ est recommande.

```typescript
// Saga orchestratrice pour la creation d'un foyer
@Processor('household-creation-saga')
export class HouseholdCreationSaga extends WorkerHost {
  async process(job: Job<CreateHouseholdSagaData>): Promise<void> {
    const { userId, householdName } = job.data;

    try {
      // Etape 1 : Creer le foyer
      const household = await this.familyGraphService.createHousehold(householdName);

      // Etape 2 : Ajouter le createur comme admin
      await this.familyGraphService.addMember(household.id, userId, 'admin');

      // Etape 3 : Initialiser les rituels par defaut
      await this.ritualsService.initializeDefaults(household.id);

      // Etape 4 : Envoyer notification de bienvenue
      await this.notificationService.sendWelcome(userId, household.id);
    } catch (error) {
      // Compensation : annuler les etapes precedentes
      await this.compensate(job.data, error);
    }
  }
}
```

### 4.5 Application au Domaine family-hub

**Carte des evenements inter-modules :**

| Evenement                        | Emetteur         | Ecouteurs                            |
|----------------------------------|-----------------|--------------------------------------|
| `member.joined`                  | FamilyGraph     | Rituals, Notifications, AIAssistant  |
| `member.left`                    | FamilyGraph     | Rituals, Notifications               |
| `ritual.completed`              | Rituals         | Notifications, AIAssistant (gamification) |
| `ritual.missed`                 | Rituals         | Notifications, AIAssistant           |
| `ai.suggestion.generated`       | AIAssistant     | Notifications, Rituals               |
| `household.created`             | FamilyGraph     | Rituals (init defaults), Notifications |
| `visibility.circle.changed`    | Circles         | FamilyGraph, Notifications           |

### 4.6 Compromis et Risques

**Avantages :**
- **Decouplage fort** : les services ne sont pas directement lies ; on peut ajouter de nouveaux consommateurs sans modifier les producteurs
- **Scalabilite** : l'ajout de reactions a un evenement ne touche pas le module emetteur
- **Auditabilite** : les evenements forment un journal naturel des actions

**Risques :**
- **Coherence eventuelle** : les evenements asynchrones impliquent que le systeme peut etre temporairement dans un etat inconsistant
- **Debugging complexe** : les flux evenementiels sont plus difficiles a tracer que les appels directs
- **Ordre des evenements** : sans garantie d'ordre, des conditions de course peuvent survenir
- **EventEmitter2 en memoire** : en cas de crash du processus, les evenements non traites sont perdus ; pour les evenements critiques, preferer BullMQ (persiste dans Redis)

### 4.7 Sources

- [Module boundary and isolation of side effects using NestJS - DEV](https://dev.to/kzmat/module-boundary-and-isolation-of-side-effects-using-nestjs-5hm4)
- [NestJS Layered Architecture with Anticorruption pattern - GitHub](https://github.com/benedya/nestjs-layered-architecture)
- [How to Build the Anti-Corruption Layer Pattern - OneUptime](https://oneuptime.com/blog/post/2026-01-30-anti-corruption-layer-pattern/view)
- [Event-Driven Architecture with NestJS: EventEmitter Module - DEV](https://dev.to/ezilemdodana/event-driven-architecture-with-nestjs-using-the-eventemitter-module-35fe)
- [How to Handle Events in NestJS with the Event Emitter - ByteScrum](https://blog.bytescrum.com/how-to-handle-events-in-nestjs-with-the-event-emitter)
- [NestJS Event Emitter - GitHub officiel](https://github.com/nestjs/event-emitter)
- [Implement Saga Patterns with NestJS and Kafka - The New Stack](https://thenewstack.io/implement-saga-patterns-in-microservices-with-nestjs-and-kafka/)
- [BullMQ NestJS Documentation](https://docs.bullmq.io/guide/nestjs)
- [NestJS Monorepo with anti-corruption layer - GitHub](https://github.com/mikemajesty/nestjs-monorepo)
- [Building Flexible Applications with Hexagonal and Event-Driven Architecture - DEV](https://dev.to/geampiere/building-flexible-applications-with-hexagonal-and-event-driven-architecture-in-nestjs-578i)

---

## 5. Modelisation du Graphe Familial en PostgreSQL

### 5.1 Description du Probleme

Le graphe familial de family-hub est un **graphe oriente et type** ou :
- Les **noeuds** sont des membres de la famille (`FamilyMember`)
- Les **aretes** sont des relations typees (parent-enfant, conjoint, fratrie, etc.)
- Les membres appartiennent a un ou plusieurs **foyers** (`Household`)
- La visibilite est regie par 5 **cercles concentriques**

C'est un probleme plus complexe qu'un simple arbre hierarchique car :
- Un membre peut avoir deux parents (graphe, pas arbre)
- Les familles recomposees creent des relations non-biologiques
- Un membre peut etre dans plusieurs foyers simultanement

### 5.2 Comparaison des Approches PostgreSQL

#### Approche 1 : Liste d'Adjacence (Adjacency List)

```sql
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  birth_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE family_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_member_id UUID REFERENCES family_members(id),
  to_member_id UUID REFERENCES family_members(id),
  relationship_type VARCHAR(50) NOT NULL, -- 'parent', 'spouse', 'sibling', 'step_parent', 'guardian'
  is_biological BOOLEAN DEFAULT true,
  start_date DATE,
  end_date DATE, -- pour les divorces, etc.
  UNIQUE(from_member_id, to_member_id, relationship_type)
);

CREATE INDEX idx_relationships_from ON family_relationships(from_member_id);
CREATE INDEX idx_relationships_to ON family_relationships(to_member_id);
CREATE INDEX idx_relationships_type ON family_relationships(relationship_type);
```

**Requete : trouver tous les descendants** (avec CTE recursive) :
```sql
WITH RECURSIVE descendants AS (
  SELECT to_member_id AS member_id, 1 AS depth
  FROM family_relationships
  WHERE from_member_id = :member_id AND relationship_type = 'parent'

  UNION ALL

  SELECT fr.to_member_id, d.depth + 1
  FROM family_relationships fr
  JOIN descendants d ON fr.from_member_id = d.member_id
  WHERE fr.relationship_type = 'parent'
)
SELECT fm.*, d.depth
FROM descendants d
JOIN family_members fm ON fm.id = d.member_id;
```

**Caracteristiques :**
- Requetes de lecture necessitant des CTE recursives (couteuses pour les arbres profonds)
- Ecriture simple : une seule ligne a modifier pour deplacer un noeud
- Ideal pour les graphes avec des modifications frequentes

#### Approche 2 : Table de Fermeture (Closure Table)

```sql
CREATE TABLE family_closure (
  ancestor_id UUID REFERENCES family_members(id),
  descendant_id UUID REFERENCES family_members(id),
  depth INTEGER NOT NULL,
  relationship_path TEXT, -- chemin encode ex: 'parent.parent'
  PRIMARY KEY (ancestor_id, descendant_id)
);

CREATE INDEX idx_closure_ancestor ON family_closure(ancestor_id);
CREATE INDEX idx_closure_descendant ON family_closure(descendant_id);
CREATE INDEX idx_closure_depth ON family_closure(depth);
```

**Requete : trouver tous les descendants** (sans recursion) :
```sql
SELECT fm.*, fc.depth
FROM family_closure fc
JOIN family_members fm ON fm.id = fc.descendant_id
WHERE fc.ancestor_id = :member_id
ORDER BY fc.depth;
```

**Caracteristiques :**
- Lectures tres rapides en temps quasi-constant (jointures simples)
- Ecritures complexes : ajouter un noeud requiert l'insertion de multiples lignes
- Deplacer un noeud necessite la mise a jour de nombreuses lignes
- Redondance de donnees importante

#### Approche 3 : LTREE (Extension PostgreSQL)

```sql
CREATE EXTENSION IF NOT EXISTS ltree;

CREATE TABLE family_members_ltree (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  family_path ltree -- ex: 'famille.grandpere.pere.moi'
);

CREATE INDEX idx_family_path_gist ON family_members_ltree USING GIST (family_path);
```

**Caracteristiques :**
- Excellent pour les arbres stricts, mais **inadapte pour les graphes** (un noeud ne peut avoir qu'un seul chemin)
- Ne supporte pas nativement les deux parents ou les familles recomposees
- **NON RECOMMANDE** pour le graphe familial de family-hub

#### Approche 4 : Hybride Adjacence + Table d'Aretes Typees -- RECOMMANDE

```sql
-- Table des membres (noeuds du graphe)
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  display_name VARCHAR(200),
  birth_date DATE,
  avatar_url TEXT,
  user_id UUID REFERENCES users(id), -- lien vers le compte utilisateur (nullable si non-inscrit)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des foyers (contextes de vie)
CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appartenance aux foyers (N:N)
CREATE TABLE household_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member', -- 'admin', 'parent', 'child', 'guest'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(household_id, member_id)
);

-- Relations familiales (aretes du graphe)
CREATE TABLE family_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  to_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) NOT NULL,
  -- Types : 'parent_of', 'spouse_of', 'sibling_of', 'step_parent_of', 'guardian_of'
  is_biological BOOLEAN DEFAULT true,
  start_date DATE,
  end_date DATE,
  metadata JSONB DEFAULT '{}', -- donnees supplementaires
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_member_id, to_member_id, relationship_type)
);

-- Cercles de visibilite
CREATE TABLE visibility_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  target_member_id UUID REFERENCES family_members(id) ON DELETE CASCADE,
  circle_level INTEGER NOT NULL CHECK (circle_level BETWEEN 1 AND 5),
  -- 1: noyau, 2: famille proche, 3: famille elargie, 4: cercle de confiance, 5: communaute
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_member_id, target_member_id)
);

-- Index pour les performances de parcours du graphe
CREATE INDEX idx_rel_from ON family_relationships(from_member_id);
CREATE INDEX idx_rel_to ON family_relationships(to_member_id);
CREATE INDEX idx_rel_type ON family_relationships(relationship_type);
CREATE INDEX idx_hm_household ON household_memberships(household_id);
CREATE INDEX idx_hm_member ON household_memberships(member_id);
CREATE INDEX idx_vis_owner ON visibility_assignments(owner_member_id);
CREATE INDEX idx_vis_target ON visibility_assignments(target_member_id);
CREATE INDEX idx_vis_circle ON visibility_assignments(circle_level);
```

### 5.3 Requetes Cles pour family-hub

```sql
-- 1. Obtenir le graphe familial visible pour un membre selon son cercle
SELECT fm.*, va.circle_level
FROM family_members fm
JOIN visibility_assignments va ON va.target_member_id = fm.id
WHERE va.owner_member_id = :current_member_id
  AND va.circle_level <= :requested_circle_level;

-- 2. Obtenir tous les membres d'un foyer avec leurs relations
SELECT fm.*, hm.role,
  COALESCE(
    json_agg(
      json_build_object(
        'related_to', fr.to_member_id,
        'type', fr.relationship_type
      )
    ) FILTER (WHERE fr.id IS NOT NULL),
    '[]'
  ) as relationships
FROM household_memberships hm
JOIN family_members fm ON fm.id = hm.member_id
LEFT JOIN family_relationships fr ON fr.from_member_id = fm.id
WHERE hm.household_id = :household_id AND hm.is_active = true
GROUP BY fm.id, hm.role;

-- 3. Trouver tous les ancetres d'un membre (CTE recursive)
WITH RECURSIVE ancestors AS (
  SELECT from_member_id AS ancestor_id, 1 AS generation
  FROM family_relationships
  WHERE to_member_id = :member_id
    AND relationship_type = 'parent_of'

  UNION ALL

  SELECT fr.from_member_id, a.generation + 1
  FROM family_relationships fr
  JOIN ancestors a ON fr.to_member_id = a.ancestor_id
  WHERE fr.relationship_type = 'parent_of'
    AND a.generation < 10 -- limite de profondeur
)
SELECT fm.*, a.generation
FROM ancestors a
JOIN family_members fm ON fm.id = a.ancestor_id
ORDER BY a.generation;
```

### 5.4 Integration GraphQL

```typescript
// Resolver GraphQL pour le graphe familial
@Resolver(() => FamilyMemberType)
export class FamilyGraphResolver {
  @Query(() => [FamilyMemberType])
  async familyGraph(
    @CurrentUser() user: AuthUser,
    @Args('circleLevel', { type: () => Int, defaultValue: 3 }) circleLevel: number,
  ): Promise<FamilyMemberType[]> {
    return this.familyGraphService.getVisibleMembers(
      user.currentMemberId,
      circleLevel,
    );
  }

  @ResolveField(() => [RelationshipType])
  async relationships(
    @Parent() member: FamilyMemberType,
    @CurrentUser() user: AuthUser,
  ): Promise<RelationshipType[]> {
    // Seules les relations vers des membres visibles sont retournees
    return this.familyGraphService.getVisibleRelationships(
      member.id,
      user.currentMemberId,
    );
  }
}
```

### 5.5 Compromis et Risques

**Avantages de l'approche hybride :**
- Flexibilite maximale pour les graphes familiaux complexes (recompositions, garde alternee)
- Les CTE recursives sont suffisantes pour des graphes familiaux (generalement < 100 noeuds)
- Les cercles de visibilite sont un simple filtre par jointure
- PostgreSQL 18 offre de meilleures performances CTE que les versions anterieures

**Risques :**
- **Cycles dans le graphe** : il faut implementer la detection de cycles (support natif PostgreSQL 14+)
- **Performances des CTE** : pour des familles tres etendues (> 500 membres), envisager une table de fermeture materialise ou un cache Redis
- **Coherence bidirectionnelle** : si A est parent de B, il faut aussi que B soit enfant de A ; cela peut etre gere par des triggers ou la couche applicative
- **Donnees non-inscrites** : des membres de la famille peuvent ne pas avoir de compte utilisateur (ex: grands-parents, jeunes enfants) ; le modele doit les supporter

### 5.6 Sources

- [Modeling Hierarchical Tree Data in PostgreSQL - Leonard Q Marcq](https://leonardqmarcq.com/posts/modeling-hierarchical-tree-data)
- [PostgreSQL Family Tree Application Practices - Alibaba Cloud](https://www.alibabacloud.com/blog/postgresql-family-tree-application-practices---graph-relation-storage-and-search_595037)
- [Family Genealogy Database - GitHub (sedelmeyer)](https://github.com/sedelmeyer/family-genealogy-database)
- [Implementing Hierarchical Data Structures: LTREE vs Adjacency vs Closure - DEV](https://dev.to/dowerdev/implementing-hierarchical-data-structures-in-postgresql-ltree-vs-adjacency-list-vs-closure-table-2jpb)
- [Closure Table Pattern for Hierarchical Filters - Medium](https://balevdev.medium.com/the-closure-table-pattern-for-hierarchical-filters-with-sql-31644e760c09)
- [Hierarchical models in PostgreSQL - Ackee](https://www.ackee.agency/blog/hierarchical-models-in-postgresql)
- [Optimal SQL Methods for Tree Hierarchies](https://sqlpey.com/algorithm/optimal-sql-methods-for-tree-hierarchies/)
- [Model Org Charts: Adjacency vs Closure - AppMaster](https://appmaster.io/blog/model-org-charts-postgresql-adjacency-vs-closure)
- [Family Tree Database Design - GitHub Gist](https://gist.github.com/1930029)

---

## 6. Feature Flags et Activation de Modules par Foyer

### 6.1 Description du Pattern

Les **feature flags** (ou feature toggles) sont des mecanismes permettant de conditionner l'affichage ou l'activation de fonctionnalites dans une application. Dans le contexte de family-hub, ce pattern permet d'activer ou desactiver des modules entiers (ex: module IA, rituels avances) par foyer, offrant :

- Une strategie de **deploiement progressif** (canary releases)
- Une **monetisation modulaire** (fonctionnalites premium par abonnement)
- Des **experimentations A/B** pour valider de nouvelles fonctionnalites
- L'adaptation de l'experience aux besoins specifiques de chaque foyer

### 6.2 Implementation par Guard Global dans NestJS

```typescript
// Entity Feature Flag
@Entity()
export class FeatureFlag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  featureKey: string; // 'ai_assistant', 'advanced_rituals', 'calendar_sync'

  @Column({ type: 'uuid', nullable: true })
  householdId: string | null; // null = flag global

  @Column({ default: false })
  isEnabled: boolean;

  @Column({ type: 'jsonb', default: '{}' })
  config: Record<string, any>; // configuration additionnelle

  @Column({ type: 'timestamptz', nullable: true })
  enabledUntil: Date | null; // pour les essais gratuits temporaires
}

// Decorator personnalise
export const RequireFeature = (featureKey: string) =>
  SetMetadata('required-feature', featureKey);

// Guard global de feature flags
@Injectable()
export class FeatureFlagGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly featureFlagService: FeatureFlagService,
    private readonly householdContext: HouseholdContext,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.get<string>(
      'required-feature',
      context.getHandler(),
    );

    if (!requiredFeature) return true; // Pas de feature flag requis

    const householdId = this.householdContext.currentHouseholdId;
    return this.featureFlagService.isEnabled(requiredFeature, householdId);
  }
}

// Utilisation dans un resolver
@Resolver()
export class AIAssistantResolver {
  @RequireFeature('ai_assistant')
  @Query(() => AIResponse)
  async askAI(@Args('question') question: string): Promise<AIResponse> {
    return this.aiService.processQuestion(question);
  }
}
```

### 6.3 Stockage des Feature Flags par Foyer

```typescript
// Service de gestion des feature flags
@Injectable()
export class FeatureFlagService {
  constructor(
    @InjectRepository(FeatureFlag)
    private readonly flagRepo: Repository<FeatureFlag>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async isEnabled(featureKey: string, householdId?: string): Promise<boolean> {
    // 1. Verifier le cache Redis en priorite
    const cacheKey = `ff:${featureKey}:${householdId || 'global'}`;
    const cached = await this.cacheManager.get<boolean>(cacheKey);
    if (cached !== undefined) return cached;

    // 2. Verifier le flag specifique au foyer
    if (householdId) {
      const householdFlag = await this.flagRepo.findOne({
        where: { featureKey, householdId },
      });
      if (householdFlag) {
        const isActive = householdFlag.isEnabled &&
          (!householdFlag.enabledUntil || householdFlag.enabledUntil > new Date());
        await this.cacheManager.set(cacheKey, isActive, 300); // cache 5 min
        return isActive;
      }
    }

    // 3. Fallback sur le flag global
    const globalFlag = await this.flagRepo.findOne({
      where: { featureKey, householdId: null },
    });
    const isActive = globalFlag?.isEnabled ?? false;
    await this.cacheManager.set(cacheKey, isActive, 300);
    return isActive;
  }

  async setFeatureForHousehold(
    featureKey: string,
    householdId: string,
    enabled: boolean,
    config?: Record<string, any>,
  ): Promise<void> {
    await this.flagRepo.upsert(
      { featureKey, householdId, isEnabled: enabled, config: config || {} },
      ['featureKey', 'householdId'],
    );
    // Invalider le cache
    await this.cacheManager.del(`ff:${featureKey}:${householdId}`);
  }
}
```

### 6.4 Application au Domaine family-hub

| Feature Flag              | Description                                     | Usage                         |
|--------------------------|------------------------------------------------|-------------------------------|
| `ai_assistant`           | Interface conversationnelle IA                  | Module premium / progressif   |
| `advanced_rituals`       | Rituels avec recurrence avancee et gamification | Feature avancee               |
| `calendar_sync`          | Synchronisation calendrier externe              | Integration tierce            |
| `multi_household`        | Support multi-foyers pour un utilisateur         | Feature avancee               |
| `extended_family_graph`  | Graphe familial au-dela du cercle 2             | Premium                       |
| `ai_meal_planning`       | Planification de repas par IA                    | Module specifique             |
| `shared_expenses`        | Gestion des depenses partagees                   | Module additionnel            |

### 6.5 Solutions Tierces vs. Custom

| Approche           | Avantages                                  | Inconvenients                     |
|-------------------|-------------------------------------------|-----------------------------------|
| **Custom** (recommande pour family-hub) | Controle total, pas de dependance externe, integration native PostgreSQL/Redis | Maintenance a assurer, pas de dashboard SaaS |
| **Unleash** (open-source) | Dashboard web, strategies avancees, SDK NestJS | Serveur supplementaire a heberger |
| **LaunchDarkly** | Fonctionnalites enterprise, A/B testing avance | Cout SaaS, dependance externe |
| **GO Feature Flag** | Leger, fichier de config, SDK OpenFeature | Moins de fonctionnalites |
| **ConfigCat** | Simple, integrations NestJS documentees | Cout SaaS |

### 6.6 Compromis et Risques

**Avantages :**
- **Deploiement progressif** : tester les nouvelles fonctionnalites sur un sous-ensemble de foyers avant le deploiement general
- **Monetisation flexible** : activer/desactiver des modules par plan d'abonnement
- **Rollback instantane** : desactiver une feature problematique sans redeploiement

**Risques :**
- **Dette technique** : les feature flags accumulent de la complexite conditionnelle ; un processus de nettoyage regulier est necessaire
- **Combinaisons explosives** : N feature flags = 2^N configurations possibles ; difficile de tester toutes les combinaisons
- **Performance** : chaque requete necessite une verification du flag ; le cache Redis est indispensable
- **Coherence UI** : le frontend doit aussi connaitre l'etat des flags pour adapter l'interface ; prevoir un endpoint GraphQL de recuperation des flags actifs

### 6.7 Sources

- [Feature Flags implementation in NestJS - Theodo](https://blog.theodo.com/2023/10/feature-flags-nestjs/)
- [How to Integrate Feature Flags in NestJS - ConfigCat](https://configcat.com/blog/how-to-integrate-feature-flags-in-nestjs/)
- [API with NestJS: Introduction to Feature Flags - Wanago](https://wanago.io/2022/08/22/api-nestjs-feature-flags-feature-toggles/)
- [NestJS Feature Flags - GitHub (rizerkrof)](https://github.com/rizerkrof/NestJs-featureFlags)
- [NestJS OpenFeature with GO Feature Flag](https://gofeatureflag.org/docs/sdk/server_providers/openfeature_nestjs)
- [Top 5 Feature Flag Services for NestJS - Tggl](https://tggl.io/blog/top-feature-flags-services-for-nestjs)
- [NestJS Unleash Feature Toggle - GitHub](https://github.com/pmb0/nestjs-unleash)
- [Feature Flags for NestJS - Tggl](https://tggl.io/technologies/feature-flags-for-nestjs)

---

## 7. Patterns Transversaux Complementaires

### 7.1 CQRS (Command Query Responsibility Segregation)

Le CQRS separe les operations d'ecriture (Commands) et de lecture (Queries) en modeles distincts. Avec le package `@nestjs/cqrs`, les commandes et requetes peuvent etre dispatchees a travers les modules.

**Application family-hub :**
- **Commands** : `CreateRitual`, `AssignTask`, `InviteMember`, `ProcessAIQuery`
- **Queries** : `GetFamilyTree`, `GetTodayRituals`, `GetHouseholdDashboard`
- Le modele de lecture peut etre optimise avec des vues materialisees PostgreSQL ou un cache Redis pour le dashboard familial

**Source** : [Exploring CQRS in NestJS - Moldstud](https://moldstud.com/articles/p-exploring-cqrs-in-nestjs-advanced-design-patterns-for-senior-developers)

### 7.2 Autorisation GraphQL par Cercle de Visibilite

L'autorisation au niveau champ (field-level) est cruciale pour family-hub ou differentes informations sont visibles selon le cercle de l'utilisateur.

```typescript
// Middleware de champ pour la visibilite
const visibilityMiddleware: FieldMiddleware = async (ctx, next) => {
  const { source, context } = ctx;
  const currentUser = context.req.user;
  const targetMemberId = source.id;

  // Verifier le cercle de visibilite
  const circleLevel = await ctx.context.circleService.getCircleLevel(
    currentUser.memberId,
    targetMemberId,
  );

  const requiredCircle = ctx.info.extensions?.requiredCircle || 1;
  if (circleLevel > requiredCircle) {
    return null; // Masquer le champ
  }

  return next();
};

// Type GraphQL avec visibilite par champ
@ObjectType()
export class FamilyMemberType {
  @Field()
  id: string;

  @Field()
  displayName: string; // Visible par tous les cercles

  @Field({ nullable: true, middleware: [visibilityMiddleware] })
  @Extensions({ requiredCircle: 1 }) // Noyau seulement
  phoneNumber: string;

  @Field({ nullable: true, middleware: [visibilityMiddleware] })
  @Extensions({ requiredCircle: 2 }) // Famille proche
  birthDate: Date;

  @Field({ nullable: true, middleware: [visibilityMiddleware] })
  @Extensions({ requiredCircle: 1 }) // Noyau seulement
  medicalNotes: string;
}
```

**Sources :**
- [GraphQL Authorization - graphql.org](https://graphql.org/learn/authorization/)
- [Field permissions with FieldMiddleware - DEV](https://dev.to/choco14t/implement-field-permissions-with-fieldmiddleware-4kad)
- [NestJS GraphQL Directives - Docs officiels](https://docs.nestjs.com/graphql/directives)

### 7.3 Structure Turborepo pour family-hub

```
family-hub/
  apps/
    api/                  # NestJS backend (GraphQL)
    web/                  # Next.js web app
    mobile/               # Expo React Native
  packages/
    domain/               # Modeles de domaine partages (Value Objects, types)
    graphql-schema/       # Schema GraphQL et types generes
    ui/                   # Composants UI partages (React)
    config-eslint/        # Configuration ESLint
    config-typescript/    # Configuration TypeScript
    utils/                # Utilitaires partages
  turbo.json
  package.json
```

Le package `domain` est critique : il contient les **Value Objects**, les **types de domaine** et les **enums** partages entre le backend, le web et le mobile. Cela garantit la coherence du langage du domaine (Ubiquitous Language du DDD) a travers toutes les applications.

**Sources :**
- [2025 NestJS + React 19 + Drizzle ORM + Turborepo ADR - DEV](https://dev.to/xiunotes/2025-nestjs-react-19-drizzle-orm-turborepo-architecture-decision-record-3o1k)
- [Turborepo Monorepo 2025: Next.js + React Native - Medium](https://medium.com/@beenakumawat002/turborepo-monorepo-in-2025-next-js-react-native-shared-ui-type-safe-api-%EF%B8%8F-6194c83adff9)
- [NestJS Turbo Monorepo - GitHub (vndevteam)](https://github.com/vndevteam/nestjs-turbo)

---

## 8. Synthese et Recommandations pour family-hub

### 8.1 Architecture Cible Recommandee

```
                    +----------------------------------+
                    |        Turborepo Monorepo        |
                    +----------------------------------+
                    |  packages/domain (shared types)  |
                    +----------------------------------+
                             |          |         |
                    +--------+    +-----+    +----+
                    |             |           |
              +-----v----+  +----v----+  +---v--------+
              | Next.js  |  | Expo RN |  | NestJS API |
              |   Web    |  | Mobile  |  | (GraphQL)  |
              +----------+  +---------+  +-----+------+
                                               |
                    +---------------------------+---------------------------+
                    |                           |                           |
              +-----v--------+          +------v-------+          +--------v-------+
              | FamilyGraph  |          |   Rituals    |          |  AIAssistant   |
              |   Module     |<-------->|   Module     |<-------->|    Module      |
              | (Hexa+DDD)   |  events  | (Hexa+DDD)  |  events  |  (Hexa+DDD)   |
              +--------------+          +--------------+          +----------------+
                    |                         |                          |
              +-----v--------+          +-----v--------+         +------v--------+
              |   Circles    |          | Notifications|         | FeatureFlags  |
              |   Module     |          |    Module    |         |    Module     |
              | (Couche std) |          | (Couche std) |         | (Couche std)  |
              +--------------+          +--------------+         +---------------+
                    |                         |                        |
              +-----v---------------------------------------------------------v----+
              |                     PostgreSQL 18 + RLS                             |
              |              (Row-Level Security par household_id)                  |
              +----------------------------+---------------------------------------+
                                           |
                                    +------v------+
                                    | Redis/BullMQ|
                                    | (Cache, Jobs|
                                    |  Events)    |
                                    +-------------+
```

### 8.2 Tableau Recapitulatif des Decisions

| Aspect                         | Decision                                  | Justification                                     |
|-------------------------------|-------------------------------------------|----------------------------------------------------|
| Architecture generale          | Monolithe modulaire DDD                   | Simplicite de deploiement, frontieres claires       |
| Pattern d'architecture         | Hexagonal pour modules complexes          | Testabilite, decouplage technologique               |
| Isolation des donnees          | RLS PostgreSQL par `household_id`         | Securite au niveau base, performance, simplicite    |
| Multi-foyers                  | Contexte de session + logique applicative  | RLS pour le foyer actif, logique pour les cercles   |
| Communication inter-modules   | EventEmitter2 + BullMQ (sagas critiques)  | Decouplage, fiabilite pour les workflows critiques  |
| Anti-corruption               | ACL dans couche Infrastructure            | Isolation des modeles de domaine entre modules      |
| Graphe familial               | Adjacence + table d'aretes typees         | Flexibilite graphe, CTE recursives suffisantes      |
| Cercles de visibilite         | Table `visibility_assignments` + Field middleware GraphQL | Controle fin par champ et par cercle |
| Feature flags                 | Custom avec cache Redis                   | Controle total, pas de dependance SaaS              |
| CQRS                          | @nestjs/cqrs pour modules complexes       | Separation lecture/ecriture, optimisation queries    |
| Packages partages             | `packages/domain` dans Turborepo          | Ubiquitous Language coherent cross-platform          |

### 8.3 Risques Principaux et Mitigations

| Risque                                     | Impact | Mitigation                                              |
|-------------------------------------------|--------|--------------------------------------------------------|
| Surconception DDD des modules simples      | Moyen  | Appliquer Hexa/DDD uniquement aux 3 modules complexes  |
| Fuite de donnees entre foyers             | Critique| RLS + tests d'integration d'isolation + audit           |
| Performance CTE recursive sur grands graphes| Faible | Cache Redis + limite de profondeur + vues materialisees |
| Accumulation de feature flags             | Moyen  | Processus de nettoyage trimestriel                     |
| Complexite des cercles de visibilite       | Eleve  | Encapsulation dans un service dedie + tests exhaustifs  |
| Coherence eventuelle inter-modules        | Moyen  | BullMQ pour les evenements critiques + idempotence      |
| Courbe d'apprentissage equipe             | Eleve  | Documentation interne + ADRs + sessions de formation    |

### 8.4 Prochaines Etapes Recommandees

1. **Definir le Ubiquitous Language** : glossaire partage entre domaine metier et code (Household, FamilyMember, Ritual, Circle, etc.)
2. **Creer le package `domain`** dans Turborepo avec les Value Objects et types partages
3. **Implementer le `FamilyGraphModule`** en architecture hexagonale comme module pilote
4. **Configurer RLS PostgreSQL** avec des tests d'isolation automatises
5. **Mettre en place `@nestjs/event-emitter`** pour la communication inter-modules
6. **Implementer le systeme de feature flags** custom avec cache Redis
7. **Definir les cercles de visibilite** comme Value Objects avec logique de resolution

---

*Rapport genere le 2026-02-06 pour le projet family-hub.*
*Sources web consultees entre janvier et fevrier 2026.*
