---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: []
workflowType: 'research'
lastStep: 1
research_type: 'technical'
research_topic: 'Outils et domaines techniques pour l écosystème family-hub'
research_goals: 'Inventaire complet des domaines techniques (MVP → v3.0+) + recommandations de stack pour le MVP — Stack de départ : NestJS, Next.js, Expo React Native'
user_name: 'Thomas'
date: '2026-02-06'
web_research_enabled: true
source_verification: true
---

# Research Report: technical

**Date:** 2026-02-06
**Author:** Thomas
**Research Type:** technical

---

## Research Overview

[Research overview and methodology will be appended here]

---

## Technical Research Scope Confirmation

**Research Topic:** Outils et domaines techniques pour l'écosystème family-hub
**Research Goals:** Inventaire complet des domaines techniques (MVP → v3.0+) + recommandations de stack pour le MVP — Stack de départ : NestJS, Next.js, Expo React Native

**Technical Research Scope:**

- Architecture & Modèle de données — graphe familial, multi-foyer, 5 cercles, permissions par rôle, architecture modulaire
- Stack d'implémentation — NestJS, Next.js, Expo React Native, base de données, ORM
- Temps réel & Synchronisation — WebSockets, synchronisation offline-first, statuts en temps réel
- IA & Conversationnel — LLM, NLP, assistant vocal, IA contextuelle, multimodale
- Infrastructure & DevOps — hébergement cloud, CI/CD, notifications push, stockage fichiers
- Sécurité & Authentification — auth multi-rôles, permissions granulaires, données familiales sensibles
- Intégrations — calendriers, assistants vocaux, géofencing, boutons physiques, N8N/Zapier
- UX & Interfaces — mode kiosque, interfaces adaptatives par âge, calm technology

**Research Methodology:**

- Current web data with rigorous source verification
- Multi-source validation for critical technical claims
- Confidence level framework for uncertain information
- Comprehensive technical coverage with architecture-specific insights

**Scope Confirmed:** 2026-02-06

---

## Technology Stack Analysis

> Analyse complète basée sur 4 recherches web parallèles couvrant 50+ sources vérifiées (février 2026).

### Langages et Frameworks

#### Backend : NestJS 11 — Excellent choix (Confiance : Très élevée)

