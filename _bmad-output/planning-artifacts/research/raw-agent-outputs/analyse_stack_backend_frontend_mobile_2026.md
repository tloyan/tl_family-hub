# Analyse de Stack Technique : Backend + Frontend + Mobile pour family-hub

**Date :** 2026-02-06
**Contexte :** Application family-hub -- plateforme de gestion familiale avec rituels/taches, graphe familial (multi-foyer, 5 cercles de visibilite), synchronisation temps reel, interface IA conversationnelle, mode kiosque, et architecture modulaire.
**Stack etudiee :** NestJS (backend) + Next.js (web) + Expo React Native (mobile)

---

## Table des matieres

1. [NestJS -- Backend](#1-nestjs--backend)
2. [Next.js -- Frontend Web](#2-nextjs--frontend-web)
3. [Expo React Native -- Mobile](#3-expo-react-native--mobile)
4. [Architecture Monorepo](#4-architecture-monorepo)
5. [Strategie API : GraphQL vs REST pour le temps reel](#5-strategie-api--graphql-vs-rest-pour-le-temps-reel)
6. [Mode Kiosque avec React Native](#6-mode-kiosque-avec-react-native)
7. [Synthese et recommandations](#7-synthese-et-recommandations)

---

## 1. NestJS -- Backend

### Version actuelle et statut

- **Version stable :** NestJS 11.1.13 (janvier 2026)
- **NestJS 11** a ete publie en janvier 2025 avec des ameliorations majeures ([Trilon -- Announcing NestJS 11](https://trilon.io/blog/announcing-nestjs-11-whats-new))
- **Cycle de releases :** Mises a jour regulieres, version mineure environ tous les 2-3 mois
- **Financement :** L'equipe NestJS a obtenu un financement Series A avec un engagement de maintenance jusqu'en 2030 minimum

### Sante de l'ecosysteme

| Metrique | Valeur |
|---|---|
| Etoiles GitHub | ~74 500 |
| Telechargements npm hebdomadaires | > 3 millions |
| Taux de reponse aux issues | 92% |
| Mainteneurs actifs | Equipe core + communaute importante |

L'ecosysteme NestJS est l'un des plus riches du monde Node.js avec des packages officiels pour : GraphQL (`@nestjs/graphql`), WebSockets (`@nestjs/websockets`), microservices (`@nestjs/microservices`), TypeORM, Prisma, et bien d'autres.

Sources : [NestJS GitHub](https://github.com/nestjs/nest), [NestJS npm](https://www.npmjs.com/package/@nestjs/core), [Leapcell -- NestJS in 2025](https://leapcell.io/blog/nestjs-2025-backend-developers-worth-it)

### Fonctionnalites cles de NestJS 11

- **Logging JSON natif :** Support integre pour la journalisation JSON, formatage ameliore des objets imbriques
- **Ameliorations microservices :** Meilleure fiabilite pour NATS, Kafka, Redis ; nouvelle methode `unwrap()` pour acces direct au client sous-jacent
- **Performance au demarrage :** Refonte de la generation des cles opaques des modules (references d'objets au lieu de hashing), amelioration significative pour les grandes applications
- **GraphQL :** Support Apollo Server v4
- **IntrinsicException :** Nouvelle classe pour les exceptions qui contournent le logging automatique
- **ParseDatePipe :** Validation simplifiee des dates dans les requetes
- **Compatibilite :** Alignement avec les dernieres versions d'Express et Fastify

Source : [Medium -- NestJS 11 New Features](https://medium.com/@atillataha/nestjs-11-new-features-and-examples-fb648ab797dc)

### Benchmarks de performance

Lors de tests de benchmarks en 2024 :
- **QPS (Queries Per Second)** sur instance unique : ~8 500 (Express pur : ~9 200, soit seulement 8% de difference)
- **Consommation memoire :** 15% superieure a Express, mais environ 5x inferieure a Spring Boot
- **Scalabilite horizontale :** Supporte le clustering automatique avec croissance lineaire des performances

Pour 95% des applications d'entreprise, cette legere difference de performance est largement compensee par l'amelioration de la productivite de developpement.

Source : [Leapcell -- NestJS in 2025](https://leapcell.io/blog/nestjs-2025-backend-developers-worth-it)

### Forces pour family-hub

1. **Architecture modulaire native :** Le systeme de modules, controleurs et services de NestJS correspond parfaitement a la structure modulaire souhaitee (module rituels, module graphe familial, module IA, etc.)
2. **Support GraphQL de premier ordre :** `@nestjs/graphql` avec decorateurs TypeScript, ideal pour le modele de donnees en graphe familial
3. **WebSockets integres :** `@nestjs/websockets` et Gateway pattern pour la synchronisation temps reel entre appareils
4. **Microservices progressifs :** Possibilite de commencer en "Monolithe Modulaire" puis d'evoluer vers des microservices sans changer de framework (Redis, RabbitMQ, Kafka, gRPC)
5. **Injection de dependances :** Facilite les tests unitaires et l'inversion de controle, crucial pour une application complexe
6. **Guards et Interceptors :** Systeme de securite declaratif ideal pour les 5 cercles de visibilite du graphe familial
7. **TypeScript natif :** Typage fort de bout en bout, partage de types avec le frontend

### Faiblesses et risques pour family-hub

1. **Surcharge pour le MVP :** La rigueur architecturale de NestJS peut ralentir les premieres iterations si l'equipe est petite
2. **Courbe d'apprentissage :** Les concepts (decorateurs, DI, modules) demandent une periode d'adaptation pour les developpeurs venant d'Express pur
3. **Overhead runtime :** Le layer d'abstraction ajoute une latence marginale par rapport a Express/Fastify pur (non significatif pour family-hub)
4. **Dependance a l'ecosysteme NestJS :** Certaines integrations tierces peuvent etre en retard par rapport a l'ecosysteme Express generique

### Feuille de route future

- **2026 :** Support WebAssembly natif pour les taches intensives en calcul
- **2027 :** Chaine d'outils de developpement assistee par IA

Source : [NestJS in 2026 -- Gold Standard](https://tyronneratcliff.com/nestjs-for-scaling-backend-systems/), [DEV -- 2025 and NestJS](https://dev.to/leapcell/2025-and-nestjs-a-match-made-for-modern-backend-needs-51jm)

---

## 2. Next.js -- Frontend Web

### Version actuelle et statut

- **Version stable :** Next.js 16.1.6 (26 janvier 2026)
- **Next.js 16** a ete publie fin 2025 avec PPR (Partial Pre-Rendering) stable et Cache Components
- **Next.js 16.1** (18 decembre 2025) : Turbopack File System Caching stable, Bundle Analyzer experimental
- **Maintenu par :** Vercel (financement important, equipe dediee)

Source : [Next.js 16 Blog](https://nextjs.org/blog/next-16), [Next.js 16.1 Blog](https://nextjs.org/blog/next-16-1)

### Sante de l'ecosysteme

Next.js est le framework React le plus utilise au monde. Il beneficie :
- D'un soutien financier massif de Vercel
- D'une communaute enorme (le repo GitHub est l'un des plus actifs de l'ecosysteme JavaScript)
- D'une adoption par des entreprises majeures (Netflix, Uber, TikTok, etc.)
- De l'integration native avec React 19+ et les React Server Components

### Fonctionnalites cles de Next.js 16

- **Cache Components (stable) :** Nouveau modele de programmation utilisant PPR et `use cache` pour une navigation instantanee. Permet de melanger contenu statique, cache et dynamique dans une seule route
- **Partial Pre-Rendering (PPR) stable :** Plus de flag experimental ; pre-rendu en shell HTML statique envoye immediatement, avec contenu dynamique qui met a jour l'UI au fur et a mesure
- **Turbopack stable pour le dev :** Cache sur disque des artefacts de compilation, temps de compilation significativement plus rapides au redemarrage
- **App Router mature :** Routeur base sur le systeme de fichiers exploitant React Server Components, Suspense, Streaming et Server Functions
- **Server Components par defaut :** Les composants tournent sur le serveur sans JavaScript cote client, reduisant la taille des bundles

Source : [Next.js 16 Blog](https://nextjs.org/blog/next-16), [Strapi -- Next.js 16 Features](https://strapi.io/blog/next-js-16-features), [LogRocket -- Next.js 16](https://blog.logrocket.com/next-js-16-whats-new/)

### Alerte securite critique (decembre 2025)

**CVE-2025-66478 (CVSS 10.0) :** Vulnerabilite critique dans le protocole React Server Components permettant l'execution de code a distance. Toutes les versions Next.js 15.x et 16.x etaient affectees.

Correctifs disponibles :
- `next@14.2.35` pour la branche 14.x
- `next@15.0.7` pour la branche 15.0.x
- `next@16.0.10` pour la branche 16.0.x

**Vulnerabilites supplementaires :**
- CVE-2025-55184 (Deni de Service, severite haute)
- CVE-2025-55183 (Exposition de code source, severite moyenne)

**Note :** Seules les applications utilisant les React Server Components avec l'App Router sont affectees. Les applications Pages Router ne sont pas concernees.

Sources : [Next.js Security Update](https://nextjs.org/blog/security-update-2025-12-11), [CVE-2025-66478](https://nextjs.org/blog/CVE-2025-66478), [React Critical Vulnerability](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components), [Microsoft Security Blog](https://www.microsoft.com/en-us/security/blog/2025/12/15/defending-against-the-cve-2025-55182-react2shell-vulnerability-in-react-server-components/)

### Forces pour family-hub

1. **Rendu hybride :** PPR + Cache Components = tableau de bord familial avec shell statique ultra-rapide et donnees dynamiques en streaming
2. **Server Components :** Ideal pour les pages de consultation du graphe familial (moins de JS cote client, meilleures performances)
3. **App Router :** Routage par dossiers parfait pour organiser les modules (rituels, graphe, parametres, IA)
4. **SEO / Partage :** Si des parties de l'app doivent etre publiques (invitations, partage de photos), le SSR est un atout
5. **Ecosystem Vercel :** Deploiement simplifie, preview deployments pour chaque branche
6. **TypeScript natif :** Typage de bout en bout avec NestJS et Expo

### Faiblesses et risques pour family-hub

1. **Complexite du modele de cache :** Le nouveau systeme Cache Components + PPR + `use cache` demande une comprehension fine ; risque de bugs subtils de cache/revalidation
2. **Dependance Vercel :** Bien que deployable ailleurs (Docker, self-hosted), l'experience optimale est sur Vercel ; le self-hosting demande plus de configuration
3. **Vulnerabilites RSC :** La decouverte de CVE-2025-66478 montre que les Server Components sont une surface d'attaque nouvelle et encore en maturation. Pour une application familiale traitant des donnees sensibles, cela impose une vigilance accrue sur les mises a jour de securite
4. **Surcharge pour une SPA :** Si family-hub est principalement une application connectee (derriere authentification), une SPA pure pourrait etre plus simple. Next.js est surtout pertinent si le rendu cote serveur apporte une valeur ajoutee
5. **Taille du bundle du framework :** Next.js ajoute une couche d'abstraction non negligeable par rapport a un React pur + Vite

### Considerations cles

- **Mise a jour imperative :** Maintenir Next.js a jour est critique a cause des vulnerabilites RSC
- **Alternative possible :** Pour une application 100% behind-auth, un frontend React pur (Vite + React Router) pourrait etre plus leger ; Next.js se justifie si on veut le SSR pour le SEO, le partage public, ou les performances initiales du dashboard

---

## 3. Expo React Native -- Mobile

### Version actuelle et statut

- **Expo SDK stable :** SDK 54 (2025)
- **Expo SDK beta :** SDK 55 (janvier 2026), base sur React Native 0.83.1 et React 19.2.0
- **New Architecture :** 83% des projets SDK 54 sur EAS Build utilisent deja la New Architecture ; SDK 55+ l'impose (impossible de la desactiver)
- **Hermes v1 :** Inclus dans SDK 55, avec des ameliorations significatives de performance et meilleur support des fonctionnalites JavaScript modernes

Sources : [Expo SDK 54](https://expo.dev/changelog/sdk-54), [Expo SDK 55 Beta](https://expo.dev/changelog/sdk-55-beta), [React Native 0.83](https://reactnative.dev/blog/2025/12/10/react-native-0.83), [Expo New Architecture Guide](https://docs.expo.dev/guides/new-architecture/)

### EAS Build (Expo Application Services)

- **Service heberge** pour compiler les binaires des applications Expo et React Native
- **Gestion automatique** des credentials de signature (iOS et Android)
- **Cache des composants** deja compiles : acceleration des builds suivants jusqu'a 30%
- **Files d'attente cloud ameliorees**, meilleure integration plateforme, livraison d'artefacts plus rapide
- **Over-the-Air (OTA) updates** : Mises a jour instantanees sans passer par les stores (avec possibilite de surcharger les headers de requete de mise a jour a runtime)

Source : [EAS Build Documentation](https://docs.expo.dev/build/introduction/), [Expo 2026](https://metadesignsolutions.com/expo-2026-the-best-way-to-build-cross-platform-apps/)

### Fonctionnalites cles du SDK 55

- **React Native 0.83.1 + React 19.2.0** : DevTools ameliores (inspection reseau, tracage de performance)
- **Hermes v1** : Moteur JavaScript nettement plus performant
- **APIs orientees objet** : `expo-contacts/next`, `expo-media-library/next`, `expo-calendar/next` avec SharedObjects pour une gestion plus fine et intuitive
- **Expo Web** : Overlay d'erreur reecrit, support alpha du SSR, data loaders experimentaux
- **Predictive Back Gesture** (Android) : Active par defaut dans SDK 55

Source : [Expo SDK 55 Beta Changelog](https://expo.dev/changelog/sdk-55-beta)

### Sante de l'ecosysteme

- **Expo est devenu le standard recommande** pour demarrer un projet React Native (recommandation officielle sur reactnative.dev)
- **Detection automatique des monorepos** : Plus besoin de configurer Metro manuellement dans un monorepo (depuis SDK 52+)
- **Communaute active** : Expo est soutenu par une entreprise dediee (Expo Inc.) avec un modele commercial base sur EAS
- **Compatibilite New Architecture** : La migration vers la New Architecture est desormais la norme, eliminant les anciens problemes de bridge

Source : [Hashrocket -- Expo 2025](https://hashrocket.com/blog/posts/expo-for-react-native-in-2025-a-perspective), [Expo Documentation](https://docs.expo.dev/)

### Forces pour family-hub

1. **Multi-plateforme efficace :** Une seule codebase pour iOS et Android, avec partage de code possible avec Next.js via monorepo
2. **EAS Build + OTA updates :** Deploiement rapide de correctifs et fonctionnalites sans attendre la validation des stores (ideal pour une app familiale qui evolue vite)
3. **New Architecture performante :** Interactions UI fluides pour le dashboard familial, animations reactives, synchronisation temps reel
4. **APIs natives riches :** Notifications push, camera, calendrier, contacts -- tout ce dont une app familiale a besoin
5. **Monorepo friendly :** Detection automatique, configuration Metro simplifiee
6. **TypeScript natif :** Coherence de typage avec NestJS et Next.js

### Faiblesses et risques pour family-hub

1. **New Architecture obligatoire (SDK 55+) :** Certaines librairies tierces peuvent ne pas encore etre compatibles ; verifier la compatibilite de toutes les dependances avant la migration
2. **Taille des binaires :** Les applications Expo sont plus lourdes qu'une application React Native bare ou native pure
3. **Limitations natives specifiques :** Pour le mode kiosque (voir section 6), des modules natifs personnalises peuvent etre necessaires, ce qui complexifie le workflow Expo
4. **Dependance a EAS :** Les builds cloud sont payants pour les equipes ; alternative possible avec builds locaux mais plus complexe
5. **Web via Expo :** Bien que le support web existe, il reste en alpha pour le SSR -- Next.js est preferable pour le frontend web

---

## 4. Architecture Monorepo

### Comparaison Turborepo vs Nx

| Critere | Turborepo | Nx |
|---|---|---|
| **Vitesse de setup** | ~15 min pour un monorepo 10 packages | ~4h pour le meme scenario |
| **Complexite** | Leger, minimal, convention > configuration | Complet, enterprise-grade, plus de concepts a maitriser |
| **Performance (petit monorepo)** | 3x plus rapide que Nx (benchmark nov. 2025) | Plus performant sur de grands monorepos (7x selon benchmarks Nx) |
| **Support Next.js** | Natif (meme editeur : Vercel) | Excellent, avec plugins dedies |
| **Support NestJS** | Via configuration manuelle | Plugins officiels `@nx/nest` |
| **Support Expo** | Fonctionne bien (detection auto depuis SDK 52) | Plugins disponibles |
| **Gestion des dependances** | S'appuie sur pnpm workspaces | Systeme propre, plus strict |
| **Detection circulaire** | Non | Oui, avec graphe de dependances |
| **Generateurs de code** | Non | Oui, pour creer des composants/modules de facon consistante |
| **Cache** | Cache distant (Vercel), cache local | Cache distribue, computation caching |
| **Technologie sous-jacente** | Reecrit en Rust (rapide) | JavaScript/TypeScript |
| **Maturite** | Plus recent, en croissance rapide | Mature, eprouve en entreprise |

Sources : [Wisp CMS -- Nx vs Turborepo](https://www.wisp.blog/blog/nx-vs-turborepo-a-comprehensive-guide-to-monorepo-tools), [DEV -- Why I Chose Turborepo](https://dev.to/saswatapal/why-i-chose-turborepo-over-nx-monorepo-performance-without-the-complexity-1afp), [DEV -- Nx vs Turborepo](https://dev.to/thedavestack/nx-vs-turborepo-integrated-ecosystem-or-high-speed-task-runner-the-key-decision-for-your-monorepo-279)

### Structure monorepo recommandee pour family-hub

```
family-hub/
├── apps/
│   ├── api/              # NestJS backend
│   ├── web/              # Next.js frontend
│   └── mobile/           # Expo React Native
├── packages/
│   ├── shared-types/     # Types TypeScript partages (DTOs, interfaces, enums)
│   ├── shared-utils/     # Fonctions utilitaires partagees
│   ├── shared-validators/# Schemas de validation (Zod) partages
│   ├── ui/               # Composants UI partages (si pertinent web+mobile)
│   └── api-client/       # Client API type-safe genere
├── turbo.json            # Configuration Turborepo
├── pnpm-workspace.yaml   # Configuration pnpm workspaces
└── package.json
```

### Templates existants

Plusieurs templates open-source combinent deja cette stack :
- **[nextjs-nestjs-expo-template](https://github.com/barisgit/nextjs-nestjs-expo-template)** : Turborepo + NestJS + Next.js + Expo avec TypeScript, tRPC, WebSockets, Clerk
- **[create-turbo-with-expo](https://github.com/Marknjo/create-turbo-with-expo)** : Starter Turborepo pour Expo + Next.js + NestJS
- **[nestjs-turbo](https://github.com/vndevteam/nestjs-turbo)** : Monorepo NestJS + Next.js + Turbo

Sources : [GitHub -- nextjs-nestjs-expo-template](https://github.com/barisgit/nextjs-nestjs-expo-template), [GitHub -- nestjs-turbo](https://github.com/vndevteam/nestjs-turbo), [DEV -- 2025 Turborepo ADR](https://dev.to/xiunotes/2025-nestjs-react-19-drizzle-orm-turborepo-architecture-decision-record-3o1k)

### Strategie de partage de code

D'apres les retours de la communaute en 2025-2026 :
- **90% du code** peut etre partage entre web et mobile dans un monorepo bien configure (Turborepo + Expo SDK 52+)
- **Les types TypeScript** sont le premier niveau de partage (DTOs, interfaces de l'API)
- **Les schemas de validation** (Zod, class-validator) peuvent etre partages entre backend et frontend
- **La logique metier pure** (calculs, transformations de donnees) se partage facilement via des packages utilitaires
- **Les composants UI** sont plus difficiles a partager entre React (web) et React Native (mobile) a cause des primitives differentes

Source : [Medium -- Turborepo Production Guide 2025](https://medium.com/better-dev-nextjs-react/setting-up-turborepo-with-react-native-and-next-js-the-2025-production-guide-690478ad75af)

### Recommandation pour family-hub

**Turborepo** est recommande pour family-hub car :
1. Setup rapide, ideal pour une equipe qui demarre
2. Integration naturelle avec Next.js (meme editeur Vercel)
3. Expo detecte automatiquement le monorepo depuis SDK 52
4. La complexite du projet ne justifie pas Nx au debut (on peut migrer plus tard si necessaire)
5. Le cache distant Vercel est un atout si on deploie deja sur Vercel

---

## 5. Strategie API : GraphQL vs REST pour le temps reel

### Analyse comparative pour le cas d'usage family-hub

| Critere | REST + WebSockets | GraphQL + Subscriptions |
|---|---|---|
| **Modele de donnees en graphe** | Necessite plusieurs endpoints pour le graphe familial | Requetes flexibles, ideal pour naviguer le graphe familial |
| **Temps reel** | WebSocket brut ou Socket.io, configuration manuelle | Subscriptions natives, declaratives |
| **Over-fetching** | Risque d'envoyer trop de donnees (surtout avec les cercles de visibilite) | Le client demande exactement ce qu'il veut |
| **Under-fetching** | Requetes multiples pour reconstituer les donnees | Une seule requete peut traverser le graphe |
| **Cache** | Cache HTTP natif, simple et efficace | Cache plus complexe (Apollo Client, normalization) |
| **Performance brute** | Legerement plus rapide (moins d'overhead) | Parsing de la requete GraphQL ajoute un leger overhead |
| **Typage** | Schemas OpenAPI/Swagger | Schema GraphQL nativement type |
| **Courbe d'apprentissage** | Plus simple pour l'equipe | Plus complexe, necessite l'apprentissage de GraphQL |
| **Support NestJS** | Excellent (`@nestjs/websockets`) | Excellent (`@nestjs/graphql`, Apollo v4) |
| **Outillage client** | Fetch/Axios + libraries WS | Apollo Client, urql, graphql-codegen |

Sources : [Medium -- NestJS GraphQL Subscriptions](https://medium.com/@shriomtripathi33/real-time-updates-in-nestjs-a-complete-guide-to-graphql-subscriptions-289f98ef4509), [NestJS Docs -- Subscriptions](https://docs.nestjs.com/graphql/subscriptions), [OneClick IT -- GraphQL vs REST in NestJS](https://www.oneclickitsolution.com/centerofexcellence/nodejs/graphql-vs-rest-in-nestjs)

### Comment fonctionnent les subscriptions GraphQL dans NestJS

Les subscriptions GraphQL sont implementees via WebSocket. Le serveur envoie des mises a jour aux clients enregistres en utilisant des connexions WebSocket. Les clients peuvent se desabonner des evenements lorsqu'ils ne sont plus necessaires.

Pour la scalabilite, il est recommande d'utiliser des solutions de gestion d'etat distribue comme Redis ou Kafka pour maintenir l'etat des subscriptions a travers les systemes distribues.

Source : [Wanago -- NestJS GraphQL Subscriptions](https://wanago.io/2021/02/15/api-nestjs-real-time-graphql-subscriptions/), [Medium -- NestJS Subscriptions Guide](https://arnab-k.medium.com/using-graphql-subscriptions-in-nestjs-a147d72cc381)

### Recommandation pour family-hub

**GraphQL est fortement recommande** pour family-hub pour les raisons suivantes :

1. **Modele de donnees en graphe familial :** Le graphe familial avec ses 5 cercles de visibilite est naturellement represente en GraphQL. Une requete comme "donne-moi les rituels du foyer X visibles par le membre Y avec le statut de completion" se traduit elegamment en une seule requete GraphQL

2. **Temps reel natif :** Les subscriptions GraphQL sont le mecanisme le plus naturel pour :
   - Notification de completion d'un rituel
   - Mise a jour en temps reel du tableau de bord familial
   - Synchronisation du statut entre appareils (mobile, web, kiosque)

3. **Controle granulaire des donnees :** Les cercles de visibilite se gerent naturellement cote resolveur GraphQL, chaque membre ne recevant que les donnees auxquelles il a acces

4. **Ecosysteme NestJS :** `@nestjs/graphql` avec Apollo Server v4, code-first approach avec decorateurs TypeScript

### Approche hybride possible

- **GraphQL** pour les requetes de donnees complexes (graphe familial, rituels, historique)
- **REST** pour les operations simples (authentification, upload de fichiers, webhooks)
- **WebSocket direct** pour les notifications push tres legeres si les subscriptions GraphQL sont trop lourdes

---

## 6. Mode Kiosque avec React Native

### Faisabilite

Le mode kiosque avec React Native est **faisable mais avec des limites importantes** selon la plateforme.

### Android -- Faisabilite elevee

Android offre un support natif pour le mode kiosque via le **Lock Task Mode** :

- **Lock Task Mode** : Verrouille l'appareil sur une seule application, empeche l'acces aux parametres systeme et autres applications
- **Difference avec Screen Pinning** : Le Screen Pinning permet a l'utilisateur de sortir a tout moment ; le Lock Task Mode ne le permet pas
- **Prerequis** : L'application doit etre configuree comme Device Admin (COSU -- Corporate Owned Single Use)

**Librairies React Native disponibles :**
- [`react-native-lock-task`](https://github.com/temaivanoff/react-native-lock-task) : Methodes `startLockTask()`, `stopLockTask()`, `isAppInLockTaskMode()`
- [`react-native-kiosk-mode`](https://github.com/sciphergfx/react-native-kiosk-mode) : Mode immersif sur Android
- [`react-native-lock-task-android`](https://github.com/ThrowJojo/react-native-lock-task-android) : Pinning de tache (API 21+)

**Remarque importante :** Ces librairies sont specifiques a Android (bare React Native). Elles necessitent un **Expo dev client** ou un **prebuild** pour fonctionner avec Expo (pas compatibles avec Expo Go).

Sources : [Android Lock Task Mode](https://developer.android.com/work/dpc/dedicated-devices/lock-task-mode), [Medium -- React Native Kiosk Mode](https://medium.com/@aeperea/setting-up-an-android-app-with-react-native-in-kiosk-mode-e062b309db71), [AppGambit -- Kiosk Mode](https://www.appgambit.com/blog/reactnative-kiosk-mode)

### iOS (iPad) -- Faisabilite moderee

iOS ne propose pas d'equivalent direct au Lock Task Mode. Les options sont :

- **Guided Access** : Verrouille l'iPad sur une seule application, mais :
  - Necessite une activation manuelle (triple-clic du bouton Home)
  - Ne persiste pas apres un redemarrage (si la batterie meurt, l'appareil redemarrage sur l'ecran d'accueil)
  - Affiche un bandeau "Triple-clic pour quitter" quand l'utilisateur appuie sur le bouton Home
  - Ne peut pas etre gere a distance sans acces physique
  - Personnalisation limitee

- **Single App Mode (MDM)** : Solution plus robuste via un MDM (Mobile Device Management) :
  - Gestion a distance
  - Persistance apres redemarrage
  - Controle complet des fonctions de l'OS
  - Mais necessite un abonnement MDM (cout supplementaire)

Sources : [Esper -- iPad Kiosk Mode](https://www.esper.io/blog/ipad-kiosk-mode-a-guide-to-ipados-guided-access-and-beyond), [Hexnode -- iOS Kiosk Mode](https://www.hexnode.com/blogs/what-is-ios-kiosk-mode/), [42Gears -- iPad Kiosk](https://www.42gears.com/blog/ipad-kiosk-app-lock-apps-on-ipad-single-app-mode/)

### Considerations materielles pour un affichage mural

- **Tablettes Android** : Budget 200-800 EUR par unite ; avantage du Lock Task Mode natif
- **iPad** : Budget 400-1200 EUR par unite ; necessite MDM pour un vrai kiosque
- **Supports muraux** : 50-200 EUR avec boitiers de protection
- **Alimentation :** Prevoir un branchement permanent (tablette murale = toujours branchee)

### Recommandation pour family-hub

1. **Privilegier Android** pour le kiosque mural (Lock Task Mode natif, tablettes moins couteuses)
2. **Utiliser une tablette Samsung Galaxy Tab ou Lenovo Tab** (bon rapport qualite/prix, support long terme)
3. **Expo avec dev client custom** : Creer un build Expo personnalise integrant `react-native-lock-task` via un config plugin
4. **Alternative web :** Envisager un mode kiosque **basee sur le navigateur** (PWA en plein ecran + outil comme Fully Kiosk Browser) qui pourrait etre plus simple et plus fiable qu'une application native pour un usage de dashboard mural
5. **Pour iPad :** Si des iPads sont deja disponibles dans la famille, utiliser Guided Access comme solution initiale avec un passage a un MDM si necessaire

---

## 7. Synthese et recommandations

### Validation du stack propose

| Technologie | Verdict | Niveau de confiance |
|---|---|---|
| **NestJS (Backend)** | Excellent choix | Tres eleve |
| **Next.js (Frontend Web)** | Bon choix, avec reserves | Eleve |
| **Expo React Native (Mobile)** | Excellent choix | Tres eleve |
| **Turborepo (Monorepo)** | Recommande | Eleve |
| **GraphQL (API)** | Fortement recommande | Tres eleve |
| **React Native Kiosque** | Faisable, Android prefere | Modere |

### Risques principaux a surveiller

1. **Securite RSC (Next.js) :** La vulnerabilite CVE-2025-66478 demontre que les React Server Components sont une surface d'attaque en maturation. Pour une application traitant des donnees familiales sensibles, maintenir Next.js a jour est imperatif.

2. **Migration New Architecture (Expo) :** SDK 55 impose la New Architecture. Toutes les dependances doivent etre verifiees avant la migration. Planifier cette migration tot dans le projet.

3. **Complexite GraphQL :** Si l'equipe n'a pas d'experience GraphQL, la courbe d'apprentissage peut ralentir le MVP. Considerer de commencer avec un sous-ensemble de l'API en GraphQL et d'elargir progressivement.

4. **Mode kiosque iOS :** Les limitations de Guided Access peuvent frustrer les utilisateurs. Prevoir une alternative web (PWA) comme plan B.

5. **Scalabilite des subscriptions GraphQL :** Pour la synchronisation temps reel a grande echelle, prevoir Redis PubSub des le debut pour eviter les problemes de scalabilite en production.

### Plan d'action recommande pour le MVP

1. **Initialiser le monorepo Turborepo** avec pnpm workspaces
2. **NestJS API** : Module auth, module graphe familial, module rituels ; GraphQL code-first avec `@nestjs/graphql` + Apollo Server v4
3. **Next.js Web** : App Router, Server Components pour les pages consultatives, Client Components pour les interactions temps reel
4. **Expo Mobile** : SDK 54 (stable) avec New Architecture activee ; migration SDK 55 des sa sortie stable
5. **Package shared-types** : DTOs, interfaces, enums partages entre les 3 applications
6. **GraphQL Subscriptions** : Commencer avec le PubSub en memoire, migrer vers Redis PubSub avant la mise en production
7. **Mode kiosque** : Prototype sur tablette Android avec `react-native-lock-task` ; evaluer la PWA comme alternative plus simple

### Sources principales

| Source | URL |
|---|---|
| NestJS Documentation | https://docs.nestjs.com/ |
| NestJS 11 Annonce | https://trilon.io/blog/announcing-nestjs-11-whats-new |
| NestJS GitHub | https://github.com/nestjs/nest |
| NestJS 2025 Analysis | https://leapcell.io/blog/nestjs-2025-backend-developers-worth-it |
| NestJS 2026 Scalability | https://tyronneratcliff.com/nestjs-for-scaling-backend-systems/ |
| Next.js 16 Blog | https://nextjs.org/blog/next-16 |
| Next.js 16.1 Blog | https://nextjs.org/blog/next-16-1 |
| Next.js Security Advisory | https://nextjs.org/blog/CVE-2025-66478 |
| React RSC Vulnerability | https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components |
| Expo SDK 54 | https://expo.dev/changelog/sdk-54 |
| Expo SDK 55 Beta | https://expo.dev/changelog/sdk-55-beta |
| Expo New Architecture | https://docs.expo.dev/guides/new-architecture/ |
| React Native 0.83 | https://reactnative.dev/blog/2025/12/10/react-native-0.83 |
| EAS Build | https://docs.expo.dev/build/introduction/ |
| Turborepo vs Nx | https://www.wisp.blog/blog/nx-vs-turborepo-a-comprehensive-guide-to-monorepo-tools |
| NestJS + Next.js + Expo Template | https://github.com/barisgit/nextjs-nestjs-expo-template |
| NestJS GraphQL Subscriptions | https://docs.nestjs.com/graphql/subscriptions |
| Android Lock Task Mode | https://developer.android.com/work/dpc/dedicated-devices/lock-task-mode |
| iPad Kiosk Mode | https://www.esper.io/blog/ipad-kiosk-mode-a-guide-to-ipados-guided-access-and-beyond |
| Expo 2025 Perspective | https://hashrocket.com/blog/posts/expo-for-react-native-in-2025-a-perspective |
| Monorepo Production Guide | https://medium.com/better-dev-nextjs-react/setting-up-turborepo-with-react-native-and-next-js-the-2025-production-guide-690478ad75af |
