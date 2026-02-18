---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-02-08'
inputDocuments:
  - prd.md
  - product-brief-family-hub-2026-02-06.md
  - ux-design-specification.md
workflowType: 'architecture'
project_name: 'family-hub'
user_name: 'Thomas'
date: '2026-02-08'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements (54 FRs en 10 domaines) :**

| Domaine | FRs | Implications architecturales |
|---|---|---|
| Gestion Foyer & Membres (FR1-9) | Creation foyer, invitations (lien/email/QR), roles, profils enfants, prestataires, fiches membres, 5 cercles de visibilite | Modele de donnees graphe familial complexe, systeme d'invitation multi-canal, isolation des donnees par foyer et par cercle |
| Rituels & Routines (FR10-18) | CRUD rituels recurrents, moments (matin/midi/soir), statuts temps reel, pictogrammes, recapitulatif hebdomadaire | Moteur de recurrence, sync temps reel, agregation de donnees pour recapitulatifs |
| Vue & Interface Quotidienne (FR19-23) | Vue colonnes par membre, vues filtrees par role, onboarding 2 questions + generation IA | Frontend adaptatif par role, generation de contenu IA a l'onboarding |
| IA Conversationnelle (FR24-29) | Chat textuel, CRUD rituels par langage naturel, requetes contextuelles, transparence IA, filtrage mineurs, actions contraintes par role | Integration LLM, systeme d'outils IA (tool-calling), guardrails, classification d'actions par niveau de risque |
| Permissions & Securite (FR30-35) | Permissions minimales enfants, deblocage progressif, isolation cross-foyer, consentement parental verifie, auth multi-methodes | Moteur de permissions granulaire, middleware d'autorisation, flux de consentement parental |
| Notifications (FR36-40) | Push rappels rituels, notification completion enfant, preferences configurables, groupement par moment, enfants sans push par defaut | Service de notifications, moteur de regles, preferences par membre |
| Donnees & Conformite (FR41-44) | Export donnees portables, collecte minimale documentee, hebergement EU, chiffrement transit + repos | Pipeline d'export, audit de donnees, infrastructure EU |
| Offline & Sync (FR45-48) | Lecture rituels offline, ecriture statuts offline, indicateur connexion, resolution de conflits deterministe | SQLite embarque, queue de sync, strategie de resolution de conflits |
| Droit a l'oubli (FR52-54) | Suppression compte avec anonymisation cascade, suppression profil enfant, acces parental aux donnees enfant | Pipeline de suppression/anonymisation, gestion des donnees partagees |
| Admin & Ops (FR49-51) | OTA updates, monitoring erreurs/performance, dashboard metriques business | CI/CD avec OTA, stack d'observabilite, dashboard analytics |

**Non-Functional Requirements (29 NFRs en 6 categories) :**

| Categorie | NFRs cles | Impact architectural |
|---|---|---|
| Performance | UI <200ms (NFR1), sync <1s (NFR2), API <300ms (NFR3), IA TTFT <2s (NFR4), cold start <3s (NFR5), Core Web Vitals (NFR6) | Optimistic updates, WebSocket performant, cache agressif, streaming LLM |
| Securite | TLS 1.3 (NFR7), AES-256 repos (NFR8), isolation cross-foyer testee (NFR9), session 30j + rotation (NFR10), IA contrainte par role (NFR11), consentement parental bloquant (NFR12), zero partage tiers (NFR13) | Chiffrement end-to-end, tests d'isolation automatises, middleware de securite IA |
| Scalabilite | 5 a 5000 foyers sans changement archi (NFR14), 50K rituels <100ms (NFR15), 500 WebSocket simultanes (NFR16), <0.05EUR/foyer/mois (NFR17) | Architecture scalable verticalement puis horizontalement, indexation DB optimisee, gestion cout infra |
| Fiabilite | Zero perte donnees (NFR18), integrite offline sync (NFR19), auto-recovery <5min (NFR20), OTA sans interruption (NFR21) | Backups quotidiens, tests de reconciliation offline, health checks + auto-restart |
| Accessibilite | WCAG 2.1 AA web (NFR22), VoiceOver/TalkBack (NFR23), contraste 4.5:1/3:1 (NFR24), pictogrammes avec alt text (NFR25) | Composants accessibles par defaut, tests a11y en CI |
| Maintenabilite | Modules independants (NFR26), TypeScript strict (NFR27), >80% couverture chemins critiques (NFR28), CI/CD obligatoire (NFR29) | Architecture modulaire avec frontieres strictes, monorepo, pipeline CI/CD |

**UX Design — Implications architecturales :**

- **Home Hub contextuel** : necessite un service de contextualisation (heure, role, etat des modules) pour prioriser les blocs affiches
- **Vue colonnes avec scroll continu entre moments** : composant ContinuousScrollMoments avec Intersection Observer, sync avec MomentSelector
- **Ritual cards expandables** : rituels imbriques (parent -> micro-rituels), validation cascade, progression incrementale
- **Profils visuels adaptatifs** : 5 variantes de rendu (parent, enfant >=7 ans, enfant <7 ans, prestataire, kiosk) gerees par tokens et logique de props
- **Theming temporel** : changement d'ambiance selon le moment de la journee (matin chaud, midi neutre, soir doux, nuit sombre) avec transition progressive
- **Design system** : ShadCN UI directement dans apps/web + NativeWind directement dans apps/mobile, design tokens partages via `packages/tokens/`

### Scale & Complexity

- **Domaine principal** : full-stack multi-plateforme (mobile iOS/Android + web + kiosk + backend + temps reel + IA)
- **Niveau de complexite** : eleve
- **Composants architecturaux estimes** : ~12-15 modules/bounded contexts majeurs
- **Contexte** : projet greenfield, developpeur solo senior, infrastructure low-cost EU

### Technical Constraints & Dependencies

| Contrainte | Detail | Impact |
|---|---|---|
| Developpeur solo | Thomas, senior full-stack — pas d'equipe, pas de designer dedie | L'architecture doit compenser par sa qualite et son automatisation |
| Budget infra | <5EUR/mois au lancement, <0.05EUR/foyer/mois a 5000 foyers | Services manages privilegies (reduire la charge ops du dev solo) tant que les couts restent maitrises et ne scalent pas de facon explosive |
| Hebergement EU | Allemagne ou Finlande — conformite RGPD native | Contrainte de datacenter, latence acceptable pour cible europeenne |
| Cout IA | <2EUR/famille/mois | Optimisation des appels LLM, caching, modeles efficaces |
| Multi-plateforme | iOS 16+, Android 10+, Chrome/Edge 120+, Safari 17+, Firefox 120+ | React Native + Web, monorepo avec partage de code maximal |
| Conformite mineurs | RGPD Art. 8, COPPA (si USA), EU AI Act Art. 50, Californie SB 243 | Privacy by design, consentement parental, guardrails IA, DPIA |
| Stores | App Store + Play Store, categorie "Productivite" (pas "Famille" au MVP) | Separation OTA (JS) vs store updates (natif), privacy labels |

### Cross-Cutting Concerns Identified

1. **Authentification & Autorisation** — Systeme de roles (parent admin, parent, enfant, prestataire), permissions par cercle de visibilite, permissions progressives enfants, jetons prestataires temporaires, consentement parental. Touche tous les modules.

2. **Temps reel & Synchronisation** — WebSocket + Pub/Sub pour la sync des statuts, evenements distribues, offline queue avec resolution de conflits. Transversal a rituels, notifications, vues.

3. **Isolation des donnees** — Aucune fuite cross-foyer, visibilite par cercle sur chaque ressource. Doit etre garanti au niveau DB + API + tests automatises.

