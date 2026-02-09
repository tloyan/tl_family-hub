# Recherche : Feuille de Route, Evaluation des Risques, Montee en Competences et Optimisation des Couts

**Projet** : family-hub -- Application de gestion familiale
**Date** : 2026-02-06
**Contexte** : Developpeur solo (niveau intermediaire visant senior), monorepo Turborepo (NestJS + Next.js + Expo), PostgreSQL 18, Redis, GraphQL, interface conversationnelle IA. Scope MVP : rituels/taches avec colonnes par membre, creneaux horaires (matin/apres-midi/soir), statut temps reel, mode kiosque, authentification basique, export de donnees.

---

## Table des matieres

1. [Feuille de route d'implementation realiste](#1-feuille-de-route-dimplementation-realiste)
2. [Plan de montee en competences](#2-plan-de-montee-en-competences)
3. [Optimisation des couts d'infrastructure](#3-optimisation-des-couts-dinfrastructure)
4. [Evaluation des risques et strategies d'attenuation](#4-evaluation-des-risques-et-strategies-dattenuation)
5. [Checklist pre-lancement MVP](#5-checklist-pre-lancement-mvp)
6. [Erreurs courantes a eviter](#6-erreurs-courantes-a-eviter)
7. [Synthese des priorites](#7-synthese-des-priorites)
8. [Sources](#8-sources)

---

## 1. Feuille de route d'implementation realiste

### 1.1 Estimation globale du calendrier

Pour un developpeur solo de niveau intermediaire travaillant sur un projet full-stack avec le stack choisi (NestJS + Next.js + Expo + PostgreSQL + Redis + GraphQL), les sources convergent vers un calendrier de **6 a 12 mois** pour un MVP fonctionnel. Cependant, la complexite du monorepo Turborepo et la triple plateforme (web, mobile, kiosque) ajoutent une couche supplementaire.

**Estimation ajustee pour family-hub** : **5 a 7 mois** en travail a temps plein, **8 a 12 mois** en side-project (10-15h/semaine).

### 1.2 Phases detaillees

#### Phase 0 -- Fondations du monorepo (Semaines 1-3)

| Tache | Duree estimee | Priorite |
|-------|---------------|----------|
| Configuration Turborepo avec pnpm workspaces | 3-4 jours | CRITIQUE |
| Setup packages partages (types, config, utils) | 2-3 jours | CRITIQUE |
| Configuration ESLint, Prettier, TypeScript partagee | 2 jours | HAUTE |
| CI/CD basique (GitHub Actions) | 1-2 jours | HAUTE |
| Docker Compose pour dev local (PostgreSQL, Redis) | 1-2 jours | HAUTE |

**Justification** : Turborepo est le choix le plus simple pour un developpeur solo comparativement a Nx -- sa configuration peut tenir en 20 lignes. La structure recommandee est : `apps/` (api, web, mobile) + `packages/` (shared-types, ui, config). Il est essentiel de poser ces fondations correctement car elles conditionnent tout le reste.

#### Phase 1 -- Backend NestJS + Base de donnees (Semaines 4-8)

| Tache | Duree estimee | Priorite |
|-------|---------------|----------|
| Schema PostgreSQL (membres, rituels, taches, creneaux) | 3-4 jours | CRITIQUE |
| Module d'authentification basique (JWT + Passport) | 3-4 jours | CRITIQUE |
| API GraphQL code-first (schema rituels/taches) | 5-7 jours | CRITIQUE |
| Subscriptions GraphQL pour temps reel | 3-4 jours | HAUTE |
| Integration Redis (cache + pub/sub) | 2-3 jours | HAUTE |
| Seed data et tests unitaires backend | 3-4 jours | MOYENNE |

**Conseil cle** : Ne pas traiter le backend comme un simple proxy de base de donnees. La logique metier (validation des creneaux, regles de recurrence des rituels, permissions par membre) doit vivre dans le backend.

#### Phase 2 -- Frontend Next.js Web (Semaines 9-13)

| Tache | Duree estimee | Priorite |
|-------|---------------|----------|
| Layout principal et navigation | 2-3 jours | CRITIQUE |
| Vue tableau de bord (colonnes par membre) | 5-7 jours | CRITIQUE |
| Gestion des creneaux (matin/apres-midi/soir) | 3-4 jours | CRITIQUE |
| Statut temps reel (WebSocket/SSE) | 3-4 jours | HAUTE |
| Mode kiosque (plein ecran, auto-refresh) | 2-3 jours | HAUTE |
| Authentification frontend (login/logout) | 2-3 jours | CRITIQUE |
| Export de donnees (CSV/JSON) | 1-2 jours | MOYENNE |

#### Phase 3 -- Application Mobile Expo (Semaines 14-18)

| Tache | Duree estimee | Priorite |
|-------|---------------|----------|
| Setup Expo avec Expo Router (file-based routing) | 2-3 jours | CRITIQUE |
| Ecrans principaux (dashboard, detail tache) | 5-7 jours | CRITIQUE |
| Notifications push | 3-4 jours | HAUTE |
| Mode hors-ligne basique | 3-4 jours | MOYENNE |
| Build et test sur iOS/Android | 3-5 jours | HAUTE |

**Note** : Expo Router utilise un routing base sur les fichiers similaire a Next.js, ce qui facilite la transition pour un developpeur deja familier avec Next.js.

#### Phase 4 -- Integration IA et polish (Semaines 19-22)

| Tache | Duree estimee | Priorite |
|-------|---------------|----------|
| Interface conversationnelle basique | 5-7 jours | MOYENNE |
| Tests end-to-end | 3-4 jours | HAUTE |
| Optimisation performance | 2-3 jours | HAUTE |
| Documentation utilisateur minimale | 1-2 jours | MOYENNE |
| Correction de bugs et stabilisation | 3-5 jours | CRITIQUE |

#### Phase 5 -- Pre-lancement (Semaines 23-24)

| Tache | Duree estimee | Priorite |
|-------|---------------|----------|
| Deploiement production | 2-3 jours | CRITIQUE |
| Monitoring et alertes | 1-2 jours | HAUTE |
| Tests de charge basiques | 1 jour | MOYENNE |
| Beta test familial | 5-7 jours | CRITIQUE |

### 1.3 Recommandation strategique : Reporter pour accelerer

Les elements suivants peuvent etre **differes au-dela du MVP** pour raccourcir le delai de livraison :

- **Interface IA conversationnelle** : La reporter a la v1.1 pour gagner 2-3 semaines
- **Application mobile Expo** : Commencer par une PWA responsive, ajouter Expo en v1.1
- **Mode hors-ligne** : Complexe a bien faire, reporter a la v1.2
- **Export avance** : Un CSV basique suffit pour le MVP

**En suivant cette strategie, le MVP "web-first" peut etre livre en 12-14 semaines** (3-3.5 mois a temps plein).

---

## 2. Plan de montee en competences

### 2.1 NestJS : De intermediaire a senior

Le parcours recommande suit une progression en 4 paliers :

#### Palier 1 -- Solidifier les bases (4-6 semaines en parallele du developpement)

- Modules, providers, injection de dependances avancee
- Decorateurs personnalises et interceptors
- Guards et pipes de validation
- Gestion d'erreurs structuree avec filtres d'exception

#### Palier 2 -- Competences mid-level (6-10 semaines)

- **GraphQL code-first** : Resolvers, mutations, subscriptions -- directement applicable au projet
- **Authentification avancee** : Strategies Passport (JWT, OAuth2), guards par role
- **Cache avec Redis** : `@nestjs/cache-manager`, invalidation de cache, strategies de caching
- **WebSockets** : `@nestjs/websockets` pour les fonctionnalites temps reel

#### Palier 3 -- Competences avancees (3-6 mois)

- **Microservices** : Communication via Redis/RabbitMQ avec `@nestjs/microservices`
- **BullMQ** : Jobs en arriere-plan et planification (utile pour les rappels de rituels)
- **Testing avance** : Tests d'integration avec base de donnees de test, mocking avance
- **Performance** : Profiling, optimisation de requetes N+1 avec DataLoader pour GraphQL

#### Palier 4 -- Niveau senior (6-12 mois)

- Architecture de systemes distribues
- Monitoring avec Prometheus/Grafana
- Docker + deploiement conteneurise
- Contribution a l'ecosysteme open-source NestJS

**Ressources recommandees** :
- Cours officiels NestJS (par le createur et l'equipe core) -- les plus complets
- Cours de Tom Ray (nestjs-course) -- approche par projets concrets
- Documentation officielle NestJS -- reference indispensable

### 2.2 React Native / Expo : Parcours d'apprentissage

Pour un developpeur web React, la transition vers Expo est relativement fluide :

#### Competences prealables (deja acquises si experience Next.js)

- JavaScript moderne (ES6+)
- React core (hooks, state management, context)
- TypeScript

#### Phase d'apprentissage Expo (4-8 semaines)

| Semaine | Focus | Application au projet |
|---------|-------|-----------------------|
| 1-2 | Composants natifs de base (View, Text, ScrollView, FlatList) | Structure des ecrans principaux |
| 2-3 | Expo Router (file-based routing) | Navigation de l'app |
| 3-4 | Styles et layouts (Flexbox natif, StyleSheet) | Design responsive |
| 4-5 | APIs natives (Notifications, AsyncStorage) | Notifications push, stockage local |
| 5-6 | Navigation avancee, gestion d'etat | Flux utilisateur complets |
| 6-8 | Build, EAS, publication App Store / Google Play | Mise en production |

**Point cle** : Expo Router utilise un routing base sur les fichiers identique a Next.js, ce qui reduit considerablement la courbe d'apprentissage. Le tutoriel officiel Expo est le meilleur point de depart.

### 2.3 Competences transverses a developper

| Competence | Urgence | Methode d'apprentissage |
|------------|---------|------------------------|
| GraphQL (schema design, subscriptions) | CRITIQUE | Pratique directe sur le projet |
| Docker & Docker Compose | HAUTE | Setup de l'environnement dev |
| CI/CD (GitHub Actions) | HAUTE | Configuration progressive |
| PostgreSQL avance (indexation, migrations) | HAUTE | Optimisation au fil du developpement |
| Redis (patterns de caching, pub/sub) | MOYENNE | Integration progressive |
| Tests (unit, integration, e2e) | HAUTE | TDD sur les modules critiques |
| Securite (OWASP Top 10, auth patterns) | HAUTE | Audit et formation continue |

---

## 3. Optimisation des couts d'infrastructure

### 3.1 Stack d'infrastructure recommandee (phase MVP)

| Service | Fournisseur recommande | Cout mensuel | Justification |
|---------|----------------------|--------------|---------------|
| **PostgreSQL** | Neon (free tier) ou Render (free 1GB) | **0 EUR** | 0.5 GB Neon ou 1 GB Render suffisent largement pour un MVP familial |
| **Redis** | Upstash (free tier) | **0 EUR** | 500K commandes/mois gratuites -- largement suffisant pour le cache et pub/sub d'un usage familial |
| **Backend NestJS** | Railway (Hobby plan) | **5 USD/mois** | Deploiement simple, bons logs, Docker support |
| **Frontend Next.js** | Vercel (free tier) | **0 EUR** | Deploiement natif Next.js, CDN global |
| **Mobile builds** | Expo EAS (free tier) | **0 EUR** | 30 builds iOS + 30 builds Android par mois gratuits |
| **Domain + DNS** | Cloudflare | **10-15 EUR/an** | Nom de domaine + DNS gratuit + protection DDoS |
| **Monitoring** | Sentry (free tier) | **0 EUR** | 5K events/mois gratuits pour le suivi d'erreurs |
| **Email transactionnel** | Resend (free tier) | **0 EUR** | 3000 emails/mois gratuits |

**Cout total MVP : environ 5-10 USD/mois** (hors nom de domaine)

### 3.2 Evolution des couts par phase

| Phase | Cout mensuel estime | Declencheur de passage |
|-------|--------------------|-----------------------|
| **Developpement** | 0-5 USD | Debut du projet |
| **MVP / Beta familiale** | 5-10 USD | Premier deploiement |
| **Production (< 100 utilisateurs)** | 10-25 USD | Ouverture a d'autres familles |
| **Croissance (100-1000 utilisateurs)** | 25-75 USD | Trafic regulier, besoin de scaling |
| **Scale (1000+ utilisateurs)** | 75-200+ USD | Base utilisateur significative |

### 3.3 Strategies d'optimisation cle

1. **Commencer avec les free tiers** : Neon + Upstash + Vercel + Expo EAS couvrent 80% des besoins a 0 EUR
2. **Railway pour le backend** : Meilleur rapport qualite/prix pour NestJS en conteneur a 5 USD/mois
3. **Eviter AWS/GCP/Azure au debut** : Les MVPs basiques sur AWS demarrent a ~500 USD/mois selon les analyses de couts 2025 -- disproportionne pour un projet solo
4. **Utiliser le cache Redis agressivement** : Reduire les lectures PostgreSQL et donc le besoin de scaling de la BDD
5. **Images optimisees via Vercel Image Optimization** : Inclus dans le free tier
6. **Reporter les couts IA** : Utiliser des modeles open-source (Ollama) en local pour le developpement, ne payer l'API OpenAI/Anthropic qu'en production avec un budget plafonne

### 3.4 Couts a anticiper mais a reporter

| Cout | Montant estime | Quand |
|------|---------------|-------|
| Apple Developer Program | 99 USD/an | Avant publication App Store |
| Google Play Developer | 25 USD (unique) | Avant publication Play Store |
| API IA (OpenAI/Anthropic) | 10-50 USD/mois | v1.1 avec interface conversationnelle |
| Backups automatises | 5-10 USD/mois | Quand donnees critiques en production |
| SSL personnalise / domaine pro | 10-20 EUR/an | Lancement public |

---

## 4. Evaluation des risques et strategies d'attenuation

### 4.1 Matrice des risques

| # | Risque | Probabilite | Impact | Score | Attenuation |
|---|--------|------------|--------|-------|-------------|
| R1 | **Burnout du developpeur solo** | ELEVEE | CRITIQUE | 9/10 | Limiter a 10-15h/semaine, sprints de 2 semaines avec pauses, definition stricte du scope MVP |
| R2 | **Over-engineering / scope creep** | ELEVEE | ELEVE | 8/10 | MVP minimal defini et verrouille, "tout le reste est v2", revues de scope bi-hebdomadaires |
| R3 | **Complexite du monorepo Turborepo** | MOYENNE | MOYEN | 5/10 | Commencer simple (20 lignes de config), evoluer graduellement, documenter les conventions tot |
| R4 | **Courbe d'apprentissage triple (NestJS + Next.js + Expo)** | ELEVEE | ELEVE | 8/10 | Sequencer : backend d'abord, puis web, puis mobile. Ne pas tout apprendre en parallele |
| R5 | **Schema de BDD mal concu** | MOYENNE | CRITIQUE | 7/10 | Investir du temps en modelisation avant de coder, utiliser des migrations (Prisma/TypeORM) |
| R6 | **Securite negligee** | MOYENNE | CRITIQUE | 7/10 | Audit OWASP basique, ne jamais stocker de PII en clair, dependances a jour |
| R7 | **Pas d'utilisateurs / pas de feedback** | MOYENNE | ELEVE | 6/10 | Beta familiale des la phase 2 (web), iterer sur du feedback reel |
| R8 | **Vendor lock-in sur free tiers** | FAIBLE | MOYEN | 3/10 | Abstraire les couches d'infrastructure, Docker pour la portabilite |
| R9 | **PostgreSQL 18 immaturite** | FAIBLE | MOYEN | 3/10 | PostgreSQL 18 est en development preview -- envisager PostgreSQL 16 ou 17 (stable) pour la production |
| R10 | **Dependance a un seul developpeur** | CERTAINE | ELEVE | 8/10 | Documentation systematique, code propre, tests automatises, CI/CD |

### 4.2 Strategies d'attenuation detaillees

#### R1 -- Burnout (Risque le plus critique)

Pres de **83% des developpeurs** experimentent le burnout au cours de leur carriere. Pour un developpeur solo sur un side-project :

- **Regle des 15h/semaine maximum** : Definir des horaires previsibles et s'y tenir
- **Sprints de 2 semaines** avec un objectif unique et livrable
- **Methode GTD** : Ecrire toutes les idees dans une liste pour liberer l'esprit
- **Celebrer les petites victoires** : Chaque fonctionnalite livree est un progres
- **Accepter l'imperfection** : "Done is better than perfect" -- un MVP imparfait qui tourne vaut mieux qu'une architecture parfaite qui n'existe pas
- **Semaines de pause planifiees** : Une semaine off toutes les 6-8 semaines

#### R2 -- Over-engineering

L'erreur la plus courante des developpeurs full-stack est de concevoir des systemes pour des niveaux de charge irrealistes. Pour family-hub :

- **Pas de microservices** : Un monolithe modulaire NestJS est parfait pour le MVP
- **Pas de Kubernetes** : Docker Compose en local, Railway en production
- **Pas de cache distribue complexe** : Redis simple avec Upstash suffit
- **Pas de CI/CD elaborate** : GitHub Actions basique (lint + test + deploy)
- **Pas de multi-tenancy complexe** : Une famille = un deploiement est acceptable pour le MVP

#### R4 -- Courbe d'apprentissage

Sequencer l'apprentissage en 3 vagues :

1. **Vague 1 (Semaines 1-8)** : NestJS + PostgreSQL + GraphQL -- c'est le coeur du systeme
2. **Vague 2 (Semaines 9-16)** : Next.js + integration frontend-backend -- competences web deja partiellement acquises
3. **Vague 3 (Semaines 17+)** : Expo -- reporter au maximum, commencer par une PWA

#### R5 -- Schema de base de donnees

- **Investir 2-3 jours en modelisation** avant d'ecrire une seule ligne de code
- Utiliser un outil visuel (dbdiagram.io, Prisma schema visualizer)
- Planifier les migrations des le depart (Prisma Migrate ou TypeORM migrations)
- Prevoir l'extensibilite avec des colonnes JSON pour les metadonnees flexibles

#### R9 -- PostgreSQL 18

PostgreSQL 18 est actuellement en phase de developpement. Il est fortement recommande d'utiliser **PostgreSQL 16 (LTS)** ou **PostgreSQL 17** pour la production. La migration vers PostgreSQL 18 pourra se faire une fois la version stable publiee (prevue fin 2025 / debut 2026).

---

## 5. Checklist pre-lancement MVP

### 5.1 Fonctionnalites essentielles (must-have)

- [ ] Authentification basique fonctionnelle (login/logout, JWT)
- [ ] CRUD complet des rituels/taches
- [ ] Affichage par colonnes (un par membre de la famille)
- [ ] Creneaux horaires (matin/apres-midi/soir) fonctionnels
- [ ] Mise a jour du statut en temps reel
- [ ] Mode kiosque (plein ecran, navigation simplifiee)
- [ ] Export basique des donnees (CSV minimum)

### 5.2 Qualite et stabilite

- [ ] Tests unitaires sur les modules critiques (> 60% de couverture sur le backend)
- [ ] Tests d'integration sur les endpoints GraphQL principaux
- [ ] Aucune erreur critique dans les logs en utilisation normale
- [ ] Temps de chargement initial < 3 secondes
- [ ] Application utilisable sur mobile via le navigateur (responsive)

### 5.3 Securite (hygiene de base)

- [ ] Mots de passe hashes (bcrypt minimum)
- [ ] Tokens JWT avec expiration raisonnable
- [ ] Variables d'environnement pour tous les secrets (jamais en dur dans le code)
- [ ] Protection CORS configuree correctement
- [ ] Rate limiting sur les endpoints d'authentification
- [ ] Dependances a jour (audit npm)
- [ ] Pas de PII (donnees personnelles) en clair dans la base de donnees
- [ ] HTTPS enforce en production

### 5.4 Infrastructure

- [ ] Deploiement automatise (push to deploy)
- [ ] Base de donnees avec backups automatiques
- [ ] Monitoring d'erreurs (Sentry ou equivalent)
- [ ] Healthcheck endpoint fonctionnel
- [ ] Variables d'environnement separees dev/staging/prod
- [ ] Logs structures et accessibles

### 5.5 Donnees et migrations

- [ ] Schema de base de donnees stable et documente
- [ ] Systeme de migrations fonctionnel et reproductible
- [ ] Donnees de seed pour les demos et tests
- [ ] Strategie de backup testee (restauration verifiee au moins une fois)

---

## 6. Erreurs courantes a eviter

### 6.1 Erreurs d'architecture

| Erreur | Consequence | Prevention |
|--------|------------|------------|
| **Microservices des le depart** | Complexite disproportionnee, overhead operationnel, debugging difficile | Monolithe modulaire NestJS avec des modules bien decoupes -- migrer vers des microservices si et seulement si un besoin reel se presente |
| **Ignorer la modelisation de donnees** | Schema qui "hante pendant des annees", migrations douloureuses | Investir 2-3 jours en conception avant de coder, iterer sur le schema avec des revues |
| **Backend = simple proxy de BDD** | Logique metier eparpillee dans le frontend, inconsistances, failles de securite | Centraliser validation, autorisation et orchestration dans les services NestJS |
| **Changer de framework en cours de route** | Perte de temps, code jetable, frustration | Choisir un framework, s'y tenir, le maitriser en profondeur |

### 6.2 Erreurs de processus

| Erreur | Consequence | Prevention |
|--------|------------|------------|
| **Construire 6 mois sans lancer** | Produit deconnecte des besoins reels, motivation en chute | Deployer une version utilisable des le mois 2-3, iterer sur du feedback reel |
| **Resoudre des problemes inexistants** | Temps perdu sur des fonctionnalites inutiles | Valider chaque fonctionnalite avec les utilisateurs (famille) avant de la construire |
| **Perfectionnisme** | Ne jamais livrer, code jamais "assez bon" | Definition explicite de "done" pour chaque sprint, timeboxing strict |
| **Ignorer le marketing/la distribution** | Produit genial que personne n'utilise | Meme pour un projet familial, penser a l'adoption (simplicite, onboarding) |

### 6.3 Erreurs techniques

| Erreur | Consequence | Prevention |
|--------|------------|------------|
| **Gestion d'erreurs minimale** | Bugs silencieux, debogage impossible | Filtres d'exception NestJS structures, logging avec niveaux (warn, error, debug) |
| **Pas de tests** | Regressions constantes, peur de refactorer | TDD sur les modules critiques, tests d'integration sur les APIs |
| **Dependances non maintenues** | Failles de securite, incompatibilites | Audit regulier (npm audit), Dependabot ou Renovate Bot |
| **Configuration de deploiement complexe** | Deployements fragiles, peur de deployer | "Start simple" : push-to-deploy via Railway/Vercel, complexifier si necessaire |
| **Sous-estimer la tarification** | Si monetisation future, prix trop bas qui devalue le travail | Fixer un prix juste des le depart, iterer a la hausse |

### 6.4 Erreurs specifiques au solo developer

- **Ne pas documenter** : Vous etes le seul a connaitre le code. Si vous reprenez le projet apres 2 mois de pause, la documentation est votre bouee de sauvetage.
- **Ne pas versionner proprement** : Commits atomiques, messages clairs, branches par fonctionnalite.
- **Ne pas tester la restauration de backup** : Avoir des backups ne sert a rien si la restauration ne fonctionne pas.
- **Ignorer l'accessibilite** : Un mode kiosque familial doit etre utilisable par tous les membres, y compris les enfants -- penser UX des le depart.

---

## 7. Synthese des priorites

### 7.1 Matrice de priorites temporelles

```
                    IMPACT ELEVE                    IMPACT FAIBLE
                  +-----------------------+------------------------+
URGENCE           | 1. Schema BDD         | 5. CI/CD avancee       |
ELEVEE            | 2. Auth backend       | 6. Monitoring pro      |
                  | 3. API GraphQL core   |                        |
                  | 4. Frontend web core  |                        |
                  +-----------------------+------------------------+
URGENCE           | 7. Temps reel         | 9. Multi-langue        |
FAIBLE            | 8. Mode kiosque       | 10. PWA / offline      |
                  | 11. Export donnees    | 12. Interface IA       |
                  | 13. App Expo          | 14. Analytics          |
                  +-----------------------+------------------------+
```

### 7.2 Recommandation finale : 3 scenarios

#### Scenario A -- "Rapide et valide" (3-4 mois a temps plein)

Livrer un MVP web uniquement (Next.js + NestJS) avec les fonctionnalites essentielles. Reporter Expo et l'IA conversationnelle. **Cout : ~5 USD/mois.**

- Avantage : Feedback rapide, validation du concept
- Inconvenient : Pas d'app mobile native
- Risque principal : Burnout si pace trop intense

#### Scenario B -- "Complet mais sequence" (6-8 mois a temps plein)

Livrer le MVP web (mois 1-3), puis ajouter Expo (mois 4-5), puis l'IA (mois 6-7), puis polish (mois 8). **Cout : ~10-15 USD/mois.**

- Avantage : Produit complet, apprentissage progressif
- Inconvenient : Delai plus long avant le lancement complet
- Risque principal : Scope creep entre les phases

#### Scenario C -- "Side-project durable" (10-14 mois a 10-15h/semaine)

Meme contenu que le Scenario B mais a rythme soutenable. Sprints de 2 semaines, pauses planifiees. **Cout : ~5-10 USD/mois.**

- Avantage : Soutenable, compatible avec un emploi a temps plein
- Inconvenient : Delai long, risque de perte de motivation
- Risque principal : Burnout lent et perte d'interet

**Recommandation** : Le **Scenario A** (web-first) suivi d'iterations incrementales est l'approche la plus pragmatique. Il permet de valider le concept rapidement avec la famille, d'iterer sur du feedback reel, et de construire la motivation necessaire pour les phases suivantes.

---

## 8. Sources

### Feuille de route et architecture

- [NestJS with Next.js: Building a Powerful Full-Stack App in 2025](https://medium.com/@qa.vgdtechnologies/nestjs-with-next-js-building-a-powerful-full-stack-app-in-2025-d4e62921b443)
- [The Complete Full-Stack Developer Roadmap for 2026](https://dev.to/thebitforge/the-complete-full-stack-developer-roadmap-for-2026-2i0j)
- [How to Build an MVP: From Idea to Launch in 2026](https://wearepresta.com/from-idea-to-mvp-the-strategic-2026-guide-for-startup-founders/)
- [How to build an MVP in 2025: Checklist](https://www.codelevate.com/blog/how-to-build-an-mvp-in-2025-checklist)
- [MVP Tech Stack Guide 2026: Build Fast, Stay Compliant](https://medium.com/@cabotsolutions/mvp-tech-stack-guide-2026-build-fast-stay-compliant-94e1bc34fee7)
- [How to Launch an App in Weeks: Fast MVP and First Version Launch Framework](https://www.valtorian.com/blog/how-to-launch-an-app-in-weeks)

### Turborepo et monorepo

- [Complete Guide to Turborepo: From Zero to Production](https://dev.to/araldhafeeri/complete-guide-to-turborepo-from-zero-to-production-3ehb)
- [Should Your Startup Use TurboRepo in 2025?](https://thecodebeast.com/monorepo-madness-should-your-startup-embrace-turborepo-in-2025/)
- [Why I Chose Turborepo Over Nx](https://dev.to/saswatapal/why-i-chose-turborepo-over-nx-monorepo-performance-without-the-complexity-1afp)
- [My Experience with TurboRepo & Monorepos](https://dev.to/divyanshulohani/my-experience-with-turborepo-monorepos-from-chaos-to-sanity-1h0f)

### Montee en competences NestJS

- [2025 NestJS BE Roadmap: Beginner to Senior Level](https://dev.to/tak089/nestjs-roadmap-for-2025-5jj)
- [NestJS Learning Roadmap 2025](https://onlyprep.gumroad.com/l/nestjs-roadmap)
- [Official NestJS Courses](https://courses.nestjs.com)
- [NestJS Course: Learn By Building Projects (Tom Ray)](https://www.tomray.dev/nestjs-course)

### Expo et React Native

- [Tutorial: Using React Native and Expo - Documentation officielle](https://docs.expo.dev/tutorial/introduction/)
- [How to Become a Mobile Developer in 2026: React Native Path](https://www.nucamp.co/blog/how-to-become-a-mobile-developer-in-2026-react-native-path-from-web-to-app-store)
- [Getting started with Expo and React Native 2025](https://dev.to/its_nish/getting-started-with-expo-and-react-native-2025-51bc)

### Couts et infrastructure

- [Best PostgreSQL hosting providers for developers in 2026](https://northflank.com/blog/best-postgresql-hosting-providers)
- [Top PostgreSQL Database Free Tiers in 2026](https://www.koyeb.com/blog/top-postgresql-database-free-tiers-in-2026)
- [PostgreSQL Hosting Options in 2025: Pricing Comparison](https://www.bytebase.com/blog/postgres-hosting-options-pricing-comparison/)
- [New Pricing and Increased Limits for Upstash Redis](https://upstash.com/blog/redis-new-pricing)
- [Railway Pricing 2025](https://www.saaspricepulse.com/tools/railway)
- [SaaS Development Costs 2026](https://www.bacancytechnology.com/blog/saas-development-costs)

### Erreurs courantes et burnout

- [10 Mistakes I Made as a Full Stack Developer](https://medium.com/full-stack-forge/10-mistakes-i-made-as-a-full-stack-developer-and-how-you-can-avoid-them-1a4d46bfde4b)
- [10 Common Mistakes Full Stack Developers Should Avoid](https://medium.com/@rohimikharat/10-common-mistakes-full-stack-developers-should-avoid-6e27d9977a64)
- [The Complete Guide to Becoming a Successful Solo Developer in 2025](https://calmops.com/tools/the-complete-guid-to-becoming-a-successful-solo-developer-in-2025/)
- [How I built my tech startup as a solo developer](https://medium.com/dreamwod-tech/how-i-built-my-tech-startup-as-a-solo-developer-45390f460002)
- [How to Build a SaaS App as a Solo Developer Without Burning Out](https://solidgigs.com/blog/how-to-build-a-saas-app-as-a-solo-developer-without-burning-out/)
- [Preventing Developer Burnout: Proactive Approach](https://blogs.embarcadero.com/preventing-developer-burnout-from-reactive-fixes-to-a-proactive-approach-to-well-being/)
- [Hacker News: What's the ideal stack for a solo dev in 2025](https://news.ycombinator.com/item?id=43486496)
- [The Solo Developer's Manifesto (GitHub)](https://github.com/fawazahmed0/the-solo-developers-manifesto)

### Marche et tendances SaaS

- [SaaS Market Report 2026 - Indie Hackers](https://www.indiehackers.com/post/saas-market-report-2026-get-your-copy-b6ed1ec0c2)
- [The Future of SaaS Pricing in 2026](https://medium.com/@aymane.bt/the-future-of-saas-pricing-in-2026-an-expert-guide-for-founders-and-leaders-a8d996892876)
- [Learning to code and building a $28k/mo portfolio of SaaS products](https://www.indiehackers.com/post/tech/learning-to-code-and-building-a-28k-mo-portfolio-of-saas-products-OA5p18fXtvHGxP9xTAwG)
