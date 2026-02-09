# Recherche : Infrastructure Cloud, DevOps, Authentification et Securite pour Family Home

**Date** : 2026-02-06
**Contexte** : Ecosysteme d'application de gestion familiale avec NestJS (backend), Next.js (web), Expo React Native (mobile). Necessite hebergement cloud, CI/CD, stockage de fichiers (photos, documents), authentification, monitoring. Modele freemium a 10 EUR/mois maximum. Objectif : minimiser les couts d'infrastructure tout en maintenant la qualite.

---

## Table des matieres

1. [Hebergement Cloud du Backend NestJS](#1-hebergement-cloud-du-backend-nestjs)
2. [Deploiement Next.js : Vercel vs Auto-Hebergement](#2-deploiement-nextjs--vercel-vs-auto-hebergement)
3. [Authentification et Gestion des Roles](#3-authentification-et-gestion-des-roles)
4. [Stockage de Fichiers (Photos et Documents)](#4-stockage-de-fichiers-photos-et-documents)
5. [CI/CD et Pipeline de Deploiement](#5-cicd-et-pipeline-de-deploiement)
6. [Monitoring et Observabilite](#6-monitoring-et-observabilite)
7. [EAS Build Expo et Alternatives](#7-eas-build-expo-et-alternatives)
8. [Securite et Conformite RGPD](#8-securite-et-conformite-rgpd)
9. [Synthese : Architecture Recommandee et Budget Previsionnel](#9-synthese--architecture-recommandee-et-budget-previsionnel)

---

## 1. Hebergement Cloud du Backend NestJS

### Options evaluees

#### 1.1 Hetzner Cloud + Coolify (RECOMMANDE pour le lancement)

**Tarification (2026)** :
- **CX22** : 2 vCPU, 4 Go RAM, 40 Go SSD — **3,79 EUR/mois** (0,0060 EUR/heure)
- **CX32** : 4 vCPU, 8 Go RAM, 80 Go SSD — ~7 EUR/mois
- **CAX11** (ARM Ampere) : 2 vCPU, 4 Go RAM, 40 Go SSD — ~3,29 EUR/mois (meilleur rapport cout/performance)
- Trafic inclus : 20 To/mois aux emplacements EU
- Protection DDoS et firewall inclus sans frais supplementaires
- Centres de donnees en Allemagne et Finlande (conformite RGPD native)

**Coolify** (PaaS open-source auto-heberge) :
- Alternative gratuite et open-source a Vercel/Heroku/Netlify
- Deploiement par git push, URLs de preview pour les PRs, SSL automatique, monitoring
- Support Docker natif, deploiement de bases de donnees PostgreSQL/Redis en un clic
- Plus de 280 services deployables en un clic
- Interface utilisateur intuitive et API complete
- Se deploie sur n'importe quel serveur accessible via SSH

**Avantages** :
- Cout mensuel extremement faible (~4-7 EUR pour tout le backend + base de donnees)
- Controle total de l'infrastructure
- Conformite RGPD native (donnees hebergees en Europe)
- Coolify offre une experience comparable a Vercel sans les couts
- Possibilite d'heberger NestJS, Next.js, PostgreSQL et Redis sur un seul serveur au lancement

**Inconvenients** :
- Necessite des connaissances Linux/Docker de base
- Maintenance du serveur a la charge du developpeur (mises a jour securite, sauvegardes)
- Pas de scaling automatique (necessite un upgrade manuel du plan)

**Sources** :
- [Hetzner Cloud Pricing](https://www.hetzner.com/cloud)
- [Coolify - Self-Hostable PaaS](https://coolify.io/)
- [Coolify GitHub](https://github.com/coollabsio/coolify)
- [Self-Hosting Next.js with Coolify - Medium](https://medium.com/better-dev-nextjs-react/self-hosting-next-js-with-coolify-escaping-the-95k-vercel-bill-d186f593a540)
- [Self-Hosting Next.js with Hetzner and Coolify](https://jb.desishub.com/blog/deploy-nextjs-using-coolify-and-hezner)

#### 1.2 Railway

**Tarification (2026)** :
- **Hobby Plan** : 5 USD/mois, incluant 5 USD de credits d'utilisation
- Si l'utilisation depasse 5 USD, l'excedent est facture en supplement
- PostgreSQL, MySQL, MongoDB, Redis deployables en un clic (inclus dans les credits)
- Detection et deploiement automatique des frameworks

**Avantages** :
- Excellente experience developpeur (DX), deploiement quasi-instantane
- Documentation officielle pour NestJS
- Base de donnees geree incluse dans le plan
- Ideal pour le prototypage rapide et les MVPs

**Inconvenients** :
- Plus cher que l'auto-hebergement a mesure que l'application grandit
- 5 USD peuvent etre depasses rapidement avec une base de donnees + backend toujours actifs
- Moins de controle sur l'infrastructure sous-jacente

**Sources** :
- [Railway Pricing](https://railway.com/pricing)
- [Railway Pricing Plans Docs](https://docs.railway.com/reference/pricing/plans)
- [Deploy NestJS on Railway](https://docs.railway.com/guides/nest)

#### 1.3 Fly.io

**Tarification (2026)** :
- Plus de plan gratuit pour les nouvelles organisations
- Facturation a l'usage : machines facturees a la seconde
- Stockage : 0,15 USD/Go/mois
- Bande passante sortante : a partir de 0,02 USD/Go
- PostgreSQL single-node (dev) : ~2 USD/mois
- PostgreSQL Managed : a partir de 38 USD/mois (plan Basic)
- A partir de fevrier 2026, l'utilisation du reseau prive inter-regions est facturee

**Avantages** :
- Deploiement multi-regions facilite (edge computing)
- Excellente gestion des WebSockets et connexions temps reel
- Machines auto-scalables (scale-to-zero possible)

**Inconvenients** :
- Plus de tier gratuit pour les nouveaux comptes
- Tarification complexe et difficile a prevoir
- Le PostgreSQL manage reste cher pour un petit projet

**Sources** :
- [Fly.io Pricing](https://fly.io/pricing/)
- [Fly.io Resource Pricing Docs](https://fly.io/docs/about/pricing/)
- [What Is Fly.io - Kuberns](https://kuberns.com/blogs/post/what-is-flyio/)

#### 1.4 Render

**Tarification** :
- Plan gratuit pour les sites statiques
- Web services a partir de 7 USD/mois
- SSL, CDN et auto-deploiement depuis Git inclus

**Avantages** :
- Bon equilibre entre facilite d'utilisation et prix
- Heritage de la philosophie Heroku avec une interface moderne

**Inconvenients** :
- Les instances gratuites s'arretent apres inactivite (cold starts)
- Moins competitif en prix que l'auto-hebergement Hetzner

### Comparatif recapitulatif hebergement backend

| Solution | Cout mensuel estime | DX | Controle | Scalabilite | RGPD |
|----------|--------------------|----|----------|-------------|------|
| Hetzner + Coolify | 4-7 EUR | Bon | Total | Manuelle | Natif (EU) |
| Railway Hobby | 5-15 USD | Excellent | Limite | Auto | Variable |
| Fly.io | 5-20 USD | Bon | Moyen | Auto/Edge | Variable |
| Render | 7-15 USD | Bon | Limite | Auto | Variable |

### Recommandation

**Phase de lancement** : Hetzner CX22/CAX11 + Coolify pour ~4 EUR/mois. Heberger NestJS + PostgreSQL + Redis sur un seul serveur. L'experience developpeur de Coolify compense le manque de managed services.

**Phase de croissance** : Migrer vers un CX32 (8 Go RAM) ou separer les services sur plusieurs machines. Eventuellement passer a un cluster PostgreSQL manage (Neon ou Supabase) si la charge le justifie.

---

## 2. Deploiement Next.js : Vercel vs Auto-Hebergement

### 2.1 Vercel

**Tarification (2026)** :
- **Hobby (gratuit)** : 100 Go de bande passante/mois, 150 000 invocations de fonctions/mois, timeout de 10 secondes par fonction, projets illimites
- **Pro** : 20 USD/developpeur/mois, 1 To de bande passante, ~1 000 Go-heures d'execution serverless
- Depassement bande passante : 20 USD par 100 Go supplementaires
- Depassement fonctions : 4 USD par 100 000 invocations supplementaires

**Avantages** :
- Integration native et optimale avec Next.js (Vercel est le createur de Next.js)
- Deploiement instantane, previews automatiques sur chaque PR
- CDN global, optimisation automatique des images
- Aucune maintenance d'infrastructure
- Analytics et Web Vitals integres

**Inconvenients** :
- Le plan Pro a 20 USD/mois peut etre un cout significatif pour un projet indie
- Vendor lock-in sur certaines fonctionnalites (ISR, Edge Functions, Image Optimization)
- Les couts d'usage peuvent exploser avec le trafic (bande passante, fonctions)
- Les equipes rapportent des economies de 50 a 70% en migrant vers Railway ou l'auto-hebergement

**Sources** :
- [Vercel Pricing](https://vercel.com/pricing)
- [Vercel Hobby Plan](https://vercel.com/docs/plans/hobby)
- [How to Lower Vercel Hosting Costs - Pagepro](https://pagepro.co/blog/vercel-hosting-costs/)
- [Self-Hosting Next.js: What You Gain and Lose vs Vercel](https://dev.to/rbobr/self-hosting-nextjs-what-you-gain-and-lose-vs-vercel-4g8c)

### 2.2 Auto-hebergement avec Coolify sur Hetzner (RECOMMANDE)

**Tarification** : Inclus dans le serveur Hetzner (0 EUR supplementaire si colocalise avec le backend).

**Avantages** :
- Cout quasi nul (partage le serveur avec le backend NestJS)
- Fonctionnalites Vercel-like via Coolify : git push deploy, SSL automatique, previews de PR
- Next.js supporte nativement l'auto-hebergement avec `next start` ou Docker
- Pas de vendor lock-in

**Inconvenients** :
- Pas de CDN global natif (ajout possible via Cloudflare gratuit en proxy)
- Optimisation d'image Next.js a configurer soi-meme (sharp ou loader externe)
- Rollbacks, cache warming et debugging infra a la charge du developpeur
- Pas d'analytics integres (necessitent un outil tiers)

### 2.3 Strategie hybride (option de croissance)

- **Phase 1** : Next.js auto-heberge sur Hetzner/Coolify avec Cloudflare en CDN/proxy (gratuit)
- **Phase 2** : Si le trafic web explose, migrer le frontend vers Vercel Hobby (gratuit) ou Cloudflare Pages
- **Phase 3** : Vercel Pro si les besoins le justifient economiquement

### Recommandation

Pour un projet indie avec un modele freemium a 10 EUR/mois, l'auto-hebergement est largement suffisant. Placer Cloudflare (gratuit) en CDN devant le serveur Hetzner offre une performance globale excellente tout en ajoutant une protection DDoS supplementaire.

**Sources** :
- [10 Best Next.js Hosting Providers 2026 - Makerkit](https://makerkit.dev/blog/tutorials/best-hosting-nextjs)
- [Vercel vs Coolify - UI Bakery](https://uibakery.io/blog/vercel-vs-coolify)
- [10 Vercel Alternatives 2026 - DigitalOcean](https://www.digitalocean.com/resources/articles/vercel-alternatives)

---

## 3. Authentification et Gestion des Roles

### Contexte des besoins

L'application familiale necessite :
- Inscription/connexion des utilisateurs (email, OAuth social)
- Roles multiples au sein d'un foyer (parent, enfant, invite, etc.)
- Gestion multi-foyer (un utilisateur peut appartenir a plusieurs foyers)
- Consentement parental pour les mineurs (exigence RGPD)
- Securite renforcee pour les donnees familiales sensibles

### 3.1 Better Auth (RECOMMANDE)

**Tarification** : Gratuit et open-source, auto-heberge.

**Caracteristiques** :
- Bibliotheque TypeScript complete et moderne pour l'authentification
- Integration NestJS officielle (maintenue par la communaute) via `@thallesp/nestjs-better-auth`
- Support Express et Fastify
- Auto-heberge : controle total des donnees d'authentification
- Compatible avec PostgreSQL via Prisma
- Gestion de sessions par cookies

**Avantages** :
- Zero cout recurrent (pas de facturation par utilisateur actif)
- Controle total sur les donnees utilisateur et la logique d'authentification
- Recommande comme le choix le plus solide pour les projets debutant en 2025-2026
- Peut evoluer a l'infini sans cout supplementaire d'authentification
- La logique de roles/permissions peut etre entierement personnalisee

**Inconvenients** :
- Integration NestJS encore en phase communautaire (pas d'integration officielle premiere partie)
- Plus de code a ecrire et maintenir qu'une solution SaaS
- Support Fastify encore en beta
- Necesssite de gerer les mises a jour de securite soi-meme

**Sources** :
- [Better Auth](https://www.better-auth.com/)
- [Better Auth NestJS Integration](https://www.better-auth.com/docs/integrations/nestjs)
- [nestjs-better-auth GitHub](https://github.com/ThallesP/nestjs-better-auth)
- [NestJS + BetterAuth Tutorial - Medium](https://medium.com/@andysenclave/nestjs-betterauth-part-1-from-zero-to-login-prisma-cookies-cfcc3e7ecec0)

### 3.2 Clerk

**Tarification (2026)** :
- **Gratuit** : 10 000 utilisateurs actifs mensuels (MAU), 100 organisations actives mensuelles
- **Pro** : 25 USD/mois + 0,02 USD par MAU au-dela de 10 000
- **Add-ons** : 100 USD/mois chacun (MFA avance, audit logs, SSO entreprise)
- Programme startup : tarif reduit pour les startups de moins d'1 an avec moins de 5M USD de financement

**Avantages** :
- Composants UI pre-construits (formulaires de connexion, gestion de profil)
- Excellente integration Next.js et documentation NestJS disponible
- Le tier gratuit a 10 000 MAU est genereux pour une app familiale
- Gestion des organisations (multi-foyer) native
- MFA, OAuth social, liens magiques inclus

**Inconvenients** :
- Vendor lock-in : les donnees d'authentification sont chez Clerk
- A 100K MAU, le cout atteint ~1 200 USD/mois (prohibitif si l'app grandit)
- Les add-ons essentiels (MFA avance, audit) coutent cher (100 USD/mois chacun)
- Dependance a un service tiers pour une fonctionnalite critique
- Questions de conformite RGPD (donnees hebergees aux USA)

**Sources** :
- [Clerk Pricing](https://clerk.com/pricing)
- [Clerk for Startups](https://clerk.com/startups)
- [Authentication with Clerk in NestJS - DEV](https://dev.to/thedammyking/authentication-with-clerk-in-nestjs-server-application-gpm)
- [Setting Up Clerk Auth with NestJS and Next.js - Medium](https://medium.com/@aozora-med/setting-up-clerk-authentication-with-nestjs-and-next-js-3cdcb54a6780)

### 3.3 Auth0

**Tarification** :
- **Gratuit** : 7 500 MAU
- **Essentials** : a partir de 35 USD/mois
- Plans superieurs significativement plus chers

**Avantages** :
- Solution enterprise eprouvee et mature
- Excellent support NestJS (Passport + JWT)
- Documentation riche et certifications de securite

**Inconvenients** :
- Plus cher que Clerk pour les petits projets
- Interface complexe pour des cas d'usage simples
- Vendor lock-in similaire a Clerk

**Sources** :
- [Auth0 + NestJS Integration](https://auth0.com/blog/developing-a-secure-api-with-nestjs-adding-authorization/)
- [Auth0 vs Clerk - SuperTokens](https://supertokens.com/blog/auth0-vs-clerk)

### 3.4 JWT personnalise avec Passport.js (NestJS natif)

**Tarification** : Gratuit (integre dans NestJS).

**Caracteristiques** :
- Passport.js est la methode recommandee par NestJS pour l'authentification
- Plus de 300 strategies d'authentification disponibles
- Guards NestJS pour RBAC (Role-Based Access Control)
- JwtService pour la generation et validation de tokens

**Avantages** :
- Aucun cout, integration native avec NestJS
- Controle total sur la logique d'authentification
- Tres bien documente dans la documentation officielle NestJS
- Maximum de flexibilite pour les roles personnalises

**Inconvenients** :
- Tout est a implementer : inscription, connexion, reset mot de passe, OAuth, MFA
- Responsabilite totale de la securite (stockage des mots de passe, rotation des tokens, etc.)
- Temps de developpement significativement plus long qu'une solution SaaS ou Better Auth

**Sources** :
- [NestJS Authentication Docs](https://docs.nestjs.com/security/authentication)
- [RBAC Authorization in NestJS - Permit.io](https://www.permit.io/blog/how-to-protect-a-url-inside-a-nestjs-app-using-rbac-authorization)
- [Authentication and Authorization in NestJS - Medium](https://medium.com/@shivshuklag/authentication-and-authorization-in-nestjs-a-complete-guide-758a70d6f9a6)

### 3.5 Note sur Lucia Auth

**Attention** : Lucia Auth sera **deprecie a partir de mars 2025**. Il continuera comme ressource educative, mais ne doit pas etre choisi pour un nouveau projet en 2026. Better Auth est son successeur spirituel recommande.

**Source** :
- [RFC Lucia v3 - GitHub Discussion](https://github.com/lucia-auth/lucia/discussions/1253)

### Comparatif recapitulatif authentification

| Solution | Cout mensuel | MAU gratuits | Controle donnees | Integration NestJS | Complexite |
|----------|-------------|-------------|------------------|-------------------|------------|
| Better Auth | 0 EUR | Illimite | Total | Communautaire | Moyenne |
| Clerk | 0-25+ USD | 10 000 | Chez Clerk | Bonne | Faible |
| Auth0 | 0-35+ USD | 7 500 | Chez Auth0 | Excellente | Faible |
| JWT/Passport personnalise | 0 EUR | Illimite | Total | Native | Elevee |

### Recommandation

**Phase de lancement** : **Better Auth** auto-heberge avec PostgreSQL. C'est le meilleur compromis entre cout (0 EUR), controle des donnees (RGPD), et rapidite de mise en place. L'integration NestJS est fonctionnelle, la bibliotheque est activement maintenue, et elle offre des fonctionnalites modernes (OAuth, sessions, etc.) sans le temps de developpement d'une solution 100% custom.

**Alternative pragmatique** : Si le temps de developpement est critique pour un MVP rapide, **Clerk** avec son tier gratuit a 10 000 MAU couvre largement les besoins d'une app familiale au lancement, mais planifier une migration vers Better Auth avant d'atteindre une echelle ou les couts deviennent significatifs.

---

## 4. Stockage de Fichiers (Photos et Documents)

### Contexte des besoins

- Photos familiales (potentiellement volumineuses : 5-20 Mo par photo)
- Documents (PDF, scans : 1-10 Mo)
- Albums partages entre membres de la famille
- Acces frequent en lecture (consultation des albums)
- Budget tres contraint

### 4.1 Cloudflare R2 (RECOMMANDE)

**Tarification (2026)** :
- **Tier gratuit** : 10 Go de stockage, 1 million d'operations Class A (upload, delete), 10 millions d'operations Class B (lecture)
- **Stockage** : 0,015 USD/Go/mois
- **Operations Class A** : 4,50 USD par million (1er million gratuit/mois)
- **Operations Class B** : 0,36 USD par million (10 premiers millions gratuits/mois)
- **Egress (bande passante sortante) : GRATUIT** (zero frais de transfert de donnees)

**Estimation pour Family Home** :
- 50 Go de photos/documents : ~0,60 USD/mois (apres le tier gratuit de 10 Go)
- 100 Go : ~1,35 USD/mois
- 500 Go : ~7,35 USD/mois
- Operations de lecture (consultation d'albums) : gratuites pour des volumes raisonnables

**Avantages** :
- Zero frais d'egress = avantage decisif pour une app avec beaucoup de lecture d'images
- API 100% compatible S3 (utilisation des SDK AWS S3 existants)
- Integration avec Cloudflare Workers pour le redimensionnement d'images a la volee
- CDN Cloudflare integre pour une distribution globale rapide
- Le tier gratuit couvre largement les besoins d'un MVP

**Inconvenients** :
- Pas de lifecycle policies aussi riches que S3 (mais en amelioration constante)
- Le tier Infrequent Access n'est pas inclus dans le tier gratuit
- Ecosysteme moins mature que AWS S3 pour les outils tiers

**Sources** :
- [Cloudflare R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [Cloudflare R2 Product Page](https://www.cloudflare.com/developer-platform/products/r2/)
- [R2 Pricing Calculator](https://r2-calculator.cloudflare.com/)

### 4.2 Backblaze B2

**Tarification** :
- Stockage : 0,006 USD/Go/mois (le moins cher du marche)
- Egress : 3x le stockage moyen mensuel gratuit, au-dela : 0,01 USD/Go
- API compatible S3

**Avantages** :
- Prix de stockage le plus bas du marche (~1/5 du cout AWS S3)
- 10 Go de stockage gratuit
- Bon pour l'archivage de grandes quantites de photos

**Inconvenients** :
- L'egress gratuit est limite (3x le stockage moyen)
- Pas de CDN integre (necessite un partenariat Cloudflare ou autre)
- Moins de fonctionnalites que R2 pour le traitement d'images

**Sources** :
- [Backblaze B2 Cloud Storage](https://www.backblaze.com/cloud-storage)
- [Backblaze B2 Pricing Comparison](https://www.backblaze.com/cloud-storage/pricing)

### 4.3 Wasabi

**Tarification** :
- Stockage : 0,00699 USD/Go/mois
- Egress : entierement gratuit et illimite
- Retention minimale de 90 jours obligatoire

**Avantages** :
- Egress illimite et gratuit
- Cout de stockage tres bas

**Inconvenients** :
- Retention minimale de 90 jours (les suppressions avant sont facturees)
- Pas de CDN integre
- Moins adapte pour les fichiers frequemment modifies ou supprimes

**Sources** :
- [Cloudflare R2 vs Backblaze B2 vs Wasabi Comparison](https://onidel.com/blog/cloudflare-r2-vs-backblaze-b2)
- [5 Cheap Object Storage Providers - Sliplane](https://sliplane.io/blog/5-cheap-object-storage-providers)

### Comparatif recapitulatif stockage fichiers

| Fournisseur | Stockage (/Go/mois) | Egress | Tier gratuit | API S3 | CDN integre |
|-------------|---------------------|--------|-------------|--------|-------------|
| Cloudflare R2 | 0,015 USD | GRATUIT | 10 Go | Oui | Oui (Cloudflare) |
| Backblaze B2 | 0,006 USD | Limite gratuit | 10 Go | Oui | Non |
| Wasabi | 0,007 USD | GRATUIT | Non | Oui | Non |
| AWS S3 | 0,023 USD | 0,09 USD/Go | 5 Go (12 mois) | Natif | Via CloudFront |

### Recommandation

**Cloudflare R2** est le choix optimal pour Family Home :
- L'egress gratuit est critique pour une app de photos (beaucoup de lecture)
- Le tier gratuit de 10 Go couvre le MVP
- L'integration avec le CDN Cloudflare (deja recommande pour le frontend) cree une synergie
- La compatibilite S3 permet d'utiliser les SDK standards (ex: `@aws-sdk/client-s3` dans NestJS)
- Possibilite d'ajouter Cloudflare Images ou Workers pour le redimensionnement automatique

---

## 5. CI/CD et Pipeline de Deploiement

### 5.1 GitHub Actions (RECOMMANDE)

**Tarification (2026)** :
- **GitHub Free** : 2 000 minutes/mois pour les depots prives, stockage illimite pour les depots publics
- **Runners Linux** : inclus dans le quota gratuit
- **Runners macOS** : consomment 10x plus de minutes (1 minute macOS = 10 minutes du quota)
- Depuis janvier 2026, reduction de prix de jusqu'a 39% sur les runners heberges par GitHub
- Depuis mars 2026, nouveau frais de plateforme de 0,002 USD/minute pour les runners auto-heberges

**Strategies d'optimisation pour un monorepo** :

1. **Builds conditionnels** : Ne construire et tester que les packages modifies sur les PRs. Un monorepo de 12 packages passant de 18 minutes (tests complets) a 4 minutes (tests affectes) est un gain typique.

2. **Cache agressif** : Mettre en cache les dependances (node_modules), les artefacts de build, et les resultats de tests separement. Turborepo et Nx comprennent le graphe de dependances et optimisent automatiquement.

3. **Workflows reutilisables** : Creer des workflows partages pour eviter la duplication entre packages (lint, test, build, deploy).

4. **Strategie de build** :
   - Sur les PRs : builds et tests affectes uniquement
   - Sur `main` : build complet + deploiement
   - Nightly : suite de tests complete

**Pipeline recommande pour Family Home** :

```yaml
# Declenchement sur PR et push sur main
# Etapes :
# 1. Checkout + setup Node.js + pnpm
# 2. Cache pnpm store + Turborepo cache
# 3. Install dependencies
# 4. Lint (affected packages only on PR)
# 5. Type-check (affected packages only on PR)
# 6. Unit tests (affected packages only on PR)
# 7. Build Docker images (backend NestJS, frontend Next.js)
# 8. Push images to container registry
# 9. Deploy via Coolify API / SSH
```

**Sources** :
- [GitHub Actions Pricing Changes 2026](https://devops-geek.net/devops-lab/github-actions-pricing-changes-2026-what-devops-geeks-need-to-know/)
- [GitHub Actions Monorepo Guide 2026 - DEV](https://dev.to/pockit_tools/github-actions-in-2026-the-complete-guide-to-monorepo-cicd-and-self-hosted-runners-1jop)
- [Monorepo with GitHub Actions - Graphite](https://graphite.com/guides/monorepo-with-github-actions)
- [NestJS CI/CD with GitHub Actions - Medium](https://medium.com/@zulfikarditya/setting-up-ci-cd-for-nestjs-applications-using-github-actions-e7b33c09dfef)
- [Supercharging CI with Turbo Caching - DEV](https://dev.to/abhilashlr/supercharging-github-actions-ci-from-slow-to-lightning-fast-with-turbo-caching-1bed)
- [NX Monorepo CI/CD with GitHub Actions - Medium](https://medium.com/@harshalbhosale24/nx-monorepo-ci-cd-with-github-actions-a-practical-guide-57fe4aeb9e1b)

### 5.2 Outils de monorepo : Turborepo vs Nx

| Critere | Turborepo | Nx |
|---------|-----------|-----|
| Complexite de setup | Faible | Moyenne |
| Cache distant | Via Vercel (ou self-hosted) | Nx Cloud (ou self-hosted) |
| Graphe de dependances | Automatique | Tres avance |
| Ecosysteme | Leger, non-opinionne | Riche, generators, plugins |
| Recommendation | Projets de taille petite a moyenne | Grands monorepos complexes |

**Recommandation** : **Turborepo** avec pnpm workspaces pour Family Home. Plus leger et suffisant pour un monorepo NestJS + Next.js + packages partages.

---

## 6. Monitoring et Observabilite

### 6.1 Stack recommandee par phases

#### Phase 1 : MVP (cout zero)

**Sentry (gratuit)** :
- **Plan Developer** : 1 utilisateur, 5 000 erreurs/mois, 50 replays de session
- Capture des exceptions backend (NestJS) et frontend (Next.js + React Native)
- Stack traces, contexte de requete, impact utilisateur
- SDK officiels pour Node.js, React, React Native

**Avantages** : Setup en quelques minutes, valeur immediate, gratuit pour un petit projet.
**Inconvenients** : Limite a 1 utilisateur et 5 000 erreurs sur le tier gratuit.

**Sources** :
- [Sentry Pricing](https://sentry.io/pricing/)
- [Sentry Pricing Guide - SigNoz](https://signoz.io/guides/sentry-pricing/)

#### Phase 2 : Croissance (faible cout)

**Ajouter une stack OpenTelemetry** :
- **OpenTelemetry** (open-source, gratuit) comme standard de collecte de telemetrie
- **nestjs-otel** ou instrumentation manuelle pour le backend NestJS
- **nestjs-pino** pour le logging structure avec injection automatique de traceId et spanId
- Export vers un backend d'observabilite

**Backends d'observabilite** :
- **SigNoz** (open-source, auto-hebergeable) : alternative gratuite a Datadog/New Relic
- **Grafana Cloud** : tier gratuit avec 50 Go de logs, 10 000 series de metriques
- **Prometheus + Grafana** auto-heberges sur le meme serveur Hetzner (cout zero)

**Sources** :
- [OpenTelemetry NestJS Guide - SigNoz](https://signoz.io/blog/opentelemetry-nestjs/)
- [NestJS Observability GitHub (OpenTelemetry + Prometheus + Jaeger + Grafana)](https://github.com/ErickKS/nestjs-observability)
- [Monitoring NestJS with Prometheus and Grafana](https://shpota.com/2024/10/22/monitoring-with-nestjs-prometheus-grafana.html)
- [Monitoring Agents with Grafana and Sentry 2026](https://bix-tech.com/monitoring-agents-and-flows-with-grafana-and-sentry-a-practical-playbook-for-real-world-observability-in-2026/)

#### Phase 3 : Production mature

- **Sentry** plan Team (26 USD/mois) pour la gestion multi-utilisateurs
- **Grafana Cloud** payant ou **Prometheus + Grafana** auto-heberges avec alertes
- Dashboards personnalises : latence API, taux d'erreur, utilisation memoire/CPU
- Alertes automatisees (PagerDuty, Slack, email)

### Metriques cles a surveiller pour Family Home

| Categorie | Metriques |
|-----------|-----------|
| Performance API | Latence P50/P95/P99, requetes/seconde, taux d'erreur |
| Base de donnees | Temps de requete, connexions actives, pool utilisation |
| Stockage fichiers | Uploads/telechargements, taille des fichiers, erreurs |
| Authentification | Connexions reussies/echouees, tentatives suspectes |
| Infrastructure | CPU, memoire, disque, reseau |
| Business | Inscriptions, foyers crees, photos uploadees, utilisateurs actifs |

### Recommandation

**Lancement** : Sentry gratuit uniquement. C'est suffisant pour capter les erreurs critiques avec un effort minimal de configuration.

**A 6 mois** : Ajouter Prometheus + Grafana auto-heberges sur Hetzner pour les metriques d'infrastructure et API. Combiner avec Sentry pour une vue complete (erreurs + performance).

---

## 7. EAS Build Expo et Alternatives

### 7.1 EAS Build (Expo officiel)

**Tarification (2026)** :
- **Plan gratuit** : Builds en basse priorite (file d'attente longue), limite mensuelle de builds
- **Starter** : 19 USD/mois, incluant 45 USD de credit de build, 3 000 MAU pour EAS Update
- **Growth** : tarification superieure avec plus de credits et fonctionnalites
- Cout par build : 1 a 4 USD selon la plateforme et la priorite

**EAS Update** :
- Mises a jour OTA (Over-The-Air) pour pousser du code JavaScript sans passer par les stores
- Plan gratuit : 1 000 MAU
- Starter : 3 000 MAU

**Avantages** :
- Integration native parfaite avec Expo
- Aucune configuration de build a maintenir
- Soumission automatisee aux stores (App Store, Google Play)
- EAS Update pour les hotfixes sans resoumission

**Inconvenients** :
- 19 USD/mois minimum pour des builds en priorite raisonnable
- Les builds gratuits peuvent prendre des heures en file d'attente
- Cout cumulatif significatif pour les builds frequents

**Sources** :
- [Expo Pricing](https://expo.dev/pricing)
- [EAS Plans and Subscriptions - Expo Docs](https://docs.expo.dev/billing/plans/)
- [EAS Usage-Based Pricing - Expo Docs](https://docs.expo.dev/billing/usage-based-pricing/)
- [True Cost of Expo Development - MetaCTO](https://www.metacto.com/blogs/the-true-cost-of-expo-app-development-a-comprehensive-guide)

### 7.2 EAS Local Build + GitHub Actions (RECOMMANDE)

**Tarification** : Gratuit (dans les limites de GitHub Actions).

**Principe** : Utiliser `eas build --local` pour executer les builds sur les runners GitHub Actions au lieu des serveurs EAS.

**Outils disponibles** :
- **expo-react-native-cicd** : Pipeline CI/CD complet pour les apps React Native/Expo avec GitHub Actions. Workflows personnalisables, options de deploiement flexibles (GitHub Releases, Google Drive, etc.)
- **React Native Expo Builder** : Generateur de workflows GitHub Actions pour builder les apps Expo gratuitement.

**Avantages** :
- Zero cout pour les builds (dans le quota gratuit de 2 000 minutes/mois de GitHub Actions)
- Controle total du processus de build
- Possibilite de builder Android sur Linux (pas de surcharge de minutes)
- Economies de centaines de dollars par mois par rapport a EAS Build payant

**Inconvenients** :
- Les builds iOS necessitent un runner macOS (10x les minutes GitHub Actions)
- Configuration initiale plus complexe qu'EAS Build
- Pas de soumission automatisee aux stores (a configurer manuellement avec Fastlane)
- Les builds macOS sur GitHub Actions sont lents et consomment rapidement le quota

**Strategie optimale pour Family Home** :
1. **Builds Android** : GitHub Actions (runners Linux, minutes standard)
2. **Builds iOS** : EAS Build gratuit (basse priorite) pour les releases, GitHub Actions macOS pour les urgences
3. **EAS Update** : Utiliser le tier gratuit (1 000 MAU) pour les hotfixes OTA
4. **Frequence de build** : Limiter aux releases (pas de CI sur chaque commit pour le mobile)

**Sources** :
- [Don't Pay for EAS! Local Build on GitHub Actions - DEV](https://dev.to/rgomezp/how-to-set-up-an-eas-local-build-on-github-actions-1l0i)
- [expo-react-native-cicd GitHub](https://github.com/TanayK07/expo-react-native-cicd)
- [React Native Expo Builder](https://www.expobuilder.app/)
- [Expo GitHub Action](https://github.com/expo/expo-github-action)

---

## 8. Securite et Conformite RGPD

### 8.1 Exigences RGPD pour une application familiale

**Donnees d'enfants (Article 8 RGPD)** :
- Le consentement parental est obligatoire pour le traitement des donnees des mineurs de moins de 16 ans (seuil variable selon les pays UE : 13-16 ans)
- Les cases a cocher non selectionnees et les verifications d'age passives sont insuffisantes
- Les flux de consentement doivent etre adaptes par geolocalisation
- La publicite basee sur le profilage est interdite pour les utilisateurs connus comme etant des enfants

**Mises a jour 2025-2026** :
- Parametres prives par defaut obligatoires
- Verification d'age plus stricte
- Evaluations de risques pour les plateformes accessibles aux mineurs
- La Commission europeenne teste un "mini-portefeuille" officiel de verification d'age open-source
- Le Comite europeen de la protection des donnees (EDPB) travaille sur des lignes directrices specifiques au traitement des donnees d'enfants

**Sources** :
- [EU Children's Data Privacy 2025 - 7 Changes](https://www.gdprregister.eu/gdpr/eu-childrens-data-privacy-2025-7-changes/)
- [GDPR Compliance Guide 2026](https://secureprivacy.ai/blog/gdpr-compliance-2026)
- [Art. 8 GDPR - Child Consent](https://gdpr-info.eu/art-8-gdpr/)
- [Protecting Children Online 2026 - ReedSmith](https://www.reedsmith.com/our-insights/blogs/technology-law-dispatch/102mela/protecting-children-online-what-to-expect-in-2026/)

### 8.2 Mesures de securite recommandees

#### Infrastructure
- **Chiffrement en transit** : TLS/HTTPS obligatoire partout (Coolify/Certbot gere cela automatiquement)
- **Chiffrement au repos** : Hetzner propose le chiffrement des volumes (a activer)
- **Firewall** : Configurer le firewall Hetzner pour n'exposer que les ports necessaires (80, 443)
- **Sauvegardes** : Automatiser les sauvegardes PostgreSQL quotidiennes vers Cloudflare R2

#### Application
- **JWT** : Inclure uniquement l'ID utilisateur, le role et les permissions dans le payload. Ne jamais stocker de PII, mots de passe ou donnees sensibles
- **Hashage des mots de passe** : bcrypt ou argon2 (recommande)
- **Rate limiting** : Proteger les endpoints de connexion et d'inscription
- **Validation des entrees** : Utiliser class-validator de NestJS systematiquement
- **CORS** : Configurer strictement les origines autorisees
- **Content Security Policy** : Headers de securite sur le frontend Next.js

#### Donnees familiales
- **Isolation des donnees** : Row Level Security PostgreSQL pour garantir que chaque foyer n'accede qu'a ses propres donnees
- **Audit logs** : Tracer les acces aux donnees sensibles (qui a vu quoi, quand)
- **Droit a l'effacement** : Implementer un mecanisme de suppression complete du compte et des donnees
- **Export des donnees** : Permettre l'export au format portable (exigence RGPD)
- **Minimisation des donnees** : Ne collecter que les donnees strictement necessaires

### 8.3 Localisation des donnees

L'hebergement sur Hetzner en Allemagne/Finlande garantit que les donnees restent dans l'UE. C'est un avantage significatif par rapport aux solutions cloud americaines (AWS, GCP, Vercel) pour la conformite RGPD et la confiance des utilisateurs europeens.

---

## 9. Synthese : Architecture Recommandee et Budget Previsionnel

### Architecture cible (Phase de lancement)

```
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare (gratuit)                  │
│              CDN + DNS + DDoS Protection                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│     ┌─────────────┐    ┌──────────────────────┐        │
│     │  Next.js     │    │  NestJS Backend      │        │
│     │  (Frontend)  │    │  + Better Auth        │        │
│     └─────────────┘    │  + WebSocket Gateway   │        │
│                         └──────────────────────┘        │
│                                                         │
│     ┌─────────────┐    ┌──────────────────────┐        │
│     │ PostgreSQL   │    │  Redis (cache +       │        │
│     │ (donnees)    │    │  sessions + temps reel)│       │
│     └─────────────┘    └──────────────────────┘        │
│                                                         │
│            Hetzner CX22 + Coolify (~4 EUR/mois)        │
└─────────────────────────────────────────────────────────┘

┌──────────────────────┐    ┌──────────────────────────┐
│   Cloudflare R2      │    │   GitHub Actions          │
│   (photos/documents) │    │   (CI/CD + EAS local      │
│   0 EUR (tier gratuit)│   │   builds)                 │
└──────────────────────┘    │   0 EUR (tier gratuit)    │
                            └──────────────────────────┘

┌──────────────────────┐    ┌──────────────────────────┐
│   Sentry             │    │   EAS Update (OTA)        │
│   (error tracking)   │    │   0 EUR (tier gratuit)    │
│   0 EUR (tier gratuit)│   └──────────────────────────┘
└──────────────────────┘
```

### Budget mensuel estimatif

#### Phase 1 : MVP/Lancement (0-500 utilisateurs)

| Service | Cout mensuel |
|---------|-------------|
| Hetzner CX22 (backend + frontend + BDD) | 3,79 EUR |
| Cloudflare (CDN + DNS + protection) | 0 EUR |
| Cloudflare R2 (stockage fichiers, tier gratuit) | 0 EUR |
| Better Auth (authentification, auto-heberge) | 0 EUR |
| GitHub Actions (CI/CD, tier gratuit) | 0 EUR |
| Sentry Developer (error tracking) | 0 EUR |
| EAS Update (OTA, tier gratuit) | 0 EUR |
| EAS Build (builds basse priorite gratuits) | 0 EUR |
| **Total** | **~4 EUR/mois** |

#### Phase 2 : Croissance (500-5 000 utilisateurs)

| Service | Cout mensuel |
|---------|-------------|
| Hetzner CX32 (upgrade serveur) | ~7 EUR |
| Cloudflare R2 (50 Go de photos) | ~0,60 USD |
| Neon PostgreSQL Launch (BDD geree) | 5 USD |
| Upstash Redis (cache serverless) | 0 USD (tier gratuit) |
| Sentry Team (monitoring avance) | 26 USD |
| EAS Starter (builds + updates) | 19 USD |
| **Total** | **~55-60 USD/mois (~50-55 EUR)** |

#### Phase 3 : Scale (5 000+ utilisateurs)

| Service | Cout mensuel |
|---------|-------------|
| Hetzner CCX13 (CPU dedie) ou multi-serveurs | 15-30 EUR |
| Cloudflare R2 (500 Go) | ~7 USD |
| Neon PostgreSQL Scale | 25+ USD |
| Upstash Redis Pro | 10+ USD |
| Sentry Business | 80+ USD |
| Prometheus + Grafana auto-heberges | 0 EUR |
| **Total** | **~140-200 USD/mois (~130-185 EUR)** |

### Parcours de scalabilite

```
Phase 1 (MVP)           Phase 2 (Croissance)         Phase 3 (Scale)
~4 EUR/mois             ~55 EUR/mois                 ~150 EUR/mois

Tout sur 1 serveur  --> Separation BDD/app       --> Multi-serveurs
PostgreSQL local    --> Neon PostgreSQL manage    --> PostgreSQL HA
Redis local         --> Upstash Redis            --> Redis cluster
Sentry gratuit      --> Sentry Team              --> Full observabilite
Builds gratuits     --> EAS Starter              --> EAS + CI custom
```

### Arbitrages cles (trade-offs)

| Decision | Choix recommande | Compromis accepte |
|----------|-----------------|-------------------|
| Managed vs Self-hosted | Self-hosted (Coolify) | Plus de maintenance, mais 70-80% d'economies |
| Auth SaaS vs Self-hosted | Better Auth (self-hosted) | Plus de code, mais zero cout et controle RGPD |
| Vercel vs Self-hosted Next.js | Self-hosted + Cloudflare CDN | Pas de previews natives Vercel, mais cout quasi nul |
| EAS Build payant vs GitHub Actions | GitHub Actions + EAS gratuit | Builds iOS plus lents, setup plus complexe |
| Base de donnees locale vs geree | Locale au lancement | Responsabilite des sauvegardes, migration future |

### Conclusion

L'architecture recommandee permet de lancer Family Home avec un budget d'environ **4 EUR/mois** tout en maintenant une qualite professionnelle. La stack est entierement hebergee en Europe (conformite RGPD native), utilise des outils open-source matures, et offre un parcours de scalabilite clair sans reecriture architecturale majeure.

L'approche self-hosted avec Coolify sur Hetzner represente le meilleur rapport qualite/prix pour un developpeur indie ou une petite equipe, en combinant l'experience developpeur des PaaS modernes avec les couts d'un VPS classique. Le choix de Better Auth pour l'authentification elimine le risque de couts explosifs lies aux solutions SaaS par MAU, tout en gardant le controle total sur les donnees des utilisateurs — un point critique pour une application gerant des donnees familiales sensibles.
