# Rapport de Recherche : Scalabilite, Performance et Architecture de Deploiement

**Projet** : family-hub
**Date** : 2026-02-06
**Contexte** : Application NestJS + Next.js + PostgreSQL 18 + Redis, deployee sur Hetzner + Coolify
**Objectif** : Supporter de 0 a 10 000+ familles avec un budget maximal de 10 EUR/mois (modele freemium)

---

## Table des matieres

1. [Scaling Horizontal de NestJS (PM2 / Cluster / Docker)](#1-scaling-horizontal-de-nestjs)
2. [Connection Pooling PostgreSQL (PgBouncer + Prisma)](#2-connection-pooling-postgresql)
3. [Strategie de Cache Redis pour GraphQL](#3-strategie-de-cache-redis-pour-graphql)
4. [Deploiement Production avec Coolify](#4-deploiement-production-avec-coolify)
5. [Optimisation des Performances NestJS](#5-optimisation-des-performances-nestjs)
6. [Deploiement Zero-Downtime (Blue-Green)](#6-deploiement-zero-downtime)
7. [Estimations de Couts par Palier](#7-estimations-de-couts-par-palier)
8. [Recommandations Finales](#8-recommandations-finales)

---

## 1. Scaling Horizontal de NestJS

### 1.1 Description du Pattern

Le scaling horizontal de NestJS repose sur deux approches complementaires :

**Approche A : Mode Cluster PM2 (mono-serveur)**
- PM2 exploite le module `cluster` de Node.js pour lancer N processus workers sur un seul serveur.
- Chaque worker ecoute sur le meme port ; le master distribue les connexions entrantes via round-robin.
- Commande : `pm2 start dist/main.js -i max` (utilise tous les coeurs CPU disponibles).
- Pas de modification du code applicatif requise.
- Ideal pour la phase initiale (0 a 1 000 familles) sur un seul serveur Hetzner.

**Approche B : Replicas Docker (multi-conteneurs, puis multi-serveurs)**
- Chaque conteneur Docker execute une instance unique de l'application NestJS.
- Un load balancer (Traefik integre a Coolify, ou Hetzner Load Balancer) distribue le trafic.
- Peut scaler d'un seul serveur a plusieurs serveurs sans changement d'architecture.
- Docker Compose : `deploy: replicas: 3` ou scaling manuel via Coolify.

### 1.2 Comparaison PM2 vs Docker pour le Scaling

| Critere | PM2 Cluster | Docker Replicas |
|---------|-------------|-----------------|
| Complexite de mise en place | Faible | Moyenne |
| Scaling mono-serveur | Excellent | Excellent |
| Scaling multi-serveurs | Impossible | Natif |
| Isolation des processus | Faible (meme OS) | Forte (conteneurs) |
| Gestion memoire | Partagee | Isolee par conteneur |
| Health checks | pm2 monit | Docker healthcheck + Traefik |
| Zero-downtime reload | `pm2 reload` | Rolling update Docker |
| Overhead memoire | ~50 MB par worker | ~80-120 MB par conteneur |

### 1.3 Implementation Recommandee pour family-hub

**Phase 1 (0-500 familles) : PM2 dans un conteneur Docker unique**
```dockerfile
# Dockerfile production
FROM node:20-alpine
RUN npm install -g pm2
COPY dist/ ./dist/
COPY package.json ./
RUN npm ci --production
EXPOSE 3000
CMD ["pm2-runtime", "dist/main.js", "-i", "2"]
```

**Phase 2 (500-5 000 familles) : Multiples replicas Docker sur un seul serveur**
```yaml
# docker-compose.yml
services:
  api:
    image: family-home-api:latest
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

**Phase 3 (5 000-10 000+ familles) : Multi-serveurs avec load balancer Hetzner**
- Ajouter un second serveur Hetzner CAX (~3,79 EUR/mois).
- Connecter via un reseau prive Hetzner.
- Utiliser le Load Balancer Hetzner (~5,39 EUR/mois) ou Coolify multi-serveur.

### 1.4 Estimations de Performance

- Un seul worker NestJS (Express) : ~15 000 req/s (hello world).
- Un seul worker NestJS (Fastify) : ~50 000 req/s (hello world).
- En conditions reelles (GraphQL + DB) : ~500-2 000 req/s par worker.
- 2 workers PM2 sur CAX11 (2 CPU) : ~1 000-4 000 req/s effectifs.
- A 10 000 familles, usage concurrent estime : 50-200 req/s en pointe (largement suffisant).

### 1.5 Sources

- [Clustering Nest.js - DEV Community](https://dev.to/danudenny/clustering-nest-js-2mj7)
- [Using Clusters in Nest.js and Scalability with PM2 and Nginx](https://medium.com/@alperkilickaya/using-clusters-in-nest-js-and-scalability-with-pm2-e3da3c7b2452)
- [From PM2 to Docker: Cluster Mode - Maxim Orlov](https://maximorlov.com/from-pm2-to-docker-cluster-mode/)
- [PM2 Ecosystem Setup Guide for Node.js/NestJS (Jan 2026)](https://medium.com/@zulfikarditya/pm2-ecosystem-setup-guide-for-node-js-nestjs-45b0eee8629a)
- [PM2 - Cluster Mode Documentation](https://pm2.keymetrics.io/docs/usage/cluster-mode/)
- [PM2 - Docker Integration](https://pm2.keymetrics.io/docs/usage/docker-pm2-nodejs/)
- [NestJS Fastify vs Express Benchmark](https://blog.scalablebackend.com/performance-testing-express-fastify-and-nestjs-with-expressfastify)
- [Express vs NestJS vs Fastify: 100 Concurrent Users](https://medium.com/@devang.bhagdev/express-vs-nestjs-vs-fastify-api-performance-face-off-with-100-concurrent-users-22583222810d)

---

## 2. Connection Pooling PostgreSQL

### 2.1 Description du Pattern

Le connection pooling est critique pour une application Node.js multi-processus communiquant avec PostgreSQL. Sans pooling, chaque worker PM2 ou replica Docker cree son propre pool de connexions, ce qui peut rapidement depasser les limites de PostgreSQL.

**Formule de base Prisma** : `num_physical_cpus * 2 + 1` connexions par instance.

**Probleme identifie** : Sur un serveur CAX11 (2 CPU), avec PM2 en mode cluster (2 workers), Prisma ouvre par defaut `(2 * 2 + 1) * 2 = 10` connexions. Avec 3 replicas Docker, cela monte a 15 connexions. PostgreSQL supporte par defaut 100 connexions simultanees, ce qui est suffisant pour la phase initiale, mais problematique a l'echelle.

### 2.2 Architecture de Pooling

**Niveau 1 : Pool Prisma natif (suffisant jusqu'a ~1 000 familles)**
```
// schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// .env
DATABASE_URL="postgresql://user:pass@localhost:5432/familyhome?connection_limit=5"
```

**Niveau 2 : PgBouncer intermediaire (recommande a partir de 1 000 familles)**
```
# pgbouncer.ini
[databases]
familyhome = host=127.0.0.1 port=5432 dbname=familyhome

[pgbouncer]
listen_port = 6432
listen_addr = 0.0.0.0
auth_type = md5
pool_mode = transaction    # OBLIGATOIRE pour Prisma
max_client_conn = 200
default_pool_size = 20
min_pool_size = 5
reserve_pool_size = 5
```

**Configuration Prisma avec PgBouncer (>= 1.21.0)** :
```
// Pas besoin de ?pgbouncer=true pour PgBouncer >= 1.21.0
DATABASE_URL="postgresql://user:pass@localhost:6432/familyhome"

// Pour les migrations (connexion directe, pas via PgBouncer)
DIRECT_URL="postgresql://user:pass@localhost:5432/familyhome"
```

**Niveau 3 : Prisma Driver Adapter avec pool natif PostgreSQL (approche moderne 2025)**
```typescript
// prisma.service.ts
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,           // connexions max dans le pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
```

### 2.3 Tuning PostgreSQL pour Petit VPS (4 Go RAM - CAX11)

| Parametre | Valeur par defaut | Valeur recommandee (4 Go RAM) | Explication |
|-----------|------------------|-------------------------------|-------------|
| `shared_buffers` | 128 MB | 1 GB (25% RAM) | Cache des blocs de donnees en memoire |
| `effective_cache_size` | 4 GB | 2.5 GB | Estimation de la memoire disponible pour le cache OS |
| `work_mem` | 4 MB | 16 MB | Memoire par operation de tri/hash (attention au multiplicateur) |
| `maintenance_work_mem` | 64 MB | 256 MB | Memoire pour VACUUM, CREATE INDEX |
| `max_connections` | 100 | 50 | Reduire si PgBouncer est utilise |
| `wal_buffers` | -1 (auto) | 16 MB | Buffer pour les Write-Ahead Logs |
| `random_page_cost` | 4.0 | 1.1 | Sur SSD, reduire significativement |

### 2.4 Estimation des Connexions par Palier

| Palier | Workers/Replicas | Connexions Prisma | Avec PgBouncer | Connexions PG reelles |
|--------|-----------------|-------------------|----------------|----------------------|
| 100 familles | 2 (PM2) | 10 | Non necessaire | 10 |
| 1 000 familles | 3 replicas | 15 | Oui (pool=20) | 20 |
| 10 000 familles | 6 replicas (2 serveurs) | 30 | Oui (pool=25) | 25 |

### 2.5 Sources

- [Configure Prisma Client with PgBouncer - Prisma Docs](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/pgbouncer)
- [Prisma Connection Pool Documentation](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/connection-pool)
- [Database Connections - Prisma Documentation](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections)
- [Excessive DB Connections with Prisma + PgBouncer + PM2 (Issue #22732)](https://github.com/prisma/prisma/issues/22732)
- [Architecting Scalability: Prisma Runtime Config + PG Pooling in NestJS](https://medium.com/@elohimcode/architecting-scalability-leveraging-prismas-new-runtime-configuration-with-postgresql-pooling-in-92cb4d4cdf9f)
- [7 Node + Prisma Connection Pool Rules at Scale](https://medium.com/@1nick1patel1/7-node-prisma-connection-pool-rules-at-scale-f9054cdfaff7)
- [PostgreSQL 17 Performance Tuning: Mastering Shared Buffers](https://medium.com/@jramcloud1/31-postgresql-17-performance-tuning-mastering-shared-buffers-f6e1d3e46069)
- [PostgreSQL Performance Tuning Best Practices 2025](https://www.mydbops.com/blog/postgresql-parameter-tuning-best-practices)
- [Optimize PostgreSQL Server Performance - Crunchy Data](https://www.crunchydata.com/blog/optimize-postgresql-server-performance)

---

## 3. Strategie de Cache Redis pour GraphQL

### 3.1 Description du Pattern

Le caching Redis pour une API GraphQL NestJS s'articule autour de trois niveaux complementaires :

1. **Cache au niveau resolver (Field-level)** : Cache le resultat de champs specifiques couteux a calculer.
2. **Cache au niveau requete (Request-level)** : Batch et cache les acces repetes au sein d'une meme operation GraphQL via DataLoader.
3. **Cache au niveau reponse (Response-level)** : Reutilise la reponse entiere pour des requetes identiques repetees.

### 3.2 Implementation par Couche

#### Couche 1 : DataLoader pour le probleme N+1 (PRIORITAIRE)

Le probleme N+1 est le premier goulot d'etranglement a adresser. DataLoader regroupe les requetes individuelles en une seule requete batch.

```typescript
// dataloader.service.ts
@Injectable({ scope: Scope.REQUEST })
export class FamilyMemberLoader {
  constructor(private readonly prisma: PrismaService) {}

  readonly batchFamilyMembers = new DataLoader<string, FamilyMember[]>(
    async (familyIds: readonly string[]) => {
      const members = await this.prisma.familyMember.findMany({
        where: { familyId: { in: [...familyIds] } },
      });

      const membersByFamily = new Map<string, FamilyMember[]>();
      members.forEach(m => {
        const list = membersByFamily.get(m.familyId) || [];
        list.push(m);
        membersByFamily.set(m.familyId, list);
      });

      // IMPORTANT : retourner dans le MEME ORDRE que les cles d'entree
      return familyIds.map(id => membersByFamily.get(id) || []);
    }
  );
}

// family.resolver.ts
@Resolver(() => Family)
export class FamilyResolver {
  constructor(private readonly memberLoader: FamilyMemberLoader) {}

  @ResolveField(() => [FamilyMember])
  async members(@Parent() family: Family) {
    return this.memberLoader.batchFamilyMembers.load(family.id);
  }
}
```

**Impact** : Reduit N+1 requetes a 2 requetes. Pour une liste de 50 familles avec membres, passe de 51 requetes DB a 2.

#### Couche 2 : Cache Redis au Niveau Resolver

Le `CacheModule` standard de NestJS ne fonctionne pas correctement avec les applications GraphQL. Il faut utiliser une approche manuelle avec un client Redis injecte.

```typescript
// redis-cache.service.ts
@Injectable()
export class RedisCacheService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async getOrSet<T>(key: string, ttl: number, factory: () => Promise<T>): Promise<T> {
    const cached = await this.redis.get(key);
    if (cached) return JSON.parse(cached);

    const result = await factory();
    await this.redis.setex(key, ttl, JSON.stringify(result));
    return result;
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) await this.redis.del(...keys);
  }
}

// family.resolver.ts
@Query(() => Family)
async family(@Args('id') id: string) {
  return this.cache.getOrSet(
    `family:${id}`,
    300,  // TTL 5 minutes
    () => this.familyService.findById(id)
  );
}
```

#### Couche 3 : Cache de Reponse GraphQL Complete

Pour les requetes publiques ou peu personnalisees, utiliser un cache de reponse complete via le plugin Envelop `@envelop/response-cache` ou le `ApolloServerPluginCacheControl` :

```typescript
// Avec Apollo Server
@CacheControl({ maxAge: 60 })  // 60 secondes
@Query(() => [PublicFamily])
async publicFamilies() {
  return this.familyService.findPublic();
}

// Champs specifiques
@CacheControl({ maxAge: 3600 })  // 1 heure
@ResolveField(() => String)
async avatarUrl(@Parent() member: FamilyMember) {
  return this.storageService.getAvatarUrl(member.avatarKey);
}
```

### 3.3 Strategie d'Eviction et Gestion Memoire Redis

Pour un serveur a memoire limitee, la configuration Redis doit etre soigneusement ajustee :

```conf
# redis.conf pour petit serveur (allouer ~256 MB a Redis)
maxmemory 256mb
maxmemory-policy allkeys-lfu

# allkeys-lfu : evicte les cles les MOINS FREQUEMMENT utilisees
# Meilleur ratio de cache hit que allkeys-lru pour des patterns d'acces non-uniformes
```

**Politique d'eviction recommandee** : `allkeys-lfu` (Least Frequently Used). Cette politique offre un meilleur taux de hit cache que `allkeys-lru` car elle conserve les donnees frequemment accedees plutot que simplement les plus recentes.

### 3.4 TTL Recommandes par Type de Donnee

| Donnee | TTL | Justification |
|--------|-----|---------------|
| Profil famille (lecture) | 5 min | Rarement modifie, acces frequent |
| Liste des membres | 5 min | Modifie lors d'ajout/suppression |
| Calendrier/evenements | 2 min | Modifications plus frequentes |
| Parametres famille | 15 min | Tres rarement modifie |
| Donnees publiques/statiques | 1 h | Contenu quasi-statique |
| Session utilisateur | 24 h | Gere par le module auth |

### 3.5 Impact Estime sur les Performances

| Metrique | Sans cache | Avec DataLoader | Avec DataLoader + Redis |
|----------|-----------|-----------------|------------------------|
| Requetes DB par page | 20-50 | 3-5 | 0-2 (cache hit) |
| Temps de reponse moyen | 200-500 ms | 50-150 ms | 10-30 ms (cache hit) |
| Charge DB (req/s a 1000 users) | 2000 | 400 | 80-150 |

### 3.6 Sources

- [Caching with NestJS, GraphQL and Redis](https://medium.com/@shkim04/caching-with-nestjs-graphql-and-redis-8a364befd592)
- [nestjs-gql-cache-control (GitHub)](https://github.com/overnested/nestjs-gql-cache-control)
- [Adding a GraphQL Response Cache (Envelop)](https://the-guild.dev/graphql/envelop/v4/guides/adding-a-graphql-response-cache)
- [Ultimate Guide: NestJS Caching With Redis](https://www.tomray.dev/nestjs-caching-redis)
- [Caching Strategies - GraphQL.js](https://www.graphql-js.org/docs/caching-strategies/)
- [GraphQL Performance in NestJS: Batching, Caching, and Schema Federation](https://medium.com/@hadiyolworld007/graphql-performance-in-nestjs-batching-caching-and-schema-federation-3e4028a75986)
- [How to solve the GraphQL N+1 problem in NestJS with Dataloaders](https://dev.to/tugascript/how-to-solve-the-graphql-n1-problem-in-nestjs-with-dataloaders-and-mikroorm-for-both-apollo-and-mercurius-3klk)
- [Using DataLoader in NestJS for Efficient Data Fetching and Batching](https://medium.com/@sureyzx/using-dataloader-in-nestjs-for-efficient-data-fetching-and-batching-88f7de6627dc)
- [Redis Key Eviction Documentation](https://redis.io/docs/latest/develop/reference/eviction/)
- [Redis Memory & Performance Optimization - DragonflyDB](https://www.dragonflydb.io/guides/redis-memory-and-performance-optimization)
- [Cache Eviction Strategies Every Redis Developer Should Know](https://redis.io/blog/cache-eviction-strategies/)

---

## 4. Deploiement Production avec Coolify

### 4.1 Description de Coolify

Coolify est un PaaS open-source auto-heberge, alternative a Heroku/Vercel/Netlify. Il fournit :
- Deploiement automatique via Git (push-to-deploy).
- Gestion des conteneurs Docker et Docker Compose.
- Reverse proxy Traefik avec HTTPS automatique (Let's Encrypt).
- Bases de donnees managees (PostgreSQL, Redis, etc.) en un clic.
- Gestion des secrets et variables d'environnement.
- Support multi-serveur natif.

### 4.2 Architecture Recommandee sur Hetzner + Coolify

#### Phase 1 : Mono-serveur (0 a 2 000 familles)

```
Serveur Hetzner CAX11 (2 vCPU ARM, 4 Go RAM, 40 Go SSD) - 3,79 EUR/mois

+--------------------------------------------------+
|  Coolify (gestion)                                |
|  +-------------------------------------------+   |
|  |  Traefik (reverse proxy + HTTPS)          |   |
|  +-------------------------------------------+   |
|  |  NestJS API (PM2, 2 workers)    [512 MB]  |   |
|  +-------------------------------------------+   |
|  |  Next.js Web (standalone)       [256 MB]  |   |
|  +-------------------------------------------+   |
|  |  PostgreSQL 18                  [1.5 GB]  |   |
|  +-------------------------------------------+   |
|  |  Redis                          [256 MB]  |   |
|  +-------------------------------------------+   |
|  |  OS + Coolify overhead          [1.5 GB]  |   |
|  +-------------------------------------------+   |
+--------------------------------------------------+
```

**Cout total** : ~3,79 EUR/mois (serveur seul) + domaine (~1 EUR/mois) = **~5 EUR/mois**

#### Phase 2 : Serveur plus puissant (2 000 a 5 000 familles)

```
Serveur Hetzner CAX21 (4 vCPU ARM, 8 Go RAM, 80 Go SSD) - 6,49 EUR/mois

+--------------------------------------------------+
|  Coolify + Traefik                               |
|  +-------------------------------------------+   |
|  |  NestJS API x3 replicas         [1.5 GB]  |   |
|  +-------------------------------------------+   |
|  |  Next.js Web                    [512 MB]  |   |
|  +-------------------------------------------+   |
|  |  PostgreSQL 18 + PgBouncer      [3 GB]    |   |
|  +-------------------------------------------+   |
|  |  Redis                          [512 MB]  |   |
|  +-------------------------------------------+   |
|  |  OS + Coolify overhead          [2.5 GB]  |   |
|  +-------------------------------------------+   |
+--------------------------------------------------+
```

**Cout total** : ~6,49 EUR/mois + domaine = **~7,50 EUR/mois**

#### Phase 3 : Multi-serveur (5 000 a 10 000+ familles)

```
Serveur 1 : CAX21 (Applications) - 6,49 EUR/mois
+-------------------------------------------+
|  Coolify (master) + Traefik               |
|  NestJS API x4 replicas                   |
|  Next.js Web x2 replicas                  |
+-------------------------------------------+

Serveur 2 : CAX11 (Donnees) - 3,79 EUR/mois
+-------------------------------------------+
|  PostgreSQL 18 + PgBouncer                |
|  Redis                                     |
+-------------------------------------------+

Hetzner Private Network - gratuit
Hetzner Load Balancer - 5,39 EUR/mois (optionnel)
```

**Cout total** : ~10,28 EUR/mois (sans LB) ou ~15,67 EUR/mois (avec LB)

### 4.3 Configuration Coolify pour NestJS

```yaml
# docker-compose.yml (deploye via Coolify)
version: '3.8'
services:
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

### 4.4 Fonctionnalites Coolify Cles pour la Production

1. **Auto-deploy depuis Git** : Push sur `main` declenche un build + deploy automatique.
2. **Rollback** : Retour a une version precedente en un clic depuis le dashboard.
3. **SSL/TLS automatique** : Traefik + Let's Encrypt sans configuration manuelle.
4. **Monitoring basique** : Dashboard avec CPU, RAM, disque par service.
5. **Secrets management** : Variables d'environnement chiffrees par projet.
6. **Webhooks** : Integration avec GitHub/GitLab pour CI/CD.
7. **Multi-serveur** : Ajout de serveurs supplementaires via SSH.

### 4.5 Limitations de Coolify a Connaitre

- Pas de Kubernetes natif (prevu mais pas encore implemente en 2026).
- Le scaling horizontal necessite une configuration manuelle du load balancer.
- Les backups de base de donnees doivent etre configures manuellement (cron + pg_dump).
- Monitoring limite : pas de metriques applicatives avancees (utiliser Prometheus/Grafana en complement).

### 4.6 Sources

- [Coolify Applications Documentation](https://coolify.io/docs/applications/)
- [Coolify PostgreSQL Documentation](https://coolify.io/docs/databases/postgresql)
- [Coolify Scalability Documentation](https://coolify.io/docs/knowledge-base/internal/scalability)
- [Coolify Load Balancing on Hetzner](https://coolify.io/docs/knowledge-base/how-to/hetzner-loadbalancing)
- [Deploy Node.js on VPS using Coolify](https://sreyaj.dev/deploy-nodejs-applications-on-a-vps-using-coolify)
- [Deploy Apps with Coolify - DigitalOcean Tutorial](https://www.digitalocean.com/community/tutorials/deploy-application-coolify)
- [Coolify Multi Server Setup (Payload + NextJS)](https://allaboutpayload.com/blog/coolify-multi-server-payload-hosting-setup)
- [Hetzner Cloud Pricing (Feb 2026)](https://costgoat.com/pricing/hetzner)
- [Hetzner Cloud VPS](https://www.hetzner.com/cloud)
- [Hetzner Server Comparison 2025 - Achromatic](https://www.achromatic.dev/blog/hetzner-server-comparison)

---

## 5. Optimisation des Performances NestJS

### 5.1 Migration vers Fastify (Recommandation Forte)

Les benchmarks recents (2025) montrent un gain significatif avec Fastify :

| Metrique | NestJS + Express | NestJS + Fastify | Gain |
|----------|-----------------|-------------------|------|
| Requetes/seconde (200 conn.) | 17 000 | 50 000 | **x2.9** |
| Latence p99 | ~15 ms | ~5 ms | **x3** |
| Utilisation CPU | Baseline | -82% | Excellent |
| Utilisation memoire | Baseline | +167% | Attention |

**Implementation** :
```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false, // Utiliser le logger NestJS
      bodyLimit: 1048576, // 1 MB
    }),
  );

  // Ecouter sur 0.0.0.0 pour Docker
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
```

**Attention** : La migration vers Fastify augmente la consommation memoire. Sur un serveur a 4 Go RAM, cela reste acceptable mais doit etre surveille.

### 5.2 Optimisation de l'Injection de Dependances

**Regle 1 : Privilegier les singletons**
```typescript
// BON : Singleton par defaut (une seule instance partagee)
@Injectable()
export class FamilyService {}

// MAUVAIS : Request-scoped (nouvelle instance par requete = overhead)
@Injectable({ scope: Scope.REQUEST })
export class FamilyService {}

// EXCEPTION : DataLoader DOIT etre request-scoped
@Injectable({ scope: Scope.REQUEST })
export class FamilyMemberLoader {}
```

**Regle 2 : Chargement paresseux des modules**
```typescript
// Pour les modules rarement utilises (ex: module d'export PDF)
const { AdminModule } = await import('./admin/admin.module');
```

**Regle 3 : Eviter les providers transients**
Les providers `TRANSIENT` creent une nouvelle instance pour chaque injection, ce qui augmente la consommation memoire et le temps de demarrage.

### 5.3 Profilage Memoire et Detection de Fuites

**Outils recommandes** :

1. **clinic.js** (suite complete) :
   - `clinic doctor` : diagnostic general de performance.
   - `clinic flame` : flamegraphs pour identifier les fonctions lentes.
   - `clinic bubbleprof` : visualisation des operations asynchrones.

2. **process.memoryUsage()** via un endpoint de health check :
```typescript
@Controller('health')
export class HealthController {
  @Get()
  check() {
    const mem = process.memoryUsage();
    return {
      status: 'ok',
      uptime: process.uptime(),
      memory: {
        rss: `${Math.round(mem.rss / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)} MB`,
        external: `${Math.round(mem.external / 1024 / 1024)} MB`,
      },
    };
  }
}
```

3. **Intercepteur de mesure de performance** :
```typescript
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Performance');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        if (duration > 500) { // Log si > 500ms
          this.logger.warn(
            `Slow request: ${context.getHandler().name} took ${duration}ms`
          );
        }
      }),
    );
  }
}
```

### 5.4 Optimisations GraphQL Specifiques

1. **Complexity limiting** : Limiter la complexite des requetes pour eviter les requetes abusives.
```typescript
GraphQLModule.forRoot({
  driver: ApolloDriver,
  validationRules: [
    createComplexityLimitRule(1000, {
      onCost: (cost) => console.log('Query cost:', cost),
    }),
  ],
});
```

2. **Depth limiting** : Limiter la profondeur des requetes imbriquees.
3. **Persisted queries** : Pre-enregistrer les requetes cote serveur pour eviter le parsing repete.

### 5.5 Sources

- [NestJS Performance - DEV Community](https://dev.to/leolanese/nestjs-performance-2kcb)
- [How to Profile a NestJS Application - DEV Community](https://dev.to/geampiere/how-to-profile-a-nestjs-application-483n)
- [Optimizing Memory and CPU with NestJS DI Tree](https://medium.com/@hadiyolworld007/optimizing-memory-and-cpu-with-nestjs-dependency-injection-tree-56929d774c9c)
- [The Ultimate Guide to NestJS Performance Optimization](https://medium.com/@s.klop/the-ultimate-guide-to-nestjs-performance-optimization-8b16810fc216)
- [How to Manage Memory and Avoid Leaks in NestJS](https://dev.to/geampiere/how-to-manage-memory-and-avoid-leaks-in-nestjs-applications-3geh)
- [How to Profile Memory Usage of a NestJS App](https://www.liquidxgroup.xyz/blog/how-to-profile-the-memory-usage-of-a-nest-js-app)
- [Optimize Your NestJS Applications - GeeksforGeeks](https://www.geeksforgeeks.org/javascript/optimize-your-nestjs-applications/)
- [NestJS Fastify Performance Documentation](https://docs.nestjs.com/techniques/performance)
- [Express vs NestJS vs Fastify Performance Face-Off](https://medium.com/@devang.bhagdev/express-vs-nestjs-vs-fastify-api-performance-face-off-with-100-concurrent-users-22583222810d)
- [Performance Testing Express, Fastify, and NestJS](https://blog.scalablebackend.com/performance-testing-express-fastify-and-nestjs-with-expressfastify)

---

## 6. Deploiement Zero-Downtime

### 6.1 Description du Pattern Blue-Green

Le deploiement Blue-Green maintient deux environnements de production identiques :
- **Blue** : la version actuellement en production, servant le trafic reel.
- **Green** : la nouvelle version, deployee et testee en parallele.

Le basculement se fait en redirigeant le trafic de Blue vers Green au niveau du reverse proxy (Traefik/Nginx), ce qui garantit zero temps d'arret.

### 6.2 Implementation avec Docker + Coolify

**Approche 1 : Rolling Update Docker (recommandee pour Coolify)**

Coolify effectue par defaut un rolling update : le nouveau conteneur est demarre avant d'arreter l'ancien.

```yaml
# docker-compose.yml
services:
  api:
    deploy:
      replicas: 2
      update_config:
        parallelism: 1        # Met a jour 1 replica a la fois
        delay: 10s             # Attend 10s entre chaque replica
        order: start-first     # Demarre le nouveau AVANT d'arreter l'ancien
        failure_action: rollback
      rollback_config:
        parallelism: 0
        order: stop-first
```

**Approche 2 : Blue-Green Manuel avec Traefik Labels**

```yaml
# Deploiement Blue (actif)
services:
  api-blue:
    image: family-home-api:v1.2.0
    labels:
      - "traefik.http.routers.api.rule=Host(`api.familyhome.app`)"
      - "traefik.http.services.api.loadbalancer.server.port=3000"

# Deploiement Green (en attente)
  api-green:
    image: family-home-api:v1.3.0
    labels:
      - "traefik.http.routers.api-staging.rule=Host(`staging-api.familyhome.app`)"
```

Apres validation du Green, basculer les labels Traefik et recharger la configuration.

### 6.3 Graceful Shutdown dans NestJS

Essentiel pour eviter les requetes perdues lors du basculement :

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Activer le graceful shutdown
  app.enableShutdownHooks();

  await app.listen(3000);
}

// app.module.ts
@Module({})
export class AppModule implements OnModuleDestroy {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleDestroy() {
    // Fermer proprement les connexions DB
    await this.prisma.$disconnect();
    // Attendre que les requetes en cours se terminent
    // (NestJS gere cela automatiquement avec enableShutdownHooks)
  }
}
```

**Configuration Docker pour un arret propre** :
```dockerfile
# Utiliser tini comme init process pour gerer les signaux correctement
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]

# Grace period de 30 secondes
STOPSIGNAL SIGTERM
```

```yaml
# docker-compose.yml
services:
  api:
    stop_grace_period: 30s  # Temps pour finir les requetes en cours
```

### 6.4 Gestion des Migrations de Base de Donnees

Les migrations SQL sont le point delicat du zero-downtime deployment. Regles essentielles :

1. **Migrations backward-compatible UNIQUEMENT** :
   - Ajouter des colonnes (avec valeur par defaut ou nullable) : OK
   - Supprimer des colonnes : NON (faire en 2 etapes sur 2 releases)
   - Renommer des colonnes : NON (ajouter + copier + supprimer sur 3 releases)

2. **Executer les migrations AVANT le deploiement** :
```bash
# Script de deploiement
npx prisma migrate deploy  # Applique les migrations
# PUIS deployer la nouvelle version de l'application
```

3. **Pattern expand-contract** :
   - Release 1 : Ajouter la nouvelle colonne (expand).
   - Release 2 : Migrer le code pour utiliser la nouvelle colonne.
   - Release 3 : Supprimer l'ancienne colonne (contract).

### 6.5 Pipeline CI/CD avec GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test
      - run: npm run test:e2e

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via Coolify Webhook
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.COOLIFY_TOKEN }}" \
            "${{ secrets.COOLIFY_WEBHOOK_URL }}"
```

### 6.6 Sources

- [Blue-Green Deployments for 100K+ Daily Requests - DEV Community](https://dev.to/sangwoo_rhie/zero-downtime-blue-green-deployment-with-github-actions-docker-multi-stage-builds-and-nginx-695)
- [Zero-Downtime Node.js Deployments with Blue-Green Strategy in Docker](https://medium.com/@vasanthancomrads/zero-downtime-node-js-deployments-with-blue-green-strategy-in-docker-917e01cbed80)
- [Zero-Downtime Scaling: Dockerizing and Orchestrating NestJS Apps with Kubernetes](https://medium.com/@mohantaankit2002/zero-downtime-scaling-dockerizing-and-orchestrating-your-nestjs-apps-with-kubernetes-f7992683232b)
- [Zero Downtime Deployment with NestJS, React (Blue-Green + GitHub Actions)](https://medium.com/@siwol406/all-of-zero-downtime-deployment-with-spring-boot-react-nest-and-nx-2-feat-8b93dda7017d)
- [Deploy Docker Compose with Zero Downtime using GitHub Actions](https://jmh.me/blog/zero-downtime-docker-compose-deploy)
- [Blue-Green Deployment Strategy: Minimize Downtime During Releases](https://www.gocodeo.com/post/blue-green-deployment-strategy-minimize-downtime-during-releases)
- [Blue-Green Deployments: A Practical Guide - Thomas Bandt](https://thomasbandt.com/blue-green-deployments)

---

## 7. Estimations de Couts par Palier

### 7.1 Tableau Recapitulatif

| Composant | 100 familles | 1 000 familles | 10 000 familles |
|-----------|-------------|----------------|-----------------|
| **Serveur Hetzner** | CAX11 (3,79 EUR) | CAX21 (6,49 EUR) | CAX21 + CAX11 (10,28 EUR) |
| **CPU** | 2 vCPU ARM | 4 vCPU ARM | 4 + 2 vCPU ARM |
| **RAM** | 4 Go | 8 Go | 8 + 4 Go |
| **Stockage** | 40 Go SSD | 80 Go SSD | 80 + 40 Go SSD |
| **Load Balancer** | Non | Non | Optionnel (5,39 EUR) |
| **Domaine** | ~1 EUR/mois | ~1 EUR/mois | ~1 EUR/mois |
| **Backups** | Inclus (Hetzner snapshots 20%) | ~1,30 EUR | ~2,06 EUR |
| **Total mensuel** | **~5,55 EUR** | **~8,79 EUR** | **~13,73 - 19,12 EUR** |

### 7.2 Analyse de Rentabilite (Modele Freemium)

**Hypotheses** :
- 5% de conversion freemium -> premium.
- Abonnement premium : 2,99 EUR/mois.

| Palier | Familles premium | Revenus mensuels | Couts infra | Marge |
|--------|-----------------|------------------|-------------|-------|
| 100 familles | 5 | 14,95 EUR | 5,55 EUR | +9,40 EUR |
| 1 000 familles | 50 | 149,50 EUR | 8,79 EUR | +140,71 EUR |
| 10 000 familles | 500 | 1 495 EUR | ~15 EUR | +1 480 EUR |

**Conclusion** : L'infrastructure reste largement sous le seuil de 10 EUR/mois jusqu'a 1 000 familles. Meme a 10 000 familles, les couts restent tres bas grace a l'approche Hetzner + Coolify.

### 7.3 Comparaison avec les Alternatives

| Solution | 100 familles | 1 000 familles | 10 000 familles |
|----------|-------------|----------------|-----------------|
| **Hetzner + Coolify** | 5,55 EUR | 8,79 EUR | ~15 EUR |
| **Railway** | ~5 EUR | ~20-50 EUR | ~100-200 EUR |
| **Render** | ~7 EUR | ~25-75 EUR | ~150-300 EUR |
| **Vercel + PlanetScale** | ~0 EUR (free tier) | ~30-50 EUR | ~100-200 EUR |
| **AWS (ECS + RDS)** | ~30-50 EUR | ~80-150 EUR | ~200-500 EUR |

L'approche Hetzner + Coolify offre un avantage cout de **5x a 30x** par rapport aux alternatives cloud traditionnelles.

---

## 8. Recommandations Finales

### 8.1 Feuille de Route Technique par Phase

#### Phase 0 : Fondations (Semaine 1-2, avant le lancement)

- [ ] Configurer Coolify sur Hetzner CAX11.
- [ ] Deployer NestJS avec `pm2-runtime` (2 workers) dans un conteneur Docker.
- [ ] Deployer PostgreSQL 18 et Redis via Coolify (services managees).
- [ ] Configurer HTTPS automatique via Traefik.
- [ ] Implementer le health check endpoint avec metriques memoire.
- [ ] Configurer les backups automatiques PostgreSQL (cron + pg_dump + Hetzner Snapshots).
- [ ] Mettre en place le pipeline CI/CD minimal (GitHub Actions -> Coolify webhook).

#### Phase 1 : Optimisation (100-500 familles)

- [ ] Implementer DataLoader pour resoudre les problemes N+1 GraphQL.
- [ ] Ajouter le cache Redis au niveau resolver pour les donnees frequemment lues.
- [ ] Configurer les TTL Redis par type de donnee.
- [ ] Activer le graceful shutdown dans NestJS.
- [ ] Mettre en place le monitoring basique (metriques memoire, temps de reponse).
- [ ] Optimiser le Dockerfile avec multi-stage build.

#### Phase 2 : Scaling Vertical (500-2 000 familles)

- [ ] Migrer de Express vers Fastify (gain x2.9 en req/s).
- [ ] Upgrader vers Hetzner CAX21 (8 Go RAM).
- [ ] Deployer PgBouncer en mode transaction.
- [ ] Tuner PostgreSQL (shared_buffers, work_mem, random_page_cost).
- [ ] Ajouter un intercepteur de performance pour detecter les requetes lentes.
- [ ] Configurer Redis avec `maxmemory 512mb` et politique `allkeys-lfu`.

#### Phase 3 : Scaling Horizontal (2 000-10 000+ familles)

- [ ] Passer a 3+ replicas Docker pour l'API NestJS.
- [ ] Separer la DB sur un serveur dedie (CAX11).
- [ ] Configurer le rolling update zero-downtime.
- [ ] Ajouter le complexity limiting et depth limiting GraphQL.
- [ ] Mettre en place Prometheus + Grafana pour le monitoring avance.
- [ ] Evaluer l'ajout d'un Load Balancer Hetzner si necessaire.

### 8.2 Decisions Architecturales Cles

| Decision | Choix Recommande | Justification |
|----------|-----------------|---------------|
| HTTP Adapter | **Fastify** (des Phase 2) | x2.9 req/s, -82% CPU |
| Process Manager | **pm2-runtime** dans Docker | Simplicite, crash recovery, cluster mode |
| Connection Pooling | **Prisma natif** puis **PgBouncer** | Progressif, pas d'overhead premature |
| Cache Strategy | **DataLoader + Redis** | Resout N+1 ET reduit la charge DB |
| Deploiement | **Coolify rolling update** | Zero-downtime natif, simple |
| Scaling | **Vertical d'abord**, horizontal ensuite | Cout-efficace, complexite minimale |
| Monitoring | **Health endpoint** puis **Prometheus** | Progressif selon les besoins |

### 8.3 Pieges a Eviter

1. **Ne pas optimiser prematurement** : A 100 familles, un CAX11 avec PM2 (2 workers) suffit largement. Ne pas deployer PgBouncer, Kubernetes, ou du multi-serveur avant d'en avoir besoin.

2. **Ne pas oublier les backups** : Coolify ne gere pas les backups de base de donnees automatiquement. Configurer `pg_dump` via cron + stockage externe (Hetzner Object Storage a 3,49 EUR/TB/mois) des le jour 1.

3. **Ne pas ignorer le probleme N+1** : DataLoader est la premiere optimisation a implementer. Un seul resolver N+1 peut transformer 2 requetes en 200.

4. **Ne pas utiliser des providers request-scoped sans necessite** : Seul DataLoader justifie un scope REQUEST. Tout le reste doit etre singleton.

5. **Ne pas deployer des migrations destructives** : Toujours utiliser le pattern expand-contract pour les changements de schema en production.

6. **Ne pas sous-estimer Redis** : Limiter la memoire Redis avec `maxmemory` et une politique d'eviction. Sans cela, Redis peut consommer toute la RAM disponible.

---

*Rapport genere le 2026-02-06. Les prix et benchmarks sont bases sur les donnees les plus recentes disponibles a cette date.*
