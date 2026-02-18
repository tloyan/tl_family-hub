---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - prd.md
  - architecture.md
  - ux-design-specification.md
---

# family-hub - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for family-hub, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**Gestion du Foyer & Membres (FR1-FR9)**

- FR1: Un utilisateur peut creer un nouveau foyer en renseignant un nom et le nombre de membres
- FR2: Un parent admin peut inviter des membres a rejoindre le foyer par lien, email ou QR code
- FR3: Un utilisateur invite peut rejoindre un foyer existant en acceptant une invitation sans configuration prealable
- FR4: Un parent admin peut attribuer un role a chaque membre du foyer (parent admin, parent, enfant, prestataire)
- FR5: Un parent admin peut creer un profil enfant avec pictogramme, tranche d'age et permissions par defaut
- FR6: Un parent admin peut inviter un prestataire (babysitter, nounou) avec un acces limite a 30 jours, en lecture seule sur les rituels et consignes des membres dont il a la charge
- FR7: Un prestataire peut acceder aux routines, consignes, allergies et numeros d'urgence des membres dont il a la charge, sans creer de compte complet
- FR8: Un membre peut consulter la fiche de chaque membre du foyer (nom, role, allergies, consignes, numero d'urgence)
- FR9: L'architecture supporte les 5 cercles de visibilite (Personnel, Couple, Foyer, Famille elargie, Connaissances), seul le cercle Foyer etant expose en UI au MVP

**Rituels & Routines (FR10-FR18)**

- FR10: Un parent peut creer un rituel recurrent associe a 1 a N membres du foyer et a un moment de la journee (matin, midi, soir)
- FR11: Un parent peut modifier ou supprimer un rituel existant
- FR12: Un parent peut definir la recurrence d'un rituel (quotidien, jours specifiques de la semaine)
- FR13: Un membre peut consulter ses rituels du jour organises par moment (matin, midi, soir)
- FR14: Un membre peut mettre a jour le statut d'un rituel qui lui est assigne (a faire, en cours, termine)
- FR15: Un enfant peut valider le statut de ses propres rituels de maniere autonome
- FR16: Un enfant de profil < 7 ans voit un pictogramme associe a chaque rituel (1 pictogramme par rituel, selectionnable par le parent)
- FR17: Un membre voit les changements de statut des rituels sur ses autres appareils en moins de 2 secondes
- FR18: Un parent peut consulter un recapitulatif hebdomadaire presentant le taux de completion des rituels par membre

**Vue & Interface Quotidienne (FR19-FR23)**

- FR19: Un membre peut visualiser l'ensemble des rituels du foyer sous forme de colonnes par membre avec tranches horaires
- FR20: Un parent peut consulter la vue complete du foyer (tous les membres, tous les moments)
- FR21: Un enfant voit uniquement sa colonne et les rituels associes a son profil d'age (pictogrammes pour < 7 ans, texte pour >= 7 ans)
- FR22: Un prestataire voit uniquement les colonnes des membres dont il a la charge et leurs consignes
- FR23: Un nouvel utilisateur peut completer l'onboarding en 2 questions max (nombre de membres, moment le plus chaotique) et obtenir une premiere routine generee en < 60 secondes

**Intelligence Artificielle Conversationnelle (FR24-FR29)**

- FR24: Un membre autorise peut interagir avec un assistant IA via un chat textuel et vocal integre a l'application (STT input natif + TTS output natif)
- FR25: Un membre peut creer, modifier ou supprimer des rituels par commande en langage naturel via le chat IA
- FR26: Un membre peut poser des questions contextuelles a l'IA sur l'organisation du foyer (planning du jour, activites prevues, consignes) et sur le fonctionnement de l'application (aide integree)
- FR27: Un membre voit un indicateur permanent "Vous parlez a une IA" dans l'interface du chat (conformite EU AI Act Article 50)
- FR28: Un membre mineur interagit avec une IA dont les reponses sont filtrees : zero contenu violent, sexuel ou inapproprie (liste de categories bannies configurable par l'admin)
- FR29: Un membre ne peut declencher via l'IA que les actions autorisees pour son role (ex: un enfant ne peut pas supprimer un rituel via l'IA)

**Permissions & Securite (FR30-FR35)**

- FR30: Un profil enfant est cree avec les permissions minimales par defaut : consultation de sa colonne, validation de statut de ses rituels, chat IA en lecture seule
- FR31: Un parent admin peut debloquer des permissions supplementaires pour un enfant parmi : creation de rituels, modification de ses rituels, chat IA interactif, consultation des colonnes des autres membres
- FR32: Un membre ne peut acceder qu'aux donnees des foyers auxquels il appartient — aucune requete ne retourne des donnees d'un foyer non-autorise
- FR33: Un parent admin peut gerer les roles et permissions de tous les membres du foyer
- FR34: Un parent admin doit fournir un consentement parental verifie (double opt-in email) avant la creation de tout profil enfant (conformite RGPD Article 8)
- FR35: Un membre peut s'authentifier de maniere securisee (email/mot de passe, magic link, ou biometrie apres configuration)

**Notifications & Communication (FR36-FR40)**

- FR36: Un parent peut recevoir des notifications push pour les rappels de rituels selon le planning configure
- FR37: Un parent peut recevoir une notification lorsqu'un enfant a complete 100% de ses rituels pour un moment donne
- FR38: Un membre peut configurer ses preferences de notification (types, frequence, horaires)
- FR39: Un membre recoit au maximum 1 notification groupee par moment (matin/midi/soir), regroupant tous les rappels du moment
- FR40: Un profil enfant ne recoit pas de notifications push par defaut. Un parent admin peut activer les notifications pour un enfant.

**Donnees & Conformite (FR41-FR44)**

- FR41: Un membre peut exporter l'integralite de ses donnees personnelles et familiales dans un format portable (conformite RGPD droit a la portabilite)
- FR42: Le service collecte uniquement les donnees suivantes : nom/prenom, email, date de naissance (enfants), roles, rituels, statuts, conversations IA. Aucune donnee de localisation, financiere ou biometrique n'est collectee au MVP.
- FR43: Un administrateur technique peut verifier que toutes les donnees sont stockees au sein de l'Union Europeenne
- FR44: Toutes les communications sont chiffrees en transit (TLS 1.3) et les donnees sensibles (tokens, mots de passe) sont chiffrees au repos (AES-256)

**Mode Offline & Synchronisation (FR45-FR48)**

- FR45: Un membre peut consulter ses rituels du jour meme sans connexion internet
- FR46: Un membre peut mettre a jour le statut de ses rituels hors ligne, avec synchronisation automatique au retour de la connexion
- FR47: Un membre voit un indicateur visuel de l'etat de connexion (en ligne / hors ligne / synchronisation en cours)
- FR48: Les conflits de synchronisation sont resolus de maniere deterministe : dernier ecrivain gagne pour les statuts, fusion pour les creations

**Administration & Operations (FR49-FR51)**

- FR49: L'administrateur technique peut deployer des mises a jour de l'application mobile sans passage par les stores (OTA pour le code JS)
- FR50: L'administrateur technique peut surveiller les erreurs, performances et metriques d'usage via des outils de monitoring
- FR51: L'administrateur technique peut consulter les metriques business (retention, DAU, Family Activation Rate) depuis un dashboard

**Droit a l'oubli & Retention (FR52-FR54)**

- FR52: Un membre peut supprimer son compte. Ses donnees personnelles sont supprimees en < 30 jours. Les donnees partagees (rituels) sont anonymisees ("membre supprime").
- FR53: Un parent admin peut supprimer le profil d'un enfant. Les donnees personnelles de l'enfant sont supprimees immediatement, les rituels associes sont conserves en anonyme.
- FR54: Un parent admin peut consulter et telecharger l'ensemble des donnees collectees sur un profil enfant (conformite RGPD droit d'acces parental).

**Systeme de demandes familiales (FR55-FR58)**

- FR55: Un membre peut creer une demande (post-it) a destination d'un ou plusieurs membres du foyer, avec un titre et une description optionnelle
- FR56: Un membre destinataire peut consulter ses demandes en attente, les approuver ou les refuser
- FR57: L'emetteur d'une demande est notifie du resultat (approuve/refuse) via notification push
- FR58: L'IA propose automatiquement de creer une demande a un admin lorsqu'une action demandee depasse les permissions du membre

### NonFunctional Requirements

**Performance**

- NFR1: Les actions utilisateur courantes (cocher un rituel, ouvrir une vue) repondent en moins de 200ms cote UI (p95, optimistic update)
- NFR2: Les changements de statut d'un rituel sont visibles sur les autres appareils du foyer en moins de 1 seconde (p95)
- NFR3: L'API backend repond aux requetes en moins de 300ms (p95 hors requetes IA)
- NFR4: Le temps de reponse du chat IA (premier token) est inferieur a 2 secondes (p95 TTFT)
- NFR5: L'application mobile demarre et affiche les rituels du jour en moins de 3 secondes (warm start, p95)
- NFR6: Le web atteint les Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1) sur les pages publiques (Lighthouse > 90)

**Securite**

- NFR7: Toutes les communications client-serveur sont chiffrees via TLS 1.3 (100% HTTPS)
- NFR8: Les donnees sensibles (tokens, mots de passe) sont chiffrees au repos avec AES-256
- NFR9: L'isolation des donnees par foyer empeche tout acces cross-foyer (tests automatises 100% endpoints)
- NFR10: Les sessions expirent apres 30 jours d'inactivite, avec refresh token rotation
- NFR11: L'IA ne peut executer que les actions autorisees pour le role du membre qui interagit (tests automatises par role)
- NFR12: Les profils enfants ne peuvent etre crees qu'avec un consentement parental verifie (flux bloquant)
- NFR13: Aucune donnee utilisateur n'est partagee avec des tiers a des fins de monetisation (zero SDK pub/analytique tiers non-conforme)

**Scalabilite**

- NFR14: L'architecture supporte de 5 a 5 000 foyers actifs sans changement d'architecture
- NFR15: La base de donnees supporte 50 000 rituels actifs avec des temps de requete < 100ms
- NFR16: Le systeme temps reel supporte 500 connexions WebSocket simultanees sur une instance
- NFR17: Le cout d'infrastructure reste inferieur a 0.05 EUR/foyer/mois jusqu'a 5 000 foyers

**Fiabilite**

- NFR18: Aucune perte de donnees utilisateur, meme en cas de panne serveur (backups quotidiens, recovery teste)
- NFR19: Le mode offline preserve l'integrite des donnees locales lors de la resynchronisation (< 0.1% de pertes)
- NFR20: Le systeme recupere automatiquement apres un crash sans intervention manuelle (< 5 min)
- NFR21: Les mises a jour OTA n'interrompent pas l'utilisation en cours de l'application

**Accessibilite**

- NFR22: L'application web respecte le niveau WCAG 2.1 AA (audit automatise axe-core + audit manuel)
- NFR23: L'application mobile est utilisable avec VoiceOver (iOS) et TalkBack (Android) — 100% parcours principaux
- NFR24: Tous les elements interactifs ont un contraste minimum de 4.5:1 (texte) et 3:1 (elements graphiques)
- NFR25: Les pictogrammes enfants sont toujours accompagnes d'un texte alternatif (100% couverture)

**Maintenabilite**

- NFR26: L'ajout d'un nouveau module fonctionnel ne necessite pas de modification des modules existants (zero imports circulaires)
- NFR27: Le code TypeScript est en mode strict end-to-end (strict: true, zero any en CI)
- NFR28: La couverture de tests couvre les chemins critiques (> 80% sur creation foyer, rituels CRUD, permissions, sync)
- NFR29: Le pipeline CI/CD valide le build, les tests et le linting avant chaque deploiement (aucun deploy sans CI vert)

### Additional Requirements

**Exigences techniques issues de l'Architecture :**

- Starter Template : Custom Monorepo Setup base sur Turborepo + pnpm (`npx create-turbo@latest family-home --package-manager pnpm`). Aucun starter existant ne correspond — setup incrementiel.
- Stack technologique : TypeScript strict end-to-end, Next.js (web), Expo (mobile), NestJS (backend), PostgreSQL via Supabase (DB), Prisma (ORM), Better Auth, ShadCN UI + Tailwind (web), React Native Reusables + NativeWind (mobile), Strapi Cloud (CMS marketing/blog/legal)
- Architecture globale : Monolithe modulaire event-driven + CQRS progressif (`@nestjs/cqrs`)
- API : GraphQL code-first (`@nestjs/graphql` + `autoSchemaFile`), `graphql-codegen` pour hooks Apollo Client (frontend uniquement), GraphQL Subscriptions + `graphql-redis-subscriptions`
- Auth : Better Auth (Social OAuth Google/Apple + Magic Link/OTP), PBAC hybride (RBAC + ABAC + ReBAC), permissions instance-level par enfant, Prisma Client Extension pour isolation foyer automatique
- State management : Apollo Client (etat serveur, optimistic UI, subscriptions, offline) + Zustand (etat client local ~1KB)
- Offline : Mobile complet (`apollo3-cache-persist` + queue mutations + OCC), Web lecture seule
- Validation : Zod partage dans `packages/shared` + schemas derives par cote (.extend, .pick, .omit)
- IDs : UUID v7 (ordonnables chronologiquement, generables cote client)
- Infrastructure : Supabase Pro EU Frankfurt (PostgreSQL + Storage), Upstash Fixed 250MB EU Frankfurt (Redis triple usage : cache + pub/sub + sessions + BullMQ), Railway Pro EU-West (NestJS), Vercel Pro Edge global (Next.js), Cloudflare Free (DNS + CDN + WAF), Expo EAS (mobile builds + OTA), Strapi Cloud Pro EU (CMS)
- Observabilite : Sentry + `@sentry/react-native` (crash reporting), Grafana Cloud (metrics Prometheus + logs Loki + dashboards), PostHog (product analytics + feature flags + session replay), Statuspage (status page)
- Communication : Resend (email transactionnel + React Email templates), Expo Notifications (push iOS/Android), BullMQ + `@nestjs/bullmq` (queue/jobs async via Redis existant)
- CI/CD : GitHub Actions, Dependabot + CodeQL + Secret Scanning, SonarCloud (code quality), Doppler (secrets management), Docker + Docker Compose (dev local), GitHub Container Registry
- Testing : Vitest (unit + integration), Supertest (API integration), Playwright (E2E web), Maestro (E2E mobile), Storybook (composants UI), k6 (load testing)
- 8 modules NestJS : household, member, ritual (CQRS actif), ai, auth, notification, compliance, admin
- Dependances inter-modules : household → (aucune), member → household, ritual → member + household, notification → ritual + member + household, ai → ritual + member + household (read-only), compliance → tous, admin → tous (read-only), auth → member + household
- Convention dot-notation pour tous les fichiers : `domain.role.ts(x)`
- Convention CQRS events : toujours `householdId` + `triggeredBy` + `occurredAt`
- Optimistic UI sur toutes les mutations Apollo Client par defaut
- Compliance : Cookiebot (cookie consent RGPD)
- Cout total estime lancement : ~105-120$/mois (~95-110EUR)