4. **Conformite & Privacy** — RGPD (droit a l'oubli, portabilite, minimisation), mineurs (consentement parental, collecte minimale), EU AI Act (transparence IA). Impacte le modele de donnees, les pipelines de suppression, les audits.

5. **IA & Guardrails** — Integration LLM avec tool-calling, actions contraintes par role, filtrage output pour mineurs, transparence permanente. Transversal aux rituels, foyer, notifications.

6. **Observabilite** — Monitoring erreurs, performance, metriques business (retention, DAU, Family Activation Rate). Dashboard ops pour developpeur solo.

7. **Modularite & Evolutivite** — Chaque module futur (calendrier, communication, geolocalisation) doit s'ajouter sans modification des modules existants. Frontieres de domaine strictes, interfaces publiques definies.

## Starter Template & Technology Foundation

### Approach: Custom Monorepo Setup

Aucun starter existant ne correspond a la combinaison exacte des preferences techniques. Approche retenue : monorepo custom base sur le starter officiel Turborepo, avec ajout incrementiel de chaque brique technologique.

**Starters evalues et rejetes :**

| Starter | Raison du rejet |
|---|---|
| nextjs-nestjs-expo-template | Utilise TypeORM + Clerk + Tamagui (pas NativeWind) |
| create-turbo-with-expo | Inactif depuis jan. 2024, Next.js 13 obsolete |
| create-t3-turbo | Pas de NestJS (utilise API routes Next.js) |
| nestjs-turbo | Pas d'Expo/React Native |

### Technology Stack Selected

**Applications (apps/) :**

| App | Technologie | Role |
|---|---|---|
| `web` | Next.js | SSR/SSG pages publiques + SPA app authentifiee |
| `mobile` | Expo (React Native) | App iOS/Android, interface principale |
| `api` | NestJS | Backend API, logique metier, temps reel |
| `cms` | Strapi | CMS headless pour le contenu marketing, blog, pages legales |

**Packages partages (packages/) :**

| Package | Contenu | Consommateurs |
|---|---|---|
| `shared` | Types, constantes, validations, enums | Tous |
| `db` | Schema Prisma, migrations, seed | api, scripts |
| `tokens` | Design tokens (couleurs, typo, spacing) + generation configs Tailwind | web, mobile |
| `config-eslint` | Config ESLint partagee | Tous |
| `config-ts` | Config TypeScript partagee | Tous |

> **Note post-Story-1.1 :** Les packages `auth`, `ui`, `ui-native`, `api-client` et `config-tailwind` initialement prevus ont ete reportes. L'auth vit dans `apps/api/modules/auth/`, les composants UI sont directement dans chaque app (ShadCN UI dans web, NativeWind dans mobile), et `packages/tokens/` genere les configurations Tailwind. Ces packages seront crees si un besoin de partage reel emerge.

### Technology Decisions

| Domaine | Choix | Justification |
|---|---|---|
| Langage | TypeScript strict end-to-end | NFR27, qualite senior |
| Monorepo | Turborepo + pnpm | Partage de code, builds incrementaux |
| Web | Next.js | Expertise Thomas, SSR/SSG + SPA |
| Mobile | Expo | Simplification dev mobile, OTA updates |
| Backend | NestJS | Expertise Thomas, architecture modulaire, support natif microservices/event-driven/CQRS/WebSocket |
| Base de donnees | PostgreSQL | Robuste, performant, extensible |
| ORM | Prisma | Type safety complete, ecosystem NestJS, $queryRaw pour requetes complexes, Prisma Studio |
| Auth | Better Auth | Open source, integration NestJS, adapter Prisma natif |
| UI Web | ShadCN UI + Tailwind CSS | Expertise Thomas, zero lock-in, esthetique sobre |
| UI Mobile | React Native Reusables (ShadCN pour RN) + NativeWind | Coherence ShadCN cross-platform, meme philosophie copy-paste |
| Icones | Lucide Icons | Inclus ecosysteme ShadCN |
| Police | Inter | Variable font, lisibilite ecran |
| CMS | Strapi Cloud | Headless CMS open source francais, contenu marketing/blog/legal, API pour Next.js ISR |

### Compatibility with Architectural Patterns

La stack selectionnee supporte nativement les patterns architecturaux envisages :

| Pattern | Support NestJS | Detail |
|---|---|---|
| Event-driven | `@nestjs/microservices` | Redis Pub/Sub, RabbitMQ, NATS, Kafka comme transport |
| CQRS | `@nestjs/cqrs` | Commands, Queries, Events, Sagas |
| Monolithe modulaire | Modules NestJS natifs | Frontieres strictes, DI, decoupage par domaine |
| DDD | Prisma + modules NestJS | Bounded contexts, agregats, repositories |
| Temps reel | `@nestjs/websockets` + `@nestjs/platform-socket.io` | Gateway WebSocket, rooms, namespaces |
| Pub/Sub | EventEmitter (in-process) ou Redis (multi-instance) | Scalabilite horizontale sans changement de code |

Les decisions sur les patterns architecturaux specifiques a family-hub sont traitees a l'etape suivante.

**Commande d'initialisation :**

```bash
npx create-turbo@latest family-home --package-manager pnpm
```

**Note :** L'initialisation du monorepo et le scaffolding des apps/packages constituent la premiere story d'implementation.

## Core Architectural Decisions

### Decision Priority Analysis

**Decisions critiques (bloquent l'implementation) :**

- Architecture globale : monolithe modulaire event-driven + CQRS progressif
- API style : GraphQL code-first
- Modele de permissions : RBAC + ABAC + ReBAC (PBAC hybride)
- Isolation des donnees par foyer : Prisma Client Extension automatique
- Authentification : Better Auth (Social OAuth + Magic Link/OTP)
- Infrastructure : Supabase + Railway + Vercel + Upstash

**Decisions importantes (faconnent l'architecture) :**

- State management : Apollo Client + Zustand
- Offline : mobile complet, web lecture seule
- Validation : Zod partage (domaine) + schemas derives par cote
- Testing : Vitest + Playwright + Maestro
- Observabilite : Sentry + Grafana Cloud

**Decisions differees (post-MVP) :**

- Migration Redis Pub/Sub → Kafka (~1 jour via abstraction transport NestJS, Upstash Kafka serverless identifie)
- E2E mobile : Maestro valide, evaluation finale a l'implementation
- CQRS generalise : progressif, Rituels + Activity d'abord, autres modules quand le besoin emerge
- CQRS read store : PostgreSQL (materialized views + pg_trgm) au MVP, Meilisearch ou Elasticsearch si besoin de recherche avancee post-5000 foyers

### Architecture Globale

| Decision | Choix | Rationale |
|---|---|---|
| Pattern global | Monolithe modulaire event-driven + CQRS progressif | Scalabilite, apprentissage patterns pro, separation read/write naturelle |
| Event bus (MVP) | `@nestjs/cqrs` EventBus (in-process) | Simplicite, zero infra supplementaire au lancement |
| Event bus (scale) | Redis Pub/Sub via `@nestjs/microservices` | Multi-instance, migration via 1 ligne de config NestJS |
| CQRS | `@nestjs/cqrs` — application progressive | Rituels + Activity en CQRS d'abord, autres modules au besoin |
| CQRS read store (MVP) | PostgreSQL (materialized views + `pg_trgm` full-text search) | Suffisant jusqu'a ~250K rituels, zero service supplementaire |
| CQRS read store (evolution) | Meilisearch ou Elasticsearch en read store secondaire | Si queries d'agregation > 100ms ou besoin recherche avancee (fuzzy, facettes) |
| Concurrence | Optimistic Concurrency Control (OCC) via champ `version` Prisma | Deterministe, pas de locks, compatible offline |

**CQRS — Cas d'usage concrets dans family-hub :**

1. Recapitulatif hebdomadaire — read model pre-agrege, pas de requete couteuse a la volee
2. Home Hub contextuel — read model optimise par role/moment/etat
3. Fil d'activite — projection chronologique des evenements
4. IA conversationnelle — contexte pre-agrege pour le LLM
5. Analytics / metriques business — projections dediees (DAU, retention, FAR)
6. Multi-foyer prestataire — vues agregees cross-foyer
7. Reconciliation offline — rejeu des evenements pour resolution de conflits

### API & Communication

| Decision | Choix | Rationale |
|---|---|---|
| API style | GraphQL **code-first** (`@nestjs/graphql` + `autoSchemaFile`) | Schema auto-genere depuis les decorateurs TypeScript, zero duplication SDL/resolvers, coherent avec Apollo ecosystem |
| Codegen | `graphql-codegen` | Generation hooks types Apollo Client (web/mobile) depuis le schema auto-genere |
| Real-time | GraphQL Subscriptions + `graphql-redis-subscriptions` | Unifie queries/mutations/subscriptions en un seul protocole |
| WebSocket transport | Socket.IO via `@nestjs/platform-socket.io` | Rooms par foyer, reconnexion auto mobile |
| Client GraphQL | Apollo Client (web + mobile) | Cache normalise, optimistic UI, subscriptions, offline |
| API Explorer | Apollo Studio (free tier) | Schema registry, explorer, breaking change detection, analytics |
| BFF | Non necessaire | GraphQL sert les 3 surfaces (web, mobile, kiosk) sans BFF |
| Cache serveur | Redis via Upstash (triple usage : cache + pub/sub + sessions) | Un seul service, cout maitrise |
| Kafka | Differe post-MVP | Redis Pub/Sub suffisant au lancement, migration ~1 jour documentes, Upstash Kafka serverless identifie (~1-2$/mois) |

**Workflow code-first :**

```
1. Decorateurs TypeScript (@ObjectType, @Field, @Query) = source de verite
2. NestJS auto-genere schema.gql au demarrage
3. graphql-codegen → hooks types Apollo Client (frontend uniquement)
```

**Optimistic UI :** Pleinement compatible. Apollo Client supporte nativement `optimisticResponse` sur chaque mutation. Flux : mutation optimiste → UI instantanee → serveur valide → reconciliation → subscription broadcast aux autres clients.

### Data Architecture

| Decision | Choix | Rationale |
|---|---|---|
| Modelisation | Prisma-first + conventions DDD | Schema Prisma source de verite, organise par domaine (`prismaSchemaFolder`), chaque module NestJS n'accede qu'a ses tables via repository dedie |
| Validation | Zod partage (schemas domaine dans `packages/shared`) + schemas derives par cote | Schemas de base partages (la verite du domaine), frontend et backend derivent (.extend, .pick, .omit) pour leurs besoins specifiques |
| Migrations | Prisma Migrate | Suffisant pour le projet, `$executeRaw` en escape hatch pour data migrations complexes |
| Seeding | Prisma seed natif (`prisma/seed.ts`) | Donnees realistes pour dev/test au MVP, factory pattern si besoin ulterieur |

**Philosophie de partage de code :** Dupliquer vaut mieux qu'une mauvaise abstraction. On partage dans `packages/shared` uniquement ce qui est structurellement identique. Des qu'une fonction partagee commence a diverger entre web et mobile, on la split sans hesiter.

### Authentication & Security

| Decision | Choix | Rationale |
|---|---|---|
| Authentification | Better Auth : Social OAuth (Google + Apple) + Magic Link/OTP | Simplicite maximale, zero mot de passe, zero gestion de reset |
| Sessions | Gerees par Better Auth (cookies httpOnly web, SecureStore mobile) | Pas de JWT custom, sessions 30j + rotation |
| Modele de permissions | RBAC + ABAC + ReBAC = **PBAC hybride** | Roles (4 roles) + attributs contextuels (age, temps, etat) + relations (cercles de visibilite) |
| Granularite permissions | **Instance-level** (par membre, pas par role) | Chaque enfant a sa propre fiche de permissions modifiable individuellement par un parent |
| Permissions enfants | Niveaux predefinis (Observer/Participant/Autonome) + overrides individuels par membre | Le niveau sert de preset, les overrides permettent du cas par cas. Table `MemberPermission(memberId, level, overrides, grantedBy)` |
| Autorisation NestJS | Guards NestJS + decorateurs custom (roles, permissions) | Code-first coherent : autorisations definies dans le code TypeScript via @UseGuards et decorateurs custom |
| Isolation foyer | Prisma Client Extension + `householdId` auto-injecte dans chaque requete | Zero risque d'oubli, bypass explicite `bypassHouseholdFilter()` pour les rares cas cross-foyer |
| Prestataires | Compte Better Auth avec permissions limitees + date d'expiration, meme flux auth | Tracabilite, pas de token custom |
| Chiffrement transit | TLS 1.3 (reverse proxy Cloudflare/Railway) | NFR7 |
| Chiffrement repos | AES-256 natif Supabase | NFR8 |
| Donnees sensibles | Chiffrement applicatif avec cle par foyer | Protection supplementaire pour notes medicales, etc. |
| Rate limiting | `@nestjs/throttler` par route/resolver | Protection brute force sur auth |
| DDoS / WAF | Cloudflare (free tier) devant Railway | Protection standard |

### Frontend Architecture

| Decision | Choix | Rationale |
|---|---|---|
| State management | Apollo Client (etat serveur) + Zustand (etat client local) | Apollo gere tout ce qui vient du serveur, Zustand gere theme temporel, mode kiosk, wizard onboarding, preferences UI. Zustand est ~1KB, cross-platform. |
| Navigation mobile | Expo Router | File-based routing, deep linking natif, layouts imbriques |
| Navigation web | Next.js App Router | RSC, layouts, SSR/SSG pages publiques |
| Offline mobile | **Complet** — `apollo3-cache-persist` + queue de mutations locale + OCC | Besoin reel : famille en mobilite, enfants qui valident, zones de mauvais reseau |
| Offline web | **Lecture seule** — `apollo3-cache-persist` | Quasi gratuit (une ligne de config Apollo), affiche les dernieres donnees en cache si perte de connexion |
| Resolution conflits | Last-Write-Wins par defaut + notification au user si conflit de version OCC | Deterministe, simple, le serveur rejette → client affiche le conflit |
| Partage de code | `packages/shared` pour le structurellement identique, duplication immediate des divergence | Pas de mauvaise abstraction, pas de `if (platform === 'web')` dans du code partage |
| Optimistic UI | Apollo `optimisticResponse` sur **toutes les mutations** par defaut (architecture event-driven = retour serveur rapide). Spinner uniquement si validation serveur bloquante (ex: consentement parental). | NFR1 (UI <200ms) |
| Pagination | Cursor-based pagination GraphQL | Rituels, activites, historique |
| Lazy loading | Composants lourds (chat IA, parametres) charges a la demande | Cold start <3s (NFR5) |
| Bundle mobile | Expo tree-shaking + Hermes engine | Performance mobile |
| Bundle web | Next.js automatic code splitting + RSC pages publiques | Core Web Vitals (NFR6) |
| i18n | i18next + react-i18next + expo-localization | Standard mondial, infrastructure posee des le depart meme si MVP en francais |

### Infrastructure & Deployment

**Hebergement :**

| Service | Outil | Plan | Cout/mois | Region |
|---|---|---|---|---|
| PostgreSQL + Storage + Images | Supabase | Pro | ~25$ | EU Frankfurt |
| Redis (cache + pub/sub + sessions + BullMQ) | Upstash | Fixed 250MB | ~10$ | EU Frankfurt |
| Backend NestJS | Railway | Pro | ~20-35$ | EU-West |
| Frontend Next.js | Vercel | Pro | ~20$ | Edge global |
| DNS + CDN + DDoS + WAF | Cloudflare | Free | 0$ | Global |
| Mobile builds + OTA | Expo EAS | Free → Starter | 0-19$ | Global CDN |
| CMS (marketing, blog, legal) | Strapi Cloud | Pro | ~29$ | EU |

**Observabilite :**

| Besoin | Outil | Detail |
|---|---|---|
| Crash reporting (JS + natif iOS/Android) | Sentry + `@sentry/react-native` | Standard industrie, Disney/GitHub/Cloudflare l'utilisent |
| Metrics (Prometheus) + Logs (Loki) + Dashboards | Grafana Cloud | Standard industrie, NestJS expose `/metrics` via `prom-client` |
| Load testing | k6 (Grafana Labs) | Integre ecosysteme Grafana |
| Status page | Atlassian Statuspage | Standard industrie, GitHub/Twilio/Dropbox l'utilisent |

**Product & Analytics :**

| Besoin | Outil | Detail |
|---|---|---|
| Product analytics + Feature flags + Session replay | PostHog | All-in-one moderne, 20K+ stars GitHub, free 1M events/mois |

**Communication :**

| Besoin | Outil | Detail |
|---|---|---|
| Email transactionnel (Magic Links, OTP, notifications) | Resend | API moderne, React Email pour templates dans le monorepo |
| Push notifications | Expo Notifications | Wraps APNs + FCM, gratuit, illimite |
| Queue / Jobs async | BullMQ + `@nestjs/bullmq` | Emails, recapitulatifs, exports, pipelines RGPD — utilise le Redis Upstash existant |

**CI/CD :**

| Outil | Detail |
|---|---|
| GitHub Actions | Pipeline : Push/PR → Lint + TS check → Tests → Build → Preview deploy → Merge main → Deploy prod |
| Dependabot + CodeQL + Secret Scanning | Security scanning natif GitHub, gratuit |
| SonarCloud | Code quality, code smells, couverture, duplication |

**Secrets & Environnements :**

| Outil | Detail |
|---|---|
| Doppler | Secrets management centralise, integration GitHub Actions + Railway + Vercel |
| Docker + Docker Compose | Dev local identique a la production (PostgreSQL + Redis + API) |
| GitHub Container Registry | Stockage images Docker |
| Environnements | Dev (Docker local) / Staging (Vercel Preview + Railway staging) / Production |

**Compliance :**

| Besoin | Outil |
|---|---|
| Cookie consent RGPD | Cookiebot |

**Testing :**

| Type | Outil | Detail |
|---|---|---|
| Unit + Integration | Vitest | Rapide, ESM natif, compatible monorepo Turborepo |
| API integration | Supertest | Tests HTTP/GraphQL des resolvers NestJS |
| E2E Web | Playwright | Standard industrie (Microsoft), cross-browser |
| E2E Mobile | Maestro | YAML-based, stable, excellent avec Expo, zero config native |
| Composants UI | Storybook | Developpement isole, tests visuels, documentation |
| Load testing | k6 | Tests de charge, integre Grafana Cloud |

**Strategie de scaling :**

| Phase | Infra | Declencheur |
|---|---|---|
| MVP (5-100 foyers) | Single instance NestJS, Supabase Pro, Upstash free/fixed | Lancement |
| Croissance (100-1000) | Railway usage accru, activation Redis Pub/Sub multi-instance | Free tiers depasses |
| Scale (1000-5000) | 2-3 instances NestJS (Railway auto-scale), indexation PostgreSQL optimisee, Upstash scale | Latence ou charge CPU |
| Post-5000 | Migration Kafka si event throughput le justifie, read replicas PostgreSQL, Meilisearch/Elasticsearch comme read store CQRS si queries d'agregation > 100ms | Evaluation au cas par cas |

**Cout total estime :**

| Phase | Cout mensuel |
|---|---|
| Lancement | ~105-120$ (~95-110EUR) |
| Production | ~160-190$ (~150-175EUR) |
| Scale (1000+ foyers) | ~230-290$ (~215-270EUR) |

### Decision Impact Analysis

**Sequence d'implementation :**

1. Monorepo Turborepo + pnpm (fondation)
2. Docker Compose dev local (PostgreSQL + Redis)
3. Schema Prisma initial + migrations
4. NestJS API + GraphQL code-first + Better Auth
5. Supabase + Railway + Vercel (infra de base)
6. Apollo Client + Next.js web (frontend web)
7. Expo + Apollo Client (frontend mobile)
8. Sentry + Grafana Cloud (observabilite)
9. GitHub Actions CI/CD
10. Modules metier (rituels, foyer, permissions)

**Dependances inter-decisions :**

- GraphQL code-first → schema auto-genere au demarrage, `graphql-codegen` pour les hooks Apollo Client frontend uniquement
- CQRS progressif → les modules Rituels et Activity implementent Commands/Queries/Events, les autres utilisent des services classiques
- Prisma Client Extension (householdId) → doit etre configure avant tout module metier
- Redis triple usage → un seul service Upstash sert le cache, pub/sub, sessions, et BullMQ
- Apollo Client → unifie state serveur, optimistic UI, subscriptions, et offline sur les deux frontends
- PostHog → remplace le besoin de Mixpanel (analytics) + LaunchDarkly (feature flags) + session replay en un seul outil

## Implementation Patterns & Consistency Rules

### Naming Patterns

**Database (Prisma → PostgreSQL) :**

| Element | Convention | Exemple |
|---|---|---|
| Modeles Prisma | `PascalCase` singulier | `HouseholdMember`, `Ritual`, `MemberPermission` |
| Tables PostgreSQL | `snake_case` pluriel via `@@map()` | `household_members`, `rituals`, `member_permissions` |
| Colonnes PostgreSQL | `snake_case` via `@map()` | `created_at`, `household_id`, `ritual_status` |
| Foreign keys | `referenced_table_id` | `household_id`, `member_id`, `parent_ritual_id` |
| Index | `idx_table_column` | `idx_members_email`, `idx_rituals_household_status` |

**GraphQL Schema (SDL) :**

| Element | Convention | Exemple |
|---|---|---|
| Types | `PascalCase` singulier | `Ritual`, `HouseholdMember` |
| Queries | `camelCase` | `ritual`, `rituals`, `householdMembers` |
| Mutations | `camelCase` verbe+nom | `createRitual`, `updateRitualStatus`, `deleteHouseholdMember` |
| Subscriptions | `camelCase` on+nom | `onRitualUpdated`, `onMemberStatusChanged` |
| Inputs | `PascalCase` suffixe Input | `CreateRitualInput`, `UpdateRitualStatusInput` |
| Enums | `UPPER_SNAKE_CASE` | `RITUAL_STATUS` avec valeurs `PENDING`, `COMPLETED` |
| Champs | `camelCase` | `createdAt`, `householdId`, `ritualStatus` |

**Code TypeScript :**

| Element | Convention | Exemple |
|---|---|---|
| Fichiers | `kebab-case.role.ts(x)` (dot-notation) | `ritual.service.ts`, `ritual.card.tsx`, `ritual.hooks.ts` |
| Classes | `PascalCase` | `RitualService`, `HouseholdMemberResolver` |
| Fonctions/methodes | `camelCase` | `createRitual()`, `getHouseholdMembers()` |
| Variables | `camelCase` | `ritualStatus`, `householdId` |
| Constantes | `UPPER_SNAKE_CASE` | `MAX_HOUSEHOLD_MEMBERS`, `DEFAULT_RITUAL_DURATION` |
| Interfaces/Types | `PascalCase` (pas de prefixe `I`) | `RitualStatus`, `HouseholdMember` |
| Composants React | `PascalCase` export, dot-notation fichier | `ritual.card.tsx` → `export function RitualCard()` |
| Zustand stores | `domain.store.ts` → `useDomainStore` | `theme.store.ts` → `useThemeStore` |
| Schemas Zod | `domain.schema.ts` | `ritual.schema.ts`, `household.schema.ts` |

**Convention dot-notation unifiee pour tout le monorepo** — meme convention backend (NestJS standard) et frontend, coherence maximale. Le suffixe explicite le role du fichier : `.module`, `.resolver`, `.service`, `.repository`, `.model`, `.dto`, `.guard`, `.decorator`, `.filter`, `.event`, `.command`, `.handler`, `.query`, `.card`, `.form`, `.hooks`, `.schema`, `.store`, `.spec`.

### Structure Patterns

**Organisation modules NestJS (backend) :**

```
apps/api/src/
├── modules/
│   ├── ritual/
│   │   ├── ritual.module.ts
│   │   ├── ritual.model.ts          # @ObjectType() — types GraphQL retournés
│   │   ├── ritual.dto.ts            # @InputType() — inputs GraphQL reçus
│   │   ├── ritual.resolver.ts
│   │   ├── ritual.service.ts
│   │   ├── ritual.repository.ts
│   │   ├── commands/
│   │   │   ├── create-ritual.command.ts
│   │   │   └── create-ritual.handler.ts
│   │   ├── queries/
│   │   │   ├── get-rituals.query.ts
│   │   │   └── get-rituals.handler.ts
│   │   ├── events/
│   │   │   ├── ritual-completed.event.ts
│   │   │   └── ritual-completed.handler.ts
│   │   └── __tests__/
│   │       ├── ritual.service.spec.ts
│   │       └── ritual.resolver.spec.ts
│   ├── household/
│   └── auth/
├── common/
│   ├── guards/
│   ├── decorators/
│   └── filters/
└── main.ts
```

**Organisation features frontend (web + mobile) :**

```
apps/web/src/
├── app/                        # Next.js App Router (routes)
│   ├── (auth)/
│   │   ├── login/
│   │   └── onboarding/
│   ├── (app)/
│   │   ├── dashboard/
│   │   └── rituals/
│   └── layout.tsx
├── features/                   # Logique metier par domaine
│   ├── ritual/
│   │   ├── ritual.card.tsx
│   │   ├── ritual.form.tsx
│   │   ├── ritual.list.tsx
│   │   ├── ritual.hooks.ts
│   │   └── __tests__/
│   │       └── ritual.card.spec.tsx
│   ├── household/
│   └── auth/
├── components/                 # Composants UI generiques (pas metier)
│   ├── layout/
│   └── common/
└── lib/                        # Utils, config, providers
```

**Tests — emplacement :**

| Type | Emplacement | Convention |
|---|---|---|
| Unit/Integration backend | `modules/ritual/__tests__/ritual.service.spec.ts` | Dossier `__tests__/` co-localise dans chaque module |
| Unit frontend | `features/ritual/__tests__/ritual.card.spec.tsx` | Dossier `__tests__/` co-localise dans chaque feature |
| E2E web | `apps/web/e2e/` | Dossier dedie a la racine de l'app |
| E2E mobile | `apps/mobile/e2e/` | Dossier dedie a la racine de l'app |
| Integration API | `apps/api/test/` | Dossier `test/` racine (convention NestJS) |

### Format Patterns

**Erreurs GraphQL :**

```json
{
  "errors": [{
    "message": "Ritual not found",
    "extensions": {
      "code": "RITUAL_NOT_FOUND",
      "statusCode": 404
    }
  }]
}
```

Convention codes d'erreur : `UPPER_SNAKE_CASE` avec prefixe domaine — `RITUAL_NOT_FOUND`, `HOUSEHOLD_MEMBER_LIMIT_REACHED`, `AUTH_CONSENT_REQUIRED`.

**Dates :**

| Contexte | Format |
|---|---|
| API (GraphQL) | ISO 8601 strings : `"2026-02-08T14:30:00.000Z"` |
| Base de donnees | `timestamp with time zone` (PostgreSQL natif) |
| Affichage UI | Formate via `date-fns` ou `Intl.DateTimeFormat` selon la locale |

**Conventions de donnees :**

| Element | Convention |
|---|---|
| Pagination | Relay-style : `{ edges { node, cursor }, pageInfo { hasNextPage, endCursor } }` |
| IDs | `String` (UUID v7 — ordonnables chronologiquement, generables cote client pour optimistic UI) |
| Booleans | Nommes positivement : `isActive`, `canEdit`, `hasConsent` (jamais `isNotDisabled`) |
| Nulls | `null` explicite quand nullable dans le schema GraphQL, jamais de `""` ou `0` comme substitut |

### Communication Patterns

**Events CQRS :**

| Element | Convention | Exemple |
|---|---|---|
| Classe event | `PascalCase` passe compose | `RitualCompletedEvent`, `MemberInvitedEvent` |
| Fichier | `kebab-case.event.ts` | `ritual-completed.event.ts` |
| Payload | Toujours `householdId` + `triggeredBy` + `occurredAt` | `{ ritualId, householdId, memberId, triggeredBy, occurredAt }` |
| Handler | `PascalCase` suffixe Handler | `RitualCompletedHandler` |

Exemple de reference :

```typescript
// ritual-completed.event.ts
export class RitualCompletedEvent {
  constructor(
    public readonly ritualId: string,
    public readonly householdId: string,
    public readonly memberId: string,
    public readonly triggeredBy: string,
    public readonly occurredAt: Date,
  ) {}
}
```

**GraphQL Subscriptions :**

| Element | Convention | Exemple |
|---|---|---|
| Nom subscription | `on` + `PascalCase` | `onRitualUpdated`, `onMemberStatusChanged` |
| Channel Redis | `domain:event:householdId` | `ritual:completed:uuid-1234` |

**Zustand stores :**

Un store par domaine, fichier `domain.store.ts`, hook exporte `useDomainStore`.

### Process Patterns

**Error handling :**

| Couche | Pattern |
|---|---|
| NestJS resolvers | Exceptions custom : `throw new RitualNotFoundException(id)` heritant de `NotFoundException` |
| NestJS global | `ExceptionFilter` global → formate en `{ message, extensions: { code, statusCode } }` |
| Apollo Client | `onError` link global (erreurs reseau), gestion locale par mutation (erreurs metier) |
| UI | `ErrorBoundary` par feature, toast pour erreurs non-bloquantes, page d'erreur pour erreurs fatales |

**Optimistic UI (corrige — architecture event-driven) :**

| Action | Pattern | Detail |
|---|---|---|
| Toutes les mutations | **Optimistic UI par defaut** | Architecture event-driven = retour serveur rapide (validate → persist → emit → return). L'UI se met a jour instantanement. |
| Creation | Optimistic avec UUID v7 client-side | Le client genere l'UUID, l'affiche immediatement, le serveur confirme |
| Suppression | Optimistic — retrait du cache immediat | Le serveur confirme, rollback si erreur |
| Validation bloquante | **Spinner (exception)** | Seul cas : actions necessitant une validation serveur bloquante (ex: consentement parental) |

**Retry :**

| Contexte | Pattern |
|---|---|
| Apollo Client | `RetryLink` avec backoff exponentiel (3 tentatives max) pour erreurs reseau |
| BullMQ jobs | 3 retries avec backoff exponentiel, dead letter queue apres echec |
| Offline queue | Replay sequentiel a la reconnexion, pas de retry auto sur erreur metier (conflit OCC) |

**Logging :**

| Niveau | Usage | Exemple |
|---|---|---|
| `error` | Erreur inattendue, crash, donnees corrompues | `logger.error('Ritual save failed', { ritualId, error })` |
| `warn` | Situation anormale mais geree | `logger.warn('OCC conflict detected', { ritualId, version })` |
| `info` | Evenements metier importants | `logger.info('Ritual completed', { ritualId, memberId })` |
| `debug` | Detail technique pour le debug | `logger.debug('Query executed', { query, duration })` |

Format structure JSON via `pino` (NestJS) → Grafana Loki.

### Enforcement Guidelines

**Tous les agents IA DOIVENT :**

1. Respecter la dot-notation pour tous les fichiers (`domain.role.ts(x)`)
2. Inclure `householdId` + `triggeredBy` + `occurredAt` dans chaque event CQRS
3. Utiliser les exceptions NestJS custom (jamais de `throw new Error()` brut)
4. Implementer l'optimistic UI sur toute mutation Apollo Client
5. Placer les tests dans `__tests__/` co-localise, suffixe `.spec.ts(x)`
6. Utiliser UUID v7 pour tous les IDs
7. Nommer les codes d'erreur en `UPPER_SNAKE_CASE` avec prefixe domaine
8. Logger en JSON structure via `pino` avec les niveaux definis

**Verification :**

- ESLint rules custom pour les conventions de nommage de fichiers
- CI check : pas de `throw new Error()` dans les modules (uniquement exceptions custom)
- Code review : chaque PR verifie la coherence des patterns
- SonarCloud : detection automatique des deviations de convention

## Project Structure & Boundaries

### Requirements to Modules Mapping

| Domaine FR | Module NestJS | Detail |
|---|---|---|
| Gestion Foyer & Membres (FR1-9) | `household/` + `member/` | Deux bounded contexts : foyer (creation, invitations, cercles) et membres (profils, roles, prestataires) |
| Rituels & Routines (FR10-18) | `ritual/` | CQRS actif — commands, queries, events. Moteur de recurrence, moments, micro-rituels |
| Vue & Interface Quotidienne (FR19-23) | Frontend `features/` | Pas de module backend dedie, le Home Hub consomme les queries GraphQL existantes |
| IA Conversationnelle (FR24-29) | `ai/` | Integration LLM, tool-calling, guardrails, filtrage mineurs |
| Permissions & Securite (FR30-35) | `auth/` + `common/` | Auth (Better Auth), guards, decorateurs, permissions enfants |
| Notifications (FR36-40) | `notification/` | Push (Expo Notifications), preferences, groupement par moment, BullMQ jobs |
| Donnees & Conformite (FR41-44) + Droit a l'oubli (FR52-54) | `compliance/` | Export donnees, pipeline RGPD, suppression/anonymisation |
| Offline & Sync (FR45-48) | Frontend Apollo Client | Gere par Apollo Cache persist + queue mutations + OCC Prisma |
| Admin & Ops (FR49-51) | `admin/` | Dashboard metriques, health checks |

**8 modules NestJS** : `household`, `member`, `ritual`, `ai`, `auth`, `notification`, `compliance`, `admin`.

### Complete Project Directory Structure

```
family-hub/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Lint + TS + Tests + Build
│       ├── deploy.yml                # Deploy API (Railway) → Web (Vercel) → Mobile (EAS) sequentiel
│       └── codeql.yml                # Security scanning
├── .husky/
│   ├── pre-commit                    # Lint-staged
│   └── commit-msg                    # Commitlint
├── docker/
│   ├── docker-compose.yml            # Dev local : PostgreSQL + Redis
│   └── api.Dockerfile                # Build NestJS pour Railway
│
├── apps/
│   ├── api/                          # ── NestJS Backend ──
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── schema.gql            # Auto-generated by NestJS code-first (do not edit)
│   │   │   ├── modules/
│   │   │   │   ├── household/
│   │   │   │   │   ├── household.module.ts
│   │   │   │   │   ├── household.resolver.ts
│   │   │   │   │   ├── household.service.ts
│   │   │   │   │   ├── household.repository.ts
│   │   │   │   │   ├── commands/
│   │   │   │   │   ├── queries/
│   │   │   │   │   ├── events/
│   │   │   │   │   └── __tests__/
│   │   │   │   ├── member/
│   │   │   │   │   ├── member.module.ts
│   │   │   │   │   ├── member.resolver.ts
│   │   │   │   │   ├── member.service.ts
│   │   │   │   │   ├── member.repository.ts
│   │   │   │   │   ├── member-permission.service.ts
│   │   │   │   │   └── __tests__/
│   │   │   │   ├── ritual/            # CQRS actif
│   │   │   │   │   ├── ritual.module.ts
│   │   │   │   │   ├── ritual.model.ts          # @ObjectType() — types GraphQL retournés
│   │   │   │   │   ├── ritual.dto.ts            # @InputType() — inputs GraphQL reçus
│   │   │   │   │   ├── ritual.resolver.ts
│   │   │   │   │   ├── ritual.service.ts
│   │   │   │   │   ├── ritual.repository.ts
│   │   │   │   │   ├── commands/
│   │   │   │   │   │   ├── create-ritual.command.ts
│   │   │   │   │   │   ├── create-ritual.handler.ts
│   │   │   │   │   │   ├── update-ritual-status.command.ts
│   │   │   │   │   │   └── update-ritual-status.handler.ts
│   │   │   │   │   ├── queries/
│   │   │   │   │   │   ├── get-rituals.query.ts
│   │   │   │   │   │   ├── get-rituals.handler.ts
│   │   │   │   │   │   ├── get-weekly-recap.query.ts
│   │   │   │   │   │   └── get-weekly-recap.handler.ts
│   │   │   │   │   ├── events/
│   │   │   │   │   │   ├── ritual-completed.event.ts
│   │   │   │   │   │   ├── ritual-completed.handler.ts
│   │   │   │   │   │   ├── ritual-created.event.ts
│   │   │   │   │   │   └── ritual-created.handler.ts
│   │   │   │   │   └── __tests__/
│   │   │   │   ├── ai/
│   │   │   │   │   ├── ai.module.ts
│   │   │   │   │   ├── ai.resolver.ts
│   │   │   │   │   ├── ai.service.ts
│   │   │   │   │   ├── ai.guardrails.ts
│   │   │   │   │   ├── tools/         # Tool-calling LLM
│   │   │   │   │   │   ├── ritual.tool.ts
│   │   │   │   │   │   └── household.tool.ts
│   │   │   │   │   └── __tests__/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.module.ts
│   │   │   │   │   ├── auth.resolver.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   └── __tests__/
│   │   │   │   ├── notification/
│   │   │   │   │   ├── notification.module.ts
│   │   │   │   │   ├── notification.resolver.ts
│   │   │   │   │   ├── notification.service.ts
│   │   │   │   │   ├── notification.processor.ts  # BullMQ job processor
│   │   │   │   │   └── __tests__/
│   │   │   │   ├── compliance/
│   │   │   │   │   ├── compliance.module.ts
│   │   │   │   │   ├── export.service.ts
│   │   │   │   │   ├── deletion.service.ts
│   │   │   │   │   └── __tests__/
│   │   │   │   └── admin/
│   │   │   │       ├── admin.module.ts
│   │   │   │       ├── admin.resolver.ts
│   │   │   │       ├── metrics.service.ts
│   │   │   │       └── __tests__/
│   │   │   └── common/
│   │   │       ├── guards/
│   │   │       │   ├── role.guard.ts
│   │   │       │   ├── household.guard.ts
│   │   │       │   └── parental-consent.guard.ts
│   │   │       ├── decorators/
│   │   │       │   ├── roles.decorator.ts
│   │   │       │   ├── current-user.decorator.ts
│   │   │       │   └── current-household.decorator.ts
│   │   │       ├── filters/
│   │   │       │   └── graphql-exception.filter.ts
│   │   │       ├── prisma/
│   │   │       │   ├── prisma.service.ts
│   │   │       │   └── household-extension.ts    # Prisma Client Extension (auto householdId)
│   │   │       └── logger/
│   │   │           └── pino.config.ts
│   │   ├── test/                     # Integration tests API
│   │   │   ├── app.e2e-spec.ts
│   │   │   └── helpers/
│   │   ├── nest-cli.json
│   │   ├── tsconfig.json
│   │   ├── codegen.ts                # graphql-codegen config (points to auto-generated schema.gql)
│   │   └── package.json
│   │
│   ├── web/                          # ── Next.js Frontend ──
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── globals.css
│   │   │   │   ├── (public)/         # Pages publiques SSG/ISR (contenu depuis Strapi)
│   │   │   │   │   ├── page.tsx      # Landing
│   │   │   │   │   ├── pricing/
│   │   │   │   │   ├── blog/
│   │   │   │   │   │   ├── page.tsx          # Liste articles (Strapi ISR)
│   │   │   │   │   │   └── [slug]/
│   │   │   │   │   │       └── page.tsx      # Article (Strapi SSG/ISR)
│   │   │   │   │   └── legal/
│   │   │   │   │       ├── privacy/
│   │   │   │   │       └── terms/
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── login/
│   │   │   │   │   └── onboarding/
│   │   │   │   └── (app)/            # App authentifiee
│   │   │   │       ├── layout.tsx    # Shell avec sidebar
│   │   │   │       ├── dashboard/
│   │   │   │       ├── rituals/
│   │   │   │       ├── household/
│   │   │   │       ├── settings/
│   │   │   │       └── ai/
│   │   │   ├── features/
│   │   │   │   ├── ritual/
│   │   │   │   │   ├── ritual.card.tsx
│   │   │   │   │   ├── ritual.form.tsx
│   │   │   │   │   ├── ritual.list.tsx
│   │   │   │   │   ├── ritual.hooks.ts
│   │   │   │   │   └── __tests__/
│   │   │   │   ├── household/
│   │   │   │   │   ├── household.dashboard.tsx
│   │   │   │   │   ├── member.card.tsx
│   │   │   │   │   ├── invitation.form.tsx
│   │   │   │   │   ├── household.hooks.ts
│   │   │   │   │   └── __tests__/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── login.form.tsx
│   │   │   │   │   ├── onboarding.wizard.tsx
│   │   │   │   │   └── __tests__/
│   │   │   │   ├── ai/
│   │   │   │   │   ├── chat.panel.tsx
│   │   │   │   │   ├── chat.message.tsx
│   │   │   │   │   └── __tests__/
│   │   │   │   └── notification/
│   │   │   │       ├── notification.list.tsx
│   │   │   │       ├── notification.preferences.tsx
│   │   │   │       └── __tests__/
│   │   │   ├── components/           # UI generiques (pas metier)
│   │   │   │   ├── layout/
│   │   │   │   │   ├── sidebar.tsx
│   │   │   │   │   ├── header.tsx
│   │   │   │   │   └── moment-selector.tsx
│   │   │   │   └── common/
│   │   │   │       ├── error-boundary.tsx
│   │   │   │       └── skeleton.tsx
│   │   │   └── lib/
│   │   │       ├── apollo.provider.tsx
│   │   │       ├── theme.provider.tsx
│   │   │       └── utils.ts
│   │   ├── e2e/                      # Playwright
│   │   │   ├── ritual.spec.ts
│   │   │   └── auth.spec.ts
│   │   ├── codegen.ts                # graphql-codegen config client
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── mobile/                       # ── Expo (React Native) ──
│       ├── app/                      # Expo Router (file-based)
│       │   ├── _layout.tsx
│       │   ├── (auth)/
│       │   │   ├── login.tsx
│       │   │   └── onboarding.tsx
│       │   ├── (tabs)/
│       │   │   ├── _layout.tsx
│       │   │   ├── index.tsx         # Home Hub
│       │   │   ├── rituals.tsx
│       │   │   ├── household.tsx
│       │   │   └── settings.tsx
│       │   └── (modals)/
│       │       ├── ai-chat.tsx
│       │       └── ritual-detail.tsx
│       ├── features/                 # Meme structure que web
│       │   ├── ritual/
│       │   │   ├── ritual.card.tsx
│       │   │   ├── ritual.form.tsx
│       │   │   ├── ritual.hooks.ts
│       │   │   └── __tests__/
│       │   ├── household/
│       │   ├── auth/
│       │   ├── ai/
│       │   └── notification/
│       ├── components/
│       ├── lib/
│       │   ├── apollo.provider.tsx
│       │   ├── offline.queue.ts      # Queue de mutations offline
│       │   └── push.notifications.ts
│       ├── e2e/                      # Maestro
│       │   ├── ritual-flow.yaml
│       │   └── auth-flow.yaml
│       ├── codegen.ts
│       ├── app.json
│       ├── eas.json
│       ├── tailwind.config.js        # NativeWind
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── shared/                       # Types, schemas, hooks logiques
│   │   ├── src/
│   │   │   ├── schemas/
│   │   │   │   ├── ritual.schema.ts
│   │   │   │   ├── household.schema.ts
│   │   │   │   ├── member.schema.ts
│   │   │   │   └── index.ts
│   │   │   ├── types/
│   │   │   │   ├── ritual.types.ts
│   │   │   │   ├── household.types.ts
│   │   │   │   ├── member.types.ts
│   │   │   │   ├── permissions.types.ts
│   │   │   │   └── index.ts
│   │   │   ├── constants/
│   │   │   │   ├── roles.ts
│   │   │   │   ├── moments.ts
│   │   │   │   ├── permission-levels.ts
│   │   │   │   └── index.ts
│   │   │   ├── hooks/                # Hooks logiques purs (pas UI)
│   │   │   │   ├── use-rituals.ts
│   │   │   │   ├── use-household.ts
│   │   │   │   └── use-permissions.ts
│   │   │   └── utils/
│   │   │       ├── date.utils.ts
│   │   │       └── uuid.utils.ts     # Generateur UUID v7 client-side
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── db/                           # Prisma
│   │   ├── prisma/
│   │   │   ├── schema/               # prismaSchemaFolder (par domaine)
│   │   │   │   ├── base.prisma       # Datasource + generator
│   │   │   │   ├── household.prisma
│   │   │   │   ├── member.prisma
│   │   │   │   ├── ritual.prisma
│   │   │   │   ├── notification.prisma
│   │   │   │   ├── auth.prisma
│   │   │   │   └── compliance.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── tokens/                       # Design tokens partages + generation configs Tailwind
│   │   ├── src/
│   │   │   ├── colors.ts
│   │   │   ├── typography.ts
│   │   │   ├── spacing.ts
│   │   │   ├── moments.ts            # Theming temporel (matin/midi/soir/nuit)
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── config-eslint/
│   │   └── index.js
│   └── config-ts/
│       ├── base.json
│       ├── nextjs.json
│       ├── react-native.json
│       └── nestjs.json
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── .gitignore
├── .env.example
├── .prettierrc
├── .eslintrc.js
└── commitlint.config.js
```

### Architectural Boundaries

**Dependances entre modules NestJS :**

```
household → (aucune dependance)
member → household
ritual → member, household
notification → ritual, member, household
ai → ritual, member, household (read-only via queries)
compliance → tous (acces donnees pour export/suppression)
admin → tous (read-only metriques)
auth → member, household
```

**Regle stricte d'import inter-modules :** un module ne peut jamais importer directement le repository d'un autre module. Communication inter-modules via :
1. Injection du **service** de l'autre module (queries synchrones)
2. **Events CQRS** (side effects asynchrones)

**Frontiere frontend/backend :**

```
Frontend (web/mobile)
    ↕ GraphQL (queries, mutations, subscriptions)
Backend (NestJS)
    ↕ Prisma Client (avec household extension)
Database (PostgreSQL via Supabase)
```

Aucun acces direct du frontend a la base de donnees. Tout passe par GraphQL.

### Integration Points

**Communication interne :**

| Source | Destination | Mecanisme |
|---|---|---|
| Module → Module (sync) | Service injection via NestJS DI | `RitualService` injecte `MemberService` pour verifier les permissions |
| Module → Module (async) | Events CQRS via EventBus | `RitualCompletedEvent` → `NotificationHandler` envoie un push |
| Frontend → Backend | GraphQL queries/mutations | Apollo Client → Apollo Server |
| Backend → Frontend (temps reel) | GraphQL Subscriptions via Redis | Le serveur publie, les clients souscrivent par foyer |
| Backend → Background jobs | BullMQ via Redis | `NotificationService` ajoute un job, `NotificationProcessor` l'execute |

**Integrations externes :**

| Service | Integration | Point d'entree |
|---|---|---|
| Supabase | PostgreSQL + Storage | `packages/db/` (Prisma) + Supabase SDK (storage) |
| Upstash Redis | Cache + Pub/Sub + Sessions + BullMQ | `apps/api/` config modules |
| Better Auth | Social OAuth + Magic Link | `apps/api/modules/auth/` |
| Resend | Email transactionnel | `apps/api/modules/notification/` via BullMQ |
| Expo Notifications | Push iOS/Android | `apps/api/modules/notification/` |
| LLM Provider | IA conversationnelle | `apps/api/modules/ai/` |
| Sentry | Error tracking | `apps/api/`, `apps/web/`, `apps/mobile/` |
| PostHog | Analytics + Feature flags | `apps/web/`, `apps/mobile/` |
| Strapi Cloud | CMS contenu marketing, blog, pages legales | `apps/web/src/app/(public)/` consomme l'API Strapi via Next.js ISR |
| Cloudflare | DNS + CDN + WAF | Infra (pas de code applicatif) |

### Data Flow

```
User Action (mobile/web)
    → Apollo Client mutation (optimistic UI)
    → GraphQL → NestJS Resolver
    → Guard (RBAC + ABAC + household isolation)
    → Service → Command (CQRS)
    → Command Handler → Prisma persist → Event emit
    → Response retournee au client (rapide)
    → Event Handler (async) :
        → Notification push (BullMQ)
        → Read model update (CQRS query side)
        → Subscription broadcast (Redis → GraphQL Subscription)
    → Autres clients recoivent la mise a jour (subscription)
```

**Data Flow — Contenu marketing (Strapi) :**

```
Editeur modifie contenu dans Strapi Cloud
    → Strapi webhook → Next.js On-Demand ISR revalidation
    → Page regeneree statiquement (SSG/ISR)
    → Servie depuis le CDN Vercel (rapide, SEO optimal)
```

## Architecture Validation Results

### Coherence Validation

**Compatibilite des decisions :** Toutes les technologies fonctionnent ensemble sans conflit. GraphQL code-first + Apollo Client + NestJS + Prisma + Redis forment une stack coherente de bout en bout. L'event-driven + CQRS progressif s'integre naturellement via `@nestjs/cqrs`. Strapi s'integre comme source de contenu decouple consomme par Next.js ISR.

**Consistance des patterns :** La dot-notation, les conventions CQRS (events avec householdId + triggeredBy + occurredAt), les patterns GraphQL, et la structure des tests sont coherents avec la stack. Aucune contradiction detectee.

**Alignement structure :** Les 8 modules NestJS couvrent les 10 domaines FR. La structure frontend miroir les modules backend. Les packages partages supportent le code sharing sans couplage excessif.

### Requirements Coverage

**54 Functional Requirements :** Tous couverts par les modules architecturaux definis.

| Domaine | Module(s) | Couverture |
|---|---|---|
| Gestion Foyer & Membres (FR1-9) | `household/` + `member/` | Complet |
| Rituels & Routines (FR10-18) | `ritual/` (CQRS) | Complet |
| Vue & Interface Quotidienne (FR19-23) | Frontend `features/` + Zustand | Complet |
| IA Conversationnelle (FR24-29) | `ai/` + guardrails + tools | Complet |
| Permissions & Securite (FR30-35) | `auth/` + guards + MemberPermission | Complet |
| Notifications (FR36-40) | `notification/` + BullMQ + Expo Push | Complet |
| Donnees & Conformite (FR41-44) | `compliance/` + Supabase EU + Cookiebot | Complet |
| Offline & Sync (FR45-48) | Apollo Cache persist + queue + OCC | Complet |
| Admin & Ops (FR49-51) | `admin/` + Sentry + Grafana + EAS | Complet |
| Droit a l'oubli (FR52-54) | `compliance/` (deletion + anonymisation) | Complet |

**29 Non-Functional Requirements :** Tous supportes architecturalement (performance via optimistic UI + cache, securite via PBAC + Prisma Extension + Cloudflare, scalabilite via strategie 4 phases, fiabilite via backups + OCC, accessibilite via design tokens + ShadCN, maintenabilite via modules + TS strict + CI/CD).

### Gap Analysis

**Aucun gap critique.**

**Gaps mineurs (non-bloquants, a resoudre a l'implementation) :**

| Gap | Resolution |
|---|---|
| Provider LLM non specifie | Decision differee — module `ai/` agnostique du provider |
| Streaming LLM (NFR4 TTFT <2s) | SSE endpoint dedie ou subscription GraphQL avec chunks — detail d'implementation |
| Mode kiosk (5e variante UX) | Layout Next.js dedie `(kiosk)/` ou query parameter — detail d'implementation |

### Architecture Completeness Checklist

**Requirements Analysis**

- [x] Contexte projet analyse (54 FRs, 29 NFRs)
- [x] Complexite et scale evalues
- [x] Contraintes techniques identifiees
- [x] Concerns transversaux mappes (7 identifies)

**Decisions architecturales**

- [x] Architecture globale (event-driven + CQRS progressif)
- [x] API & Communication (GraphQL code-first + subscriptions)
- [x] Data (Prisma-first + DDD conventions + Zod partage)
- [x] Auth & Security (PBAC hybride + Prisma Extension isolation)
- [x] Frontend (Apollo + Zustand + offline mobile complet)
- [x] Infrastructure (stack professionnelle complete)
- [x] CMS (Strapi Cloud pour marketing/blog)

**Patterns d'implementation**

- [x] Naming conventions (DB, GraphQL, TypeScript, dot-notation)
- [x] Structure patterns (modules NestJS, features frontend, tests)
- [x] Format patterns (erreurs, dates, pagination, IDs)
- [x] Communication patterns (events CQRS, subscriptions, stores)
- [x] Process patterns (error handling, optimistic UI, retry, logging)
- [x] Enforcement guidelines (8 regles obligatoires)

**Structure projet**

- [x] Arborescence complete (3 apps + 5 packages implementes, 4 apps + 10 packages prevus)
- [x] Boundaries modules definies
- [x] Points d'integration mappes (internes + externes + Strapi)
- [x] Data flow documente (applicatif + marketing)

### Architecture Readiness Assessment

**Statut : PRET POUR L'IMPLEMENTATION**

**Niveau de confiance : Eleve**

**Points forts :**

- Architecture coherente de bout en bout (GraphQL unifie toute la communication)
- Stack professionnelle complete avec observabilite, security scanning, et analytics
- Patterns prescriptifs pour guider les agents IA
- Strategie de scaling progressive sans changement d'architecture
- Offline mobile complet avec resolution de conflits
- CMS decouple pour le contenu marketing (SEO optimal)

**Evolutions futures documentees :**

- Redis Pub/Sub → Kafka (~1 jour via abstraction transport NestJS)
- CQRS read store → Meilisearch/Elasticsearch si PostgreSQL insuffisant post-5000 foyers
- CQRS progressif → generalise quand le besoin emerge
- Provider LLM → a choisir a l'implementation du module IA

### Architecture Evolution Process

Pour faire evoluer ce document :

| Besoin | Methode |
|---|---|
| Revoir un choix d'architecture | Relancer l'agent architecte (Winston) avec reference a ce document |
| Questions de scalabilite | Idem — domaine de l'architecte |
| Ajouter un module/integration | Discussion avec l'architecte, puis ajout dans le document |
| Petit ajustement | Edition directe dans la section concernee |

Ce document est la **source de verite architecturale**. Tout agent IA implementant du code doit s'y referer pour les decisions, patterns, et conventions.
