# Recherche : Integrations Externes, APIs Tierces et Interoperabilite Systeme

**Date de recherche** : 6 fevrier 2026
**Contexte** : Ecosysteme "family-hub" -- Backend NestJS, Web Next.js, Mobile Expo React Native
**Perimetre** : Integrations externes planifiees de la v1.2 a la v3.0+

---

## Table des matieres

1. [Synchronisation de calendriers (Google, Apple, Outlook)](#1-synchronisation-de-calendriers)
2. [Assistants vocaux (Google Home, Alexa, Siri)](#2-assistants-vocaux)
3. [Automatisation de workflows (n8n, Zapier)](#3-automatisation-de-workflows)
4. [Authentification OAuth 2.0 pour APIs tierces](#4-authentification-oauth-20)
5. [Patterns Webhooks (entrants/sortants)](#5-patterns-webhooks)
6. [Boutons physiques et IoT (Flic, MQTT)](#6-boutons-physiques-et-iot)
7. [Protocole Matter et interoperabilite](#7-protocole-matter)
8. [Synthese et recommandations par version](#8-synthese-et-recommandations)

---

## 1. Synchronisation de calendriers

### 1.1 APIs et protocoles disponibles

| Fournisseur | API / Protocole | Type | Cout |
|---|---|---|---|
| **Google Calendar** | Google Calendar REST API v3 | REST/JSON, OAuth 2.0 | Gratuit (quotas genereux) |
| **Google Calendar** | CalDAV v2 | WebDAV/XML | Gratuit |
| **Apple iCloud** | CalDAV (via iCloud) | WebDAV/XML | Gratuit |
| **Microsoft Outlook** | Microsoft Graph API | REST/JSON, OAuth 2.0 | Gratuit (Azure AD requis) |

**Google Calendar API vs CalDAV** : Google propose deux chemins d'acces. L'API REST v3 offre des endpoints RESTful complets pour les operations CRUD avec support des notifications push, du partage d'evenements et du controle d'acces. Le protocole CalDAV est plus universel mais plus verbeux (XML). Pour une application personnalisee, l'API REST est recommandee pour Google ; CalDAV est incontournable pour Apple iCloud qui ne propose pas d'API REST publique.

**Apple iCloud Calendar** : Apple ne fournit pas d'API REST officielle pour les calendriers. L'integration passe obligatoirement par le protocole CalDAV. La bibliotheque `tsdav` (TypeScript) est la reference pour communiquer avec le serveur iCloud sans manipuler directement le XML CalDAV. Elle fournit une API de haut niveau couvrant `fetchCalendars`, `fetchCalendarObjects`, `createCalendarObject`, `updateCalendarObject`, `deleteCalendarObject`, ainsi que `syncCalendars` et `smartCollectionSync` pour la synchronisation incrementale via sync-tokens.

**Microsoft Outlook** : L'API Microsoft Graph est l'interface moderne pour acceder aux donnees Outlook (calendrier, mail, contacts). Le SDK officiel `@microsoft/microsoft-graph-client` est disponible en TypeScript. Une bibliotheque communautaire `outlook-events-client` simplifie la gestion des evenements. L'authentification passe par Azure AD avec OAuth 2.0.

### 1.2 Complexite et effort d'integration

| Integration | Complexite | Effort estime | Justification |
|---|---|---|---|
| Google Calendar API | Moyenne | 2-3 semaines | API REST bien documentee, OAuth 2.0 standard, SDK JS mature |
| Apple iCloud CalDAV | Elevee | 3-4 semaines | Protocole CalDAV complexe (XML), authentification app-specific password ou OAuth, synchronisation incrementale delicate |
| Microsoft Graph / Outlook | Moyenne | 2-3 semaines | API REST bien documentee, SDK TypeScript officiel, configuration Azure AD supplementaire |
| Synchronisation bidirectionnelle | Tres elevee | +2-3 semaines | Gestion des conflits, resolution des doublons, sync incrementale, gestion des fuseaux horaires |

### 1.3 Patterns d'implementation NestJS

```
// Architecture recommandee
src/
  calendar/
    calendar.module.ts
    calendar.service.ts          // Facade unifiee
    calendar.controller.ts       // Endpoints REST
    providers/
      google-calendar.provider.ts   // Google Calendar API v3
      apple-caldav.provider.ts      // tsdav wrapper
      outlook-graph.provider.ts     // Microsoft Graph
    interfaces/
      calendar-provider.interface.ts // Interface commune
    dto/
      sync-calendar.dto.ts
      calendar-event.dto.ts
```

**Pattern Strategy** : Definir une interface `ICalendarProvider` commune avec les methodes `fetchEvents()`, `createEvent()`, `updateEvent()`, `deleteEvent()`, `syncEvents()`. Chaque fournisseur implemente cette interface. Un service facade orchestre les appels selon le provider selectionne par l'utilisateur.

**Bibliotheques cles** :
- `googleapis` (npm) -- SDK officiel Google, inclut Calendar API v3
- `tsdav` (npm) -- Client CalDAV/CardDAV TypeScript, teste avec Google et iCloud
- `ts-caldav` (npm) -- Alternative legere pour CalDAV
- `@microsoft/microsoft-graph-client` (npm) -- SDK officiel Microsoft Graph
- `outlook-events-client` (npm) -- Wrapper TypeScript specialise Outlook

### 1.4 Securite

- **OAuth 2.0** obligatoire pour Google et Microsoft. Tokens a stocker de maniere chiffree (AES-256) en base de donnees.
- **Apple iCloud** : authentification par mot de passe specifique a l'application ou delegation OAuth selon la methode CalDAV. Necessite une gestion soigneuse des credentials.
- **Refresh tokens** : implementer la rotation des tokens avec expiration courte (7-14 jours pour les refresh tokens).
- **Scopes minimaux** : demander uniquement les scopes calendrier necessaires (`https://www.googleapis.com/auth/calendar`, `Calendars.ReadWrite` pour Microsoft).
- **Webhooks/Push** : Google Calendar propose des notifications push (webhook) pour les modifications ; Microsoft Graph offre des subscriptions avec notifications. Valider les signatures des callbacks.

### 1.5 Maturite et fiabilite

| Fournisseur | Maturite | Fiabilite | Notes |
|---|---|---|---|
| Google Calendar API v3 | Tres haute | Excellente | API stable depuis 2012, bien maintenue |
| tsdav (CalDAV) | Haute | Bonne | Utilisee par Cal.com (fork calcom/tsDAV), communaute active |
| Microsoft Graph | Tres haute | Excellente | SDK officiel Microsoft, documentation exhaustive |

### 1.6 Sources

- [Google Calendar API -- Google for Developers](https://developers.google.com/calendar)
- [Google CalDAV API Developer's Guide](https://developers.google.com/workspace/calendar/caldav/v2/guide)
- [Demystifying CalDAV: Apple Calendar Integration -- Aurinko](https://www.aurinko.io/blog/caldav-apple-calendar-integration/)
- [How to integrate iCloud Calendar API -- OneCal](https://www.onecal.io/blog/how-to-integrate-icloud-calendar-api-into-your-app)
- [tsdav -- npm](https://www.npmjs.com/package/tsdav)
- [tsdav -- GitHub (natelindev)](https://github.com/natelindev/tsdav)
- [ts-caldav -- GitHub (KlautNet)](https://github.com/KlautNet/ts-caldav)
- [calcom/tsDAV fork -- GitHub](https://github.com/calcom/tsDAV)
- [Outlook Calendar API overview -- Microsoft Graph](https://learn.microsoft.com/en-us/graph/outlook-calendar-concept-overview)
- [@microsoft/microsoft-graph-client -- npm](https://www.npmjs.com/package/@microsoft/microsoft-graph-client)
- [outlook-events-client -- GitHub](https://github.com/Fmanuel809/outlook-events-client)
- [Google CalDAV API vs Google Calendar API -- TutorialPedia](https://www.tutorialpedia.org/blog/difference-between-google-caldav-api-and-google-calendar-api/)

---

## 2. Assistants vocaux

### 2.1 APIs et protocoles disponibles

| Plateforme | API / SDK | Protocole | Cout |
|---|---|---|---|
| **Amazon Alexa** | Alexa Smart Home Skill API | JSON via AWS Lambda | Gratuit (AWS Lambda payant au-dela du free tier) |
| **Google Home** | Cloud-to-cloud (ex-Actions on Google) | REST/JSON, OAuth 2.0 | Gratuit (hebergement cloud a charge) |
| **Apple Siri** | HomeKit framework + Siri Shortcuts | HAP (HomeKit Accessory Protocol) | Gratuit (inscription MFi requise pour le hardware) |

**Amazon Alexa** : Le Smart Home Skill API utilise un modele d'interaction vocale pre-construit. Le developpeur fournit un backend via AWS Lambda qui recoit des requetes JSON (Discovery, Control, Query) et retourne des reponses JSON. L'account linking via OAuth 2.0 permet de relier les comptes utilisateur. L'API supporte l'envoi de messages asynchrones depuis le cloud applicatif vers Alexa.

**Google Home** : L'architecture Cloud-to-cloud (C2C) exige un endpoint de fulfillment cloud qui repond aux intents SYNC, QUERY, EXECUTE. OAuth 2.0 (Authorization Code flow) est obligatoire pour le account linking. Le Local Home SDK v1.0 (publie en janvier 2025) permet un routage local des commandes via mDNS, UDP ou UPnP pour reduire la latence. Les commandes peuvent retomber sur le cloud si le chemin local echoue.

**Apple Siri / HomeKit** : L'integration directe avec une application personnalisee est la plus restrictive. HomeKit necessite l'inscription au programme MFi pour distribuer des accessoires. Cependant, les Siri Shortcuts offrent un mecanisme d'automatisation flexible : un utilisateur peut creer des raccourcis qui declenchent des actions dans l'application family-hub via des URL schemes ou des Intents (SiriKit). L'action "Control Home" permet de piloter des accessoires HomeKit depuis les Shortcuts.

### 2.2 Complexite et effort d'integration

| Integration | Complexite | Effort estime | Justification |
|---|---|---|---|
| Alexa Smart Home Skill | Elevee | 4-6 semaines | AWS Lambda, certification Amazon, gestion OAuth, tests vocaux |
| Google Home C2C | Elevee | 4-6 semaines | Fulfillment cloud, certification Google, OAuth, gestion des traits/types d'appareils |
| Siri Shortcuts (basique) | Moyenne | 2-3 semaines | Integration via URL schemes/Intents dans l'app Expo |
| HomeKit (complet) | Tres elevee | 8-12 semaines | Programme MFi, protocole HAP, certification hardware |

### 2.3 Patterns d'implementation NestJS

**Pour Alexa et Google Home**, le backend NestJS sert de cloud de fulfillment :

```
src/
  voice-assistant/
    voice-assistant.module.ts
    alexa/
      alexa.controller.ts        // Endpoint Lambda proxy ou direct
      alexa.service.ts            // Traitement des directives Alexa
      alexa-discovery.handler.ts
      alexa-control.handler.ts
    google-home/
      google-home.controller.ts  // Endpoint fulfillment
      google-home.service.ts     // Traitement des intents SYNC/QUERY/EXECUTE
    shared/
      device-mapper.service.ts   // Mapping entites family-hub -> devices virtuels
      oauth-linking.service.ts   // Account linking
```

**Concept cle** : L'application family-hub n'est pas un appareil physique, mais on peut exposer ses entites (taches, rappels, listes) comme des "appareils virtuels" controlables par la voix. Par exemple, "Alexa, ajoute 'lait' a la liste de courses" pourrait declencher l'ajout via le Skill.

### 2.4 Securite

- **OAuth 2.0 Account Linking** obligatoire pour Alexa et Google Home. Le serveur NestJS doit fournir les endpoints d'autorisation et d'echange de tokens.
- **Validation des requetes** : verifier l'origine des requetes (signature Lambda pour Alexa, en-tetes Google pour C2C).
- **Scopes limites** : definir des scopes granulaires pour les operations vocales (lecture seule vs modification).
- **Traitement local** : en 2026, les trois plateformes ameliorent le traitement local des commandes vocales, reduisant l'exposition des donnees au cloud.

### 2.5 Maturite et fiabilite

| Plateforme | Maturite | Ecosysteme | Appareils compatibles |
|---|---|---|---|
| Alexa | Tres haute | Le plus large | 100 000+ appareils |
| Google Home | Haute | Tres large | 80 000+ appareils |
| Apple HomeKit | Haute | Plus restreint mais qualitatif | ~25 000 appareils (certification stricte) |

### 2.6 Sources

- [Alexa Smart Home Skill API -- Amazon Developer](https://developer.amazon.com/en-US/docs/alexa/smarthome/understand-the-smart-home-skill-api.html)
- [Build Alexa Smart Home Skills -- Amazon](https://developer.amazon.com/en-US/alexa/alexa-skills-kit/get-deeper/smart-home-skills)
- [Cloud-to-cloud intents -- Google Home Developers](https://developers.home.google.com/cloud-to-cloud/intents/execute)
- [Local Home SDK -- Google Home Developers](https://developers.home.google.com/local-home)
- [Smart Home Actions migration -- Google](https://developers.home.google.com/cloud-to-cloud/project/migration)
- [Apple Home Developer -- Apple](https://developer.apple.com/apple-home/)
- [HomeKit Documentation -- Apple](https://developer.apple.com/documentation/homekit)
- [Best Voice Assistants for Smart Homes 2026 -- Spartan Concepts](https://spartanconcepts.ai/best-voice-assistants-for-smart-homes-in-2026-alexa-google-or-apple/)
- [Best Voice Assistants 2026 -- PropelRC](https://www.propelrc.com/best-voice-assistants-for-smart-homes/)
- [Smart Home Ecosystem Comparison -- IoT For All](https://www.iotforall.com/comparing-smart-home-ecosystem-options-alexa-google-assistant-apple-homekit)
- [Matter Hub + Home Assistant](https://community.home-assistant.io/t/matter-hub-simple-setup-to-link-google-home-alexa-and-siri-to-home-assistant/792902)

---

## 3. Automatisation de workflows

### 3.1 APIs et protocoles disponibles

| Plateforme | Type | Protocole principal | Cout |
|---|---|---|---|
| **n8n** | Self-hosted / Cloud | Webhooks HTTP, REST API | Open-source gratuit (self-hosted), Cloud a partir de 20EUR/mois |
| **Zapier** | Cloud SaaS | Webhooks HTTP, REST API | Gratuit (100 taches/mois), Pro a partir de 20$/mois |
| **Make (ex-Integromat)** | Cloud SaaS | Webhooks HTTP, REST API | Gratuit (1000 ops/mois), Core a partir de 9$/mois |

### 3.2 n8n vs Zapier : analyse comparative

**n8n** est un outil d'automatisation plus recent, concu pour les developpeurs et les equipes techniques. Il offre un controle profond sur les workflows, l'infrastructure et la logique. Les points forts :
- **Self-hosted** : peut etre deploye sur l'infrastructure family-hub (Docker), zero dependance externe, donnees en interne
- **Extensibilite** : nodes HTTP Request/Webhook pour integrer tout service avec une API, nodes Code (JavaScript) pour transformer les payloads
- **Latence** : instance self-hosted "always warm", avantage pour les webhooks temps reel
- **Cout** : gratuit en self-hosted, pas de limite de taches

**Zapier** est plus accessible et offre la couverture d'applications la plus large (6000+ apps). Il est preferable pour les utilisateurs non-techniques qui veulent des automatisations cle-en-main.

**Recommandation pour family-hub** : **n8n self-hosted** est le choix optimal. Il permet de garder les donnees familiales en interne, offre une extensibilite maximale, et s'integre naturellement avec le backend NestJS via webhooks.

### 3.3 Patterns d'implementation NestJS

**Integration NestJS <-> n8n** :

```
// 1. NestJS envoie des evenements a n8n via webhook
// Quand un evenement se produit dans family-hub, le backend notifie n8n

@Injectable()
export class AutomationService {
  constructor(private readonly httpService: HttpService) {}

  async triggerWorkflow(event: AppEvent): Promise<void> {
    await this.httpService.axiosRef.post(
      'https://n8n.family-home.local/webhook/family-event',
      { eventType: event.type, payload: event.data }
    );
  }
}

// 2. n8n appelle le backend NestJS via REST API
// n8n utilise le node HTTP Request pour interagir avec l'API family-hub
// Authentification via API key ou JWT
```

**Architecture recommandee** :

```
src/
  automation/
    automation.module.ts
    automation.controller.ts     // Endpoints pour recevoir les callbacks n8n
    automation.service.ts        // Logique de declenchement des workflows
    webhook-dispatcher.service.ts // Envoi d'evenements vers n8n/Zapier
    dto/
      automation-trigger.dto.ts
      webhook-payload.dto.ts
```

**Cas d'usage famille** :
- "Quand une tache est marquee terminee -> envoyer une notification a toute la famille"
- "Chaque lundi a 8h -> creer les taches menageres de la semaine"
- "Quand le calendrier est modifie -> synchroniser avec Google Calendar"
- "Quand un nouveau repas est planifie -> ajouter les ingredients a la liste de courses"

### 3.4 Securite

- **Webhooks signes** : signer chaque payload sortant avec HMAC-SHA256, valider les signatures des callbacks entrants.
- **API keys** : generer des cles API dediees pour la communication n8n <-> NestJS.
- **Reseau** : si n8n est self-hosted, le placer dans le meme reseau prive que le backend NestJS.
- **Rate limiting** : limiter les appels webhook pour prevenir les abus.

### 3.5 Maturite et fiabilite

| Plateforme | Maturite | Fiabilite | Communaute |
|---|---|---|---|
| n8n | Haute | Bonne (self-hosted = controle total) | Open-source actif, 45k+ stars GitHub |
| Zapier | Tres haute | Excellente (SaaS manage) | Enorme ecosysteme, documentation riche |
| Make | Haute | Tres bonne | Grande communaute, bon rapport qualite-prix |

### 3.6 Sources

- [n8n Webhook integrations](https://n8n.io/integrations/webhook/)
- [n8n Features](https://n8n.io/features/)
- [n8n vs Zapier -- n8n](https://n8n.io/vs/zapier/)
- [n8n vs Zapier 2025 -- Skywork AI](https://skywork.ai/blog/agent/n8n-vs-zapier-2025-which-automation-tool-wins-for-ai-workflows/)
- [n8n Documentation](https://docs.n8n.io/)
- [Webhook node documentation -- n8n Docs](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- [n8n vs Zapier Ultimate Showdown 2025 -- WebspaceKit](https://webspacekit.com/n8n-vs-zapier/)
- [How to use API with n8n self-hosted -- Hostinger](https://www.hostinger.com/tutorials/n8n-api)

---

## 4. Authentification OAuth 2.0

### 4.1 Protocoles et standards

| Standard | Usage | Description |
|---|---|---|
| **OAuth 2.0 Authorization Code** | APIs tierces (Google, Microsoft, etc.) | Flow standard pour les applications serveur, avec code d'autorisation et echange de tokens |
| **OAuth 2.0 + PKCE** | Applications mobiles (Expo) | Extension securisee pour les clients publics, elimine le besoin de client_secret |
| **OpenID Connect (OIDC)** | Authentification utilisateur | Couche d'identite sur OAuth 2.0, fournit un id_token avec les informations utilisateur |
| **API Keys** | Services machine-to-machine | Cles statiques pour les integrations simples (n8n, webhooks) |

### 4.2 Patterns d'implementation NestJS

**Packages essentiels** :
- `@nestjs/passport` -- Integration Passport.js avec NestJS
- `@nestjs/jwt` -- Gestion des tokens JWT
- `passport-google-oauth20` -- Strategie Google OAuth 2.0
- `passport-oauth2` -- Strategie generique OAuth 2.0
- `passport-jwt` -- Validation des JWT

**Architecture multi-provider extensible** :

```
src/
  auth/
    auth.module.ts
    strategies/
      google.strategy.ts          // passport-google-oauth20
      microsoft.strategy.ts       // passport-azure-ad ou custom
      apple.strategy.ts           // passport-apple
    guards/
      oauth.guard.ts
      jwt-auth.guard.ts
    services/
      token-management.service.ts  // Stockage et rotation des tokens
      account-linking.service.ts   // Liaison de comptes tiers
    decorators/
      current-user.decorator.ts
```

**Pattern cle -- gestion des tokens tiers** :

```typescript
// Stocker les tokens OAuth des services tiers de maniere securisee
@Injectable()
export class TokenManagementService {
  // Chiffrer les tokens avant stockage (AES-256-GCM)
  async storeProviderTokens(userId: string, provider: string, tokens: OAuthTokens): Promise<void>;

  // Rafraichir automatiquement les tokens expires
  async getValidToken(userId: string, provider: string): Promise<string>;

  // Rotation des refresh tokens a chaque usage
  async rotateRefreshToken(userId: string, provider: string): Promise<OAuthTokens>;
}
```

### 4.3 Bonnes pratiques de securite (2025-2026)

1. **Parametre `state`** : toujours inclure un parametre state aleatoire pour prevenir les attaques CSRF.
2. **Rotation des refresh tokens** : a chaque utilisation, emettre un nouveau refresh token et invalider l'ancien.
3. **Duree de vie courte** : tokens d'acces de 15-60 minutes, refresh tokens de 7-14 jours maximum.
4. **Validation de l'id_token** : toujours verifier la signature et l'issuer contre les cles publiques du fournisseur d'identite.
5. **Variables d'environnement** : ne jamais coder en dur les client_id et client_secret ; utiliser des variables d'environnement ou un coffre-fort (Vault).
6. **Scopes minimaux** : ne demander que les permissions strictement necessaires.
7. **Account linking** : supporter la liaison automatique des comptes avec email correspondant, avec verification prealable.
8. **PKCE pour le mobile** : obligatoire pour l'application Expo React Native (client public).

### 4.4 Complexite et effort

| Composant | Effort estime | Notes |
|---|---|---|
| OAuth 2.0 de base (Google) | 1-2 semaines | Passport.js simplifie enormement |
| Multi-provider (Google + Microsoft + Apple) | 2-3 semaines | Pattern Strategy extensible |
| Gestion securisee des tokens tiers | 1-2 semaines | Chiffrement, rotation, rafraichissement auto |
| Account linking | 1 semaine | Logique de liaison/deliaison |

### 4.5 Cout

- **OAuth 2.0** : gratuit (protocole standard ouvert).
- **Google Cloud Console** : gratuit pour la configuration des credentials OAuth.
- **Azure AD** : gratuit pour les fonctionnalites de base, Microsoft Entra ID (ex-Azure AD) offre un tier gratuit.
- **Apple Developer Program** : 99$/an (necessaire pour Sign in with Apple).

### 4.6 Sources

- [NestJS Third Party OAuth2 Authentication -- nerd.vision](https://www.nerd.vision/post/nestjs-third-party-oauth2-authentication)
- [NestJS Authentication with OAuth2.0: Adding External Providers -- DEV Community](https://dev.to/tugascript/nestjs-authentication-with-oauth20-adding-external-providers-2kj)
- [Integrating OAuth 2.0 with NestJS -- Medium (rnab)](https://arnab-k.medium.com/integrating-oauth2-with-nestjs-for-authentication-bf797a1d29eb)
- [Multi-Provider SSO in NestJS with OAuth2 -- Medium (Camille Fauchier)](https://medium.com/@camillefauchier/multi-provider-oauth2-authentication-in-nestjs-beyond-basic-jwt-7945ece51bb3)
- [Implement OAuth 2.0 and OIDC with NestJS -- MojoAuth](https://mojoauth.com/oauth2-oidc/implement-oauth2-oidc-with-nestjs)
- [NestJS Authentication with OAuth2.0: Configuration and Operations -- DEV Community](https://dev.to/tugascript/nestjs-authentication-with-oauth20-configuration-and-operations-41k)
- [Top NestJS Security Best Practices -- MoldStud](https://moldstud.com/articles/p-top-nestjs-security-best-practices-comprehensive-faq-for-developers)
- [Enhancing Web Security: OAuth2 in NestJS -- Medium (rnab)](https://arnab-k.medium.com/enhancing-web-security-oauth2-implementation-in-nestjs-c38dae3aeb65)

---

## 5. Patterns Webhooks

### 5.1 Types de webhooks

| Type | Direction | Description |
|---|---|---|
| **Webhooks entrants** (Incoming) | Externe -> family-hub | Recevoir des notifications de services tiers (Stripe, GitHub, Google Calendar push, etc.) |
| **Webhooks sortants** (Outgoing) | family-hub -> Externe | Notifier des services tiers quand un evenement se produit dans l'application |

### 5.2 Patterns d'implementation NestJS

**Webhooks entrants** :

```typescript
@Controller('webhooks')
export class WebhookController {

  @Post('google-calendar')
  async handleGoogleCalendarWebhook(
    @Headers('x-goog-channel-id') channelId: string,
    @Headers('x-goog-resource-state') resourceState: string,
    @Body() payload: any,
  ) {
    // 1. Verifier la signature/l'origine
    // 2. Enregistrer l'evenement dans une table webhook_events
    // 3. Dispatcher vers le traitement asynchrone (queue)
  }
}
```

**Webhooks sortants** :

```typescript
@Injectable()
export class WebhookDispatcherService {
  constructor(
    private readonly httpService: HttpService,
    private readonly webhookQueue: Queue,
  ) {}

  async dispatch(event: AppEvent, subscriberUrl: string): Promise<void> {
    const payload = this.buildPayload(event);
    const signature = this.signPayload(payload, subscriberSecret);

    // Enqueue pour retry automatique
    await this.webhookQueue.add('dispatch', {
      url: subscriberUrl,
      payload,
      signature,
      attempt: 0,
    });
  }

  private signPayload(payload: any, secret: string): string {
    return crypto.createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
  }
}
```

**Architecture robuste avec queues** :

```
src/
  webhooks/
    webhooks.module.ts
    incoming/
      incoming-webhook.controller.ts  // Endpoints de reception
      webhook-validator.service.ts    // Validation des signatures
      webhook-event.entity.ts         // Table de suivi des evenements
    outgoing/
      outgoing-webhook.service.ts     // Dispatch des webhooks
      webhook-subscriber.entity.ts    // Table des abonnes
    queue/
      webhook-dispatch.processor.ts   // BullMQ processor avec retry
      dead-letter.processor.ts        // Traitement des echecs definitifs
    guards/
      webhook-signature.guard.ts      // Guard de verification de signature
```

### 5.3 Mecanismes de fiabilite

| Mecanisme | Implementation | Objectif |
|---|---|---|
| **Retry exponential backoff** | BullMQ avec configuration attempts + backoff | Gerer les erreurs transitoires |
| **Dead-letter queue (DLQ)** | Queue BullMQ separee pour les echecs definitifs | Revue manuelle, alerting |
| **Idempotence** | Table `webhook_events` avec `idempotency_key` unique | Eviter le double-traitement |
| **Optimistic locking** | Version column sur les entites modifiees | Prevenir les race conditions |
| **Rate limiting** | `@nestjs/throttler` sur les endpoints webhook | Prevenir les abus |
| **Signature HMAC** | HMAC-SHA256 sur chaque payload | Authentifier l'origine |

### 5.4 Bibliotheques et outils

- `@golevelup/nestjs-webhooks` -- Utilitaires middleware pour le parsing du raw body et la configuration des routes webhook dans NestJS.
- `@nestjs/bull` ou `@nestjs/bullmq` -- Integration BullMQ pour les queues de retry et dead-letter.
- `@nestjs/axios` -- Module HTTP pour l'envoi des webhooks sortants.
- `@nestjs/throttler` -- Rate limiting natif NestJS.

### 5.5 Complexite et effort

| Composant | Effort estime |
|---|---|
| Webhooks entrants basiques | 1 semaine |
| Webhooks sortants avec signature | 1-2 semaines |
| Systeme de retry + DLQ (BullMQ) | 1-2 semaines |
| Idempotence + tracking | 1 semaine |
| **Total systeme webhook complet** | **4-6 semaines** |

### 5.6 Sources

- [Building Webhooks with NestJS -- Fullstack Labs](https://www.fullstack.com/labs/resources/blog/how-to-implement-webhooks-using-nestjs)
- [Building Event-Driven Architecture with NestJS -- Medium (Sylvester)](https://medium.com/@sylvesterranjithfrancis/building-event-driven-architecture-with-nestjs-and-typescript-b183a3730185)
- [How to build webhooks using NestJS -- Engagespot](https://engagespot.co/blog/how-to-implementing-webhooks-with-nestjs)
- [Webhook Systems with NestJS: Retry, Security, DLQ, Rate Limiting -- DEV Community](https://dev.to/juan_castillo/building-a-webhook-systems-with-nestjs-handling-retry-security-dead-letter-queues-and-rate-4nm7)
- [@golevelup/nestjs-webhooks -- npm](https://www.npmjs.com/package/@golevelup/nestjs-webhooks)
- [Efficiently Handle Webhooks in NestJS -- Medium (Ankit)](https://medium.com/@mohantaankit2002/how-to-efficiently-handle-webhooks-in-a-nestjs-application-c1d7818612cc)
- [Configurable Webhook module for NestJS -- DEV Community](https://dev.to/endykaufman/creating-a-configurable-webhook-module-for-a-nestjs-application-49o9)
- [NestJS Events documentation](https://docs.nestjs.com/techniques/events)
- [Stripe Subscriptions in NestJS: Webhook Idempotency -- DEV Community](https://dev.to/aniefon_umanah_ac5f21311c/building-reliable-stripe-subscriptions-in-nestjs-webhook-idempotency-and-optimistic-locking-3o91)

---

## 6. Boutons physiques et IoT

### 6.1 APIs et protocoles disponibles

| Technologie | Protocole | Type | Cout |
|---|---|---|---|
| **Flic Smart Button** | MQTT (via Flic Hub SDK) | Publish/Subscribe | Flic 2 : ~30EUR/bouton, Hub LR : ~100EUR |
| **Flic Smart Button** | HTTP (webhooks via Flic Hub) | Request/Response | Inclus avec le Hub |
| **MQTT generique** | MQTT 3.1 / 3.1.1 / 5.0 | Publish/Subscribe | Gratuit (protocole ouvert), broker a heberger |
| **Bluetooth Low Energy (BLE)** | BLE GATT | Point-to-point | Gratuit (protocole ouvert) |
| **Zigbee / Z-Wave** | Zigbee, Z-Wave | Mesh radio | Necessite un coordinateur (~30-50EUR) |

### 6.2 Flic Smart Button -- Integration detaillee

Les boutons Flic supportent nativement MQTT via le Flic Hub SDK, permettant une integration sans cloud (cloudless). Le Hub MQTT permet de connecter les boutons a un broker MQTT existant sans materiel ni logiciel supplementaire.

**Fonctionnalites** :
- Clic simple, double-clic, appui long -- chaque action publie un message MQTT sur un topic specifique
- Integration avec Home Assistant via MQTT Discovery
- SDK Hub pour creer des integrations personnalisees

**Integration avec l'ecosysteme family-hub** :
1. Le bouton Flic publie un evenement MQTT sur un topic (ex: `family-hub/buttons/flic-cuisine/click`)
2. Le backend NestJS, abonne a ce topic via MQTT, recoit l'evenement
3. NestJS declenche l'action associee (marquer une tache, demarrer un timer, etc.)

### 6.3 Patterns d'implementation NestJS (MQTT)

**Support natif NestJS Microservices** :

NestJS offre un support MQTT integre via son framework de microservices. La configuration se fait dans `main.ts` avec les options du broker (URL, username, password, clientId, port). Le decorateur `@MessagePattern` permet de consommer les messages MQTT.

```typescript
// main.ts -- Configuration du transport MQTT
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    transport: Transport.MQTT,
    options: {
      url: 'mqtt://broker.family-home.local:1883',
      username: 'family-hub',
      password: process.env.MQTT_PASSWORD,
    },
  },
);

// Ou en mode hybride (HTTP + MQTT)
const app = await NestFactory.create(AppModule);
app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.MQTT,
  options: { url: 'mqtt://broker.family-home.local:1883' },
});
await app.startAllMicroservices();
await app.listen(3000);
```

```typescript
// iot.controller.ts
@Controller()
export class IoTController {

  @MessagePattern('family-hub/buttons/+/click')
  handleButtonClick(@Payload() data: ButtonEvent, @Ctx() context: MqttContext) {
    const topic = context.getTopic(); // ex: family-hub/buttons/flic-cuisine/click
    // Dispatcher l'action associee au bouton
  }

  @MessagePattern('family-hub/sensors/+/status')
  handleSensorUpdate(@Payload() data: SensorData) {
    // Traiter la mise a jour du capteur
  }
}
```

**Architecture** :

```
src/
  iot/
    iot.module.ts
    controllers/
      button.controller.ts        // @MessagePattern pour les boutons
      sensor.controller.ts         // @MessagePattern pour les capteurs
    services/
      device-registry.service.ts   // Registre des appareils IoT
      action-mapper.service.ts     // Mapping bouton -> action
      mqtt-publisher.service.ts    // Publication de commandes vers les appareils
    entities/
      iot-device.entity.ts
      button-action-mapping.entity.ts
```

**Bibliotheques tierces** :
- `pigeon-mqtt-nest` -- Broker MQTT leger integre a NestJS, supporte MQTT 3.1, 3.1.1 et 5.0
- `nestjs-mqtt-broker` -- Module NestJS integrant le broker Aedes
- `mqtt` (npm) -- Client MQTT pour Node.js (utilise en interne par NestJS)

### 6.4 React Native et IoT

React Native supporte les protocoles IoT essentiels :
- **MQTT** : via des bibliotheques comme `react-native-mqtt` ou `mqtt.js`
- **WebSockets** : natif dans React Native, utile pour le temps reel
- **BLE** : via `react-native-ble-plx` pour la communication directe avec les appareils Bluetooth

**Cas d'usage mobile** :
- Configuration et appairage des boutons Flic depuis l'app mobile
- Dashboard temps reel des capteurs IoT
- Controle direct des appareils via BLE quand le reseau est indisponible

### 6.5 Securite

- **MQTT TLS** : toujours utiliser MQTTS (MQTT over TLS) pour chiffrer les communications.
- **Authentification broker** : username/password ou certificats client pour chaque appareil.
- **ACL (Access Control Lists)** : restreindre les topics par appareil/utilisateur.
- **Reseau isole** : broker MQTT sur un VLAN dedie ou un reseau IoT separe.
- **Firmware** : maintenir a jour le firmware des appareils (Flic Hub, capteurs).

### 6.6 Complexite et effort

| Composant | Effort estime |
|---|---|
| Configuration broker MQTT (Mosquitto) | 1-2 jours |
| Integration NestJS MQTT (microservices) | 1 semaine |
| Integration Flic Hub + mappings | 1-2 semaines |
| Dashboard IoT React Native | 2-3 semaines |
| **Total IoT basique** | **4-6 semaines** |

### 6.7 Maturite et fiabilite

| Technologie | Maturite | Fiabilite | Notes |
|---|---|---|---|
| MQTT | Tres haute | Excellente | Standard industriel IoT, utilise massivement |
| Flic Buttons | Haute | Bonne | Produit commercial mature, communaute active |
| NestJS MQTT | Haute | Bonne | Support officiel dans le framework microservices |
| Pigeon MQTT Nest | Moyenne | Correcte | Bibliotheque communautaire, moins testee en production |

### 6.8 Sources

- [NestJS MQTT Microservices Documentation](https://docs.nestjs.com/microservices/mqtt)
- [Flic MQTT Integration](https://flic.io/business/flic-mqtt)
- [Flic Smart Button Applications](https://flic.io/applications/)
- [Flic MQTT Home Assistant Integration -- Community](https://community.home-assistant.io/t/direct-flic-button-via-flic-hub-mqtt-integration-cloudless/553108)
- [flic-mqtt-homeassistant -- GitHub](https://github.com/alexander-cato/flic-mqtt-homeassistant)
- [Pigeon MQTT Nest -- GitHub](https://github.com/binaryb3ast/pigeon-mqtt-nest)
- [nestjs-mqtt-broker -- GitHub](https://github.com/alphaport-multimedia/nestjs-mqtt-broker)
- [Simplest way to implement MQTT in NestJS -- DEV Community](https://dev.to/imshivanshpatel/simplest-way-to-implement-mqtt-in-nest-js-36l9)
- [MQTT Integration with NestJS -- Medium](https://medium.com/@manav23soni/mqtt-integration-with-nestjs-application-with-simple-example-1a6609e88f47)
- [React Native for IoT App Development 2025 -- RipeApps](https://ripenapps.com/blog/react-native-for-iot-app-development/)
- [React Native IoT Smart Home Tutorial -- Medium](https://medium.com/@fa21-bse-013/using-react-native-for-iot-a-smart-home-application-tutorial-4639fbc8e22f)
- [Flic Home Assistant Integration](https://www.home-assistant.io/integrations/flic/)

---

## 7. Protocole Matter

### 7.1 Vue d'ensemble

Matter est le standard ouvert pour la domotique, developpe par la Connectivity Standards Alliance (CSA) et soutenu par Amazon, Apple, Google et Samsung. Il permet a un appareil de fonctionner avec n'importe quel ecosysteme certifie Matter via un protocole unique.

**Version actuelle** : Matter 1.5 (publiee le 20 novembre 2025), ajoutant le support des cameras, capteurs d'humidite du sol et fonctionnalites de gestion energetique.

### 7.2 Pertinence pour family-hub

Le protocole Matter est pertinent pour family-hub comme **couche d'interoperabilite** entre l'application et les ecosystemes domotiques existants (Google Home, Alexa, HomeKit). Plutot que d'integrer chaque ecosysteme individuellement, exposer des "appareils virtuels" via Matter permettrait une compatibilite universelle.

**Cependant** : Matter est concu principalement pour les appareils physiques. L'integration d'une application logicielle comme family-hub via Matter est un cas d'usage non standard qui necessiterait de simuler un appareil Matter (bridge/controller). C'est un investissement significatif pour un benefice incertain a ce stade.

### 7.3 SDK et outils

- **SDK Matter open-source** : sous licence Apache, royalty-free
- **Google Home Matter SDK** : pour les developpeurs d'appareils et d'applications mobiles
- **Apple Matter SDK** : inclus dans Xcode, pour les applications iOS
- **Certification** : obligatoire pour les produits commerciaux, implique des frais d'adhesion a la CSA

### 7.4 Recommandation

**Pour les versions v1.x-v2.x** : ne pas investir dans Matter directement. Privilegier les integrations directes (Alexa Skill, Google Home C2C).
**Pour la v3.0+** : reevaluer l'interet d'un bridge Matter pour une interoperabilite universelle, en fonction de la maturite du standard et de l'evolution de l'ecosysteme.

### 7.5 Sources

- [Matter -- Google Home Developers](https://developers.home.google.com/matter)
- [What is Matter? -- Google Home Developers](https://developers.home.google.com/matter/overview)
- [Matter Protocol Developer Guide -- MobisoftInfotech](https://mobisoftinfotech.com/resources/blog/matter-protocol-smart-home-developers-guide)
- [Matter support in iOS 16 -- Apple](https://developer.apple.com/apple-home/matter/)
- [Matter (standard) -- Wikipedia](https://en.wikipedia.org/wiki/Matter_(standard))
- [Matter Protocol Explained 2025 -- ThinkRobotics](https://thinkrobotics.com/blogs/learn/matter-protocol-explained-for-smart-homes-complete-guide-2025)
- [A Developer's Guide to Matter Protocol -- DEV Community](https://dev.to/mobisoftinfotech/a-developers-guide-to-matter-protocol-building-smart-home-applications-with-matter-sdk-3g08)

---

## 8. Synthese et recommandations par version

### 8.1 Matrice de priorite

| Integration | Version cible | Priorite | Effort total | Prerequis |
|---|---|---|---|---|
| OAuth 2.0 multi-provider | v1.2 | Critique | 3-5 sem. | Infrastructure auth en place |
| Systeme de webhooks | v1.2 | Haute | 4-6 sem. | BullMQ/Redis deploye |
| Google Calendar sync | v1.5 | Haute | 3-4 sem. | OAuth 2.0 Google |
| n8n (automatisation) | v2.0 | Moyenne | 2-3 sem. | Webhooks + Docker |
| Apple iCloud CalDAV | v2.0 | Moyenne | 3-4 sem. | Infrastructure CalDAV |
| Outlook Calendar | v2.0 | Moyenne | 2-3 sem. | OAuth 2.0 Microsoft |
| Boutons Flic / MQTT | v2.5 | Moyenne | 4-6 sem. | Broker MQTT |
| Alexa Smart Home Skill | v3.0 | Basse | 4-6 sem. | OAuth account linking |
| Google Home C2C | v3.0 | Basse | 4-6 sem. | OAuth account linking |
| Siri Shortcuts | v3.0 | Basse | 2-3 sem. | App iOS native/Expo |
| Matter bridge | v3.0+ | Exploratoire | 8-12 sem. | Evaluation prealable |

### 8.2 Dependances techniques transversales

```
                    +-----------------+
                    |   OAuth 2.0     |  <-- Fondation pour toutes les APIs tierces
                    |  (v1.2 - crit.) |
                    +--------+--------+
                             |
              +--------------+--------------+
              |              |              |
     +--------v-----+ +-----v------+ +-----v--------+
     | Google Cal.  | | Outlook    | | Alexa/Google |
     | (v1.5)       | | (v2.0)     | | Home (v3.0)  |
     +--------------+ +------------+ +--------------+

                    +-----------------+
                    | Webhooks System |  <-- Fondation pour les events externes
                    |  (v1.2 - haute) |
                    +--------+--------+
                             |
              +--------------+--------------+
              |              |              |
     +--------v-----+ +-----v------+ +-----v--------+
     | n8n Auto.    | | Calendar   | | IoT/MQTT     |
     | (v2.0)       | | Push notif.| | Events       |
     +--------------+ +------------+ +--------------+

                    +-----------------+
                    |  MQTT Broker    |  <-- Fondation pour l'IoT
                    |  (v2.5)        |
                    +--------+--------+
                             |
              +--------------+--------------+
              |              |              |
     +--------v-----+ +-----v------+ +-----v--------+
     | Flic Buttons | | Capteurs   | | Matter ?     |
     | (v2.5)       | | (v2.5+)    | | (v3.0+)      |
     +--------------+ +------------+ +--------------+
```

### 8.3 Estimation budgetaire

| Poste | Cout | Type |
|---|---|---|
| APIs Google (Calendar, Home) | Gratuit | Quotas genereux |
| Azure AD / Microsoft Graph | Gratuit | Tier gratuit suffisant |
| Apple Developer Program | 99$/an | Obligatoire pour Sign in with Apple |
| n8n self-hosted | Gratuit | Open-source |
| Broker MQTT (Mosquitto) | Gratuit | Open-source, self-hosted |
| AWS Lambda (Alexa Skill) | ~0-5$/mois | Free tier puis pay-as-you-go |
| Flic hardware | ~200-400EUR | Boutons + Hub (one-time) |
| **Total annuel recurrent** | **~100-200$/an** | Hors hardware et hebergement |

### 8.4 Risques identifies

| Risque | Probabilite | Impact | Mitigation |
|---|---|---|---|
| Changement d'API Google/Microsoft | Faible | Eleve | Architecture a couche d'abstraction, tests d'integration |
| Deprecation d'Actions on Google / migration C2C | Moyenne | Moyen | Suivre les guides de migration Google, architecture flexible |
| Complexite CalDAV iCloud | Elevee | Moyen | Utiliser tsdav (battle-tested par Cal.com), prevoir du temps de debug |
| Latence MQTT sur reseau domestique | Faible | Faible | Broker local, QoS MQTT configurable |
| Certification Alexa/Google rejetee | Moyenne | Moyen | Suivre scrupuleusement les guidelines, prevoir 2-4 semaines de certification |
| Evolution du protocole Matter | Elevee | Faible | Ne pas investir trop tot, surveiller la v2.0+ |

---

*Document genere le 6 fevrier 2026 -- Recherche exhaustive sur les integrations externes pour l'ecosysteme family-hub.*