**Exigences UX issues du Design Specification :**

- Home Hub contextuel comme point d'entree (grille de FeatureBlocks contextualisee par heure/role/etat), pas directement les rituels
- Rituels en cartes (RitualCard) — plus hautes et larges qu'une ligne de to-do, pictogramme + nom + statut + couleur membre, micro-animation douce a la validation
- Rituels imbriques (parent → micro-rituels) avec expand/collapse, progression incrementale ("3/5"), validation cascade
- Navigation par scroll continu entre moments (ContinuousScrollMoments + MomentSelector synchronise via Intersection Observer)
- FAB flottant (AIFloatingButton) pour l'assistant IA, accessible depuis tous les ecrans (48-56px, coin inferieur droit)
- AIChatPanel en bottom sheet (mobile) ou panel lateral (web desktop), avec chips de suggestions contextuelles
- 5 profils visuels adaptatifs : parent (defaut), enfant >=7 ans (elements plus grands), enfant <7 ans (pictogrammes grands, texte minimal, boutons larges), prestataire (vue reduite), kiosk (plein ecran, elements tres grands)
- Theming temporel : matin chaud (#FFFBF5), midi neutre (#FAFAFA), soir doux (#FFF8F0), nuit sombre (#0F172A) avec transition progressive (fondu 30min)
- Onboarding en < 90s : 2 questions → generation IA → routine generee → spotlight FAB IA → prenoms → Home Hub → vue colonnes
- Invitation second parent en < 30s (deep link → profil pret), prestataire en < 15s (jeton temporaire, sans compte complet)
- Zero feedback celebratif — ton factuel et chaleureux, pas de "Bravo!", pas de confettis
- Calm technology — notifications non intrusives, regroupees par moment, badge discret hors ligne
- Design system : ShadCN UI (web) + React Native Reusables (mobile), tokens partages dans le monorepo (couleurs, typo Inter, spacing 4px grid, radius, dark mode)
- Couleurs des membres attribuees automatiquement (bleu, violet, ambre, emeraude, rouge doux, indigo) — seul element chromatique fort
- Composants custom a creer : RitualCard, RitualCardExpandable, FeatureBlock, HomeHub, MemberColumn, MomentSelector, ContinuousScrollMoments, AIFloatingButton, AIChatPanel, MemberAvatar, InvitationScreen, PictogramPicker, WeeklyRecap, PermissionToggle, ActivityFeed, KioskConfig
- Responsive mobile-first : breakpoints sm (<640px), md (640-767px), lg (768-1023px), xl (1024-1279px), 2xl (>=1280px)
- Accessibilite WCAG 2.1 AA : cibles tactiles >=44px (48px recommande), HTML semantique, ARIA labels, navigation clavier, respect prefers-reduced-motion
- Vue colonnes : 1 colonne + peek + swipe horizontal (mobile), 2-4 colonnes (web desktop), toutes colonnes (kiosk)
- i18n : infrastructure i18next posee des le depart, MVP en francais

### FR Coverage Map

| FR | Epic | Description |
|---|---|---|
| FR1 | Epic 1 | Creation de foyer |
| FR2 | Epic 1 | Invitation membres (lien/email/QR) |
| FR3 | Epic 1 | Rejoindre un foyer via invitation |
| FR4 | Epic 1 | Attribution des roles |
| FR5 | Epic 1 | Creation profil enfant |
| FR6 | Epic 1 | Invitation prestataire (acces limite 30j) |
| FR7 | Epic 1 | Acces prestataire aux consignes |
| FR8 | Epic 1 | Fiche membre consultable |
| FR9 | Epic 1 | 5 cercles de visibilite (DB, Foyer expose en UI) |
| FR10 | Epic 2 | Creation rituel recurrent par moment |
| FR11 | Epic 2 | Modification/suppression rituel |
| FR12 | Epic 2 | Recurrence (quotidien, jours specifiques) |
| FR13 | Epic 2 | Consultation rituels du jour par moment |
| FR14 | Epic 2 | Mise a jour statut rituel |
| FR15 | Epic 2 | Validation autonome par l'enfant |
| FR16 | Epic 2 | Pictogrammes pour enfants < 7 ans |
| FR17 | Epic 2 | Sync statuts temps reel < 2s |
| FR18 | Epic 2 | Recapitulatif hebdomadaire |
| FR19 | Epic 2 | Vue colonnes par membre |
| FR20 | Epic 2 | Vue complete foyer (parent) |
| FR21 | Epic 2 | Vue filtree enfant (sa colonne, profil d'age) |
| FR22 | Epic 2 | Vue filtree prestataire (membres a charge) |
| FR23 | Epic 3 | Onboarding 2 questions + routine generee < 60s |
| FR24 | Epic 3 | Chat IA textuel integre |
| FR25 | Epic 3 | CRUD rituels par langage naturel |
| FR26 | Epic 3 | Questions contextuelles a l'IA |
| FR27 | Epic 3 | Indicateur "Vous parlez a une IA" (EU AI Act) |
| FR28 | Epic 3 | Filtrage IA pour mineurs |
| FR29 | Epic 3 | Actions IA contraintes par role |
| FR30 | Epic 1 | Permissions minimales par defaut (enfant) |
| FR31 | Epic 1 | Deblocage progressif permissions enfant |
| FR32 | Epic 1 | Isolation donnees cross-foyer |
| FR33 | Epic 1 | Gestion roles et permissions par le parent admin |
| FR34 | Epic 1 | Consentement parental verifie (RGPD Art. 8) |
| FR35 | Epic 1 | Authentification securisee |
| FR36 | Epic 4 | Notifications push rappels rituels |
| FR37 | Epic 4 | Notification completion 100% enfant |
| FR38 | Epic 4 | Preferences de notification configurables |
| FR39 | Epic 4 | Notification groupee par moment (max 1) |
| FR40 | Epic 4 | Notifications enfants desactivees par defaut |
| FR41 | Epic 6 | Export donnees portables (RGPD portabilite) |
| FR42 | Epic 6 | Collecte minimale documentee |
| FR43 | Epic 6 | Stockage donnees EU verifiable |
| FR44 | Epic 6 | Chiffrement transit TLS 1.3 + repos AES-256 |
| FR45 | Epic 5 | Consultation rituels hors ligne |
| FR46 | Epic 5 | Mise a jour statuts hors ligne + sync auto |
| FR47 | Epic 5 | Indicateur visuel etat connexion |
| FR48 | Epic 5 | Resolution conflits deterministe |
| FR49 | Epic 7 | Deploiement OTA (code JS) |
| FR50 | Epic 7 | Monitoring erreurs, performance, usage |
| FR51 | Epic 7 | Dashboard metriques business |
| FR52 | Epic 6 | Suppression compte + anonymisation < 30j |
| FR53 | Epic 6 | Suppression profil enfant |
| FR54 | Epic 6 | Acces parental aux donnees enfant |
| FR55 | Epic 8 | Creation de demande (post-it) a un membre |
| FR56 | Epic 8 | Consultation, approbation ou refus des demandes |
| FR57 | Epic 8 | Notification du resultat au demandeur |
| FR58 | Epic 8 | IA propose une demande si permissions insuffisantes |

## Epic List

### Epic 1: Fondation, Authentification & Foyer familial
Un utilisateur peut s'inscrire, creer un foyer, inviter des membres avec des roles et permissions adaptes, et gerer les profils de sa famille en toute securite.
**FRs couvertes:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR30, FR31, FR32, FR33, FR34, FR35
**Inclut:** Setup monorepo Turborepo + pnpm, infrastructure (Supabase, Railway, Vercel, Upstash, Cloudflare), CI/CD GitHub Actions, schema DB Prisma, schema GraphQL, auth Better Auth (OAuth + Magic Link), design system tokens, Prisma Client Extension isolation foyer

## Epic 1: Fondation, Authentification & Foyer familial

Un utilisateur peut s'inscrire, creer un foyer, inviter des membres avec des roles et permissions adaptes, et gerer les profils de sa famille en toute securite.

### Story 1.1: Initialisation monorepo, CI/CD et deploiement

En tant que developpeur (Thomas),
Je veux un monorepo initialise avec toutes les apps, packages, et l'infrastructure deployee,
Afin de disposer d'une fondation production-ready pour construire les features.

**Criteres d'acceptation :**

**Given** le projet n'existe pas encore
**When** j'initialise le monorepo avec Turborepo + pnpm
**Then** la structure contient apps/ (api NestJS, web Next.js, mobile Expo) et packages/ (shared, db, tokens, config-eslint, config-ts)

> **Note post-Story-1.1 :** Les packages `auth`, `ui`, `ui-native`, `api-client` et `config-tailwind` ont ete reportes. Voir `architecture.md` pour le rationnel.

**Given** Docker est installe
**When** je lance `docker compose up`
**Then** PostgreSQL et Redis demarrent localement et sont accessibles

**Given** je push sur main
**When** GitHub Actions s'execute
**Then** lint + TypeScript check (strict: true, zero `any`) + build reussissent

**Given** le CI est vert
**When** je deploie
**Then** NestJS est deploye sur Railway (EU-West), Next.js sur Vercel, les deux repondent a un health check

**Given** l'infrastructure est deployee
**When** je verifie Cloudflare
**Then** DNS + CDN + WAF sont configures pour le domaine

**Given** le monorepo est initialise
**When** je verifie la configuration
**Then** Doppler est configure pour la gestion des secrets, Husky + commitlint sont actifs, .env.example est present

### Story 1.2: Authentification securisee (Google OAuth + Magic Link)

En tant qu'utilisateur,
Je veux creer un compte et me connecter via Google OAuth ou Magic Link,
Afin d'acceder a l'application sans gerer de mot de passe.

**Criteres d'acceptation :**

**Given** je suis sur l'ecran de connexion
**When** je tape "Continuer avec Google"
**Then** je suis redirige vers le flux Google OAuth et mon compte est cree (si nouveau) ou je suis connecte (si existant)

**Given** je suis sur l'ecran de connexion
**When** j'entre mon email et tape "Recevoir un lien magique"
**Then** je recois un email avec un Magic Link dans les 30 secondes

**Given** j'ai recu un email Magic Link
**When** je tape le lien
**Then** je suis authentifie et redirige vers l'app

**Given** je suis authentifie
**When** je verifie la session
**Then** elle expire apres 30 jours d'inactivite avec refresh token rotation (NFR10)

**Given** je suis authentifie sur mobile
**When** je verifie le stockage des tokens
**Then** ils sont dans SecureStore (pas AsyncStorage)

**Given** je suis authentifie sur web
**When** je verifie les cookies
**Then** les cookies de session sont httpOnly et secure

**Given** toute communication client-serveur
**When** je verifie le transport
**Then** toutes les connexions utilisent TLS 1.3 (NFR7)

*Tables creees : User, Session, Account (Better Auth standard)*

### Story 1.3: Creation de foyer et modele de donnees familial

En tant qu'utilisateur authentifie,
Je veux creer un foyer en renseignant un nom,
Afin de commencer a organiser ma famille.

**Criteres d'acceptation :**

**Given** je suis authentifie
**When** je tape "Creer un foyer" et entre un nom
**Then** un foyer est cree et je recois automatiquement le role "owner"

**Given** un foyer est cree
**When** je verifie le schema de donnees
**Then** le modele inclut les 5 cercles (Personnel, Couple, Foyer, Famille elargie, Connaissances) — seul Foyer est expose en UI au MVP (FR9)

**Given** un foyer existe
**When** une requete API est executee
**Then** le Prisma Client Extension injecte automatiquement le householdId du contexte courant — aucune donnee cross-foyer ne peut etre retournee (FR32, NFR9)

**Given** je suis owner du foyer
**When** je consulte mon foyer
**Then** je vois le nom du foyer, le nombre de membres, et mon profil avec ma couleur attribuee automatiquement

**Given** je tente d'acceder aux donnees d'un autre foyer
**When** la requete s'execute
**Then** elle retourne zero resultat (test automatise d'isolation)

*Note d'implementation : Le Prisma Client Extension filtre par householdId du contexte courant (pas un ID fixe). Le modele supporte deja qu'un membre appartienne a N foyers (FR9). L'extension evoluera en v2.0 pour le switch de contexte foyer et en v1.5+ pour le filtrage par cercle de visibilite. Le bypass explicite `bypassHouseholdFilter()` est prevu pour les cas cross-foyer controles.*

*Tables creees : Household, HouseholdMember, Circle, MemberRole*

### Story 1.4: Invitation de membres et rejoindre un foyer

En tant que parent admin/owner,
Je veux inviter des membres par lien, email ou QR code,
Afin que ma famille puisse rejoindre le foyer rapidement.

**Criteres d'acceptation :**

**Cas 1 — Invitation sans profil existant :**

**Given** je suis admin/owner
**When** je tape "Inviter un membre"
**Then** je choisis le role (admin, adulte, enfant, prestataire) ET la relation (parent, grand-parent, oncle, ami, etc.) AVANT de generer l'invitation

**Given** j'ai configure l'invitation
**When** le systeme la cree
**Then** un lien unique + QR code sont generes avec le role et la relation pre-assignes

**Given** un invite recoit le lien
**When** il tape dessus
**Then** il arrive sur un ecran "X vous invite a rejoindre le foyer Y en tant que [relation]"

**Given** l'invite est sur l'ecran d'accueil
**When** il s'authentifie (Google OAuth ou Magic Link)
**Then** son compte est cree/lie et il rejoint le foyer avec le role pre-assigne

**Cas 2 — Invitation d'un profil existant :**

**Given** un profil membre existe sans compte lie
**When** je tape "Inviter" sur ce profil
**Then** un lien est genere qui attachera le compte de l'invite au profil existant (rituels, couleur, historique conserves)

**Given** l'invite tape le lien d'un profil existant
**When** il s'authentifie
**Then** son compte est attache au profil existant et toutes les donnees sont preservees

**Cas 3 — Enfant sans compte :**

**Given** un profil enfant existe sans compte
**When** l'enfant n'a pas besoin de son propre appareil
**Then** le profil fonctionne sans compte lie (le parent gere tout)

**Given** un profil enfant existe sans compte
**When** je tape "Lier un compte" sur ce profil
**Then** un lien d'invitation est genere pour attacher un futur compte a ce profil

**General :**

**Given** un lien d'invitation
**When** il n'a pas ete utilise
**Then** il est partageable via SMS, WhatsApp, email ou toute messagerie

**Given** une invitation
**When** je consulte son statut
**Then** je vois si elle est en attente, acceptee ou expiree

*Tables creees : Invitation (token, role, relation, status, expiresAt, linkedMemberProfileId nullable)*

### Story 1.5: Roles, permissions et gestion des membres

En tant que parent admin/owner,
Je veux gerer les roles des membres du foyer,
Afin que chaque personne ait les acces adaptes a son implication.

**Criteres d'acceptation :**

**Given** je suis admin/owner
**When** je consulte le profil d'un membre
**Then** je peux changer son role parmi : admin, adulte, enfant, prestataire

**Given** je suis owner
**When** je transfere le role owner a un admin
**Then** il devient owner et je deviens admin

**Given** je suis owner
**When** je tente de quitter le foyer ou d'etre exclu
**Then** je suis bloque avec le message "Transferez le role de proprietaire a un autre membre avant de quitter"

**Given** je suis admin
**When** je tente de transferer le role owner
**Then** l'action est impossible (seul le owner peut transferer)

**Given** je suis admin/owner
**When** j'exclus un membre invite (avec un compte)
**Then** le membre perd l'acces au foyer mais son compte et ses donnees personnelles persistent — il peut etre re-invite
**And** ses rituels assignes affichent "membre exclu" dans l'historique

**Given** je suis admin/owner
**When** je tente de supprimer le compte d'un membre invite
**Then** l'action est impossible (seul le membre lui-meme peut supprimer son propre compte)

**Given** il ne reste qu'un seul admin/owner dans le foyer
**When** je tente de l'exclure ou de le retrograder
**Then** l'action est bloquee (le foyer doit toujours avoir au moins un admin)

**Given** les 5 roles existent
**When** les permissions sont verifiees
**Then** la matrice suivante est respectee :

| Action | owner | admin | adulte | enfant | prestataire |
|---|---|---|---|---|---|
| Supprimer le foyer | oui | non | non | non | non |
| Transferer ownership | oui | non | non | non | non |
| Invitations, exclusions | oui | oui | non | non | non |
| Changer les roles | oui | oui | non | non | non |
| Gerer permissions enfants | oui | oui | non | non | non |
| Creer/modifier rituels | oui | oui | oui | progressif | non |
| Voir toutes les colonnes | oui | oui | oui | progressif | restreint |
| Chat IA | oui | oui | oui | progressif | non |
| Valider ses rituels | oui | oui | oui | oui | oui |

### Story 1.6: Profil enfant, consentement parental et permissions progressives

En tant que parent admin/owner,
Je veux creer des profils enfants avec consentement parental verifie et permissions progressives,
Afin que mes enfants utilisent l'app en securite et gagnent en autonomie.

**Criteres d'acceptation :**

**Given** je suis admin/owner
**When** je cree un profil enfant
**Then** je renseigne : prenom, tranche d'age (< 7 ans, 7-12 ans, 13-15 ans), pictogramme, relation (fils, fille, etc.)

**Given** je cree un profil enfant
**When** le systeme le traite
**Then** un flux de consentement parental est declenche (email de verification avec lien de confirmation — double opt-in) (FR34)

**Given** l'email de consentement est envoye
**When** je n'ai PAS clique le lien de verification
**Then** le profil enfant est cree mais bloque (non actif)

**Given** je clique le lien de verification
**When** le systeme le valide
**Then** le profil enfant est active avec horodatage dans un registre de consentement auditable

**Given** un profil enfant est actif
**When** je verifie ses permissions par defaut
**Then** elles sont minimales : voir sa colonne, valider ses rituels, chat IA en lecture seule (FR30)

**Given** je consulte l'ecran de gestion des permissions d'un enfant
**When** l'ecran charge
**Then** je vois des presets (Observateur / Participant / Autonome) et je peux overrider individuellement : creation de rituels, modification de ses rituels, chat IA interactif, consultation colonnes autres membres (FR31)

**Given** je modifie une permission d'un enfant
**When** le systeme enregistre
**Then** il consigne qui a accorde/modifie la permission et quand (audit trail)

*Tables creees : ParentalConsent (memberId, grantedBy, grantedAt, verificationToken), MemberPermission (memberId, level, overrides, grantedBy, updatedAt)*

### Story 1.7: Acces prestataire

En tant que parent admin/owner,
Je veux inviter un prestataire avec un acces restreint et temporaire,
Afin que babysitters et intervenants voient uniquement les informations necessaires.

**Criteres d'acceptation :**

**Given** je suis admin/owner
**When** j'invite un prestataire
**Then** je specifie : prenom, relation (babysitter, nounou, aide a domicile, etc.), duree d'acces (30 jours par defaut, customisable de 1 jour a illimite), membres a charge

**Given** une invitation prestataire est creee
**When** le lien est genere
**Then** le prestataire peut rejoindre sans creer de compte complet (acces par jeton)

**Given** un prestataire rejoint
**When** il accede a l'app
**Then** il voit UNIQUEMENT les rituels et fiches membres (consignes, allergies, numeros d'urgence) des membres dont il a la charge (FR7)

**Given** la duree d'acces du prestataire expire
**When** il tente d'acceder a l'app
**Then** l'acces est refuse avec le message "Votre acces a expire. Contactez [nom de l'admin]."

**Given** je suis admin/owner
**When** je consulte les acces prestataires
**Then** je peux prolonger, reduire ou revoquer l'acces a tout moment

**Given** un prestataire est actif
**When** il valide des rituels
**Then** les parents voient les mises a jour en temps reel

### Story 1.8: Fiches membres

En tant que membre du foyer,
Je veux consulter la fiche de chaque membre avec les informations importantes,
Afin que les allergies, numeros d'urgence et consignes soient toujours accessibles.

**Criteres d'acceptation :**

**Given** je suis membre du foyer
**When** je tape sur l'avatar ou le prenom d'un membre
**Then** je vois sa fiche

**Given** je consulte une fiche membre
**When** la fiche charge
**Then** je vois : prenom, photo/avatar, couleur, role, relation — et pour les enfants : tranche d'age, pictogramme

**Given** le membre a des infos medicales
**When** je consulte sa fiche
**Then** je vois : allergies, medicaments, consignes specifiques, numeros d'urgence

**Given** je suis prestataire
**When** je consulte les fiches
**Then** je vois uniquement les fiches des membres qui me sont assignes

**Given** je suis enfant avec permissions par defaut
**When** je tente de voir les fiches d'autres membres
**Then** je vois uniquement ma propre fiche (sauf si permission accordee)

**Given** je suis admin/owner
**When** je consulte une fiche
**Then** je peux editer les informations (allergies, consignes, numeros d'urgence)

### Epic 2: Rituels quotidiens & Vue colonnes
Les membres creent, consultent et valident leurs rituels quotidiens dans la vue colonnes signature avec synchronisation temps reel.
**FRs couvertes:** FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22
**Inclut:** CRUD rituels, moteur de recurrence, moments (matin/midi/soir), pictogrammes enfants, statuts temps reel (GraphQL Subscriptions + Redis), recapitulatif hebdomadaire, vue colonnes par membre, Home Hub contextuel, MomentSelector, ContinuousScrollMoments, RitualCard/RitualCardExpandable, vues filtrees par role (enfant, prestataire)

## Epic 2: Rituels quotidiens & Vue colonnes

Les membres creent, consultent et valident leurs rituels quotidiens dans la vue colonnes signature avec synchronisation temps reel.

### Story 2.1: CRUD rituels et moteur de recurrence

En tant que parent (owner/admin/adulte),
Je veux creer, modifier et supprimer des rituels recurrents assignes a des membres et des moments de la journee,
Afin de structurer la vie quotidienne de ma famille.

**Criteres d'acceptation :**

**Given** je suis owner/admin/adulte
**When** je cree un rituel
**Then** je renseigne au minimum : nom du rituel + "Creer" (creation simple, divulgation progressive pour les options avancees)

**Given** je cree un rituel avec options avancees
**When** j'ouvre les options
**Then** je peux definir : moment (matin/midi/soir), heure, recurrence (quotidien, jours specifiques), membres assignes (1 a N), pictogramme

**Given** je cree un rituel sans specifier de moment
**When** le systeme le traite
**Then** le moment est deduit de l'heure (6h-12h = matin, 12h-17h = midi, 17h-21h = soir) ou "matin" par defaut

**Given** un rituel recurrent existe (ex: quotidien, lundi-vendredi)
**When** un nouveau jour commence
**Then** les instances du rituel sont generees automatiquement pour les jours configures

**Given** je suis owner/admin/adulte
**When** je modifie un rituel existant
**Then** je peux changer : nom, moment, heure, recurrence, membres assignes, pictogramme (FR11)
**And** je choisis si la modification s'applique a "cette occurrence" ou "toutes les occurrences futures"

**Given** je suis owner/admin/adulte
**When** je supprime un rituel
**Then** je choisis entre "cette occurrence" ou "toutes les occurrences futures"
**And** l'historique des occurrences passees est conserve

**Given** je cree un rituel parent (ex: "Routine du matin")
**When** j'ajoute des sous-etapes
**Then** je peux creer des micro-rituels imbriques (ex: "Brosser les dents", "Faire le lit", "S'habiller")
**And** le rituel parent affiche une progression ("3/5")

**Given** un rituel est cree
**When** je verifie les performances
**Then** l'API repond en < 300ms (NFR3) et la DB supporte 50K rituels actifs avec requetes < 100ms (NFR15)

*Tables creees : Ritual (id, householdId, name, moment, time, recurrence, pictogram, parentRitualId nullable, version), RitualAssignment (ritualId, memberId), RitualInstance (ritualId, date, status)*

### Story 2.2: Consultation et validation des rituels du jour

En tant que membre du foyer,
Je veux consulter mes rituels du jour organises par moment et valider leur statut,
Afin de savoir ce que j'ai a faire et de montrer ma progression.

**Criteres d'acceptation :**

**Given** je suis membre du foyer
**When** j'ouvre la vue rituels
**Then** je vois mes rituels du jour organises par moment : matin, midi, soir (FR13)
**And** le moment actuel est selectionne par defaut selon l'heure

**Given** je consulte mes rituels
**When** je les vois
**Then** les rituels "a faire" sont en haut, les "termines" sont en bas (grises) — hierarchie visuelle claire

**Given** je consulte un rituel
**When** la carte s'affiche (RitualCard)
**Then** je vois : pictogramme (si defini), nom du rituel, indicateur horaire optionnel, zone de check, barre couleur du membre

**Given** je tape sur un rituel simple
**When** l'action se declenche
**Then** le statut bascule (a faire → termine ou termine → a faire) avec micro-animation douce
**And** la carte se grise et glisse vers le bas de la liste (optimistic update < 200ms — NFR1)

**Given** je tape sur un rituel parent (avec micro-rituels)
**When** la carte s'expand
**Then** je vois la liste des micro-rituels avec leur statut individuel

**Given** je coche les micro-rituels un par un
**When** tous sont coches
**Then** le rituel parent se complete automatiquement

**Given** je coche directement le rituel parent
**When** l'action se declenche
**Then** tous les micro-rituels sont marques fait d'un coup

**Given** un rituel n'est pas complete a la fin de la journee
**When** le jour suivant commence
**Then** le rituel manque disparait sans traitement punitif (zero rouge, zero compteur negatif — principe zero punition)

### Story 2.3: Synchronisation temps reel des statuts

En tant que membre du foyer,
Je veux voir les changements de statut des rituels sur tous les appareils en temps reel,
Afin que toute la famille voie la progression instantanement.

**Criteres d'acceptation :**

**Given** un membre coche un rituel sur son appareil
**When** le statut est mis a jour
**Then** tous les autres membres connectes au meme foyer voient le changement en < 2 secondes (FR17, NFR2)

**Given** le backend recoit une mutation de statut
**When** le changement est persiste
**Then** un evenement `ritual.status.changed` est emis via GraphQL Subscription + Redis Pub/Sub

**Given** un membre est connecte
**When** il souscrit aux changements du foyer
**Then** la souscription est filtree par householdId (room Socket.IO par foyer)

**Given** un membre cree ou modifie un rituel
**When** le changement est persiste
**Then** les evenements `ritual.created` / `ritual.updated` sont broadcasts a tous les membres du foyer

**Given** un membre rejoint le foyer
**When** il se connecte
**Then** l'evenement `member.joined` est broadcast

**Given** 500 connexions WebSocket simultanees
**When** le systeme est sous charge
**Then** les performances restent stables (NFR16)

**Given** un membre perd la connexion puis se reconnecte
**When** la reconnexion est etablie
**Then** les changements manques sont rattrapes automatiquement (reconciliation)

### Story 2.4: Vue colonnes par membre et Home Hub

En tant que membre du foyer,
Je veux visualiser les rituels de toute la famille en colonnes par membre avec navigation par moment,
Afin d'avoir une vue d'ensemble claire de l'organisation du foyer.

**Criteres d'acceptation :**

**Given** j'ouvre l'app
**When** le Home Hub charge
**Then** je vois une grille de FeatureBlocks contextualisee — le bloc "Rituels" affiche un apercu ("3/5 faits") et est priorise selon le moment actuel

**Given** je tape sur le bloc Rituels du Home Hub
**When** le module rituels s'ouvre
**Then** je vois ma colonne (MemberColumn) avec mes rituels du moment actuel
**And** les bords des colonnes voisines sont visibles (peek — invitation au swipe)

**Given** je suis sur la vue colonnes (mobile)
**When** je swipe horizontalement
**Then** je navigue entre les colonnes des membres du foyer

**Given** je suis sur la vue colonnes (web desktop)
**When** la page charge
**Then** je vois 2 a 4 colonnes cote a cote selon la largeur de l'ecran

**Given** je suis sur une colonne
**When** je scrolle verticalement au-dela du dernier rituel du matin
**Then** la vue transitionne vers les rituels du midi avec le MomentSelector qui se met a jour automatiquement (ContinuousScrollMoments + Intersection Observer)

**Given** je tape sur un tab du MomentSelector (Matin/Midi/Soir)
**When** l'action se declenche
**Then** la liste scrolle directement vers la section correspondante

**Given** je suis parent (owner/admin/adulte)
**When** je consulte la vue colonnes
**Then** je vois toutes les colonnes de tous les membres du foyer (FR20)

**Given** chaque colonne
**When** elle s'affiche
**Then** le header contient le prenom, l'avatar avec ring couleur du membre (MemberAvatar)
**And** un tap sur le header ouvre la fiche membre

**Given** l'app demarre
**When** le cold start se termine
**Then** les rituels du jour sont affiches en < 3 secondes (NFR5)

**Given** le web (pages publiques)
**When** je mesure les performances
**Then** les Core Web Vitals sont respectes : LCP < 2.5s, FID < 100ms, CLS < 0.1 (NFR6)

### Story 2.5: Profils visuels adaptatifs (enfants et pictogrammes)

En tant qu'enfant du foyer,
Je veux une interface adaptee a mon age avec des pictogrammes et la possibilite de valider mes rituels seul,
Afin de gagner en autonomie.

**Criteres d'acceptation :**

**Given** je suis un enfant avec le role "enfant"
**When** je valide le statut d'un de mes rituels
**Then** l'action fonctionne de la meme maniere que pour un adulte (meme geste, meme dignite) (FR15)

**Given** je suis un enfant de profil < 7 ans
**When** je consulte mes rituels
**Then** chaque rituel affiche un pictogramme grand et clair, avec texte minimal et boutons larges tactiles (FR16)

**Given** je suis un enfant de profil >= 7 ans
**When** je consulte mes rituels
**Then** les ritual cards sont legerement plus grandes que la version adulte, avec pictogramme toujours present + texte (FR21)

**Given** je suis un enfant avec permissions par defaut
**When** j'ouvre l'app
**Then** je vois uniquement ma colonne (FR21) et le Home Hub avec des blocs reduits (pas de gestion foyer)

**Given** un parent a accorde la permission "consulter colonnes autres membres"
**When** je swipe horizontalement
**Then** je peux voir les colonnes des membres autorises

**Given** je suis un enfant de profil < 7 ans
**When** les ritual cards s'affichent
**Then** les cibles tactiles sont >= 48px et les pictogrammes sont accompagnes d'un texte alternatif (NFR25)

**Given** le theming temporel est actif
**When** je consulte l'app le matin
**Then** l'ambiance est chaude et lumineuse (#FFFBF5), le soir elle est douce (#FFF8F0), la nuit sombre (#0F172A) — avec transition progressive

### Story 2.6: Vue prestataire restreinte

En tant que prestataire,
Je veux voir uniquement les colonnes et consignes des membres dont j'ai la charge,
Afin de savoir exactement quoi faire pendant ma garde.

**Criteres d'acceptation :**

**Given** je suis prestataire
**When** j'ouvre l'app
**Then** je vois un Home Hub restreint avec uniquement les blocs autorises (rituels + consignes des membres assignes)

**Given** je suis prestataire
**When** je consulte la vue colonnes
**Then** je vois UNIQUEMENT les colonnes des membres qui me sont assignes (FR22)
**And** je ne vois pas les colonnes des autres membres du foyer

**Given** je suis prestataire
**When** je tape sur le header d'une colonne
**Then** je vois la fiche membre avec consignes, allergies et numeros d'urgence

**Given** je suis prestataire
**When** je tente d'acceder a la gestion du foyer, les parametres ou le chat IA
**Then** ces fonctionnalites ne sont pas accessibles (pas de menu, pas de navigation possible)

**Given** je suis prestataire
**When** je valide un rituel d'un enfant a ma charge
**Then** les parents voient la mise a jour en temps reel

### Story 2.7: Recapitulatif hebdomadaire

En tant que parent,
Je veux consulter un recapitulatif hebdomadaire du taux de completion des rituels par membre,
Afin de mesurer la repartition de la charge et la progression de la famille.

**Criteres d'acceptation :**

**Given** je suis parent (owner/admin/adulte)
**When** je consulte le recapitulatif hebdomadaire
**Then** je vois la periode (semaine du X au Y) et le taux de completion par membre avec barres de progression en couleur membre (FR18)

**Given** le recapitulatif s'affiche
**When** je lis les statistiques
**Then** le ton est factuel et chaleureux — "Cette semaine, 4 membres du foyer ont contribue aux rituels du matin" (pas de "Bravo !", zero feedback celebratif)

**Given** le recapitulatif est disponible
**When** je ne le consulte pas un dimanche
**Then** il n'y a pas de relance ni de notification forcee (calm technology)

**Given** le recapitulatif est consulte
**When** les donnees sont calculees
**Then** elles proviennent d'un read model pre-agrege (CQRS) — pas de requete couteuse a la volee

**Given** le recapitulatif est affiche sur mobile
**When** je scrolle
**Then** les graphiques sont empiles verticalement

**Given** le recapitulatif est affiche sur web desktop
**When** la page charge
**Then** les graphiques sont cote a cote (layout horizontal)

**Given** le recapitulatif montre la repartition
**When** je compare les pourcentages entre membres
**Then** je peux identifier objectivement qui contribue et dans quelle proportion (outil de visibilite pour Nadia/Sophie)

### Epic 3: Intelligence Artificielle & Onboarding
Un membre interagit avec l'IA en langage naturel (texte et voix) pour gerer ses rituels et obtenir des informations, et un nouvel utilisateur s'installe en < 90 secondes via l'onboarding intelligent.
**FRs couvertes:** FR23, FR24, FR25, FR26, FR27, FR28, FR29
**Inclut:** Module NestJS ai/, integration LLM agnostique avec tool-calling extensible, STT natif (input vocal) + TTS natif (output vocal), guardrails mineurs, transparence IA permanente, filtrage output, FAB flottant AIFloatingButton, AIChatPanel (bottom sheet mobile / panel lateral web), chips suggestions contextuelles, aide integree sur le fonctionnement de l'app, onboarding 2 questions + generation IA de routine, spotlight FAB

## Epic 3: Intelligence Artificielle & Onboarding

Un membre interagit avec l'IA en langage naturel (texte et voix) pour gerer ses rituels et obtenir des informations, et un nouvel utilisateur s'installe en < 90 secondes via l'onboarding intelligent.

### Story 3.1: Module IA backend, interface chat et interaction vocale

En tant que membre autorise,
Je veux interagir avec un assistant IA via un chat textuel et vocal integre a l'application,
Afin d'obtenir de l'aide et d'effectuer des actions en langage naturel sans naviguer dans les menus.

**Criteres d'acceptation :**

**Given** je suis authentifie et sur n'importe quel ecran de l'application
**When** je regarde le coin inferieur droit
**Then** je vois un bouton flottant AIFloatingButton (48-56px) permettant d'ouvrir l'assistant IA (FR24)

**Given** je tape sur le AIFloatingButton sur mobile
**When** le chat s'ouvre
**Then** un AIChatPanel apparait en bottom sheet avec un champ de saisie texte, un bouton micro (STT), et des chips de suggestions contextuelles basees sur l'ecran actuel et le moment de la journee

**Given** je tape sur le AIFloatingButton sur web desktop
**When** le chat s'ouvre
**Then** un AIChatPanel apparait en panel lateral droit avec les memes elements (champ texte, micro, chips suggestions)

**Given** le chat IA est ouvert
**When** je regarde l'interface
**Then** un indicateur permanent "Vous parlez a une IA" est visible en haut du panel a tout moment (FR27, conformite EU AI Act Article 50)

**Given** je tape un message texte dans le chat
**When** j'envoie le message
**Then** l'IA repond en streaming (premier token < 2 secondes, NFR4) et la reponse s'affiche progressivement

**Given** le chat est ouvert
**When** je tape le bouton micro
**Then** l'enregistrement vocal demarre (STT natif : react-native-voice sur mobile, Web Speech API sur web), un indicateur visuel montre que l'app ecoute, et ma parole est transcrite en texte dans le champ de saisie

**Given** l'IA a repondu a mon message
**When** je regarde la reponse
**Then** un bouton "ecouter" est disponible sur chaque reponse pour activer la synthese vocale (TTS natif : iOS Speech Synthesis / Android TTS / Web Speech API)

**Given** je suis dans les preferences du chat IA
**When** j'active l'option "lecture automatique"
**Then** chaque reponse de l'IA est automatiquement lue a voix haute sans tap supplementaire

**Given** le module NestJS ai/ est deploye
**When** je verifie l'architecture
**Then** le module expose un resolver GraphQL pour les messages, utilise un service LLM agnostique du provider (abstraction permettant de changer de provider sans modifier le module), et supporte le streaming via subscription GraphQL ou SSE

**Given** l'IA recoit un message
**When** elle traite la requete
**Then** le contexte utilisateur est injecte automatiquement (role, permissions, foyer, moment de la journee, ecran actuel) pour des reponses personnalisees

*Tables creees : AiConversation (id, memberId, householdId, createdAt, updatedAt), AiMessage (id, conversationId, role enum [user, assistant], content, toolCalls jsonb, createdAt)*
*Composants crees : AIFloatingButton, AIChatPanel, ChatBubble, VoiceInputButton*

### Story 3.2: CRUD rituels par langage naturel via IA

En tant que membre autorise,
Je veux creer, modifier ou supprimer des rituels en parlant ou ecrivant en langage naturel,
Afin de gerer mes routines familiales sans naviguer dans les formulaires.

**Criteres d'acceptation :**

**Given** le chat IA est ouvert et je suis un parent/admin/owner
**When** j'ecris ou dis "Ajoute ranger la chambre pour Lucas tous les soirs"
**Then** l'IA utilise le tool-calling (ritual.tool.ts) pour creer le rituel avec les parametres extraits (nom: "Ranger la chambre", membre: Lucas, moment: soir, recurrence: quotidien), affiche un resume de l'action et demande confirmation avant execution (FR25)

**Given** j'ai confirme la creation d'un rituel via l'IA
**When** l'action est executee
**Then** le rituel est cree via la meme mutation GraphQL que l'UI classique, les regles de validation Zod sont appliquees, et un message de confirmation est affiche avec les details du rituel cree

**Given** le chat IA est ouvert
**When** j'ecris "Modifie le rituel brossage de dents de Lucas a 20h au lieu de 19h"
**Then** l'IA identifie le rituel concerne via household.tool.ts (recherche contextuelle), affiche le changement propose, et demande confirmation avant execution (FR25)

**Given** le chat IA est ouvert
**When** j'ecris "Supprime le rituel preparer le cartable pour Lucas"
**Then** l'IA identifie le rituel, affiche un resume avec avertissement de suppression ("Ce rituel sera supprime definitivement"), et demande confirmation explicite avant execution (FR25)

**Given** l'IA ne trouve pas de correspondance unique pour un rituel
**When** plusieurs rituels correspondent a la description
**Then** l'IA propose une liste numerotee des rituels correspondants et demande de preciser lequel

**Given** l'IA interprete ma commande
**When** les parametres extraits sont incomplets (ex: pas de membre specifie)
**Then** l'IA pose une question de clarification ("Pour quel membre ?") au lieu de deviner

**Given** j'annule une action apres la confirmation
**When** je dis "annule" ou "non finalement"
**Then** l'action n'est pas executee et l'IA confirme l'annulation

**Given** le module ai/ traite une commande CRUD
**When** l'action est executee avec succes
**Then** les memes events CQRS sont emis que pour une action UI (RitualCreatedEvent, RitualUpdatedEvent, RitualDeletedEvent) — les subscriptions temps reel et notifications fonctionnent identiquement

*Architecture : ritual.tool.ts definit les tools LLM (createRitual, updateRitual, deleteRitual) qui appellent les memes commands CQRS que les mutations GraphQL classiques*

### Story 3.3: Questions contextuelles et aide integree

En tant que membre,
Je veux poser des questions a l'IA sur l'organisation du foyer et le fonctionnement de l'application,
Afin d'obtenir des reponses instantanees sans chercher manuellement dans l'interface.

**Criteres d'acceptation :**

**Given** le chat IA est ouvert
**When** je demande "Quel est le programme de Lucas ce soir ?"
**Then** l'IA interroge le contexte du foyer (household.tool.ts) et retourne les rituels de Lucas pour le moment "soir" du jour courant, avec leurs statuts actuels (FR26)

**Given** le chat IA est ouvert
**When** je demande "Quelles sont les allergies de Lucas ?"
**Then** l'IA retourne les consignes et allergies du membre concerne depuis sa fiche membre (FR26)

**Given** le chat IA est ouvert
**When** je demande "Qui a fini ses rituels ce matin ?"
**Then** l'IA interroge les statuts des rituels du matin pour tous les membres du foyer et retourne un resume (FR26)

**Given** le chat IA est ouvert
**When** je demande "C'est quoi ma prochaine routine ?"
**Then** l'IA determine le prochain moment de la journee (matin/midi/soir) et retourne mes rituels pour ce moment avec la reponse vocale disponible via TTS

**Given** le chat IA est ouvert
**When** je demande "Comment j'invite quelqu'un dans le foyer ?"
**Then** l'IA repond avec les etapes pour inviter un membre (aide sur le fonctionnement de l'app), en utilisant un contexte systeme decrivant les features de l'application (FR26 elargi)

**Given** le chat IA est ouvert
**When** je demande "Comment je change le role d'un membre ?"
**Then** l'IA explique la procedure et peut proposer de naviguer vers l'ecran concerne

**Given** les chips de suggestions contextuelles sont affichees
**When** je suis sur la vue colonnes le matin
**Then** les suggestions incluent "Rituels du matin", "Qui a fini ?", "Ajoute un rituel"

**Given** les chips de suggestions sont affichees
**When** je suis sur la fiche d'un membre
**Then** les suggestions incluent "Consignes de [prenom]", "Rituels de [prenom] aujourd'hui"

**Given** l'IA repond a une question contextuelle
**When** je verifie la source des donnees
**Then** l'IA utilise des read models CQRS pre-agreges pour le contexte (pas de requetes couteuses a la volee), et les donnees retournees respectent l'isolation par foyer (NFR9)

*Architecture : household.tool.ts expose les tools de lecture (getMemberRituals, getMemberInfo, getHouseholdStatus, getAppHelp). Le contexte IA est pre-agrege via read models CQRS dedies.*

### Story 3.4: Guardrails IA — filtrage mineurs et contraintes par role

En tant que parent admin/owner,
Je veux que l'IA filtre ses reponses pour les mineurs et n'execute que les actions autorisees par le role du membre,
Afin de garantir la securite et la conformite pour ma famille.

**Criteres d'acceptation :**

**Given** un enfant interagit avec le chat IA
**When** l'IA genere une reponse
**Then** le contenu est filtre via ai.guardrails.ts : zero contenu violent, sexuel, inapproprie ou anxiogene. Les categories bannies sont appliquees systematiquement (FR28)

**Given** je suis un parent admin/owner
**When** j'accede aux parametres de l'IA
**Then** je peux configurer la liste des categories de contenu bannies pour les profils mineurs du foyer (FR28)

**Given** un enfant demande a l'IA de supprimer un rituel
**When** l'IA verifie les permissions du role "enfant"
**Then** l'action est refusee — l'IA explique que cette action necessite un parent et propose d'envoyer une demande (voir Story 8.4) (FR29)

**Given** un enfant demande a l'IA de creer un rituel pour lui-meme
**When** l'IA verifie les permissions
**Then** l'action est autorisee UNIQUEMENT si le parent admin a debloque la permission "creation de rituels" pour cet enfant (FR29, FR31)

**Given** un prestataire interagit avec le chat IA
**When** il demande des informations sur un membre dont il n'a pas la charge
**Then** l'IA refuse et explique qu'il n'a acces qu'aux membres dont il a la charge (FR29, FR22)

**Given** un prestataire demande a l'IA de modifier un rituel
**When** l'IA verifie les permissions du role "prestataire"
**Then** l'action est refusee — le prestataire a un acces lecture seule (FR29, FR6)

**Given** le AIFloatingButton est affiche pour un profil enfant
**When** je verifie sa visibilite
**Then** le FAB est desactive par defaut pour les enfants. Un parent admin peut l'activer dans les permissions de l'enfant (FR30, FR31)

**Given** un membre adulte interagit avec l'IA
**When** l'IA repond
**Then** aucun filtrage de contenu supplementaire n'est applique (le filtrage mineurs ne concerne que les profils enfants)

**Given** l'IA recoit une requete de n'importe quel membre
**When** elle determine les actions disponibles
**Then** seuls les tools LLM correspondant au role du membre sont exposes au LLM dans le contexte de la requete (principe du moindre privilege — un enfant ne voit meme pas les tools de suppression) (NFR11)

*Architecture : ai.guardrails.ts intercepte les inputs et outputs du LLM. Le filtrage des tools est fait en amont (le LLM ne recoit que les tools autorises pour le role). Le filtrage output est fait en aval (scan du contenu genere avant envoi au client).*

### Story 3.5: Onboarding intelligent

En tant que nouvel utilisateur,
Je veux completer l'onboarding en 2 questions et obtenir une premiere routine generee par l'IA,
Afin de percevoir la valeur de l'application immediatement et de commencer a organiser mon foyer.

**Criteres d'acceptation :**

**Given** je viens de creer mon compte et mon foyer (Story 1.3)
**When** j'arrive sur l'ecran d'onboarding
**Then** je vois la question 1 : "Combien de membres dans votre foyer ?" avec un selecteur simple (2, 3, 4, 5, 6+)

**Given** j'ai repondu a la question 1
**When** l'ecran suivant s'affiche
**Then** je vois la question 2 : "Quel moment est le plus chaotique ?" avec 3 choix : Matin / Midi / Soir (FR23)

**Given** j'ai repondu aux 2 questions
**When** l'IA genere la routine
**Then** une animation discrete de generation s'affiche (2-3 secondes max), puis une liste de rituels generes par moment est affichee, modifiables avant validation. Le message "L'IA a cree ca pour vous — ajustez si besoin" est affiche (FR23)

**Given** la routine generee est affichee
**When** je modifie, supprime ou ajoute des rituels
**Then** les modifications sont appliquees en temps reel dans la liste avant validation finale

**Given** je tape "Continuer" apres la routine generee
**When** l'ecran suivant s'affiche
**Then** un spotlight/zoom anime met en evidence le FAB IA avec le message : "A tout moment, dites a l'assistant ce que vous voulez. Il cree, modifie ou supprime vos rituels en une phrase." + exemple anime. Un bouton "Compris" ou tap sur le FAB pour essayer (FR23)

**Given** j'ai passe l'etape spotlight FAB
**When** l'ecran des prenoms s'affiche
**Then** je vois un champ par membre (Membre 1, 2... selon la reponse Q1), avec une couleur attribuee automatiquement par le systeme (bleu, violet, ambre, emeraude, rouge doux, indigo)

**Given** j'ai renseigne les prenoms
**When** je tape "Terminer"
**Then** j'arrive sur le Home Hub avec le bloc "Rituels du [moment actuel]" en evidence, et les rituels generes sont visibles dans la vue colonnes

**Given** l'ensemble du flux onboarding
**When** je mesure le temps total
**Then** le temps entre la premiere question et l'arrivee sur le Home Hub est < 90 secondes (FR23)

**Given** la generation IA de la routine
**When** je mesure le temps de generation
**Then** la routine est generee en < 60 secondes (temps serveur IA inclus) (FR23)

**Given** le backend recoit la requete de generation d'onboarding
**When** il traite la generation
**Then** le module ai/ utilise un prompt dedie a l'onboarding (nombre de membres, moment chaotique) pour generer des rituels adaptes, realistes et varies. Les rituels sont crees via les memes commands CQRS que l'UI classique.

**Given** le flux onboarding est complete
**When** je verifie l'etat du foyer
**Then** les membres sont crees avec des profils temporaires (prenom + couleur), le role "owner" est attribue a l'utilisateur qui a cree le foyer, les rituels generes sont actifs et associes aux membres

*Composants crees : OnboardingWizard (steps), OnboardingQuestion, OnboardingRoutinePreview, FABSpotlight*

---

**Resume Epic 3 :** 5 stories, couvrant FR23, FR24, FR25, FR26, FR27, FR28, FR29. Architecture tool-calling extensible, voix bidirectionnelle (STT + TTS), guardrails par role, onboarding generatif < 90s.

### Epic 4: Notifications intelligentes
Les membres recoivent des rappels de rituels et des notifications de completion, configurables et non intrusives (calm technology).
**FRs couvertes:** FR36, FR37, FR38, FR39, FR40
**Inclut:** Expo Notifications (push iOS/Android), BullMQ jobs async, moteur de regles extensible (chaque type de notification = une regle declarative), groupement par moment, preferences par membre, notifications enfants desactivees par defaut

## Epic 4: Notifications intelligentes

Les membres recoivent des rappels de rituels et des notifications de completion, configurables et non intrusives (calm technology).

### Story 4.1: Infrastructure notifications push et moteur de regles

En tant que developpeur (Thomas),
Je veux un module de notifications avec un moteur de regles extensible et l'integration Expo Notifications,
Afin de disposer d'une infrastructure capable d'envoyer des push notifications et d'accueillir tout nouveau type de notification sans modifier le code existant.

**Criteres d'acceptation :**

**Given** le module NestJS notification/ est cree
**When** je verifie l'architecture
**Then** le module contient : notification.module.ts, notification.resolver.ts, notification.service.ts, notification.processor.ts (BullMQ), notification.rules.ts (registre de regles), et un dossier rules/ pour les regles declaratives

**Given** un device mobile (iOS ou Android) est installe
**When** l'utilisateur accepte les notifications push
**Then** le push token Expo est enregistre en base, associe au membre et au device (un membre peut avoir plusieurs devices)

**Given** un push token est enregistre
**When** le membre se deconnecte ou revoque les notifications
**Then** le push token est supprime de la base

**Given** le moteur de regles est initialise
**When** un event CQRS est emis (ex: RitualCompletedEvent)
**Then** le moteur parcourt les regles enregistrees, evalue les conditions de chaque regle, et declenche l'envoi si les conditions sont remplies

**Given** je veux ajouter un nouveau type de notification a l'avenir
**When** je cree un nouveau fichier dans rules/ (ex: calendar-reminder.rule.ts)
**Then** la regle est auto-enregistree dans le moteur sans modifier notification.service.ts ni notification.processor.ts — pattern plugin/registry

**Given** une notification doit etre envoyee
**When** le moteur declenche l'envoi
**Then** un job BullMQ est cree (pas d'envoi synchrone), le processor recupère le job et envoie via Expo Notifications API, avec retry (3 tentatives, backoff exponentiel) et dead letter queue en cas d'echec

**Given** une notification est envoyee
**When** je verifie les logs
**Then** le type, le destinataire, le statut (sent/failed), et le timestamp sont traces (observabilite)

**Given** le moteur de regles evalue les conditions
**When** le destinataire est un profil enfant sans notifications activees
**Then** la regle est ignoree pour ce destinataire (respect du controle parental, FR40 — logique dans le moteur, pas dans chaque regle)

*Tables creees : PushToken (id, memberId, householdId, token, platform enum [ios, android, web], createdAt), NotificationLog (id, memberId, householdId, type, payload jsonb, status enum [pending, sent, failed], createdAt, sentAt)*
*Architecture : chaque regle implemente une interface NotificationRule { module: string; ruleType: string; eventType: string; label: string; defaultEnabled: boolean; configurableOptions: ConfigOption[]; evaluate(event, context): NotificationPayload[] | null }. Le champ module identifie le module source (ex: "ritual", "request", "calendar"). Le moteur itere les regles au moment de l'event. L'UI des preferences regroupe automatiquement les regles par module. Pattern extensible — zero modification du moteur ni de l'UI des preferences pour chaque nouveau type ou module.*

### Story 4.2: Rappels de rituels groupes par moment

En tant que parent,
Je veux recevoir un rappel regroupe pour mes rituels a chaque moment de la journee,
Afin de savoir ce qui est prevu sans etre submerge de notifications individuelles.

**Criteres d'acceptation :**

**Given** des rituels sont planifies pour moi au moment "matin"
**When** l'heure du rappel matin est atteinte
**Then** je recois une seule notification push regroupant tous mes rituels du matin : "Matin — 4 rituels : Reveil Lucas, Petit-dej, Preparer cartable, Brossage de dents" (FR36, FR39)

**Given** des rituels sont planifies pour le moment "midi"
**When** l'heure du rappel midi est atteinte
**Then** je recois au maximum 1 notification groupee pour le midi, meme si j'ai 10 rituels (FR39)

**Given** des rituels sont planifies pour le moment "soir"
**When** l'heure du rappel soir est atteinte
**Then** je recois au maximum 1 notification groupee pour le soir (FR39)

**Given** tous mes rituels d'un moment sont deja termines
**When** l'heure du rappel est atteinte
**Then** aucune notification n'est envoyee pour ce moment (pas de rappel inutile)

**Given** je n'ai aucun rituel planifie pour un moment
**When** l'heure du rappel est atteinte
**Then** aucune notification n'est envoyee pour ce moment

**Given** le systeme de rappels
**When** je verifie l'implementation
**Then** les rappels sont declenches par des jobs BullMQ programes (cron/scheduled) — un job par moment par foyer, qui evalue les rituels en attente et envoie les notifications groupees

**Given** les heures par defaut des rappels
**When** aucune personnalisation n'est configuree
**Then** les heures par defaut sont : matin 7h00, midi 12h00, soir 18h00 (modifiables dans les preferences, Story 4.4)

**Given** un rappel est envoye
**When** le membre tape la notification
**Then** il est dirige vers la vue colonnes filtree sur le moment concerne

*Architecture : ritual-reminder.rule.ts dans rules/ — ecoute un event ScheduledMomentEvent emis par un cron job BullMQ. Evalue les rituels non termines par membre/moment, construit une notification groupee.*

### Story 4.3: Notification de completion 100% enfant

En tant que parent,
Je veux etre notifie quand mon enfant a termine 100% de ses rituels pour un moment,
Afin de savoir que tout est fait sans avoir a verifier manuellement.

**Criteres d'acceptation :**

**Given** Lucas a des rituels assignes pour le moment "matin"
**When** Lucas (ou un parent) marque le dernier rituel du matin comme "termine"
**Then** une notification push est envoyee aux parents du foyer : "Lucas a termine tous ses rituels du matin" (FR37)

**Given** Lucas a 5 rituels le matin et 4 sont termines
**When** le 5e rituel est marque comme "termine"
**Then** la notification de completion 100% est envoyee dans les 5 secondes suivant l'event RitualCompletedEvent

**Given** Lucas a 5 rituels le matin et 3 sont termines
**When** le 4e rituel est marque comme "termine" (mais pas le dernier)
**Then** aucune notification de completion n'est envoyee (la regle ne se declenche qu'a 100%)

**Given** un foyer a plusieurs enfants
**When** chaque enfant complete 100% d'un moment
**Then** chaque parent recoit une notification distincte par enfant (pas de groupement inter-enfants — chaque completion est un evenement a celebrer factuellement)

**Given** le parent a desactive les notifications de type "completion enfant" dans ses preferences
**When** un enfant complete 100%
**Then** aucune notification n'est envoyee a ce parent

**Given** le ton de la notification
**When** je lis le message
**Then** le ton est factuel et chaleureux — "Lucas a termine tous ses rituels du matin" — pas de "Bravo !", pas de confettis, pas d'emojis celebratifs (principe zero feedback celebratif)

*Architecture : child-completion.rule.ts dans rules/ — ecoute RitualCompletedEvent, verifie si tous les rituels du membre pour le moment sont termines, envoie aux parents si 100%.*

### Story 4.4: Preferences et controle parental des notifications

En tant que membre,
Je veux configurer mes preferences de notification (types, horaires),
Afin de recevoir uniquement les notifications pertinentes aux moments qui me conviennent.

**Criteres d'acceptation :**

**Given** je suis dans mes parametres de profil
**When** j'accede a la section "Notifications"
**Then** je vois les types de notifications organises par module (ex: section "Rituels" avec rappels par moment + completion enfant, section "Demandes" avec demandes recues + resultats). Chaque type a un toggle et ses options specifiques. Le regroupement est automatique — base sur le champ module de chaque NotificationRule (FR38)

**Given** je configure les horaires de rappel
**When** je modifie l'heure du rappel matin
**Then** l'heure est sauvegardee et les prochains rappels utiliseront la nouvelle heure (FR38)

**Given** je desactive un type de notification
**When** un evenement correspondant se produit
**Then** aucune notification de ce type ne m'est envoyee (FR38)

**Given** je suis un parent admin/owner
**When** j'accede aux parametres d'un profil enfant
**Then** je vois un toggle "Activer les notifications push" (desactive par defaut) avec un avertissement : "Les enfants ne recoivent pas de notifications par defaut" (FR40)

**Given** j'active les notifications pour un enfant
**When** je sauvegarde
**Then** l'enfant commence a recevoir les types de notifications que j'ai coches pour lui (rappels rituels uniquement par defaut, pas de completion — c'est un type parent) (FR40)

**Given** un nouveau type de notification est ajoute a l'avenir (ex: rappel calendrier dans le module "calendar")
**When** il est deploye
**Then** une nouvelle section "Calendrier" apparait automatiquement dans l'ecran de preferences avec le type et son etat par defaut — pas de migration manuelle, pas de modification de l'UI des preferences

**Given** un nouveau module ajoute plusieurs types de notifications
**When** ils sont deployes
**Then** tous les types du module apparaissent groupes sous la meme section dans les preferences, avec leurs options specifiques (horaires, toggle, seuils, etc.)

**Given** un prestataire
**When** il accede a ses preferences de notification
**Then** il ne voit que les types pertinents a son role (rappels rituels des membres a sa charge) — les types non applicables ne sont pas affiches

**Given** les preferences sont sauvegardees
**When** le moteur de regles evalue une notification
**Then** les preferences du destinataire sont consultees AVANT l'envoi — si le type est desactive ou l'horaire ne correspond pas, la notification est filtree

*Tables creees : NotificationPreference (id, memberId, householdId, ruleType string, enabled boolean, config jsonb — stocke les horaires et options specifiques par type, createdAt, updatedAt)*
*Architecture : les preferences sont consultees par le moteur de regles via le contexte. Chaque regle declare son module, son label, son etat par defaut, et ses options configurables (horaires, toggles, seuils). L'UI des preferences query le registre de regles et genere automatiquement les sections par module + les controles par type. Ajouter un module avec 5 types de notifications = 5 fichiers rule, zero code UI.*

---

**Resume Epic 4 :** 4 stories, couvrant FR36, FR37, FR38, FR39, FR40. Moteur de regles extensible par module (pattern plugin/registry) — chaque nouveau type de notification = 1 fichier rule dans rules/ avec declaration du module parent. L'UI des preferences se genere automatiquement par module. Calm technology : groupement par moment, ton factuel, enfants proteges par defaut. Les futures notifications (calendrier, communication, geolocalisation) s'ajouteront comme de nouveaux modules sans modifier le moteur ni l'UI.

### Epic 5: Mode Offline & Synchronisation
L'application fonctionne hors ligne pour la consultation et la validation des rituels, avec synchronisation automatique a la reconnexion.
**FRs couvertes:** FR45, FR46, FR47, FR48
**Inclut:** apollo3-cache-persist (mobile complet, web lecture seule), queue de mutations locale, OCC (Optimistic Concurrency Control) via champ version Prisma, indicateur connexion, resolution conflits last-write-wins

## Epic 5: Mode Offline & Synchronisation

L'application fonctionne hors ligne pour la consultation et la validation des rituels, avec synchronisation automatique a la reconnexion.

### Story 5.1: Cache offline et consultation des rituels hors ligne

En tant que membre sur mobile,
Je veux consulter mes rituels du jour meme sans connexion internet,
Afin de savoir ce que j'ai a faire meme dans un lieu sans reseau (metro, campagne, avion).

**Criteres d'acceptation :**

**Given** je suis authentifie sur l'app mobile et j'ai consulte mes rituels au moins une fois en ligne
**When** je perds la connexion internet
**Then** mes rituels du jour restent consultables — les donnees sont servies depuis le cache local persiste (FR45)

**Given** l'app mobile est installee
**When** je verifie la configuration Apollo Client
**Then** `apollo3-cache-persist` est configure avec AsyncStorage comme couche de persistance, le cache est sauvegarde a chaque modification et restaure au demarrage de l'app

**Given** je suis hors ligne sur mobile
**When** je navigue dans l'app
**Then** je peux consulter : mes rituels du jour par moment, les fiches membres (consignes, allergies, numeros d'urgence), et la vue colonnes avec les dernieres donnees en cache (FR45)

**Given** je suis hors ligne sur mobile
**When** j'essaie d'acceder au chat IA
**Then** un message discret m'informe que l'assistant IA necessite une connexion internet — pas de message d'erreur rouge, juste une indication factuelle

**Given** je suis sur l'app web
**When** je perds la connexion internet
**Then** les donnees deja chargees restent visibles en lecture seule — aucune mutation n'est possible sur web hors ligne (mobile complet, web lecture seule)

**Given** l'app mobile demarre en mode hors ligne (cold start sans reseau)
**When** l'app s'ouvre
**Then** le cache persiste est restaure et les rituels du jour s'affichent en < 3 secondes (NFR5)

**Given** le cache est persiste
**When** je verifie la taille
**Then** seules les donnees du foyer actif sont cachees (pas de donnees cross-foyer en cache, respect de l'isolation NFR9)

*Architecture : apollo3-cache-persist avec AsyncStorage (mobile). Le cache contient les resultats des queries GraphQL recentes. La politique de cache Apollo (cache-and-network) sert les donnees locales immediatement puis met a jour si le reseau est disponible.*

### Story 5.2: Mutations hors ligne et synchronisation automatique

En tant que membre sur mobile,
Je veux mettre a jour le statut de mes rituels meme hors ligne et que tout se synchronise automatiquement au retour de la connexion,
Afin de ne jamais etre bloque dans ma routine quotidienne par un probleme de reseau.

**Criteres d'acceptation :**

**Given** je suis hors ligne sur mobile
**When** je coche un rituel comme "termine"
**Then** le statut est mis a jour immediatement dans l'UI (optimistic update) et la mutation est ajoutee a la queue de mutations locale (FR46)

**Given** je suis hors ligne
**When** je mets a jour plusieurs rituels successivement
**Then** chaque mutation est ajoutee a la queue dans l'ordre chronologique, la queue persiste entre les redemarrages de l'app

**Given** la connexion internet revient
**When** l'app detecte le retour du reseau
**Then** la queue de mutations est rejouee automatiquement dans l'ordre sequentiel — chaque mutation est envoyee au serveur une par une, sans intervention de l'utilisateur (FR46)

**Given** la queue est en cours de replay
**When** une mutation reussit
**Then** elle est retiree de la queue et la suivante est executee

**Given** la queue est en cours de replay
**When** une mutation echoue pour une erreur reseau transitoire
**Then** le replay s'arrete et reprendra automatiquement quand le reseau sera stable (retry avec backoff exponentiel, 3 tentatives max)

**Given** la queue est en cours de replay
**When** une mutation echoue pour une erreur metier (conflit OCC — voir Story 5.4)
**Then** la mutation en conflit est retiree de la queue, l'erreur est logguee, et le replay continue avec les mutations suivantes — pas de blocage de la queue entiere

**Given** toutes les mutations de la queue sont synchronisees
**When** le replay est termine
**Then** le cache local est mis a jour avec les donnees serveur fraichement recues (reconciliation) et l'UI reflète l'etat reel

**Given** le mode offline
**When** je verifie les mutations supportees hors ligne
**Then** seules les mutations de statut de rituel (a faire → en cours → termine) sont supportees hors ligne au MVP — les creations/modifications/suppressions de rituels necessitent une connexion

*Architecture : offline.queue.ts dans apps/mobile/src/lib/ — queue FIFO persistee dans AsyncStorage, replay sequentiel via un service de synchronisation qui ecoute les changements de connectivite (NetInfo). Les mutations sont des objets serialisables { operationName, variables, timestamp, retryCount }.*

### Story 5.3: Indicateur visuel d'etat de connexion

En tant que membre,
Je veux voir clairement si je suis en ligne, hors ligne ou en cours de synchronisation,
Afin de comprendre l'etat de mes donnees sans confusion.

**Criteres d'acceptation :**

**Given** je suis connecte a internet
**When** je regarde l'app
**Then** aucun indicateur particulier n'est affiche — l'etat en ligne est l'etat par defaut, pas de badge superflu (calm technology) (FR47)

**Given** je perds la connexion internet
**When** le changement d'etat est detecte
**Then** un badge discret apparait (icone nuage barre ou equivalent) dans la barre de navigation ou le header, avec le texte "Hors ligne" accessible au tap (FR47)

**Given** je suis hors ligne
**When** je regarde le badge
**Then** le badge est non intrusif — pas de banniere rouge, pas de popup, pas de vibration. Juste un indicateur visuel sobre et permanent tant que la connexion est absente (principe calm technology)

**Given** la connexion revient et la queue de mutations est en cours de replay
**When** la synchronisation est active
**Then** le badge passe en mode "Synchronisation en cours" avec une micro-animation discrete (icone tournante ou pulsation douce) (FR47)

**Given** la synchronisation est terminee avec succes
**When** toutes les mutations sont envoyees
**Then** le badge disparait en fondu (transition douce, pas de disparition abrupte)

**Given** la synchronisation a echoue partiellement (certains conflits)
**When** la sync est terminee
**Then** le badge affiche un etat "Synchronise avec avertissement" (icone nuage avec point d'attention). Un tap ouvre un detail minimal : "2 modifications n'ont pas pu etre synchronisees — les donnees du serveur ont ete conservees"

**Given** l'etat de connexion change
**When** le composant d'indicateur se met a jour
**Then** l'etat est gere via Zustand (store local ~1KB) et la detection de connectivite via NetInfo (mobile) / navigator.onLine + ping (web)

*Composants crees : ConnectionStatusBadge (mobile + web), SyncStatusDetail (popup/tooltip au tap)*

### Story 5.4: Resolution de conflits deterministe

En tant que developpeur (Thomas),
Je veux que les conflits de synchronisation soient resolus de maniere deterministe et transparente,
Afin de garantir l'integrite des donnees sans intervention manuelle et sans perte.

**Criteres d'acceptation :**

**Given** Sophie coche le rituel "Brossage de dents" de Lucas comme "termine" sur son telephone
**And** Marc coche le meme rituel comme "en cours" sur son telephone au meme moment (avant que la sync de Sophie arrive)
**When** les deux mutations arrivent au serveur
**Then** le conflit est resolu par last-write-wins base sur le timestamp client : la mutation la plus recente gagne pour les mises a jour de statut (FR48)

**Given** le modele Ritual en base de donnees
**When** je verifie le schema Prisma
**Then** un champ `version` (Int, @default(0)) est present pour l'Optimistic Concurrency Control (OCC) — chaque mutation incremente la version

**Given** une mutation offline arrive au serveur
**When** la version envoyee ne correspond pas a la version actuelle en base
**Then** c'est un conflit OCC. Pour les statuts de rituels : la mutation avec le timestamp le plus recent est appliquee, l'autre est ignoree. L'utilisateur dont la mutation a ete ignoree voit son UI se mettre a jour via la subscription temps reel (FR48)

**Given** Sophie cree un rituel offline
**And** Marc cree un rituel different offline au meme moment
**When** les deux creations arrivent au serveur
**Then** les deux rituels sont crees (fusion pour les creations) — les UUID v7 generes cote client garantissent l'unicite (FR48)

**Given** un conflit est resolu
**When** le serveur retourne le resultat
**Then** un event CQRS ConflictResolvedEvent est emis avec le detail (mutation originale, resolution appliquee, timestamp) pour tracabilite

**Given** un conflit est resolu cote serveur
**When** le client receptionne la mise a jour via subscription
**Then** le cache local est mis a jour silencieusement avec l'etat serveur — pas de popup de conflit, pas d'action utilisateur requise (calm technology, NFR19)

**Given** le mode offline est utilise intensivement
**When** je mesure l'integrite des donnees apres reconciliation
**Then** le taux de perte est < 0.1% (NFR19) — les tests automatises couvrent les scenarios de conflit (2 ecritures simultanees, creation + suppression, multi-device)

**Given** un cas extreme : un rituel est modifie offline par un membre et supprime par un admin en ligne
**When** la mutation offline arrive au serveur
**Then** la suppression gagne (le rituel n'existe plus), la mutation est ignoree, et le client recoit la mise a jour de suppression via subscription — pas d'erreur visible

*Architecture : la resolution de conflits est implementee dans le mutation handler backend (Prisma transaction avec WHERE version = expectedVersion). En cas d'echec OCC, le handler compare les timestamps et applique la politique par type d'operation : last-write-wins (statuts), fusion (creations), suppression-wins (suppression vs modification).*

---

**Resume Epic 5 :** 4 stories, couvrant FR45, FR46, FR47, FR48. Mobile complet (lecture + ecriture offline), web lecture seule. Queue de mutations persistee, replay sequentiel automatique, OCC Prisma pour l'integrite, resolution deterministe (last-write-wins statuts, fusion creations, suppression-wins). Calm technology : zero popup de conflit, badge discret, transitions douces.

### Epic 6: Conformite RGPD & Gestion des donnees
Les membres controlent leurs donnees personnelles : export, suppression de compte avec anonymisation, et droit d'acces parental.
**FRs couvertes:** FR41, FR42, FR43, FR44, FR52, FR53, FR54
**Inclut:** Module NestJS compliance/, pipeline export donnees portables, pipeline suppression/anonymisation cascade, collecte minimale documentee, hebergement EU verifie, chiffrement TLS 1.3 + AES-256, droit a l'oubli < 30j, suppression profil enfant, acces parental

## Epic 6: Conformite RGPD & Gestion des donnees

Les membres controlent leurs donnees personnelles : export, suppression de compte avec anonymisation, et droit d'acces parental.

### Story 6.1: Module compliance, collecte minimale et chiffrement

En tant qu'administrateur technique (Thomas),
Je veux un module compliance qui documente la collecte minimale et verifie les exigences de chiffrement et d'hebergement EU,
Afin de garantir la conformite RGPD des la mise en production.

**Criteres d'acceptation :**

**Given** le module NestJS compliance/ est cree
**When** je verifie sa structure
**Then** il contient : compliance.module.ts, export.service.ts, deletion.service.ts, et un fichier data-inventory.ts qui documente exhaustivement toutes les donnees collectees

**Given** le data-inventory.ts est en place
**When** je verifie les donnees collectees
**Then** la liste est strictement limitee a : nom/prenom, email, date de naissance (enfants uniquement), roles, relations, rituels, statuts de rituels, conversations IA, push tokens, preferences de notification. Aucune donnee de localisation, financiere ou biometrique n'est collectee (FR42)

**Given** le data-inventory.ts est modifie
**When** une nouvelle donnee est ajoutee a la liste
**Then** un commentaire obligatoire documente la base legale (consentement, interet legitime, execution du contrat) et la duree de retention pour cette donnee (FR42)

**Given** l'infrastructure est deployee
**When** je verifie l'hebergement des donnees
**Then** toutes les donnees utilisateur sont stockees dans l'Union Europeenne : Supabase EU Frankfurt (PostgreSQL + Storage), Upstash EU Frankfurt (Redis), Railway EU-West (backend). Un test CI verifie les endpoints des services et alerte si un service est hors EU (FR43)

**Given** toute communication client-serveur
**When** je verifie le transport
**Then** TLS 1.3 est impose sur tous les endpoints (Cloudflare force HTTPS, HSTS active, certificats valides). Un test CI verifie la configuration TLS (FR44, NFR7)

**Given** les donnees sensibles en base
**When** je verifie le chiffrement au repos
**Then** les tokens de session, mots de passe hashes (bcrypt/argon2 via Better Auth), et push tokens sont chiffres au repos via le chiffrement natif Supabase (AES-256). Les conversations IA sont chiffrees au repos (FR44, NFR8)

**Given** l'app web est deployee
**When** un utilisateur visite le site pour la premiere fois
**Then** une banniere de consentement cookies est affichee via Cookiebot (conformite RGPD ePrivacy) — seuls les cookies strictement necessaires sont actifs avant consentement

**Given** la politique de confidentialite
**When** je verifie son contenu
**Then** elle est hebergee sur Strapi Cloud (CMS), accessible depuis l'app et le site web, et documente clairement : donnees collectees, finalites, durees de retention, droits des utilisateurs, contact DPO (FR42)

*Architecture : data-inventory.ts sert de source de verite pour les audits. Les tests CI/CD incluent des verifications automatisees (TLS, region hosting, zero third-party data sharing — NFR13). Cookiebot est integre cote web uniquement.*

### Story 6.2: Export des donnees personnelles (droit a la portabilite)

En tant que membre,
Je veux exporter l'integralite de mes donnees personnelles dans un format portable,
Afin d'exercer mon droit a la portabilite conformement au RGPD.

**Criteres d'acceptation :**

**Given** je suis dans mes parametres de profil
**When** je tape "Exporter mes donnees"
**Then** un pipeline d'export est declenche via un job BullMQ asynchrone (pas de blocage UI) (FR41)

**Given** le pipeline d'export est en cours
**When** j'attends le resultat
**Then** un indicateur de progression est affiche et je recois une notification push quand l'export est pret

**Given** l'export est termine
**When** je telecharge le fichier
**Then** je recois un fichier ZIP contenant des fichiers JSON structures : profil.json (nom, email, role, relation, date creation), rituels.json (tous mes rituels avec historique de statuts), conversations-ia.json (historique des conversations), preferences.json (notifications, parametres), membres-foyer.json (fiches des membres de mon foyer que j'ai le droit de voir) (FR41)

**Given** le fichier d'export
**When** je verifie le format
**Then** chaque fichier JSON est auto-descriptif (schema documente en en-tete), les dates sont en ISO 8601, les IDs sont presents pour la tracabilite, et le format est lisible par un humain et parseable par une machine (FR41)

**Given** un parent admin exporte ses donnees
**When** l'export est genere
**Then** il inclut les donnees de ses profils enfants en plus des siennes (coherent avec le droit d'acces parental FR54)

**Given** un prestataire exporte ses donnees
**When** l'export est genere
**Then** il inclut uniquement ses donnees personnelles et les rituels/consignes des membres dont il a la charge — pas les donnees du foyer complet

**Given** le pipeline d'export
**When** je verifie la securite
**Then** le fichier ZIP est genere cote serveur, stocke temporairement dans Supabase Storage (bucket prive, lien signe avec expiration 24h), et supprime automatiquement apres telechargement ou apres 72h

**Given** le RGPD impose un delai de reponse
**When** un export est demande
**Then** l'export est disponible en < 1 heure pour les foyers de taille normale (< 50 membres, < 10 000 rituels)

*Architecture : export.service.ts orchestre le pipeline — collecte les donnees via les services des modules concernes (member, ritual, ai, notification), les structure en JSON, genere le ZIP, le stocke dans Supabase Storage, et notifie le membre.*

### Story 6.3: Suppression de compte et anonymisation (droit a l'oubli)

En tant que membre,
Je veux supprimer mon compte et que mes donnees personnelles soient effacees tout en preservant l'historique collectif du foyer,
Afin d'exercer mon droit a l'oubli conformement au RGPD.

**Criteres d'acceptation :**

**Given** je suis dans mes parametres de profil
**When** je tape "Supprimer mon compte"
**Then** un ecran de confirmation s'affiche avec : un resume de ce qui sera supprime (donnees personnelles, conversations IA, preferences), un resume de ce qui sera anonymise (rituels partages → "Membre supprime"), et un champ de confirmation (saisir mon email pour confirmer) (FR52)

**Given** je suis owner du foyer
**When** je tente de supprimer mon compte
**Then** la suppression est bloquee avec le message : "Vous devez d'abord transferer le role owner a un autre membre avant de supprimer votre compte" (coherent avec la regle owner de l'Epic 1)

**Given** je confirme la suppression de mon compte
**When** le pipeline de suppression est declenche
**Then** un job BullMQ asynchrone demarre le processus de suppression en cascade (FR52)

**Given** le pipeline de suppression est en cours
**When** il traite mes donnees personnelles
**Then** les donnees suivantes sont supprimees definitivement : profil (nom, prenom, email, date de naissance), sessions et tokens, conversations IA, preferences de notification, push tokens, compte d'authentification (Better Auth) (FR52)

**Given** le pipeline de suppression est en cours
**When** il traite les donnees partagees (rituels)
**Then** les rituels auxquels j'etais associe sont conserves mais anonymises : mon nom est remplace par "Membre supprime", mon ID est remplace par un ID anonyme, ma couleur membre est remplacee par un gris neutre (FR52)

**Given** le pipeline de suppression est en cours
**When** il traite mes demandes (post-it)
**Then** les demandes emises sont anonymisees ("Membre supprime a demande..."), les demandes recues en attente sont annulees automatiquement

**Given** le pipeline de suppression est termine
**When** je verifie le delai
**Then** la suppression complete est effectuee en < 30 jours apres la demande. Un job BullMQ de nettoyage final s'execute a J+30 pour verifier qu'aucune donnee residuelle ne subsiste (FR52)

**Given** un membre est supprime
**When** un admin consulte le foyer
**Then** le membre n'apparait plus dans la liste des membres actifs. Les rituels anonymises affichent "Membre supprime". Aucun moyen de retrouver l'identite du membre supprime (suppression irreversible)

**Given** le dernier membre adulte d'un foyer supprime son compte
**When** le foyer n'a plus aucun membre actif (hors enfants sans compte)
**Then** le foyer entier est marque pour suppression complete (donnees + rituels + historique) apres 30 jours de grace

*Architecture : deletion.service.ts orchestre le pipeline en cascade — supprime les donnees personnelles, anonymise les donnees partagees, nettoie les references dans tous les modules. Transaction Prisma pour garantir l'atomicite. Job de verification a J+30 pour audit.*

### Story 6.4: Gestion profil enfant — suppression et acces parental

En tant que parent admin/owner,
Je veux pouvoir supprimer le profil d'un enfant et consulter/telecharger toutes les donnees collectees sur cet enfant,
Afin d'exercer mes droits parentaux conformement au RGPD.

**Criteres d'acceptation :**

**Given** je suis parent admin/owner et je consulte le profil d'un enfant
**When** je tape "Supprimer le profil de [prenom]"
**Then** un ecran de confirmation s'affiche avec : le resume des donnees qui seront supprimees (profil enfant, permissions, preferences) et des donnees anonymisees (rituels → "Membre supprime") (FR53)

**Given** je confirme la suppression du profil enfant
**When** le pipeline de suppression s'execute
**Then** les donnees personnelles de l'enfant sont supprimees immediatement (pas de delai de 30 jours — protection renforcee pour les mineurs) : profil, permissions, conversations IA (si activees), preferences (FR53)

**Given** le profil enfant est supprime
**When** je verifie les rituels
**Then** les rituels associes a l'enfant sont conserves en anonyme ("Membre supprime") — l'historique familial est preserve sans donnees identifiantes (FR53)

**Given** le profil enfant avait un compte utilisateur lie (cas 3 des invitations)
**When** je supprime le profil enfant
**Then** le lien entre le compte utilisateur et le profil enfant est rompu. Le compte utilisateur de l'enfant n'est PAS supprime (seul l'enfant ou un admin technique peut supprimer un compte utilisateur) — coherent avec la regle "exclure, pas supprimer"

**Given** je suis parent admin/owner et je consulte le profil d'un enfant
**When** je tape "Consulter les donnees collectees"
**Then** je vois un ecran detaillant toutes les donnees collectees sur l'enfant : profil (prenom, date de naissance, tranche d'age), rituels assignes et historique de statuts, permissions actuelles, conversations IA (si activees), pictogrammes associes (FR54)

**Given** je consulte les donnees de l'enfant
**When** je tape "Telecharger"
**Then** un fichier JSON/ZIP est genere avec toutes les donnees de l'enfant (meme format que l'export Story 6.2), telechargeable via un lien signe temporaire (FR54)

**Given** je suis un parent adulte (non admin)
**When** j'essaie de supprimer le profil d'un enfant ou de consulter ses donnees collectees
**Then** l'action est refusee — seuls les admin/owner ont acces a ces fonctions

**Given** le foyer a plusieurs admins
**When** un admin supprime le profil d'un enfant
**Then** tous les autres admin/owner recoivent une notification de l'action effectuee (tracabilite)

*Architecture : deletion.service.ts gere aussi la suppression enfant avec un flag immediateDelete: true (pas de delai 30j). export.service.ts supporte un mode childExport(memberId) pour l'acces parental. Les actions de suppression enfant sont logguees dans un audit trail (conformite RGPD).*

---

**Resume Epic 6 :** 4 stories, couvrant FR41, FR42, FR43, FR44, FR52, FR53, FR54. Module compliance/ avec inventaire des donnees, export portable (ZIP/JSON via BullMQ), pipeline suppression/anonymisation cascade (compte adulte < 30j, profil enfant immediat), acces parental complet, chiffrement TLS 1.3 + AES-256, hebergement EU verifie en CI, Cookiebot pour le consentement cookies.

### Epic 7: Administration & Operations
L'operateur technique surveille, maintient et met a jour l'application en production.
**FRs couvertes:** FR49, FR50, FR51
**Inclut:** Module NestJS admin/, Expo EAS OTA updates, Sentry crash reporting, Grafana Cloud metrics/logs/dashboards, PostHog analytics + feature flags, dashboard metriques business (retention, DAU, Family Activation Rate)

## Epic 7: Administration & Operations

L'operateur technique surveille, maintient et met a jour l'application en production.

### Story 7.1: Deploiement OTA et pipeline de release mobile

En tant qu'administrateur technique (Thomas),
Je veux deployer des mises a jour de l'application mobile sans passer par les stores,
Afin de livrer des corrections et ameliorations rapidement aux utilisateurs.

**Criteres d'acceptation :**

**Given** une modification du code JavaScript/TypeScript de l'app mobile est prete
**When** je declenche un deploiement OTA via Expo EAS
**Then** la mise a jour est publiee sur le CDN Expo et disponible pour tous les utilisateurs en < 5 minutes (FR49)

**Given** une mise a jour OTA est publiee
**When** un utilisateur ouvre l'app mobile
**Then** la mise a jour est telechargee en arriere-plan et appliquee au prochain redemarrage de l'app — aucune interruption de l'utilisation en cours (NFR21)

**Given** le pipeline CI/CD GitHub Actions
**When** un push sur la branche main est effectue avec un tag de release mobile
**Then** le pipeline execute : lint → TypeScript check → tests → build EAS → publication OTA automatique (FR49)

**Given** une mise a jour OTA est publiee
**When** je detecte un probleme critique apres deploiement
**Then** je peux effectuer un rollback vers la version precedente via `eas update --rollback` en < 2 minutes

**Given** une mise a jour OTA est en cours de telechargement
**When** l'utilisateur est hors ligne
**Then** la mise a jour sera telechargee a la prochaine connexion — pas de blocage, pas de message d'erreur

**Given** une modification native (nouveau SDK, nouvelle permission, nouveau module natif)
**When** je dois deployer
**Then** un build natif complet via EAS Build est necessaire, suivi d'une soumission aux stores (App Store / Play Store). L'OTA ne couvre que le code JS/TS.

**Given** les mises a jour OTA
**When** je verifie la strategie de versioning
**Then** chaque update OTA est identifiee par un channel (production, staging), un runtime version, et un identifiant unique. Les apps avec un runtime version incompatible ne recoivent pas l'OTA et continuent de fonctionner normalement.

*Architecture : Expo EAS Update configure avec 2 channels (staging, production). GitHub Actions declenche la publication. Le runtime version est lie au build natif. Les updates JS sont independantes des builds natifs.*

### Story 7.2: Monitoring erreurs, performances et logs

En tant qu'administrateur technique (Thomas),
Je veux surveiller les erreurs, performances et logs de l'application en temps reel,
Afin de detecter et resoudre les problemes rapidement sans dependre de rapports utilisateurs.

**Criteres d'acceptation :**

**Given** l'application est deployee (api, web, mobile)
**When** une erreur non geree se produit
**Then** elle est capturee automatiquement par Sentry avec le stack trace, le contexte utilisateur (role, foyer, plateforme), le breadcrumb des actions precedentes, et les tags d'environnement (FR50)

**Given** Sentry est configure
**When** je verifie les integrations
**Then** `@sentry/nestjs` est actif sur le backend (api), `@sentry/nextjs` sur le web, et `@sentry/react-native` sur le mobile — les trois apps remontent les erreurs vers le meme projet Sentry avec des environments distincts

**Given** une erreur critique se produit (crash, erreur 500, timeout)
**When** Sentry la capture
**Then** je recois une alerte immediate (email ou Slack webhook) avec le lien vers le detail de l'erreur (FR50)

**Given** le backend NestJS est en production
**When** je verifie les metriques de performance
**Then** Grafana Cloud affiche un dashboard avec : temps de reponse API (p50, p95, p99), taux d'erreur HTTP, utilisation CPU/memoire Railway, connexions WebSocket actives, taille du cache Redis, jobs BullMQ en queue/en cours/echoues (FR50)

**Given** Grafana Cloud est configure
**When** je verifie les sources de donnees
**Then** les metriques Prometheus sont exposees par NestJS (`@willsoto/nestjs-prometheus`), les logs sont envoyes a Loki, et les dashboards sont pre-configures pour les KPIs techniques

**Given** le backend expose un endpoint /health
**When** un service de monitoring le verifie
**Then** le health check retourne l'etat de : PostgreSQL (connexion), Redis (ping), BullMQ (queue active), et le statut global (healthy/degraded/unhealthy)

**Given** le monitoring est en place
**When** une metrique depasse un seuil d'alerte (ex: temps de reponse API p95 > 500ms, taux d'erreur > 5%, Redis memoire > 80%)
**Then** une alerte Grafana est declenchee (email ou webhook)

**Given** un incident se produit
**When** je consulte Statuspage
**Then** le statut public de l'application est mis a jour (operationnel / degradation partielle / incident majeur) pour informer les utilisateurs

*Architecture : Sentry (3 SDKs), Grafana Cloud (Prometheus metrics + Loki logs + dashboards pre-configures), health check NestJS expose via /health, Statuspage pour la communication publique. Tout le monitoring est externe — zero infrastructure a maintenir.*

### Story 7.3: Dashboard metriques business et feature flags

En tant qu'administrateur technique (Thomas),
Je veux consulter les metriques business et gerer les feature flags depuis un dashboard,
Afin de mesurer l'adoption du produit et de controler le deploiement progressif des fonctionnalites.

**Criteres d'acceptation :**

**Given** PostHog est integre dans les apps (web + mobile)
**When** je verifie les evenements traces
**Then** les evenements cles sont captures automatiquement : inscription, creation foyer, invitation envoyee, invitation acceptee, rituel cree, rituel complete, chat IA utilise, onboarding complete, export donnees, suppression compte (FR51)

**Given** PostHog est configure
**When** je consulte le dashboard metriques business
**Then** je vois les KPIs suivants, calculables a partir des evenements : DAU (Daily Active Users), retention J1/J7/J30, Family Activation Rate (% de foyers avec >= 2 membres actifs en < 7 jours), taux de completion rituels, adoption IA (% actions via chat IA vs UI) (FR51)

**Given** le dashboard metriques business
**When** je consulte la retention
**Then** je vois une courbe de retention par cohorte (semaine de creation du compte) avec les points J1, J7, J14, J30 (FR51)

**Given** le dashboard metriques business
**When** je consulte la Family Activation Rate
**Then** je vois le pourcentage de foyers ou le second parent a rejoint et effectue au moins une action en < 7 jours apres la creation du foyer (FR51)

**Given** PostHog feature flags est configure
**When** je cree un feature flag (ex: "enable-voice-input")
**Then** je peux activer/desactiver la fonctionnalite pour un pourcentage d'utilisateurs, un foyer specifique, ou un groupe (beta testeurs) — sans deploiement de code

**Given** un feature flag est actif
**When** l'app verifie le flag cote client
**Then** le SDK PostHog retourne l'etat du flag avec un temps de reponse < 100ms (cache local avec sync periodique)

**Given** PostHog session replay est active (web uniquement)
**When** un utilisateur rencontre un probleme
**Then** je peux visionner sa session pour comprendre le parcours et identifier le probleme — les donnees sensibles (champs de saisie, emails) sont masquees automatiquement (respect NFR13)

**Given** les metriques business
**When** je verifie la conformite RGPD
**Then** PostHog est configure en mode EU hosting (EU Cloud), les donnees utilisateur sont pseudonymisees (identifiant interne, pas d'email dans les evenements), et les utilisateurs ayant refuse le tracking (Cookiebot) ne sont pas traces

*Architecture : PostHog SDKs integres dans apps/web (posthog-js) et apps/mobile (posthog-react-native). Les evenements sont envoyes via l'API PostHog. Les feature flags sont evalues cote client avec fallback local. Le dashboard est accessible via l'interface PostHog Cloud (pas de dashboard custom a developper).*

---

**Resume Epic 7 :** 3 stories, couvrant FR49, FR50, FR51. OTA via Expo EAS avec rollback, monitoring complet (Sentry crash + Grafana metrics/logs + health checks + alerting), metriques business via PostHog (retention, DAU, FAR, adoption IA), feature flags pour deploiement progressif. Zero infrastructure de monitoring a maintenir — tout est service managed.

### Epic 8: Systeme de demandes familiales
Les membres peuvent s'envoyer des demandes (post-it) entre eux, les consulter, les approuver ou les refuser, avec notification du resultat. L'IA peut aussi creer des demandes quand un membre n'a pas les permissions suffisantes.
**FRs couvertes:** FR55, FR56, FR57, FR58
**Inclut:** Modele de donnees Request (titre, description, emetteur, destinataires, statut, sourceType manual/ai), liste des demandes en attente, flux approbation/refus, notifications push resultat, FeatureBlock "Demandes" dans le Home Hub, creation de demande via l'IA quand permissions insuffisantes (request.tool.ts), integration future avec tous les modules (calendrier, taches, etc.)

## Epic 8: Systeme de demandes familiales

Les membres peuvent s'envoyer des demandes (post-it) entre eux, les consulter, les approuver ou les refuser, avec notification du resultat. L'IA peut aussi creer des demandes quand un membre n'a pas les permissions suffisantes.

### Story 8.1: Creation de demandes manuelles

En tant que membre du foyer,
Je veux creer une demande (post-it) a destination d'un ou plusieurs membres,
Afin d'exprimer un besoin ou une requete sans devoir en parler de vive voix ou l'oublier.

**Criteres d'acceptation :**

**Given** je suis authentifie et membre d'un foyer
**When** je tape "Nouvelle demande" (depuis le Home Hub, le profil d'un membre, ou le menu)
**Then** un formulaire s'ouvre avec : un champ titre (obligatoire), un champ description (optionnel), et un selecteur de destinataire(s) parmi les membres du foyer (FR55)

**Given** le formulaire de demande est ouvert
**When** je selectionne les destinataires
**Then** le selecteur propose deux modes : selection individuelle (membres avec avatar, prenom, couleur) ou selection par cercle ("Foyer" au MVP — envoie a tous les membres du cercle). Je peux combiner les deux (FR55, FR9)

**Given** je selectionne le cercle "Foyer" comme destinataire
**When** la demande est creee
**Then** tous les membres du cercle Foyer sont ajoutes comme destinataires. Le champ recipientCircle est renseigne ("foyer") pour tracer l'intention — si un membre rejoint le foyer apres l'envoi, il ne recoit PAS la demande retroactivement

**Given** les 5 cercles sont supportes en base (FR9)
**When** les cercles Famille elargie ou Connaissances seront exposes en UI (post-MVP)
**Then** ils apparaitront automatiquement dans le selecteur de destinataires — zero modification de la logique de demandes

**Given** je remplis le formulaire et tape "Envoyer"
**When** la demande est creee
**Then** un objet Request est persiste en base avec le statut "pending", et je vois une confirmation discrete "Demande envoyee" (FR55)

**Given** je cree une demande depuis le profil d'un membre
**When** le formulaire s'ouvre
**Then** le destinataire est pre-selectionne avec ce membre (modifiable)

**Given** je suis un enfant avec le chat IA desactive
**When** je veux envoyer une demande
**Then** je peux creer une demande manuellement via l'UI — la fonctionnalite de demande n'est pas liee au chat IA et est accessible a tous les membres

**Given** je suis un prestataire
**When** je cree une demande
**Then** seuls les admin/owner du foyer sont proposees comme destinataires — le prestataire ne peut pas envoyer de demande aux enfants ou aux autres membres

**Given** cette story cree le modele Request
**When** le schema est defini
**Then** le modele complet est : Request (id, title, description, senderId, householdId, status enum [pending, approved, rejected, cancelled], sourceType enum [manual, ai], createdAt, resolvedAt, resolvedBy) + RequestRecipient (id, requestId, memberId, readAt)

**Given** une demande est creee
**When** un event CQRS est emis
**Then** un RequestCreatedEvent est publie (householdId, requestId, senderId, recipientIds, triggeredBy, occurredAt) — les handlers de notification peuvent reagir (Story 8.3)

*Tables creees : Request (avec sourceType, cancelled status, recipientCircle nullable — "foyer", "famille_elargie", etc.), RequestRecipient (table de liaison N:M avec readAt pour tracker la lecture). Le modele supporte les demandes manuelles ET celles creees via l'IA (Story 8.4), et les destinataires individuels ET par cercle.*
*Composants crees : RequestForm, RecipientSelector*

### Story 8.2: Consultation et gestion des demandes

En tant que membre du foyer,
Je veux consulter mes demandes recues et envoyees, et pouvoir approuver ou refuser les demandes qui me sont adressees,
Afin de repondre aux besoins des autres membres et suivre l'etat de mes propres demandes.

**Criteres d'acceptation :**

**Given** je suis authentifie
**When** j'accede a l'ecran "Demandes"
**Then** je vois deux onglets : "Recues" (demandes ou je suis destinataire) et "Envoyees" (demandes que j'ai creees), triees par date decroissante (FR56)

**Given** j'ai des demandes recues en attente
**When** je consulte l'onglet "Recues"
**Then** chaque demande affiche : titre, description (tronquee), nom et avatar de l'emetteur, date, et un badge "En attente" / "Approuvee" / "Refusee". Les demandes en attente sont en haut de la liste (FR56)

**Given** je tape sur une demande recue en attente
**When** le detail s'ouvre
**Then** je vois le titre, la description complete, l'emetteur, la date, et la source (manuelle ou IA). Deux boutons sont affiches : "Approuver" et "Refuser" (FR56)

**Given** je tape "Approuver" sur une demande
**When** l'action est confirmee
**Then** le statut passe a "approved", mon ID est enregistre comme resolvedBy, la date de resolution est enregistree, et un RequestResolvedEvent est emis (FR56)

**Given** je tape "Refuser" sur une demande
**When** l'action est confirmee
**Then** le statut passe a "rejected", avec les memes metadonnees enregistrees, et un RequestResolvedEvent est emis (FR56)

**Given** une demande a plusieurs destinataires
**When** un destinataire approuve ou refuse
**Then** la demande est resolue pour tous les destinataires — le premier a repondre determine le resultat (pas de vote — c'est une reponse, pas un consensus)

**Given** j'ai cree une demande
**When** je consulte l'onglet "Envoyees"
**Then** je vois le titre, les destinataires, le statut actuel, et la date. Si la demande est resolue, je vois qui a repondu et quand.

**Given** j'ai cree une demande en attente
**When** je veux l'annuler
**Then** un bouton "Annuler" est disponible. Le statut passe a "cancelled" et les destinataires ne voient plus la demande dans leur liste active.

**Given** le Home Hub est affiche
**When** j'ai des demandes en attente
**Then** un FeatureBlock "Demandes" apparait avec un badge indiquant le nombre de demandes non lues (ex: "2 demandes en attente"). Un tap ouvre l'ecran Demandes.

**Given** je n'ai aucune demande en attente
**When** le Home Hub s'affiche
**Then** le FeatureBlock "Demandes" n'affiche pas de badge (ou affiche "Aucune demande") — pas de bruit visuel inutile

*Composants crees : RequestList, RequestDetail, RequestStatusBadge, RequestFeatureBlock (Home Hub)*

### Story 8.3: Notifications des demandes

En tant que membre du foyer,
Je veux etre notifie quand je recois une demande et quand ma demande est approuvee ou refusee,
Afin de ne pas manquer les demandes importantes et de connaitre le resultat rapidement.

**Criteres d'acceptation :**

**Given** une demande est creee (manuellement ou via l'IA)
**When** le RequestCreatedEvent est emis
**Then** chaque destinataire recoit une notification push : "[Prenom] vous a envoye une demande : [titre]". Un tap sur la notification ouvre le detail de la demande (FR57)

**Given** une demande creee par l'IA pour un enfant (Story 8.4)
**When** le RequestCreatedEvent est emis
**Then** la notification aux admin/owner precise la source : "Lucas (via l'IA) demande : [titre]" — distinction claire entre demande manuelle et demande IA (FR57)

**Given** un admin/owner approuve une demande
**When** le RequestResolvedEvent est emis avec status "approved"
**Then** l'emetteur recoit une notification push : "[Prenom] a approuve votre demande : [titre]" (FR57)

**Given** un admin/owner refuse une demande
**When** le RequestResolvedEvent est emis avec status "rejected"
**Then** l'emetteur recoit une notification push : "[Prenom] a refuse votre demande : [titre]" (FR57)

**Given** l'emetteur est un enfant avec les notifications desactivees
**When** sa demande est resolue
**Then** aucune notification push n'est envoyee — le resultat sera visible dans l'ecran Demandes a la prochaine consultation (respect du controle parental FR40)

**Given** le moteur de regles de notifications (Epic 4)
**When** les regles de l'Epic 8 sont deployees
**Then** deux fichiers sont ajoutes dans rules/ : request-received.rule.ts (module: "request", ecoute RequestCreatedEvent) et request-resolved.rule.ts (module: "request", ecoute RequestResolvedEvent). Ils apparaissent automatiquement dans les preferences sous la section "Demandes"

**Given** un membre a desactive les notifications de type "Demandes recues" dans ses preferences
**When** une demande lui est adressee
**Then** aucune notification push n'est envoyee — la demande reste visible dans l'ecran Demandes

**Given** le ton des notifications
**When** je lis le message
**Then** le ton est factuel et neutre — pas de "Super nouvelle !" ni d'emoji. Juste "[Prenom] a [approuve/refuse] votre demande : [titre]"

*Architecture : 2 fichiers rule dans notification/rules/ — request-received.rule.ts et request-resolved.rule.ts. Declarent module: "request", s'integrent automatiquement dans le moteur de regles et les preferences utilisateur. Zero modification du moteur de notifications.*

### Story 8.4: Demandes d'autorisation via l'IA

En tant que membre avec permissions limitees,
Je veux que l'IA propose d'envoyer une demande a un admin quand je ne peux pas effectuer une action,
Afin de ne pas etre bloque et de pouvoir exprimer mes besoins.

**Criteres d'acceptation :**

**Given** un enfant demande a l'IA une action non autorisee (ex: "Supprime le rituel ranger la chambre")
**When** l'IA detecte que les permissions sont insuffisantes
**Then** l'IA repond : "Tu n'as pas la permission pour ca, mais je peux envoyer une demande a [prenom parent]. On envoie ?" (FR58)

**Given** l'enfant confirme l'envoi de la demande
**When** l'IA cree la demande
**Then** une demande (Request) est creee via request.tool.ts avec le titre auto-genere (ex: "Lucas demande la suppression du rituel 'Ranger la chambre'"), la description de l'action souhaitee, l'emetteur (enfant), et le(s) destinataire(s) (tous les admin/owner du foyer), sourceType = "ai" (FR58)

**Given** une demande est creee via l'IA
**When** elle est enregistree
**Then** les admin/owner recoivent une notification push avec le detail de la demande (FR57, utilise le modele Request de Story 8.1 et le canal push d'Epic 4)

**Given** l'enfant refuse l'envoi de la demande ("non c'est bon")
**When** l'IA annule le processus
**Then** aucune demande n'est creee et l'IA continue la conversation normalement

**Given** un prestataire demande une action non autorisee
**When** l'IA detecte les permissions insuffisantes
**Then** le meme flux de proposition de demande est active — le prestataire peut envoyer une demande aux admin/owner

**Given** un adulte (non admin) demande une action reservee aux admin (ex: changer un role)
**When** l'IA detecte les permissions insuffisantes
**Then** le meme flux de proposition de demande est active

*Dependance : cette story utilise le modele Request cree dans Story 8.1 et le canal push d'Epic 4 pour les notifications. Le module ai/ (Epic 3) fournit le contexte IA et le tool-calling.*
*Architecture : request.tool.ts est le tool LLM qui cree les demandes. Le tool est disponible pour tous les roles.*

---

**Resume Epic 8 :** 4 stories, couvrant FR55, FR56, FR57, FR58. Systeme de demandes complet : creation manuelle (Stories 8.1-8.3) + via IA (Story 8.4), multi-destinataires, flux approbation/refus, annulation, FeatureBlock Home Hub avec badge, notifications via le moteur de regles extensible (2 rules auto-enregistrees). Le modele supporte sourceType (manual/ai) pour distinguer l'origine. Extensible pour les futurs modules (demande de calendrier, demande de tache, etc.).