- **Version stable :** NestJS 11.1.13 (janvier 2026) — 74 500 étoiles GitHub, 3M+ téléchargements npm/semaine
- **Architecture modulaire** parfaitement alignée avec la structure de family-hub (module rituels, module graphe familial, module IA, etc.)
- **Support natif** de GraphQL (Apollo Server v4), WebSockets, microservices
- **Guards et Interceptors** : système de sécurité déclaratif idéal pour les 5 cercles de visibilité
- **Financement** : Série A avec maintenance garantie jusqu'en 2030
- **Risque** : Surcharge potentielle pour le MVP avec une petite équipe, mais investissement payant à long terme
- _Source : [Trilon](https://trilon.io/blog/announcing-nestjs-11-whats-new), [NestJS GitHub](https://github.com/nestjs/nest)_

#### Frontend Web : Next.js 16 — Bon choix, avec réserves (Confiance : Élevée)

- **Version stable :** Next.js 16.1.6 (26 janvier 2026) avec PPR stable et Cache Components
- **PPR + Cache Components** = shell statique ultra-rapide + contenu dynamique en streaming, idéal pour le dashboard familial
- **App Router mature** : routage par dossiers parfait pour organiser les modules
- **⚠️ CVE-2025-66478 (CVSS 10.0)** : vulnérabilité critique dans les React Server Components (corrigée). Surface d'attaque encore en maturation
- **Considération** : Pour une app 100% behind-auth, un React + Vite pourrait être plus simple. Next.js se justifie pour le SSR, le SEO, et les performances du dashboard
- _Source : [Next.js Blog](https://nextjs.org/blog/next-16), [CVE-2025-66478](https://nextjs.org/blog/CVE-2025-66478)_

#### Mobile : Expo React Native SDK 54/55 — Excellent choix (Confiance : Très élevée)

- **SDK 54 stable**, SDK 55 en beta (React Native 0.83.1 + React 19.2.0)
- **New Architecture** adoptée par 83% des projets, obligatoire dans SDK 55
- **EAS Build + OTA updates** : déploiement rapide sans attendre la validation des stores
- **Détection automatique des monorepos** depuis SDK 52
- **Risque** : Certaines librairies tierces peuvent ne pas encore être compatibles New Architecture
- _Source : [Expo SDK 54](https://expo.dev/changelog/sdk-54), [Expo SDK 55 Beta](https://expo.dev/changelog/sdk-55-beta)_

#### Monorepo : Turborepo — Recommandé (Confiance : Élevée)

- Setup en ~15 min (vs 4h pour Nx), intégration naturelle avec Next.js (Vercel)
- Jusqu'à **90% du code** partageable entre web et mobile
- Templates open-source existants pour NestJS + Next.js + Expo ([nextjs-nestjs-expo-template](https://github.com/barisgit/nextjs-nestjs-expo-template))
- Structure recommandée : `apps/{api, web, mobile}` + `packages/{shared-types, shared-utils, shared-validators, ui, api-client}`
- _Source : [Wisp CMS](https://www.wisp.blog/blog/nx-vs-turborepo-a-comprehensive-guide-to-monorepo-tools)_

### Base de données et Stockage

#### PostgreSQL 18 — Choix principal (Confiance : Très élevée)

- **CTE récursives** parfaitement adaptées au graphe familial (< 1000 nœuds par famille élargie, temps de réponse < 10ms)
- **Row Level Security (RLS)** pour l'isolation multi-foyer et les 5 cercles de visibilité
- **SQL/PGQ** (PostgreSQL 18 beta) : standard SQL:2023 pour requêtes de graphe — évolution future sans changement de SGBD
- **Neo4j écarté** : l'échelle modérée du graphe familial ne justifie pas la complexité d'une base graphe dédiée
- _Source : [PostgreSQL Docs](https://www.postgresql.org/docs/current/queries-with.html), [Apache AGE](https://age.apache.org/)_

#### ORM : Prisma 6 — Recommandé (Alternative : Drizzle)

- **DX inégalée** : schema déclaratif, migrations automatiques, Prisma Studio
- **RLS via Prisma Client Extensions** pour le multi-foyer
- **$queryRaw** pour les CTE récursives du graphe familial
- **TypeORM déconseillé** pour un nouveau projet en 2026 (maintenance inégale)
- _Source : [Prisma NestJS Guide](https://www.prisma.io/docs/guides/nestjs), [Better Stack](https://betterstack.com/community/guides/scaling-nodejs/drizzle-vs-prisma/)_

#### Redis 8.x — Cache et temps réel (Confiance : Très élevée)

- **Pub/Sub** pour statut temps réel (présence, disponibilité des membres)
- **Streams** pour événements durables (notifications critiques)
- **BullMQ** (@nestjs/bullmq) pour rituels et tâches récurrentes (cron, retry, monitoring)
- **Cache** : sessions, requêtes fréquentes, cercles de visibilité pré-calculés
- _Source : [Redis 8.4 GA](https://redis.io/blog/redis-8-4-open-source-ga/), [BullMQ Docs](https://docs.bullmq.io/)_

### API : GraphQL — Fortement recommandé

- Le graphe familial avec ses 5 cercles de visibilité se traduit naturellement en requêtes GraphQL
- **Subscriptions** natives pour la synchronisation temps réel entre appareils
- **Contrôle granulaire** côté résolveur : chaque membre ne reçoit que les données auxquelles il a accès
- **Approche hybride** : GraphQL pour les requêtes complexes, REST pour auth/upload/webhooks
- Redis PubSub dès le début pour la scalabilité des subscriptions
- _Source : [NestJS GraphQL Subscriptions](https://docs.nestjs.com/graphql/subscriptions)_

### Temps réel et Communication

#### Socket.IO + NestJS + Redis Adapter (Confiance : Très élevée)

- Reconnexion automatique, fallback HTTP, rooms par famille, acknowledgements
- Architecture : rooms `/family:{id}`, `/tasks:{familyId}`, `/rituals:{familyId}`
- Redis Adapter indispensable pour le déploiement multi-instance
- **Production-ready**, open source, gratuit
- _Source : [Socket.IO Guide](https://jsdev.space/websocket-socketio/)_

#### Notifications Push : Expo Push Service (gratuit)

- Service gratuit d'Expo gérant APNs (iOS) et FCM (Android) via `expo-server-sdk-node`
- Web Push API + Service Worker pour la partie Next.js
- BullMQ pour la queue de notifications côté NestJS
- _Source : [Expo Push Notifications](https://docs.expo.dev/push-notifications/overview/)_

#### Offline-First : PowerSync (Recommandé) ou WatermelonDB

- **PowerSync** : synchronisation transparente PostgreSQL ↔ SQLite, Sync Rules configurables, SDK Expo officiel
- **WatermelonDB** : alternative open source gratuite, plus de contrôle mais sync à implémenter soi-même
- Résolution de conflits : Last-Write-Wins (suffisant pour une app familiale)
- _Source : [PowerSync](https://www.powersync.com), [WatermelonDB](https://github.com/Nozbe/WatermelonDB)_

### IA et Conversationnel

#### Vercel AI SDK 6 — Couche d'abstraction principale (Production-ready)

- Toolkit TypeScript multi-provider (OpenAI, Anthropic, Google), compatible Next.js et Expo nativement
- Streaming des réponses, tool calling, agents via Language Model v3
- LangGraph.js + NestJS pour l'orchestration des agents backend (concierge familial)
- _Source : [Vercel AI SDK 6](https://vercel.com/blog/ai-sdk-6), [Getting Started: Expo](https://ai-sdk.dev/docs/getting-started/expo)_

#### Routage multi-modèle LLM — Stratégie de coût

| Usage | Modèle recommandé | Coût estimé/famille/mois |
|---|---|---|
| Interactions simples | GPT-4o-mini / Gemini 2.5 Flash | ~$0.38 |
| Tâches complexes | GPT-5 / Claude Sonnet 4.5 | ~$5-9 |
| **Routage intelligent** | Mix rapide + puissant | **~$2-5** |

- Prompt caching (90% réduction Anthropic) + Batch API (50% réduction) pour optimiser
- _Source : [DEV Community LLM Comparison](https://dev.to/superorange0707/choosing-an-llm-in-2026-the-practical-comparison-table-specs-cost-latency-compatibility-354g)_

#### Contrôle vocal — Approche hybride

- **STT primaire** : `expo-speech-recognition` (on-device, gratuit, rapide)
- **STT premium** : Deepgram Nova-3 ($4.30/1000 min, WER 5-6%)
- **TTS primaire** : `expo-speech` (on-device, gratuit)
- **TTS premium** : ElevenLabs ($0.18-$0.30/1K caractères)
- _Source : [expo-speech-recognition](https://github.com/jamsch/expo-speech-recognition)_

### Infrastructure Cloud et DevOps

#### Hébergement : Hetzner + Coolify (~4 EUR/mois au lancement)

- **Hetzner CX22** : 2 vCPU, 4 Go RAM, 40 Go SSD — 3,79 EUR/mois
- **Coolify** : PaaS open-source (git push deploy, SSL auto, preview PRs) — gratuit
- NestJS + Next.js + PostgreSQL + Redis sur un seul serveur au lancement
- **RGPD natif** : données hébergées en Allemagne/Finlande
- _Source : [Hetzner Cloud](https://www.hetzner.com/cloud), [Coolify](https://coolify.io/)_

#### Authentification : Better Auth — Recommandé (gratuit, open-source)

- TypeScript, auto-hébergé, contrôle total des données
- Intégration NestJS via `@thallesp/nestjs-better-auth`
- Compatible PostgreSQL via Prisma, gestion de sessions par cookies
- **Alternative MVP rapide** : Clerk (10 000 MAU gratuits) avec migration prévue
- ⚠️ Lucia Auth **déprécié** depuis mars 2025
- _Source : [Better Auth](https://www.better-auth.com/), [Better Auth NestJS](https://www.better-auth.com/docs/integrations/nestjs)_

#### Stockage fichiers : Cloudflare R2 (gratuit au lancement)

- **Egress gratuit** (zéro frais de bande passante sortante) — critique pour les photos
- Tier gratuit : 10 Go, 10M opérations de lecture/mois
- API 100% compatible S3, CDN Cloudflare intégré
- 100 Go de photos : ~1,35 USD/mois
- _Source : [Cloudflare R2 Pricing](https://developers.cloudflare.com/r2/pricing/)_

#### CI/CD : GitHub Actions + Turborepo

- 2 000 minutes/mois gratuites (runners Linux)
- Builds conditionnels pour le monorepo (18 min → 4 min)
- **Builds Android** : GitHub Actions (gratuit) | **Builds iOS** : EAS Build gratuit (basse priorité)
- **EAS Update** : tier gratuit (1 000 MAU) pour les hotfixes OTA
- _Source : [GitHub Actions Monorepo](https://dev.to/pockit_tools/github-actions-in-2026-the-complete-guide-to-monorepo-cicd-and-self-hosted-runners-1jop)_

#### Monitoring : Sentry gratuit → Prometheus + Grafana

- **Lancement** : Sentry Developer (gratuit, 5 000 erreurs/mois)
- **Croissance** : + OpenTelemetry + Prometheus + Grafana auto-hébergés sur Hetzner
- _Source : [Sentry Pricing](https://sentry.io/pricing/), [NestJS Observability](https://github.com/ErickKS/nestjs-observability)_

### Géofencing : react-native-background-geolocation

- **Transistor Software** : détection de mouvement intelligente, fonctionne après redémarrage, compatible Expo via config plugin
- Licence : gratuit en dev, ~$300-500 one-time en production
- expo-location : alternative gratuite mais moins fiable en arrière-plan
- **⚠️ Confidentialité** : tracking d'enfants sensible, transparence et désactivation nécessaires
- **⚠️ App Store/Play Store** : justification claire requise pour le background location
- _Source : [Transistor Software](https://www.transistorsoft.com/shop/products/react-native-background-geolocation)_

### Mode Kiosque

- **Android** : faisabilité élevée via Lock Task Mode natif + `react-native-lock-task` (Expo dev client requis)
- **iOS/iPad** : faisabilité modérée (Guided Access limité, MDM nécessaire pour un vrai kiosque)
- **Alternative recommandée** : PWA en plein écran + Fully Kiosk Browser — potentiellement plus simple et fiable
- _Source : [Android Lock Task Mode](https://developer.android.com/work/dpc/dedicated-devices/lock-task-mode)_

### Sécurité et RGPD

- **Données d'enfants (Article 8 RGPD)** : consentement parental obligatoire pour les < 16 ans
- **RLS PostgreSQL** : isolation des données par foyer au niveau base de données
- **Chiffrement** : TLS partout (Coolify/Certbot), chiffrement au repos (Hetzner)
- **Localisation des données** : Hetzner EU = conformité RGPD native
- **Export complet** : droit à la portabilité des données (exigence RGPD)
- _Source : [GDPR Art. 8](https://gdpr-info.eu/art-8-gdpr/), [GDPR Compliance 2026](https://secureprivacy.ai/blog/gdpr-compliance-2026)_

### Technology Adoption Trends

- **Tendance "local-first"** : offline-first devient la norme pour les apps mobiles (PowerSync, ElectricSQL, WatermelonDB)
- **IA comme interface** : le paradigme conversationnel remplace les menus traditionnels (Vercel AI SDK 6, Agents LangGraph)
- **React Native New Architecture** : migration massive en cours, 83% des projets SDK 54 déjà migrés
- **Self-hosting renaissance** : Coolify, Dokploy et les PaaS open-source réduisent l'écart DX avec Vercel/Railway
- **TypeScript full-stack** : NestJS + Next.js + Expo + Prisma = typage de bout en bout sans friction

---

## Budget prévisionnel global

### Phase 1 : MVP (~4 EUR/mois)

| Service | Coût |
|---|---|
| Hetzner CX22 (tout-en-un) | 3,79 EUR |
| Cloudflare CDN + R2 | 0 EUR |
| Better Auth + PostgreSQL + Redis | 0 EUR (auto-hébergé) |
| GitHub Actions + EAS gratuit | 0 EUR |
| Sentry Developer | 0 EUR |

### Phase 2 : Croissance (~55 EUR/mois)

Séparation BDD/app, Neon PostgreSQL, Sentry Team, EAS Starter

### Phase 3 : Scale (~150 EUR/mois)

Multi-serveurs, Redis Pro, full observabilité, base de données HA

### Coût IA par famille : $0.69-2.15/mois

(LLM + STT/TTS + Redis + PowerSync, hors hébergement serveur)

---

## Rapports détaillés

Les analyses complètes avec toutes les sources sont disponibles dans :

1. `raw-agent-outputs/analyse_stack_backend_frontend_mobile_2026.md` — NestJS, Next.js, Expo, Monorepo, GraphQL, Kiosque
2. `database-storage-technologies-research-2026-02-06.md` — PostgreSQL, Neo4j, Prisma/Drizzle/TypeORM, Redis, RLS, Supabase
3. `raw-agent-outputs/rapport_technologies_ia_temps_reel_2025_2026.md` — IA/LLM, Voix, Socket.IO, Push, Offline-first, Géofencing
4. `cloud-infra-devops-auth-security-research-2026-02-06.md` — Hébergement, Auth, Stockage, CI/CD, Monitoring, RGPD

## Integration Patterns Analysis

> Analyse basée sur 3 recherches web parallèles couvrant 60+ sources (février 2026).

### API Design Patterns

#### GraphQL Code-First avec NestJS — Pattern principal

- **Architecture 3 couches** : Resolver → Service → Repository avec décorateurs TypeScript (`@ObjectType`, `@Resolver`, `@Query`, `@Mutation`)
- **DataLoader** (scope REQUEST) pour résoudre le problème N+1 sur les relations du graphe familial
- **Pagination Relay** cursor-based pour les listes (rituels, tâches, historique)
- **Guards GraphQL** : `GqlAuthGuard` + `RolesGuard` adaptés aux 5 cercles de visibilité — autorisation déclarative au niveau du résolveur
- **Approche hybride** : GraphQL pour les requêtes complexes (graphe, rituels, subscriptions) + REST pour auth, upload fichiers, webhooks
- _Source : [NestJS GraphQL Docs](https://docs.nestjs.com/graphql/quick-start)_

#### API Gateway — Backend NestJS unique (pas de BFF)

- Un seul backend NestJS servant web, mobile et kiosque via GraphQL
- **Adaptation par client** : chaque client (Expo, Next.js, kiosque) envoie des requêtes GraphQL adaptées à ses besoins (mobile léger, web riche)
- Partage de types et fragments GraphQL via packages monorepo Turborepo
- **Évolution future** : Apollo Federation si nécessité de séparer en sous-graphes (graphe familial, rituels, IA)
- _Source : [WunderGraph](https://wundergraph.com/), [NestJS Docs](https://docs.nestjs.com/)_

### Communication Protocols

#### GraphQL Subscriptions + Redis Pub/Sub — Temps réel scalable

- `graphql-redis-subscriptions` pour la scalabilité multi-instances
- **Topics structurés** par foyer et cercle de visibilité : `household:{id}:task:updated`, `family:{id}:ritual:completed`
- Combinaison Socket.IO + GraphQL Subscriptions sur un backbone Redis unique
- Sticky sessions pour la scalabilité horizontale
- _Source : [npm graphql-redis-subscriptions](https://www.npmjs.com/package/graphql-redis-subscriptions)_

#### Socket.IO — Communication bidirectionnelle

- Rooms par famille (`/family:{id}`, `/tasks:{familyId}`)
- Reconnexion automatique (critique pour le mobile), fallback HTTP
- Redis Adapter pour le déploiement multi-instance
- Événements : `task:created/updated/completed`, `ritual:started/completed`, `member:location_updated`, `ai:response_stream`
- _Source : [Socket.IO Docs](https://socket.io/docs/v4/)_

### Microservices Integration Patterns

#### Monolithe Modulaire → Microservices (migration progressive)

- **Phase 1 (MVP)** : Monolithe modulaire NestJS avec frontières strictes entre modules et couche anti-corruption
- Services publics et DTOs de transfert inter-modules (jamais d'accès direct aux repositories d'un autre module)
- **Communication événementielle** via `@nestjs/event-emitter` (EventEmitter2) en interne
- **Phase 2+** : Extraction progressive des modules en microservices via `@nestjs/microservices` (transporteurs Redis, RabbitMQ, gRPC)
- Migration réaliste sur 12+ mois, pas avant la production stable
- _Source : [DEV Community](https://dev.to/), [Level Up Coding](https://levelup.gitconnected.com/)_

#### CQRS léger avec @nestjs/cqrs

- **Commands** (écritures) et **Queries** (lectures) séparées — sans event sourcing complet
- **Sagas RxJS** pour les workflows transversaux (création de foyer = créer Household + Membre + Cercles + Permissions)
- Journal d'événements pour l'audit (boîte noire familiale) — pas un event store complet
- **Recommandation** : CQRS léger, uniquement pour les domaines complexes (graphe familial, rituels). Pas partout.
- _Source : [NestJS CQRS Docs](https://docs.nestjs.com/recipes/cqrs)_

#### BullMQ — Files d'attente et tâches récurrentes

- **Job Schedulers** (BullMQ 5.16+) avec `upsertJobScheduler` pour les rituels récurrents
- Expressions cron avec support des fuseaux horaires
- Workers dédiés pour le traitement IA asynchrone (résumés quotidiens, suggestions) avec rate limiting
- Pattern de rotation des assignations entre membres du foyer
- Dead Letter Queue + monitoring via Bull Board
- _Source : [BullMQ Docs](https://docs.bullmq.io/guide/job-schedulers), [@nestjs/bullmq](https://docs.nestjs.com/techniques/queues)_

### Event-Driven Integration

- **Interne** : `@nestjs/event-emitter` pour la communication inter-modules (EventEmitter2)
- **Externe** : Webhooks entrants/sortants avec retry (BullMQ), idempotence, signature HMAC-SHA256
- **Redis Pub/Sub** pour le broadcast temps réel aux clients connectés
- **Redis Streams** pour les événements durables nécessitant une livraison garantie (notifications critiques)
- **Pattern Publish-Subscribe** : chaque action métier (tâche créée, rituel complété) émet un événement consommé par N listeners (notifications, sync, IA, analytics)

### AI Agent Integration Patterns

#### Tool Calling avec Vercel AI SDK 6

- Outils définis via `tool()` avec schemas Zod : `addCalendarEvent`, `completeTask`, `getWeekSchedule`, `createRitual`, `getFamilyGraph`
- **Boucle multi-étapes** (`maxSteps: 10`) : le LLM peut enchaîner vérification calendrier → création événement → envoi notification
- **Structured Output** combiné avec tool calling (nouveauté SDK 6)
- Contrôleur NestJS avec `streamText` + `pipeUIMessageStreamToResponse`
- Classification des outils par niveau de risque : `read` (libre), `write` (confirmation), `destructive` (double confirmation), `critical` (parent admin uniquement)
- _Source : [Vercel AI SDK 6](https://vercel.com/blog/ai-sdk-6)_

#### Orchestration Multi-Agents avec LangGraph.js

- Architecture DAG avec `StateGraph`, nœuds et arêtes
- **Pattern Superviseur** : un agent routeur dirige vers des agents spécialisés (calendrier, tâches, rituels, graphe familial)
- `createReactAgent` avec `stateModifier` pour la spécialisation de chaque agent
- **Human-in-the-loop** via la primitive `interrupt()` de LangGraph pour les actions à risque
- _Source : [LangGraph.js Docs](https://langchain-ai.github.io/langgraphjs/)_

#### Context Engineering — 3 couches de contexte

1. **Couche persistante** : profil utilisateur, rôle, foyer, préférences, membres de la famille
2. **Couche temporelle** : date/heure, rituels du jour, événements à venir, dernières activités
3. **Couche transitoire** : historique de conversation (derniers N messages), action en cours

- Personnalisation du system prompt par rôle (parent admin, parent, adolescent, enfant)
- Fencing instructionnel XML contre les injections de prompt
- _Source : [DEV Community](https://dev.to/)_

#### Guardrails et Sécurité IA

- **Input Rails** : détection de contenu inapproprié, validation des intentions
- **Tool Rails** : matrice de permissions par rôle familial (enfant ne peut pas supprimer un foyer)
- **Output Rails** : filtrage des réponses, conformité COPPA 2025 (amendements juin 2025)
- **NeMo Guardrails** (NVIDIA) comme framework de référence pour les rails de sécurité
- _Source : [NVIDIA NeMo Guardrails](https://github.com/NVIDIA/NeMo-Guardrails)_

#### Streaming vers Mobile (Expo)

- Client Expo avec hook `useChat` du Vercel AI SDK
- Polyfills nécessaires pour Expo SDK 52+ (`web-streams-polyfill`)
- Stratégies de streaming par contexte : chat (full), voix (text-only), widget (compact), notification (résumé)
- _Source : [Vercel AI SDK Expo Getting Started](https://ai-sdk.dev/docs/getting-started/expo)_

### External Integrations (Roadmap v1.2 → v3.0+)

#### Calendriers (v1.2) — Fondation

| Fournisseur | API | Complexité | Effort |
|---|---|---|---|
| Google Calendar | REST API v3 + OAuth 2.0 | Moyenne | 2-3 semaines |
| Apple iCloud | CalDAV via `tsdav` (TypeScript) | Élevée | 3-4 semaines |
| Microsoft Outlook | Microsoft Graph API | Moyenne | 2-3 semaines |

- **Pattern Strategy** : interface `ICalendarProvider` commune, chaque fournisseur implémente
- Sync bidirectionnelle +2-3 semaines (conflits, doublons, fuseaux horaires)
- _Source : [Google Calendar API](https://developers.google.com/calendar), [tsdav](https://github.com/natelindev/tsdav)_

#### Assistants vocaux (v2.0+) — Complexité élevée

- **Alexa** : Smart Home Skill API (AWS Lambda, JSON) — exposer les entités family-hub comme "appareils virtuels"
- **Google Home** : Cloud-to-cloud API (fulfillment REST) + Local Home SDK v1.0 (2025)
- **Siri** : Shortcuts + App Intents
- Effort : 4-6 semaines par assistant
- _Source : [Alexa Smart Home](https://developer.amazon.com/en-US/alexa/devices/connected-devices/development-resources/smart-home), [Google Home Developer](https://developers.home.google.com/)_

#### Automatisation (v2.0+) — n8n recommandé

- **n8n self-hosted** : données familiales en interne, extensibilité maximale, gratuit
- Intégration via webhooks bidirectionnels entre NestJS et n8n
- Zapier comme alternative SaaS (plus simple, payant)
- _Source : [n8n](https://n8n.io/)_

#### IoT et boutons physiques (v3.0+)

- **Flic Smart Button** : via MQTT, support natif NestJS Microservices
- Mode hybride HTTP + MQTT, React Native avec `mqtt.js` et BLE
- **Protocole Matter v1.5** (nov. 2025) : couche d'interopérabilité future, pas avant v3.0+
- _Source : [Flic Developer](https://flic.io/developer), [Matter Standard](https://csa-iot.org/all-solutions/matter/)_

### Integration Security Patterns

- **OAuth 2.0 + PKCE** pour toutes les intégrations tierces (calendriers, assistants vocaux)
- **Tokens chiffrés** (AES-256) en base de données, refresh token rotation
- **Webhooks** : signature HMAC-SHA256, validation des callbacks, idempotence
- **MQTT** : MQTTS (TLS), ACL, réseau isolé pour les devices IoT
- **Scopes minimaux** : demander uniquement les permissions nécessaires à chaque intégration

---

## Rapports détaillés — Patterns d'intégration

5. `api-design-patterns-internal-communication-research-2026-02-06.md` — GraphQL code-first, monolithe modulaire, CQRS, BullMQ, API gateway
6. `external-integrations-third-party-apis-research-2026-02-06.md` — Calendriers, assistants vocaux, n8n/Zapier, webhooks, IoT/Matter
7. `raw-agent-outputs/rapport_ai_agent_patterns_tool_calling_2026.md` — Tool calling, LangGraph agents, context engineering, guardrails, streaming

## Architectural Patterns and Design

> Analyse basée sur 3 recherches web parallèles couvrant 60+ sources (février 2026).

### System Architecture Patterns

#### Monolithe Modulaire avec DDD — Architecture cible

**Bounded Contexts identifiés** (= modules NestJS) :

| Bounded Context | Responsabilité | Complexité domaine |
|---|---|---|
| **FamilyGraph** | Graphe familial, foyers, cercles, relations | Très élevée |
| **Rituals** | Rituels, tâches, routines, streaks | Élevée |
| **AIAssistant** | Interface conversationnelle, agents, tool calling | Élevée |
| **Auth** | Authentification, sessions, profils | Moyenne |
| **Notifications** | Push, in-app, email, queue | Moyenne |
| **Calendar** | Calendrier, événements, sync externe | Moyenne |
| **Circles** | Gestion des 5 cercles de visibilité | Élevée |

**Building blocks DDD** appliqués :
- **Aggregate Roots** : `Household`, `Ritual`, `Conversation` — point d'entrée pour chaque domaine
- **Entities** : `FamilyMember`, `Task`, `Occurrence` — identité propre
- **Value Objects** : `VisibilityLevel`, `TimeSlot`, `RecurrencePattern` — immutables, comparés par valeur
- **Domain Events** : `RitualCompleted`, `MemberJoinedHousehold`, `CircleChanged` — communication inter-modules

**Recommandation** : Appliquer le DDD/hexagonal uniquement aux 3 modules riches en logique métier (FamilyGraph, Rituals, AIAssistant). Les modules plus simples (Auth, Notifications) restent en architecture classique NestJS.
- _Source : [DEV Community](https://dev.to/), [NestJS Docs](https://docs.nestjs.com/)_

#### Architecture Hexagonale (Ports & Adapters) — Modules complexes uniquement

- **Ports** = interfaces TypeScript (ex: `IFamilyGraphRepository`, `ICalendarProvider`)
- **Adapters** = implémentations concrètes (ex: `PrismaFamilyGraphRepository`, `GoogleCalendarAdapter`)
- Injection de dépendances NestJS pour le binding port → adapter
- Facilite le test unitaire (mock des ports) et le remplacement d'implémentation (changer d'ORM, changer de provider calendrier)
- _Source : [Trilon Blog](https://trilon.io/blog/), [Medium](https://medium.com/)_

### Data Architecture Patterns

#### Modélisation du Graphe Familial — Approche hybride Adjacence + Arêtes typées

**Schema PostgreSQL recommandé** :

| Table | Rôle |
|---|---|
| `family_members` | Nœuds du graphe (individus) |
| `households` | Nœuds du graphe (foyers) |
| `household_memberships` | Arêtes membre ↔ foyer avec rôle par foyer |
| `family_relationships` | Arêtes typées (parent/enfant, conjoint, beau-parent, etc.) |
| `visibility_assignments` | Règles de visibilité par ressource/cercle |

- **CTE récursives** pour la traversée (ancêtres, descendants, cercles concentriques)
- Support des **familles recomposées** : membre multi-foyer, garde alternée, beau-parent
- **Performance** : < 10ms pour des graphes < 1000 nœuds avec index B-tree
- _Source : [PostgreSQL Docs](https://www.postgresql.org/docs/current/queries-with.html)_

#### Multi-Tenancy : RLS + Logique applicative hybride

- **Row-Level Security PostgreSQL** pour l'isolation par foyer actif (`household_id`)
- **Logique applicative** pour les cercles transversaux (famille élargie, connaissances) qui traversent plusieurs foyers
- Middleware NestJS injecte `app.current_user_id` et `app.current_household_id` via `set_config`
- Guard `@HouseholdContext()` sur chaque resolver GraphQL
- _Source : [Crunchy Data](https://www.crunchydata.com/blog/row-level-security-for-tenants-in-postgres), [AWS Multi-tenant RLS](https://aws.amazon.com/blogs/database/multi-tenant-data-isolation-with-postgresql-row-level-security/)_

#### Feature Flags par Foyer

- Implémentation custom : Guard global + décorateur `@RequireFeature('ai_assistant')` + cache Redis
- Table `household_features` en base (foyer_id, feature_key, enabled, plan_tier)
- Aligné avec le business model freemium (modules activables par palier)
- Features planifiées : `ai_assistant`, `advanced_rituals`, `calendar_sync`, `geofencing`, `gamification`, `family_extended`
- _Source : [Unleash](https://www.getunleash.io/), [ConfigCat](https://configcat.com/)_

### Scalability and Performance Patterns

#### Scaling progressif

| Phase | Familles | Infrastructure | Coût |
|---|---|---|---|
| **1 - Fondations** | 0-500 | Hetzner CAX11, PM2 dans Docker, tout-en-un | ~4 EUR/mois |
| **2 - Optimisation** | 500-1 000 | Hetzner CAX21, Fastify, PgBouncer, cache Redis | ~7 EUR/mois |
| **3 - Scaling vertical** | 1 000-5 000 | Hetzner CX32+, Docker replicas, PostgreSQL dédié | ~10 EUR/mois |
| **4 - Scaling horizontal** | 5 000-10 000+ | Multi-serveur, load balancer, Redis cluster | ~15 EUR/mois |

#### Stratégie de cache Redis — 3 couches

1. **DataLoader** (request-scoped) : résolution du problème N+1 — réduit 50 requêtes à 2
2. **Cache Redis resolver-level** : TTL par type (graphe familial 5 min, rituels 30 sec, profils 15 min)
3. **Cache de réponse GraphQL** : pour les requêtes publiques/statiques

- Impact estimé : temps de réponse 200-500ms → 10-30ms (cache hit)
- Politique d'éviction : `allkeys-lfu` avec `maxmemory 256mb`

#### Performance NestJS

- **Fastify** recommandé en Phase 2 : 50 000 req/s vs 17 000 avec Express (x2.9)
- **Connection pooling** : Prisma natif (Phase 1) → PgBouncer mode transaction (Phase 2+)
- **Persisted queries** GraphQL en production (whitelisting des requêtes autorisées)
- **Complexity limiting** + **depth limiting** sur les requêtes GraphQL
- _Source : [NestJS Performance](https://docs.nestjs.com/techniques/performance), [BullMQ](https://docs.bullmq.io/)_

#### Déploiement Zero-Downtime

- **Rolling update Docker** via Coolify (recommandé)
- **Graceful shutdown** NestJS avec `enableShutdownHooks()` — fermer les connexions WebSocket, drainer les queues BullMQ
- **Migrations backward-compatible** : pattern expand-contract (ajouter colonne → migrer données → supprimer ancienne)
- _Source : [Coolify Docs](https://coolify.io/docs/), [NestJS Lifecycle Events](https://docs.nestjs.com/fundamentals/lifecycle-events)_

### Security Architecture Patterns

#### Durcissement NestJS (OWASP Top 10:2025)

- **Validation des entrées** : `class-validator` + `class-transformer` sur tous les DTOs
- **Rate limiting** : `@nestjs/throttler` avec limites par endpoint (auth plus strict)
- **Headers de sécurité** : Helmet (CSP, HSTS, X-Frame-Options)
- **Gestion des secrets** : `@nestjs/config` avec validation Joi au démarrage
- **CORS strict** : origines autorisées explicites
- _Source : [NestJS Security](https://docs.nestjs.com/security/helmet), [OWASP](https://owasp.org/Top10/)_

#### Sécurité GraphQL — 5 mécanismes

1. **Depth limiting** : `graphile/depth-limit` (max 7 niveaux pour le graphe familial)
2. **Complexity analysis** : `graphql-query-complexity` (coût par champ, max 1000 points)
3. **Rate limiting GraphQL** : `@nestjs/throttler` adapté aux mutations
4. **Persisted queries** : trusted documents en production (whitelisting)
5. **Introspection désactivée** en production
- _Source : [GraphQL Security Best Practices](https://graphql.org/learn/security/)_

#### Autorisation — CASL (RBAC + ABAC hybride)

- **CASL** recommandé pour family-hub : combine RBAC (rôles) et ABAC (attributs dynamiques = cercle, foyer)
- **7 rôles** : Super Admin, Parent Admin, Parent, Adolescent, Enfant, Invité, Prestataire
- **Conditions dynamiques** par foyer et cercle de visibilité
- **Défense en profondeur** : CASL (couche applicative) + PostgreSQL RLS (couche base de données)
- _Source : [CASL.js](https://casl.js.org/v6/en/), [NestJS Authorization](https://docs.nestjs.com/security/authorization)_

#### Conformité RGPD Article 8 (Enfants)

- **Consentement parental vérifiable** obligatoire pour les < 16 ans
- **Profils enfants** : cercle de visibilité par défaut le plus restrictif
- **Consentements granulaires** : localisation, santé, photos — chacun indépendant
- **Droit à l'effacement** : suppression complète du compte et données associées
- **Export portable** : format JSON structuré (droit à la portabilité)
- **Audit des accès** : qui a consulté quoi, quand (exigence RGPD)
- _Source : [GDPR Art. 8](https://gdpr-info.eu/art-8-gdpr/), [EU Children's Data Privacy 2025](https://www.gdprregister.eu/gdpr/eu-childrens-data-privacy-2025-7-changes/)_

#### Chiffrement des données sensibles

| Type de donnée | Méthode | Outil |
|---|---|---|
| Données de santé (fiche médicale) | Chiffrement colonne | `pgcrypto` (AES-256) |
| Localisations GPS | Chiffrement applicatif | `aes-256-gcm` (Node.js) |
| Photos (métadonnées) | Chiffrement au repos | Cloudflare R2 (natif) |
| Mots de passe | Hashage | argon2 |
| Tokens OAuth | Chiffrement colonne | AES-256 en base |

- Gestion des clés via dérivation par foyer (HKDF)
- _Source : [PostgreSQL pgcrypto](https://www.postgresql.org/docs/current/pgcrypto.html)_

#### Audit Logging

- Table PostgreSQL immutable et partitionnée par mois
- Service NestJS asynchrone via EventEmitter2 (pas de blocage des requêtes)
- Intercepteur global pour les opérations mutantes (mutations GraphQL, REST POST/PUT/DELETE)
- **11 événements d'audit** spécifiques : accès profil enfant, modification permissions, suppression données, export, changement de foyer, etc.
- Masquage des données sensibles dans les logs eux-mêmes (conformité RGPD des logs)
- _Source : [NestJS Interceptors](https://docs.nestjs.com/interceptors)_

### Deployment and Operations Architecture

```
Phase 1 (MVP) :
┌──────────────────────────────────────┐
│  Hetzner CAX11 (~4 EUR/mois)        │
│  ┌──────────┐ ┌──────────┐          │
│  │ NestJS   │ │ Next.js  │          │
│  │ (PM2)    │ │ (Docker) │          │
│  └──────────┘ └──────────┘          │
│  ┌──────────┐ ┌──────────┐          │
│  │PostgreSQL│ │  Redis   │          │
│  └──────────┘ └──────────┘          │
│  Coolify (orchestration)             │
└──────────────────────────────────────┘
          ↓ Cloudflare CDN

Phase 3+ (Scale) :
┌─────────┐ ┌─────────┐ ┌─────────┐
│ NestJS  │ │ NestJS  │ │ Next.js │
│ Replica │ │ Replica │ │ (Docker)│
└─────────┘ └─────────┘ └─────────┘
     ↑ Load Balancer (Traefik)
┌─────────┐ ┌──────────────┐
│  Redis  │ │ PostgreSQL   │
│ Cluster │ │ (PgBouncer)  │
└─────────┘ └──────────────┘
```

---

## Rapports détaillés — Patterns architecturaux

8. `raw-agent-outputs/rapport_architecture_systeme_DDD_patterns_2026.md` — DDD, hexagonal, multi-tenancy, graphe familial, feature flags
9. `raw-agent-outputs/rapport_scalabilite_performance_deploiement_2026.md` — Scaling, connection pooling, cache, Coolify, zero-downtime
10. `raw-agent-outputs/rapport_securite_architecture_protection_donnees_2026.md` — OWASP, GraphQL security, RGPD, CASL, chiffrement, audit

## Implementation Approaches and Technology Adoption

> Analyse basée sur 2 recherches web parallèles couvrant 40+ sources (février 2026).

### Development Workflows and Tooling

#### Monorepo Turborepo — Workflow quotidien

- **Namespace** : `@family/api`, `@family/web`, `@family/mobile`, `@family/shared-types`
- **pnpm workspaces** + `turbo.json` avec pipelines : `build`, `dev`, `test`, `lint`, `db:migrate`
- **Dev parallèle** : `turbo dev` lance NestJS + Next.js + Expo simultanément
- Expo détecte automatiquement le monorepo depuis SDK 52 (pas de config Metro manuelle)
- _Source : [Turborepo Docs](https://turbo.build/repo/docs)_

#### Code Quality — Biome 2.x (remplace ESLint + Prettier)

- **Biome** recommandé : 10-25x plus rapide qu'ESLint+Prettier, 1 outil au lieu de 3-4
- Support natif monorepo, configuration root + overrides par package
- **Husky + lint-staged** pour les pre-commit hooks
- _Source : [Biome](https://biomejs.dev/)_

### Testing and Quality Assurance

#### Pyramide de tests pragmatique (développeur solo)

| Niveau | Proportion | Outils | Priorité |
|---|---|---|---|
| **Tests d'intégration** | 50-60% | Vitest + supertest + Testcontainers | P0 — Meilleur ROI |
| **Tests unitaires** | 30-40% | Vitest (logique métier pure) | P1 — Services/Value Objects |
| **Tests E2E** | 5-10% | Supertest (parcours critiques) | P2 — Pre-release seulement |
| **Tests mobile** | Au besoin | Jest + @testing-library/react-native | P3 — Post-v1 |

#### Choix des outils de test

- **Vitest** pour NestJS et Next.js : 4x plus rapide que Jest en cold run, 10x en watch mode
- **Jest** conservé pour Expo (écosystème officiel `jest-expo`)
- **Testcontainers** avec PostgreSQL pour les tests d'intégration base de données
- **Detox (E2E mobile)** : reporté post-v1 (pas officiellement supporté par Expo, feedback lent)
- Cohabitation Vitest + Jest via Turborepo (chaque app a son runner)
- _Source : [Vitest](https://vitest.dev/), [Testcontainers](https://testcontainers.com/)_

#### Plan d'investissement testing

| Phase | Effort | Contenu |
|---|---|---|
| Phase 0 (1-2 jours) | Setup | Biome + Husky + lint-staged + config Vitest/Jest |
| Phase 1 (2-3 jours) | Infrastructure | Testcontainers, factories, fixtures |
| Phase 2 (continu) | +20-30% par feature | Tests au fil du développement |
| Phase 3 (pre-release) | 2-3 jours | E2E parcours critiques + stress tests |

### Technology Adoption Strategy

#### Approche incrémentale — Web-first

**Recommandation forte** : livrer le MVP en **web-first** (Next.js + NestJS) puis ajouter le mobile (Expo).

**Justification** :
- Réduit la complexité initiale de 40% (pas de gestion App Store/Play Store au lancement)
- Permet de valider le produit plus vite (12-14 semaines vs 20-24)
- Le mobile partage 90% du code via le monorepo Turborepo
- Next.js fonctionne sur mobile via le navigateur en attendant l'app native

#### Feuille de route d'implémentation réaliste

| Phase | Durée | Contenu | Livrables |
|---|---|---|---|
| **1 — Fondations** | Semaines 1-4 | Monorepo, auth, modèle de données, GraphQL de base | Squelette technique fonctionnel |
| **2 — MVP Core** | Semaines 5-10 | Rituels/tâches, colonnes par membre, statut temps réel, vue kiosque | App web fonctionnelle (beta privée) |
| **3 — Polish** | Semaines 11-14 | Tests, sécurité, performance, déploiement production | **MVP web lancé** |
| **4 — Mobile** | Semaines 15-20 | Expo React Native, push notifications, offline-first | App mobile sur stores |
| **5 — IA** | Semaines 21-26+ | Interface conversationnelle, tool calling, voix | v1.3 avec IA |

**Note importante** : PostgreSQL 18 est encore en développement. Utiliser **PostgreSQL 16 ou 17** en production. Les CTE récursives et RLS sont disponibles depuis longtemps.

### Team Organization and Skills

#### Montée en compétences — Parcours développeur solo

| Compétence | Niveau actuel | Cible | Urgence | Ressource |
|---|---|---|---|---|
| NestJS (modules, DI, guards) | Intermédiaire | Senior | Critique | Docs officielles + cours Trilon |
| GraphQL (schema, resolvers, subscriptions) | Débutant → Inter. | Inter. avancé | Critique | NestJS GraphQL Docs |
| PostgreSQL (CTE, RLS, tuning) | Intermédiaire | Avancé | Haute | PostgreSQL Docs + exercises |
| Prisma (migrations, extensions, raw SQL) | Débutant → Inter. | Intermédiaire | Haute | Prisma Docs |
| Expo React Native | Débutant | Intermédiaire | Moyenne (Phase 4) | Expo Docs + tutoriels |
| Vercel AI SDK / LangGraph | Débutant | Intermédiaire | Basse (Phase 5) | AI SDK Docs |

#### Stratégie d'apprentissage

- **Learn by building** : chaque feature du MVP développe les compétences correspondantes
- **Documentation-driven** : lire les docs officielles avant les tutoriels tiers
- **AI-assisted** : utiliser Claude/ChatGPT pour le pair programming et le code review

### Cost Optimization and Resource Management

#### Budget par phase

| Phase | Infra | Services | LLM/IA | Total mensuel |
|---|---|---|---|---|
| **MVP (0-500 familles)** | 4 EUR (Hetzner) | 0 EUR (tiers gratuits) | 0 EUR | **~4 EUR** |
| **Croissance (500-1K)** | 7 EUR | ~30 EUR (Sentry, EAS) | ~50 EUR | **~87 EUR** |
| **Scale (1K-5K)** | 10 EUR | ~60 EUR | ~500 EUR | **~570 EUR** |
| **Scale+ (5K-10K)** | 15 EUR | ~100 EUR | ~1 500 EUR | **~1 615 EUR** |

#### Optimisations clés

- **Tiers gratuits** au maximum : Cloudflare (CDN+R2), GitHub Actions, Sentry Developer, EAS gratuit, Expo Push
- **LLM** : routage intelligent multi-modèle (modèle cheap pour 80% des interactions)
- **Cache agressif** : Redis 3 couches pour réduire les requêtes DB et API
- **Pas d'optimisation prématurée** : upgrader l'infra quand les métriques le justifient

### Risk Assessment and Mitigation

#### Top 5 des risques critiques

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| **Burnout développeur solo** | Élevée | Critique | MVP minimal strict, releases fréquentes, temps de pause planifiés |
| **Over-engineering** | Élevée | Élevé | YAGNI strict, DDD seulement sur 3 modules, pas de microservices avant 12+ mois |
| **Scope creep** | Élevée | Élevé | Brainstorm déjà fait (172 idées classées), s'en tenir au MVP défini |
| **Sécurité données familiales** | Moyenne | Critique | RLS dès le jour 1, RGPD intégré dans l'architecture, audit logging |
| **Coûts LLM imprévus** | Moyenne | Moyen | Limites par famille, routage multi-modèle, cache de prompts |

#### Pièges à éviter (top 5)

1. **Ne pas tester la base de données** → Testcontainers dès le début
2. **Monorepo mal configuré** → Suivre un template existant (nextjs-nestjs-expo-template)
3. **Providers request-scoped partout** → Privilégier les singletons (performance NestJS)
4. **Migrations destructives** → Pattern expand-contract obligatoire
5. **Pas de backups** → Backup PostgreSQL automatisé vers R2 dès le jour 1

## Technical Research Recommendations

### Implementation Roadmap — Résumé

```
Semaines 1-4:   FONDATIONS (monorepo, auth, DB, GraphQL)
Semaines 5-10:  MVP CORE (rituels, colonnes, temps réel, kiosque)
Semaines 11-14: POLISH & LAUNCH (tests, sécu, perf, déploiement)
                ──── MVP WEB LANCÉ ────
Semaines 15-20: MOBILE (Expo, push, offline-first)
Semaines 21-26: IA (conversationnel, voix, agents)
                ──── v1.3 AVEC IA ────
```

### Technology Stack Recommendations — Récapitulatif final

| Couche | Technologie | Version | Confiance |
|---|---|---|---|
| **Backend** | NestJS | 11.x | Très élevée |
| **Frontend Web** | Next.js | 16.x | Élevée |
| **Mobile** | Expo React Native | SDK 54 | Très élevée |
| **Monorepo** | Turborepo + pnpm | Latest | Élevée |
| **API** | GraphQL (code-first) | Apollo v4 | Très élevée |
| **BDD** | PostgreSQL | 16 ou 17 (prod) | Très élevée |
| **ORM** | Prisma | 6.x | Élevée |
| **Cache/Temps réel** | Redis + Socket.IO | 8.x / 4.x | Très élevée |
| **Queues** | BullMQ | 5.x | Élevée |
| **Auth** | Better Auth | Latest | Élevée |
| **IA** | Vercel AI SDK + LangGraph | 6.x | Production-ready |
| **Hébergement** | Hetzner + Coolify | — | Élevée |
| **CDN/Stockage** | Cloudflare + R2 | — | Élevée |
| **CI/CD** | GitHub Actions | — | Mature |
| **Monitoring** | Sentry | Free tier | Mature |
| **Tests** | Vitest + Jest + Testcontainers | — | Mature |
| **Linting** | Biome | 2.x | Élevée |

### Success Metrics and KPIs

| Phase | Métrique | Objectif |
|---|---|---|
| **MVP** | Temps de livraison | ≤ 14 semaines |
| **MVP** | Couverture de tests | ≥ 60% (intégration) |
| **MVP** | Temps de réponse API P95 | < 200ms |
| **MVP** | Coût infra mensuel | < 10 EUR |
| **Post-launch** | Familles actives (beta) | 10-50 |
| **v1.0** | Uptime | > 99.5% |
| **v1.3** | Coût IA par famille | < 5 EUR/mois |
| **Scale** | Familles supportées | 10 000+ |

---

## Rapports détaillés — Implémentation

11. `dev-workflows-testing-code-quality-research-2026-02-06.md` — Workflows Turborepo, testing pyramid, Biome, Vitest/Jest, Testcontainers
12. `implementation-roadmap-risks-skills-costs-research-2026-02-06.md` — Roadmap, montée en compétences, coûts, risques, checklist pre-launch

---

## Conclusion

Cette recherche technique couvre l'ensemble de l'écosystème family-hub, du brainstorm initial (172 idées) jusqu'aux recommandations d'implémentation concrètes. **12 rapports détaillés** ont été produits, couvrant 200+ sources web vérifiées.

**Les 3 insights clés :**

1. **La stack NestJS + Next.js + Expo + Turborepo est solide et validée** — templates existants, communauté active, intégration prouvée
2. **L'approche web-first en 14 semaines est la plus pragmatique** — livrer vite, valider le produit, ajouter le mobile ensuite
3. **Le coût d'infrastructure est remarquablement bas** (~4 EUR/mois au lancement) grâce à l'approche Hetzner + Coolify + tiers gratuits

**Recherche technique complétée le 2026-02-06.**
