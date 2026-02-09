# Recherche : Technologies de Base de Donnees et Stockage pour Family Home

**Date** : 2026-02-06
**Contexte** : Application de gestion familiale avec graphe familial (foyers interconnectes), 5 cercles de visibilite, multi-foyers, permissions par role, rituels/taches recurrentes, statut temps reel, architecture modulaire. Backend NestJS.

---

## Table des matieres

1. [PostgreSQL et Requetes de Graphe (CTE Recursives)](#1-postgresql-et-requetes-de-graphe-cte-recursives)
2. [Neo4j vs PostgreSQL pour le Graphe Familial](#2-neo4j-vs-postgresql-pour-le-graphe-familial)
3. [ORM pour NestJS : Prisma vs TypeORM vs Drizzle](#3-orm-pour-nestjs--prisma-vs-typeorm-vs-drizzle)
4. [Redis pour le Temps Reel et le Cache](#4-redis-pour-le-temps-reel-et-le-cache)
5. [PostgreSQL Row Level Security (RLS) pour le Multi-Foyer](#5-postgresql-row-level-security-rls-pour-le-multi-foyer)
6. [Supabase vs PostgreSQL Auto-Heberge](#6-supabase-vs-postgresql-auto-heberge)
7. [Synthese et Recommandations Architecturales](#7-synthese-et-recommandations-architecturales)

---

## 1. PostgreSQL et Requetes de Graphe (CTE Recursives)

### Version et maturite

- **PostgreSQL 18** (publie en 2025) est la version stable actuelle. Les mises a jour 18.1, 17.7, 16.11 ont ete publiees le 13 novembre 2025.
- Les CTE recursives sont disponibles depuis PostgreSQL 8.4 (2009) et sont extremement matures et eprouvees en production.
- PostgreSQL 14+ a ajoute les mots-cles `SEARCH` (profondeur/largeur) et `CYCLE` (detection de cycles) pour les CTE recursives.
- PostgreSQL 18 introduit le support experimental de **SQL/PGQ** (Property Graph Queries), standard SQL:2023 qui permet de definir des vertex et edges directement en SQL.

### Adequation pour le modele de graphe familial

Les CTE recursives de PostgreSQL sont **parfaitement adaptees** au modele de graphe familial de l'application :

- **Parcours d'arbres genealogiques** : Navigation ascendante (ancetres) et descendante (descendants) via `WITH RECURSIVE`.
- **Multi-foyers** : Modelisation des relations foyer-membre comme un graphe biparti, traversable en CTE.
- **Cercles de visibilite** : Calcul des cercles concentriques (Personnel, Couple, Foyer, Famille Elargie, Connaissances) par expansion recursive depuis un noeud utilisateur.
- **Detection de cycles** : Le mot-cle `CYCLE` (PG14+) protege contre les boucles infinies dans les relations familiales complexes (recompositions).

**Exemple de structure** :
```sql
WITH RECURSIVE family_graph AS (
    -- Noeud de depart : l'utilisateur courant
    SELECT id, household_id, visibility_circle, 0 AS depth
    FROM family_members WHERE id = :current_user_id

    UNION ALL

    -- Extension recursive via les relations
    SELECT fm.id, fm.household_id, r.circle_type, fg.depth + 1
    FROM family_graph fg
    JOIN relationships r ON r.from_member_id = fg.id
    JOIN family_members fm ON fm.id = r.to_member_id
    WHERE fg.depth < 5  -- Limite de profondeur par cercle
)
SELECT * FROM family_graph;
```

### Performance a l'echelle attendue

Pour une application familiale (echelle moderee : centaines a quelques milliers de noeuds par graphe familial) :

- **Performance excellente** : Les CTE recursives sont optimisees pour les graphes de taille moderee. Les benchmarks montrent des temps de reponse inferieurs a 10ms pour des traversees de graphes familiaux typiques.
- **Indexation** : Des index B-tree sur les colonnes de relation (`from_member_id`, `to_member_id`) garantissent des performances de jointure optimales.
- **Limitation** : Pour des traversees tres profondes (>10 niveaux) ou des graphes tres denses, les performances peuvent se degrader. Cependant, un graphe familial depasse rarement 5-6 niveaux de profondeur.

### Nouvelles capacites graphe (SQL/PGQ et Apache AGE)

Deux extensions meritent attention pour l'evolution future :

**SQL/PGQ (PostgreSQL 18 beta)** :
- Standard ISO SQL:2023 pour les requetes de graphe de proprietes.
- Permet de creer des "Property Graphs" par-dessus des tables relationnelles existantes.
- Utilise l'operateur `GRAPH_TABLE` avec un langage de pattern matching graphe integre a SQL.
- Statut : patches experimentaux appliques a PostgreSQL 18 beta 2, pas encore en production stable.

**Apache AGE** :
- Extension PostgreSQL open-source offrant le langage openCypher (meme syntaxe que Neo4j).
- Benchmarks 2025 : pour les traversees simples, les CTE recursives SQL sont **40x plus rapides** que AGE. En revanche, AGE excelle sur les patterns de relations complexes, les traversees multi-sauts variables et les algorithmes de graphe.
- Supporte par Azure Database for PostgreSQL.

### Sources

- [PostgreSQL Documentation: WITH Queries](https://www.postgresql.org/docs/current/queries-with.html)
- [Graph Traversal using Recursive CTE in PostgreSQL (GitHub)](https://github.com/anowerhossain/Graph-Traversal-using-Recursive-CTE-in-PostgreSQL)
- [Fusionbox: Graph Algorithms with Recursive CTEs](https://www.fusionbox.com/blog/detail/graph-algorithms-in-a-database-recursive-ctes-and-topological-sort-with-postgres/620/)
- [EDB: Representing Graphs in PostgreSQL with SQL/PGQ](https://www.enterprisedb.com/blog/representing-graphs-postgresql-sqlpgq)
- [Experimenting with SQL:2023 Property-Graph Queries in Postgres 18](https://gavinray97.github.io/blog/postgres-sql-property-graphs)
- [PostgreSQL 18 Release Notes](https://www.postgresql.org/docs/current/release-18.html)
- [Apache AGE Official Site](https://age.apache.org/)
- [PostgreSQL Showdown: Complex Joins vs. Native Graph Traversals with Apache AGE](https://medium.com/@sjksingh/postgresql-showdown-complex-joins-vs-native-graph-traversals-with-apache-age-78d65f2fbdaa)
- [Baremon: Working with Graph Data in Neo4j, PostgreSQL, and Oracle](https://www.baremon.eu/graph-databases-in-practice/)

---

## 2. Neo4j vs PostgreSQL pour le Graphe Familial

### Vue d'ensemble comparative

| Critere | PostgreSQL (CTE + extensions) | Neo4j |
|---------|-------------------------------|-------|
| **Version actuelle** | 18.1 (nov. 2025) | 5.x / AuraDB |
| **Modele de donnees** | Relationnel + graph via CTE/AGE | Graph natif (noeuds + relations) |
| **Langage de requete** | SQL + openCypher (AGE) | Cypher natif |
| **Traversee de graphe** | Bon pour profondeur limitee (<10) | Excellent, O(1) par relation |
| **Jointures complexes** | Excellent | Limite |
| **Ecosysteme NestJS** | Mature (Prisma, TypeORM, Drizzle) | Limite (neo4j-driver basique) |
| **Cout** | Gratuit / open-source | AuraDB a partir de 65$/mois |
| **Operations** | Bien compris, large communaute | Expertise specialisee requise |

### Arguments pour Neo4j

- **Traversee native** : Chaque noeud reference directement ses noeuds connectes, eliminant les jointures couteuses et les lookups d'index. Performances de traversee constantes meme sur des millions de relations.
- **Expressivite** : Le langage Cypher est nettement plus intuitif pour exprimer des patterns de relations familiales complexes.
- **Cas d'usage ideal** : Reseaux sociaux, systemes de recommandation, detection de fraude -- tous bases sur la decouverte de connexions.

### Arguments pour PostgreSQL

- **Source unique de verite** : Toutes les donnees (profils, taches, rituels, parametres) coexistent dans la meme base, evitant la synchronisation entre deux systemes.
- **Maturite de l'ecosysteme** : Integration native avec NestJS via les ORMs, RLS pour la securite, triggers, fonctions stockees.
- **Cout total de possession** : Zero licence, large pool de developpeurs competents, monitoring et sauvegarde bien documentes.
- **Performance suffisante** : Pour un graphe familial (typiquement <1000 noeuds par famille elargie), les CTE recursives sont amplement performantes.

### Retour d'experience critique

Un article Medium de 2025 titre "We Replaced Postgres With Neo4j. Six Months Later, We Regretted It" met en garde contre le passage a Neo4j quand le modele de donnees n'est pas *principalement* oriente graphe. Les problematiques soulevees incluent :
- Complexite operationnelle supplementaire
- Manque de flexibilite pour les requetes non-graphe (aggregations, rapports)
- Ecosysteme d'outils plus restreint

### Recommandation pour Family Home

**PostgreSQL est le choix recommande** pour les raisons suivantes :

1. **Echelle moderee** : Un graphe familial de quelques centaines de noeuds ne justifie pas la complexite d'un systeme graphe dedie.
2. **Donnees mixtes** : L'application gere des donnees relationnelles (taches, rituels, parametres) ET des donnees graphe (relations familiales). PostgreSQL gere les deux.
3. **Evolutivite** : Si les besoins en graphe augmentent, Apache AGE ou SQL/PGQ (PostgreSQL 18+) peuvent etre ajoutes sans changer de SGBD.
4. **Cout et complexite** : Maintenir deux bases de donnees (PostgreSQL + Neo4j) pour une application familiale est disproportionne.

### Sources

- [Medium: Exploring Graph Database Capabilities: Neo4j vs. PostgreSQL](https://medium.com/self-study-notes/exploring-graph-database-capabilities-neo4j-vs-postgresql-105c9e85bb5d)
- [pgbench: Postgres vs Neo4j Fundamentals](https://pgbench.com/comparisons/postgres-vs-neo4j/)
- [DEV Community: PostgreSQL vs Neo4j: Choosing the Right Database](https://dev.to/pawnsapprentice/postgresql-vs-neo4j-choosing-the-right-database-for-your-project-1o59)
- [Neo4j Community: Neo4j vs PostgreSQL for the new project](https://community.neo4j.com/t/neo4j-vs-postgresql-for-the-new-project/39059)
- [Medium: We Replaced Postgres With Neo4j. Six Months Later, We Regretted It.](https://medium.com/@toyezyadav/we-replaced-postgres-with-neo4j-six-months-later-we-regretted-it-b930710f57e3)
- [PuppyGraph: Top 5 Neo4j Alternatives of 2026](https://www.puppygraph.com/blog/neo4j-alternatives)
- [GeeksforGeeks: Difference between Neo4j and PostgreSQL](https://www.geeksforgeeks.org/postgresql/difference-between-neo4j-and-postgresql/)
- [Neo4j Pricing](https://neo4j.com/pricing/)

---

## 3. ORM pour NestJS : Prisma vs TypeORM vs Drizzle

### Tableau comparatif (etat 2025-2026)

| Critere | Prisma | Drizzle | TypeORM |
|---------|--------|---------|---------|
| **Version** | 6.x (2025) | 0.38+ (2025) | 0.3.x |
| **Approche** | Schema-first (DSL propre) | Code-first (TypeScript) | Decorateurs TypeScript |
| **Performance** | Moyenne (moteur Rust) | Excellente (SQL direct) | Moyenne |
| **Securite de type** | Excellent | Excellent | Bon |
| **Migrations** | Automatiques (prisma migrate) | Semi-auto (drizzle-kit) | Auto + manuelles |
| **Cold start serverless** | Lent (binaire Rust) | Rapide (~7kb) | Moyen |
| **CTE recursives** | Via raw SQL | Via raw SQL (support natif en cours) | Via raw SQL |
| **RLS PostgreSQL** | Via extensions client | Via raw SQL | Via raw SQL |
| **Ecosysteme NestJS** | Officiel (@nestjs/prisma) | Modules communautaires | Officiel (@nestjs/typeorm) |
| **Maintenance** | Active (equipe dediee) | Active (communaute) | Inegale |

### Prisma

**Forces** :
- Experience developpeur (DX) inegalee : schema declaratif, Prisma Studio pour visualisation, migrations automatiques avec detection de perte de donnees.
- Client entierement type genere automatiquement.
- Documentation officielle NestJS de premiere classe.
- Support RLS via **Prisma Client Extensions** : chaque requete HTTP peut avoir son propre client avec contexte RLS.
- Eciosysteme riche : `prisma-client-extensions/row-level-security`, bibliothque `Yates` pour RBAC.

**Faiblesses** :
- **Vendor lock-in** : Schema en DSL proprietaire. Migrer implique de reecrire toute la couche d'acces aux donnees.
- **Pas de CTE recursives natives** : Necessite `$queryRaw` pour les requetes de graphe familial.
- **Latence cold start** : Le moteur Rust de requete ajoute de la latence mesurable en serverless.
- **Abstraction parfois trop opaque** : Les requetes generees ne sont pas toujours optimales pour des schemas complexes.

**Pour Family Home** : Prisma est un excellent choix si l'equipe privilegie la productivite developpeur et accepte d'utiliser `$queryRaw` pour les traversees de graphe. L'integration RLS via extensions est bien documentee.

### Drizzle ORM

**Forces** :
- **Performance maximale** : Compile les requetes en SQL avec un overhead minimal. Jusqu'a 14x moins de latence que les ORMs souffrant du probleme N+1.
- **Zero abstraction magique** : Le developpeur voit et controle le SQL genere.
- **Taille minimale** : ~7kb minifie+gzip, zero dependance binaire. Ideal pour serverless.
- **TypeScript natif** : Schema defini en TypeScript pur, pas de DSL a apprendre.
- **Migrations transparentes** : `drizzle-kit` genere des fichiers SQL que le developpeur valide.

**Faiblesses** :
- **Maturite relative** : Version 0.x, API qui evolue encore.
- **CTE recursives** : Issue GitHub #209 ouverte pour le support de `WITH RECURSIVE`. Actuellement, il faut passer par du SQL brut (`sql` tagged template).
- **Integration NestJS** : Pas de module officiel NestJS, mais plusieurs modules communautaires (`nestjs-drizzle`, intregation via providers).
- **Necessite une bonne connaissance SQL** : Pas de "lazy loading" magique.
- **Support RLS** : Pas d'abstraction dediee, mais l'acces au SQL brut rend l'implementation directe.

**Pour Family Home** : Drizzle est le meilleur choix si l'equipe est a l'aise avec SQL et souhaite des performances maximales. Le manque de CTE recursives natives est contournable via `sql\`WITH RECURSIVE...\``.

### TypeORM

**Forces** :
- Integration officielle NestJS la plus ancienne et la plus documentee.
- Familier pour les developpeurs venant d'Angular/Java (decorateurs, pattern Repository).
- Supporte Active Record et Data Mapper patterns.

**Faiblesses** :
- **Maintenance preoccupante** : Bugs critiques non resolus pendant des mois. Projet open-source avec des periodes d'inactivite.
- **Performance** : Overhead significatif sur les requetes complexes.
- **TypeScript** : Typage moins precis que Prisma ou Drizzle pour les relations complexes.
- **Migrations** : Le generateur automatique peut produire des migrations erronees sur des schemas complexes.

**Pour Family Home** : TypeORM est **deconseille** pour un nouveau projet en 2026. Sa maintenance inegale et ses performances moindres ne justifient pas son choix face a Prisma ou Drizzle.

### Recommandation ORM

**Prisma est recommande comme choix principal** pour Family Home :

1. **Productivite** : Schema declaratif, migrations automatiques, Prisma Studio.
2. **RLS** : Support via extensions client bien documente pour le multi-foyer.
3. **NestJS** : Integration officielle de premiere classe.
4. **Graphe familial** : `$queryRaw` pour les CTE recursives, encapsule dans un service dedie.
5. **Equipe** : Courbe d'apprentissage douce, excellente documentation.

**Alternative** : Drizzle si la performance est prioritaire et l'equipe maitrise SQL.

### Sources

- [DEV Community: Best ORM for NestJS in 2025](https://dev.to/sasithwarnakafonseka/best-orm-for-nestjs-in-2025-drizzle-orm-vs-typeorm-vs-prisma-229c)
- [NiharDaily: Best Node.js ORMs: Prisma vs Drizzle vs TypeORM vs Sequelize](https://www.nihardaily.com/173-the-best-nodejs-orms-in-2025-a-brutally-honest-review)
- [TheDataGuy: Node.js ORMs in 2025](https://thedataguy.pro/blog/2025/12/nodejs-orm-comparison-2025/)
- [Better Stack: Drizzle vs Prisma](https://betterstack.com/community/guides/scaling-nodejs/drizzle-vs-prisma/)
- [Level Up Coding: The 2025 TypeScript ORM Battle](https://levelup.gitconnected.com/the-2025-typescript-orm-battle-prisma-vs-drizzle-vs-kysely-007ffdfded67)
- [Medium: Prisma or TypeORM in 2026? The NestJS Data Layer Call](https://medium.com/@Nexumo_/prisma-or-typeorm-in-2026-the-nestjs-data-layer-call-ae47b5cfdd73)
- [Trilon: NestJS & DrizzleORM: A Great Match](https://trilon.io/blog/nestjs-drizzleorm-a-great-match)
- [Prisma: How to use Prisma ORM with NestJS](https://www.prisma.io/docs/guides/nestjs)
- [GitHub: Drizzle ORM - Support WITH RECURSIVE (Issue #209)](https://github.com/drizzle-team/drizzle-orm/issues/209)
- [GitHub: Prisma Client Extensions - Row Level Security](https://github.com/prisma/prisma-client-extensions/tree/main/row-level-security)
- [GitHub: Yates - Prisma RLS](https://github.com/cerebruminc/yates)

---

## 4. Redis pour le Temps Reel et le Cache

### Version et maturite

- **Redis 8.4** est la version stable la plus recente (2025-2026), decrite comme "the fastest and most powerful Redis yet".
- Redis 8 apporte **plus de 30 ameliorations de performance** : commandes jusqu'a 87% plus rapides, debit jusqu'a 2x plus eleve, replication jusqu'a 18% plus rapide.
- **Licence** : Redis est revenu a une licence open-source plus permissive avec Redis 8. Cependant, les versions 7.x avaient adopte une licence SSPL/RSALv2 controversee.
- **Nouvelles structures de donnees** : JSON natif, Time Series, Bloom Filter, Cuckoo Filter, Count-Min Sketch, Top-K, T-Digest, Vector Set (beta).

### Adequation pour Family Home

Redis repond a **trois besoins critiques** de l'application :

#### 4.1 Pub/Sub pour le Statut Temps Reel

Le systeme de statut temps reel (presence, disponibilite des membres du foyer) s'implemente naturellement avec Redis Pub/Sub :

- **Architecture** : Chaque foyer = un canal Redis. Les membres abonnes recoivent les mises a jour de statut en temps reel.
- **Integration NestJS** : Support natif via `@nestjs/microservices` avec le transporteur Redis, ou via `ioredis` pour plus de controle.
- **WebSocket + Redis** : Les NestJS Gateways combinees avec Redis Pub/Sub permettent de diffuser les evenements WebSocket a travers plusieurs instances serveur.
- **Limitation** : Le Pub/Sub Redis est **ephemere** -- les messages ne sont pas persistes. Si un client est deconnecte, il perd les messages. Pour la durabilite, utiliser **Redis Streams**.

#### 4.2 Redis Streams pour les Evenements Durables

Pour les cas ou la durabilite est importante (notifications de taches, rappels de rituels) :

- Redis 8.2+ ameliore les Streams avec de nouvelles commandes pour la gestion des consumer groups.
- Redis 8.4 ajoute l'option `CLAIM min-idle-time` pour `XREADGROUP`, permettant de reclamer et traiter les entrees en attente ET les nouvelles entrees en une seule operation.
- Les Streams garantissent la livraison "at-least-once", adaptee aux notifications critiques.

#### 4.3 BullMQ pour les Taches Recurrentes

Pour les rituels et taches recurrentes de l'application, **BullMQ** (construit sur Redis) est la solution standard :

- **Integration NestJS** : Package officiel `@nestjs/bullmq`.
- **Taches planifiees** : Support des expressions cron et des intervalles fixes pour les taches recurrentes.
- **Job Schedulers** : Fabriques de jobs qui produisent des jobs selon un planning. Parfait pour les rituels familiaux recurents.
- **Fiabilite** : Retry automatique, dead-letter queues, concurrence configurable.
- **API "upsert"** : Simplifie la gestion des taches recurrentes en production, evitant les doublons.

#### 4.4 Cache Applicatif

- **Cache de sessions** : Sessions utilisateur avec TTL configurable.
- **Cache de requetes** : Resultats de requetes frequentes (graphe familial, permissions resolues) avec invalidation ciblee.
- **Cache de calculs** : Resultats pre-calcules des cercles de visibilite pour eviter les CTE recursives a chaque requete.

### Performance a l'echelle attendue

Pour une application familiale :
- Redis gere facilement des millions d'operations/seconde ; l'echelle de Family Home (centaines de familles actives simultanement) est triviale.
- La latence Pub/Sub est de l'ordre de la microseconde en local, quelques millisecondes en reseau.
- BullMQ peut traiter des milliers de jobs par seconde avec un seul worker.

### Sources

- [Redis Blog: Redis 8 is now GA](https://redis.io/blog/redis-8-ga/)
- [Redis Blog: Redis 8.4 is the fastest and most powerful Redis yet](https://redis.io/blog/redis-8-4-open-source-ga/)
- [Redis Docs: Redis 8.2 New Features](https://redis.io/docs/latest/develop/whats-new/8-2/)
- [NestJS Documentation: Redis Microservices](https://docs.nestjs.com/microservices/redis)
- [Medium: How To Implement Redis Pub/Sub in NestJS](https://javascript.plainenglish.io/how-to-implement-redis-pub-sub-in-nestjs-for-real-time-communication-8916cb08f8ca)
- [Medium: Building Real-time Notifications with GraphQL Subscriptions and Redis PubSub in NestJS](https://medium.com/@sujoy.swe/building-real-time-notifications-with-graphql-subscriptions-and-redis-pubsub-in-nestjs-ed13916dfac1)
- [PraeclarumTech: WebSockets at Scale with NestJS and Redis Pub/Sub](https://praeclarumtech.com/websockets-at-scale-real-time-architectures-with-nestjs-and-redis-pub-sub/)
- [BullMQ Documentation: Job Schedulers](https://docs.bullmq.io/guide/job-schedulers)
- [BullMQ Documentation: Repeatable Jobs](https://docs.bullmq.io/guide/jobs/repeatable)
- [DEV Community: Level Up Your NestJS App with BullMQ Queues](https://dev.to/ronak_navadia/level-up-your-nestjs-app-with-bullmq-queues-dlqs-bull-board-5hnn)
- [Medium: Using BullMQ with NestJS for Background Job Processing](https://mahabub-r.medium.com/using-bullmq-with-nestjs-for-background-job-processing-320ab938048a)

---

## 5. PostgreSQL Row Level Security (RLS) pour le Multi-Foyer

### Vue d'ensemble

Le Row-Level Security (RLS) de PostgreSQL est le mecanisme natif pour restreindre l'acces aux lignes d'une table selon des politiques de securite. Disponible depuis PostgreSQL 9.5, c'est une fonctionnalite mature et eprouvee en production.

### Adequation pour le modele multi-foyer et les cercles de visibilite

Le RLS est **idealement adapte** au modele de permissions de Family Home :

#### 5.1 Isolation par Foyer

```sql
-- Activer RLS sur la table des taches
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Politique : un membre ne voit que les taches de ses foyers
CREATE POLICY household_tasks ON tasks
    FOR SELECT
    USING (
        household_id IN (
            SELECT household_id FROM household_members
            WHERE member_id = current_setting('app.current_user_id')::uuid
        )
    );
```

#### 5.2 Cercles de Visibilite

Le modele a 5 cercles peut etre implemente via des politiques RLS graduelles :

```sql
-- Politique pour le cercle "Personnel" : uniquement ses propres donnees
CREATE POLICY personal_circle ON items
    FOR SELECT
    USING (
        visibility_circle = 'personal'
        AND owner_id = current_setting('app.current_user_id')::uuid
    );

-- Politique pour le cercle "Foyer" : donnees du foyer
CREATE POLICY household_circle ON items
    FOR SELECT
    USING (
        visibility_circle = 'household'
        AND household_id IN (
            SELECT household_id FROM household_members
            WHERE member_id = current_setting('app.current_user_id')::uuid
        )
    );

-- Les politiques multiples sont combinees avec OR
-- => un item est visible s'il satisfait AU MOINS une politique
```

#### 5.3 Politiques Restrictives

Pour les cas ou plusieurs conditions doivent etre satisfaites simultanement :

```sql
-- Politique restrictive : combine avec AND au lieu de OR
CREATE POLICY must_be_active ON items AS RESTRICTIVE
    FOR ALL
    USING (is_active = true);
```

### Integration avec Prisma et NestJS

#### Approche recommandee :

1. **Utilisateur non-superutilisateur** : Prisma doit se connecter avec un role non-superutilisateur pour que les politiques RLS s'appliquent. Les superutilisateurs et roles avec `BYPASSRLS` contournent automatiquement le RLS.

2. **Contexte de session via Prisma Client Extensions** :
```typescript
// Middleware NestJS qui injecte le contexte utilisateur
const prismaWithRLS = prisma.$extends({
    query: {
        $allOperations({ args, query }) {
            return prisma.$transaction([
                prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`,
                prisma.$executeRaw`SELECT set_config('app.current_household_id', ${householdId}, true)`,
                query(args),
            ]);
        },
    },
});
```

3. **FORCE ROW LEVEL SECURITY** : Commande a appliquer si le meme utilisateur PostgreSQL est utilise pour les migrations et l'application, car le proprietaire de la table contourne normalement le RLS.

#### Outils dedies :

- **Prisma Client Extensions RLS** : Exemple officiel Prisma pour isoler les donnees par tenant via RLS.
- **Yates** : Module pour implenter le RBAC avec Prisma en utilisant le RLS PostgreSQL.
- **prisma-rls** : Extension Prisma communautaire pour le RLS sur n'importe quelle base.

### Bonnes pratiques (2025)

1. **Activer RLS sur toutes les tables contenant des donnees de tenant/foyer**.
2. **Utiliser `set_config` avec le parametre `is_local = true`** pour limiter le contexte a la transaction courante.
3. **Tester les politiques RLS de maniere exhaustive** : un WHERE oublie dans le code applicatif ne compromet pas la securite grace au RLS.
4. **Combiner RLS et permissions applicatives** : Le RLS est un filet de securite, pas un remplacement de la logique metier.
5. **Performance** : Le RLS ajoute un overhead negligeable sur les requetes (quelques microsecondes par requete).

### Sources

- [Simplyblock: Row-Level Security for Multi-Tenant Applications](https://www.simplyblock.io/blog/underated-postgres-multi-tenancy-with-row-level-security/)
- [Crunchy Data: Row Level Security for Tenants in Postgres](https://www.crunchydata.com/blog/row-level-security-for-tenants-in-postgres)
- [AWS: Multi-tenant data isolation with PostgreSQL RLS](https://aws.amazon.com/blogs/database/multi-tenant-data-isolation-with-postgresql-row-level-security/)
- [Logto Blog: Multi-tenancy implementation with PostgreSQL](https://blog.logto.io/implement-multi-tenancy)
- [Permit.io: Postgres RLS Implementation Guide](https://www.permit.io/blog/postgres-rls-implementation-guide)
- [The Nile: Shipping multi-tenant SaaS using Postgres RLS](https://www.thenile.dev/blog/multi-tenant-rls)
- [Medium: Securing Multi-Tenant Applications Using RLS with Prisma](https://medium.com/@francolabuschagne90/securing-multi-tenant-applications-using-row-level-security-in-postgresql-with-prisma-orm-4237f4d4bd35)
- [EliteDev: Complete Guide: Build Multi-Tenant SaaS with NestJS, Prisma and RLS](https://js.elitedev.in/js/complete-guide-build-multi-tenant-saas-with-nestjs-prisma-and-row-level-security-96c123c5/)
- [GitHub: Prisma Client Extensions - Row Level Security](https://github.com/prisma/prisma-client-extensions/tree/main/row-level-security)
- [GitHub: Yates - Prisma RLS](https://github.com/cerebruminc/yates)

---

## 6. Supabase vs PostgreSQL Auto-Heberge

### Comparaison architecturale

| Critere | Supabase (heberge) | PostgreSQL auto-heberge |
|---------|-------------------|------------------------|
| **Base de donnees** | PostgreSQL (identique) | PostgreSQL (identique) |
| **API auto-generee** | REST + GraphQL automatiques | A construire (NestJS) |
| **Authentification** | GoTrue integre | A implementer |
| **Temps reel** | WebSocket natif | Via Redis Pub/Sub + NestJS Gateways |
| **Stockage fichiers** | Storage integre | S3/MinIO a configurer |
| **RLS** | Interface graphique pour politiques | SQL direct |
| **Cout (small)** | ~25$/mois (Pro) | ~10-20$/mois (VPS) |
| **Cout operationnel** | Quasi-zero | 1-2 ETP pour auto-hebergement |
| **Latence** | 100-200ms (API Supabase) | 70-150ms (NestJS optimise) |
| **Cold start** | 500-800ms (Edge Functions) | 300-500ms (NestJS warm) |

### Arguments pour Supabase

- **Rapidite de prototypage** : API REST auto-generee, authentification integree, dashboard pour gerer le RLS.
- **Temps reel natif** : WebSocket integre sans configuration supplementaire.
- **Ecosysteme "batteries included"** : Auth, Storage, Edge Functions, Vector embeddings.
- **Communaute active** : Documentation riche, nombreux tutoriels.

### Arguments contre Supabase (pour Family Home)

1. **Architecture NestJS** : Family Home utilise NestJS comme backend. Supabase est concu comme un Backend-as-a-Service (BaaS) qui *remplace* le backend custom. Utiliser Supabase uniquement comme base de donnees hebergee sous-utilise ses fonctionnalites et paie pour des services non utilises.

2. **Logique metier complexe** : Les 5 cercles de visibilite, les permissions par role par foyer, et la logique de rituels recurrents necessitent une couche metier sophistiquee que NestJS gere mieux que les Edge Functions Supabase.

3. **Controle** : L'architecture modulaire de Family Home necessite un controle fin sur les requetes de base de donnees, les transactions, et les migrations. NestJS + Prisma offrent ce controle.

4. **Auto-hebergement de Supabase** : Possible mais complexe (PostgreSQL + RealtimeDB + GoTrue + Storage + Vector). Le cout operationnel typique est de 1-2 ETP (120K-240K$/an), disproportionne pour une app familiale.

### PostgreSQL heberge (alternatives a Supabase)

Pour beneficier d'un PostgreSQL manage sans l'overhead Supabase :

- **Neon** : PostgreSQL serverless, branchement de base (comme git), auto-scaling. Ideal pour le developpement.
- **Railway** : Deploiement simple, bon rapport qualite/prix.
- **Render** : PostgreSQL manage avec backups automatiques.
- **AWS RDS / Aurora** : Pour la production a plus grande echelle.
- **DigitalOcean Managed Database** : Simple et economique.

### Recommandation

**PostgreSQL heberge (Neon ou Railway) + NestJS** est le choix optimal pour Family Home :

1. Utiliser un **PostgreSQL manage** (Neon, Railway, ou Render) pour eliminer la charge operationnelle de l'administration de base de donnees.
2. Conserver **NestJS comme backend** pour la logique metier complexe.
3. Utiliser **Redis heberge** (Upstash, Railway, ou Redis Cloud) pour le cache et le temps reel.
4. **Ne pas utiliser Supabase** : son modele BaaS ne correspond pas a l'architecture backend custom de Family Home.

### Sources

- [iTitans: Backend Choices - BaaS vs Supabase vs NestJS](https://ititans.com/blog/backend-choices-baas-vs-supabase-vs-nestjs/)
- [Leanware: Supabase vs Postgres Deployment Guide for Startups](https://www.leanware.co/insights/postgresql-vs-supabase-deployment-guide-startups)
- [pgbench: Postgres vs Supabase Full Overview](https://pgbench.com/comparisons/postgres-vs-supabase/)
- [Vela/Simplyblock: Self-Hosting Supabase: Is It Worth It?](https://vela.simplyblock.io/articles/self-hosting-supabase-worth-it/)
- [GitHub Discussion: Self-hosting Supabase - What's working and what's not](https://github.com/orgs/supabase/discussions/39820)
- [Northflank: Best PostgreSQL Hosting Providers 2026](https://northflank.com/blog/best-postgresql-hosting-providers)
- [ToolJet: Top 10 Supabase Alternatives 2026](https://blog.tooljet.com/supabase-alternatives/)

---

## 7. Synthese et Recommandations Architecturales

### Stack recommande pour Family Home

```
+--------------------------------------------------+
|              COUCHE APPLICATIVE                   |
|  NestJS (modules, services, guards, gateways)    |
+--------------------------------------------------+
|              COUCHE ORM / ACCES DONNEES           |
|  Prisma ORM (schema, migrations, client type)    |
|  + $queryRaw pour CTE recursives (graphe)        |
|  + Client Extensions pour RLS (multi-foyer)      |
+--------------------------------------------------+
|              COUCHE BASE DE DONNEES               |
|  PostgreSQL 18 (heberge : Neon / Railway)        |
|  - RLS pour isolation multi-foyer                |
|  - CTE recursives pour graphe familial           |
|  - Index B-tree sur relations                    |
|  - (futur) SQL/PGQ pour requetes graphe natives  |
+--------------------------------------------------+
|              COUCHE CACHE / TEMPS REEL            |
|  Redis 8.x (heberge : Upstash / Railway)         |
|  - Pub/Sub pour statut temps reel               |
|  - Streams pour evenements durables             |
|  - BullMQ pour taches/rituels recurrents        |
|  - Cache de sessions et requetes                |
+--------------------------------------------------+
```

### Decisions cles et justifications

| Decision | Choix | Justification |
|----------|-------|---------------|
| **SGBD principal** | PostgreSQL 18 (manage) | Maturite, CTE recursives, RLS, cout zero licence, ecosysteme NestJS |
| **Base graphe dediee** | Non (PostgreSQL suffit) | Echelle moderee, donnees mixtes, complexite operationnelle evitee |
| **ORM** | Prisma | DX optimale, RLS via extensions, integration NestJS officielle, migrations auto |
| **Cache / Temps reel** | Redis 8.x | Pub/Sub, Streams, BullMQ, performances triviales a l'echelle familiale |
| **Taches recurrentes** | BullMQ (sur Redis) | Integration NestJS officielle, cron, retry, monitoring |
| **Hebergement DB** | Neon ou Railway | Manage, economique, backups auto, pas de charge ops |
| **Hebergement Redis** | Upstash ou Railway | Serverless, pay-as-you-go, latence faible |
| **BaaS (Supabase)** | Non | Architecture backend custom NestJS incompatible avec le modele BaaS |

### Risques et mitigations

| Risque | Probabilite | Impact | Mitigation |
|--------|-------------|--------|------------|
| CTE recursives insuffisantes pour graphe complexe | Faible | Moyen | Apache AGE ou SQL/PGQ disponibles comme evolution |
| Prisma vendor lock-in | Moyen | Moyen | Encapsuler les acces DB dans des repositories abstraits |
| Redis Pub/Sub perte de messages | Moyen | Faible | Utiliser Redis Streams pour les messages critiques |
| Drizzle depasse Prisma en adoption | Faible | Faible | Architecture en couches permet le changement d'ORM |
| RLS mal configure = fuite de donnees | Moyen | Eleve | Tests automatises des politiques RLS, audits reguliers |

### Feuille de route technologique

1. **Phase 1 (MVP)** : PostgreSQL + Prisma + Redis basique (cache + Pub/Sub)
2. **Phase 2** : Ajout BullMQ pour rituels recurrents, RLS pour isolation multi-foyer
3. **Phase 3** : Optimisation cache graphe familial, Redis Streams pour evenements durables
4. **Phase 4 (evolution)** : Evaluation SQL/PGQ (PostgreSQL 19+) pour requetes graphe natives

---

*Document genere le 2026-02-06. Les versions et informations refletent l'etat des technologies a cette date.*
