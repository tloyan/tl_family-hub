# Rapport de Recherche : Technologies IA/Conversationnelles et Temps Reel

**Date** : 6 fevrier 2026
**Contexte** : Application de gestion familiale avec IA comme interface principale (UI conversationnelle, controle vocal, IA contextuelle, multimodale texte/voix/image), concierge familial proactif, synchronisation temps reel, WebSockets, notifications push, offline-first.
**Stack cible** : NestJS (backend) + Next.js (web) + Expo/React Native (mobile)

---

## Table des matieres

1. [IA Conversationnelle et Integration LLM](#1-ia-conversationnelle-et-integration-llm)
2. [Comparaison des Fournisseurs LLM](#2-comparaison-des-fournisseurs-llm)
3. [Controle Vocal et Speech-to-Text / Text-to-Speech](#3-controle-vocal-et-speech-to-text--text-to-speech)
4. [Communication Temps Reel (WebSockets)](#4-communication-temps-reel-websockets)
5. [Notifications Push Cross-Platform](#5-notifications-push-cross-platform)
6. [Strategie Offline-First](#6-strategie-offline-first)
7. [Geofencing et Localisation en Arriere-Plan](#7-geofencing-et-localisation-en-arriere-plan)
8. [Synthese et Recommandations Architecturales](#8-synthese-et-recommandations-architecturales)

---

## 1. IA Conversationnelle et Integration LLM

### 1.1 Etat de l'art (2025-2026)

L'interface conversationnelle alimentee par des LLM est devenue le paradigme dominant pour les applications grand public en 2025-2026. Les approches actuelles se divisent en trois categories :

**a) Chat UI avec LLM cloud :**
L'approche la plus repandue consiste a connecter une interface de chat (texte et/ou voix) a un LLM heberge via API (OpenAI, Anthropic, Google). Le SDK gere le streaming des reponses en temps reel pour une experience fluide. Les plateformes comme Botpress, ElevenLabs et Dialogflow offrent des solutions cles en main, mais les applications sur mesure privilegient l'integration directe des API LLM.

**b) Agents IA autonomes :**
L'emergence de frameworks d'agents (LangGraph, Vercel AI SDK 6 avec `ToolLoopAgent`) permet de creer des assistants capables d'executer des actions (tool calling) : ajouter un evenement au calendrier, modifier une liste de courses, envoyer un rappel. C'est l'approche ideale pour un "concierge familial" proactif.

**c) IA on-device :**
Depuis avril 2025, le package `react-native-ai` de Callstack permet d'executer des LLM directement sur les appareils mobiles via le Vercel AI SDK, avec des modeles HuggingFace au format GGUF ou le runtime MLC LLM. Cela offre une experience hors ligne, a faible latence, et respectueuse de la vie privee. Cependant, les capacites sont nettement inferieures aux modeles cloud.

### 1.2 Outils et bibliotheques disponibles

| Outil | Description | Maturite |
|---|---|---|
| **Vercel AI SDK 6** | Toolkit TypeScript pour interfaces IA avec streaming, support multi-provider (OpenAI, Anthropic, Google, xAI), agents, tool calling. Compatible Next.js et Expo. | Tres mature, production-ready |
| **LangChain.js / LangGraph** | Framework d'orchestration d'agents IA. Integration NestJS documentee et active. | Mature |
| **Botpress** | Plateforme conversationnelle low-code avec moteurs LLM integres | Mature mais moins flexible |
| **react-native-ai (Callstack)** | Execution de LLM on-device pour React Native avec compatibilite Vercel AI SDK | Beta/experimental |

### 1.3 Integration avec la stack NestJS + Next.js + Expo

**Architecture recommandee :**

```
[Mobile Expo] <--streaming--> [Next.js API Routes / Vercel AI SDK]
                                          |
                                   [NestJS Backend]
                                   - LangGraph agents
                                   - Context management
                                   - Tool execution
                                   - History storage
```

- **Next.js** : Utiliser le Vercel AI SDK 6 cote serveur (API Routes ou Server Actions) pour le streaming des reponses LLM vers le client web.
- **Expo/React Native** : Le Vercel AI SDK 6 offre un guide officiel "Getting Started: Expo" pour l'integration mobile avec streaming.
- **NestJS** : Orchestrer les agents LangGraph, gerer le contexte conversationnel, stocker l'historique, et executer les outils (actions sur les taches, calendrier, etc.). Plusieurs modules NestJS-LangChain existent sur GitHub.

Le Vercel AI SDK 6 introduit la specification Language Model v3 qui standardise l'interface entre les providers, permettant de changer de fournisseur LLM sans modifier le code applicatif.

### 1.4 Evaluation de maturite

- **Vercel AI SDK 6** : Production-ready. Utilise par des milliers d'applications en production. Support officiel Expo.
- **LangGraph.js + NestJS** : Patterns etablis mais necessitent un effort d'architecture. Recommande pour les cas complexes (agents multi-etapes).
- **On-device LLM** : Experimental. Utile pour des fonctionnalites simples hors ligne, pas pour l'interface principale.

### 1.5 Risques et compromis

- **Dependance aux API cloud** : L'IA conversationnelle de qualite necessite des modeles cloud. Mode degrade necessaire en cas de panne ou hors ligne.
- **Latence** : Le streaming attenua la perception de latence, mais le premier token peut prendre 500ms-2s selon le modele.
- **Cout** : Chaque interaction genere des couts API (voir section 2). Pour une famille de 4 personnes avec ~50 interactions/jour, le cout peut etre significatif.
- **Hallucinations** : Les LLM peuvent generer des informations incorrectes. Necessaire de contraindre les reponses avec des outils structures (tool calling) et des guardrails.

### 1.6 Sources

- [Vercel AI SDK 6 - Blog officiel](https://vercel.com/blog/ai-sdk-6)
- [Getting Started: Expo - Vercel AI SDK](https://ai-sdk.dev/docs/getting-started/expo)
- [react-native-ai - Callstack](https://github.com/callstackincubator/ai)
- [On-device LLM in React Native](https://www.callstack.com/blog/meet-react-native-ai-llms-running-on-mobile-for-real)
- [LangGraphJS + NestJS - Agent Initializr](https://dev.to/ialijr/how-to-build-a-fullstack-ai-agent-with-langgraphjs-and-nestjs-using-agent-initializr-127j)
- [LangGraph modulaire dans NestJS](https://dev.to/d_akhil_kumar/how-to-build-a-modular-ai-agent-with-langgraph-in-nestjs-typescript-3m9f)
- [Top Conversational AI Platforms 2026 - ElevenLabs](https://elevenlabs.io/blog/top-conversational-ai-platforms-2025)
- [Conversational AI Platforms - Botpress](https://botpress.com/blog/conversational-ai-platforms)

---

## 2. Comparaison des Fournisseurs LLM

### 2.1 Tableau comparatif des prix (fevrier 2026)

| Fournisseur / Modele | Input ($/1M tokens) | Output ($/1M tokens) | Specialite | Latence |
|---|---|---|---|---|
| **OpenAI GPT-5** | $1.25 | $10.00 | General, multimodal | Moyenne |
| **OpenAI GPT-4o** | $2.50 | $10.00 | General, rapide | Faible |
| **OpenAI GPT-4o-mini** | $0.15 | $0.60 | Taches simples, cout faible | Tres faible |
| **Anthropic Claude Opus 4.5** | $5.00 | $25.00 | Raisonnement complexe | Elevee |
| **Anthropic Claude Sonnet 4.5** | $3.00 | $15.00 | Equilibre qualite/cout | Moyenne |
| **Anthropic Claude Haiku 4.5** | $1.00 | $5.00 | Rapide, cout faible | Faible |
| **Google Gemini 2.5 Pro** | $1.25 | $10.00 | Multimodal, contexte long | Moyenne |
| **Google Gemini 2.5 Flash** | $0.15 | $0.60 | Ultra-rapide, economique | Tres faible |
| **Google Gemini 3 Flash** | $0.50 | $3.00 | Derniere generation Flash | Faible |
| **DeepSeek V3** | ~$0.07 | ~$0.63 | Ultra-economique | Variable |

### 2.2 Analyse pour le cas d'usage "Family Home"

**Estimation de consommation :**
- Famille de 4 personnes, ~50 interactions/jour
- Moyenne de ~500 tokens input + ~300 tokens output par interaction
- Total mensuel : ~750K input tokens + ~450K output tokens

**Cout mensuel estime par modele :**

| Modele | Cout mensuel estime |
|---|---|
| GPT-4o-mini / Gemini 2.5 Flash | ~$0.38 |
| Claude Haiku 4.5 | ~$3.00 |
| GPT-5 / Gemini 2.5 Pro | ~$5.44 |
| Claude Sonnet 4.5 | ~$9.00 |
| Claude Opus 4.5 | ~$15.00 |

**Strategie recommandee : Routage intelligent multi-modele**

1. **Modele rapide/economique** (GPT-4o-mini, Gemini 2.5 Flash, ou Haiku) pour les interactions simples : rappels, questions rapides, confirmations.
2. **Modele intermediaire** (Sonnet 4.5, GPT-5, ou Gemini 2.5 Pro) pour les taches complexes : planification, resolution de conflits d'agenda, suggestions contextuelles.
3. **Cache de prompts** : Utiliser le prompt caching (90% de reduction chez Anthropic, 50-90% chez OpenAI, 75% chez Google) pour les prompts systeme repetes.
4. **Batch API** : Pour les taches non urgentes (resumees quotidiens, suggestions proactives), 50% de reduction.

Le Vercel AI SDK 6 facilite ce routage multi-provider grace a sa specification Language Model v3 qui abstrait les differences entre fournisseurs.

### 2.3 Comparaison qualitative

| Critere | OpenAI | Anthropic (Claude) | Google (Gemini) | Open Source |
|---|---|---|---|---|
| **Qualite generale** | Excellente | Excellente (meilleur en raisonnement) | Tres bonne | Bonne (ecart qui se reduit) |
| **Tool calling** | Excellent | Excellent | Bon | Variable |
| **Multimodal (image)** | Oui (GPT-4o/5) | Oui (Claude 3.5+) | Oui (natif) | Limite |
| **Streaming** | Oui | Oui | Oui | Oui |
| **Contexte long** | 128K (GPT-4o) | 200K (Sonnet) | 1M+ (Gemini Pro) | 32K-128K |
| **Confidentialite** | Enterprise tier | Enterprise tier | GCP compliance | Auto-heberge |
| **Ecosysteme SDK** | Tres large | Large | Large | Communautaire |
| **Fiabilite API** | Tres bonne | Bonne (rate limits plus bas) | Bonne | N/A |

### 2.4 Risques et compromis

- **Vendor lock-in** : Attenua par le Vercel AI SDK mais les prompts optimises pour un modele peuvent etre sous-optimaux pour un autre.
- **Disponibilite** : Toutes les API majeures ont connu des incidents en 2025. Prevoir un fallback multi-provider.
- **Politique de donnees** : Les tiers Enterprise des fournisseurs garantissent que les donnees ne sont pas utilisees pour l'entrainement. Essentiel pour les donnees familiales sensibles.
- **Couts evolutifs** : Tendance a la baisse des prix (~10x en 2 ans), mais une forte adoption peut generer des factures imprevues. Implementer des limites de consommation par famille.
- **Open source en alternative** : DeepSeek ou Llama auto-heberges offrent un controle total mais necessitent une infrastructure GPU (~$80K/an pour 8xA100). Non recommande au lancement, envisageable a l'echelle.

### 2.5 Sources

- [Choosing an LLM in 2026 - DEV Community](https://dev.to/superorange0707/choosing-an-llm-in-2026-the-practical-comparison-table-specs-cost-latency-compatibility-354g)
- [OpenAI API Pricing](https://platform.openai.com/docs/pricing)
- [Claude API Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [GPT-5 API Pricing](https://pricepertoken.com/pricing-page/model/openai-gpt-5)
- [Open Source vs Closed LLMs 2026](https://hakia.com/tech-insights/open-vs-closed-llms/)
- [Best Open Source LLMs 2026](https://www.bentoml.com/blog/navigating-the-world-of-open-source-large-language-models)
- [LLM API Pricing Comparison](https://www.cloudidr.com/llm-pricing)

---

## 3. Controle Vocal et Speech-to-Text / Text-to-Speech

### 3.1 Etat de l'art (2025-2026)

Le controle vocal dans les applications mobiles a considerablement progresse en 2025-2026, avec trois approches principales :

**a) Speech-to-Text (STT) natif on-device :**
iOS 26 (2025) a introduit les API `SpeechAnalyzer` et `SpeechTranscriber` qui fonctionnent entierement sur l'appareil. Android dispose de son propre moteur STT. L'avantage est la latence minimale, la gratuite et le fonctionnement hors ligne.

**b) STT via API cloud :**
Les services comme OpenAI Whisper, Deepgram, Google Cloud Speech-to-Text et AssemblyAI offrent une precision superieure, le support multilingue et des fonctionnalites avancees (diarisation, ponctuation).

**c) Text-to-Speech (TTS) :**
ElevenLabs domine le marche des voix synthetiques realistes. Apple propose la synthese on-device via `AVSpeechSynthesizer`, integrable dans React Native via le Vercel AI SDK.

### 3.2 Comparaison des services STT

| Service | Prix (1000 min) | WER moyen | Latence streaming | Langues | Streaming natif |
|---|---|---|---|---|---|
| **OpenAI Whisper** | $6.00 | ~10.6% | Non natif (batch) | 50+ | Non |
| **OpenAI GPT-4o Transcribe** | $6.00 | Meilleur | Oui (Realtime API) | 50+ | Oui |
| **GPT-4o-mini Transcribe** | $3.00 | Bon | Oui | 50+ | Oui |
| **Deepgram Nova-3** | $4.30 | 5.26-6.84% | <300ms | 30+ | Oui |
| **Google Chirp 3** | $16.00 | Bon | Oui | 100+ | Oui |
| **AssemblyAI** | $6.50 | Meilleur | Oui | 20+ | Oui |
| **On-device (iOS/Android)** | Gratuit | Variable | Instantanee | Limite | Oui |

### 3.3 Comparaison des services TTS

| Service | Description | Qualite | Prix |
|---|---|---|---|
| **ElevenLabs** | Voix synthetiques indiscernables du reel | Excellente | $0.18-$0.30/1K caracteres |
| **OpenAI TTS** | Bonne qualite, plusieurs voix | Tres bonne | $15/1M caracteres |
| **Google Cloud TTS** | Large selection de voix | Bonne | $4-$16/1M caracteres |
| **On-device (AVSpeechSynthesizer)** | Gratuit, hors ligne, via Vercel AI SDK | Correcte | Gratuit |

### 3.4 Bibliotheques React Native / Expo

| Bibliotheque | Plateforme | Expo compatible | Notes |
|---|---|---|---|
| **expo-speech-recognition** | iOS + Android | Oui (dev build) | STT. Support continu, enregistrement. Android 13+ pour mode continu. |
| **react-native-voice** | iOS + Android | Oui (config plugin) | STT mature. Online et offline. |
| **react-native-voicekit** | iOS + Android | Oui | STT avec transcription. |
| **expo-speech** | iOS + Android | Oui | TTS natif (API Expo officielle). |
| **ElevenLabs React Native SDK** | iOS + Android | Oui (dev build) | Agents vocaux IA interactifs. Requiert LiveKit/WebRTC. |

### 3.5 Architecture recommandee pour "Family Home"

```
[Utilisateur parle]
    |
    v
[expo-speech-recognition] -- STT on-device (gratuit, rapide)
    |
    v
[Texte transcrit] --> [API NestJS] --> [LLM (Vercel AI SDK)]
    |                                          |
    v                                          v
[Reponse texte] <---------------------------- |
    |
    v
[expo-speech / ElevenLabs] -- TTS
    |
    v
[Utilisateur ecoute]
```

**Strategie hybride recommandee :**
1. **STT primaire** : `expo-speech-recognition` (on-device, gratuit, rapide) pour la majorite des interactions.
2. **STT de secours/premium** : Deepgram Nova-3 ou GPT-4o-mini Transcribe pour les cas necessitant une meilleure precision (dictee longue, environnement bruyant).
3. **TTS primaire** : `expo-speech` (on-device, gratuit) pour les reponses courtes et le mode hors ligne.
4. **TTS premium** : ElevenLabs pour une experience premium avec voix naturelle (option configurable par l'utilisateur).

### 3.6 Couts estimes (controle vocal)

Pour une famille de 4 personnes, ~20 interactions vocales/jour, ~15 secondes par interaction :
- STT on-device : **Gratuit**
- STT Deepgram (si 100% cloud) : ~$1.30/mois
- TTS on-device : **Gratuit**
- TTS ElevenLabs (si 100% cloud) : ~$5-15/mois selon le plan

### 3.7 Risques et compromis

- **Precision STT on-device** : Variable selon l'appareil, la langue et l'accent. Peut frustrer les utilisateurs non anglophones.
- **Latence bout-a-bout** : STT (200ms) + API (300ms) + LLM (500ms-2s) + TTS (200ms) = 1.2s-2.7s minimum. Acceptable pour un assistant vocal mais pas pour du temps reel strict.
- **Confidentialite** : L'envoi de l'audio a des services cloud souleve des questions de confidentialite pour les donnees familiales. Privilegier le STT on-device quand possible.
- **ElevenLabs SDK** : Necessite un development build Expo (pas Expo Go) a cause de la dependance WebRTC/LiveKit.
- **Android fragmentation** : Le mode continu de `expo-speech-recognition` ne fonctionne que sur Android 13+.

### 3.8 Sources

- [expo-speech-recognition - GitHub](https://github.com/jamsch/expo-speech-recognition)
- [React Native Speech Recognition Guide - Picovoice](https://picovoice.ai/blog/react-native-speech-recognition/)
- [Making STT work with Expo - FosterMade](https://fostermade.co/about/journal/making-speech-to-text-work-with-react-native-and-expo)
- [On-Device TTS with AI SDK - Callstack](https://www.callstack.com/blog/on-device-text-to-speech-on-apple-devices-with-ai-sdk)
- [ElevenLabs React Native SDK](https://elevenlabs.io/docs/agents-platform/libraries/react-native)
- [Best STT APIs 2026 - Deepgram](https://deepgram.com/learn/best-speech-to-text-apis-2026)
- [Whisper vs Deepgram - Deepgram](https://deepgram.com/learn/whisper-vs-deepgram)
- [OpenAI Whisper Pricing](https://costgoat.com/pricing/openai-transcription)
- [ElevenLabs TTS dans React Native - Medium](https://medium.com/@pelumiogundipe905/implementing-text-to-speech-in-react-native-with-elevenlabs-7940cf8c02e3)
- [Expo Speech Documentation](https://docs.expo.dev/versions/latest/sdk/speech/)

---

## 4. Communication Temps Reel (WebSockets)

### 4.1 Etat de l'art (2025-2026)

Pour la synchronisation en temps reel des statuts de taches et rituels dans une application familiale, deux options dominent dans l'ecosysteme NestJS :

**a) Socket.IO (recommande pour NestJS) :**
Socket.IO est la solution par defaut de NestJS pour les WebSockets. Il encapsule le protocole WebSocket brut avec des fonctionnalites supplementaires essentielles :
- **Reconnexion automatique** : Critique pour les appareils mobiles qui changent de reseau frequemment.
- **Fallback transport** : Si WebSocket echoue, bascule automatiquement sur HTTP long-polling.
- **Rooms et namespaces** : Permet de creer des "salles" par famille, par tache ou par rituel.
- **Acknowledgements** : Confirmation de reception des messages.
- **Broadcasting** : Diffusion a tous les membres d'une famille sauf l'emetteur.

**b) WebSocket brut (ws) :**
Protocole natif avec overhead minimal. Plus performant en termes de latence pure et de taille de message, mais necessite d'implementer manuellement la reconnexion, le fallback et la gestion des rooms.

### 4.2 Comparaison technique

| Critere | Socket.IO | WebSocket brut (ws) |
|---|---|---|
| **Protocole** | Surcouche sur WebSocket | Protocole natif |
| **Taille du message** | Plus large (enveloppe JSON) | Minimal (binaire possible) |
| **Reconnexion auto** | Oui, integree | Non, a implementer |
| **Fallback HTTP** | Oui (long-polling) | Non |
| **Rooms/Namespaces** | Oui, natifs | Non, a implementer |
| **Support NestJS** | Natif (`@nestjs/platform-socket.io`) | Natif (`@nestjs/platform-ws`) |
| **Scalabilite** | Via Redis adapter (multi-instance) | Plus simple a scaler |
| **Performance** | Legere surcharge (~5-10%) | Maximale |
| **Popularite NestJS** | Plus populaire | Moins courant |
| **Ecosysteme client** | `socket.io-client` (React Native compatible) | API native ou `ws` |

### 4.3 Architecture recommandee pour "Family Home"

```
[Expo Client] <-- socket.io-client --> [NestJS Gateway]
                                            |
[Next.js Client] <-- socket.io-client -->   |
                                            |
                                     [Redis Adapter] (pour multi-instance)
                                            |
                                     [Rooms par famille]
                                       /family:{id}
                                       /tasks:{familyId}
                                       /rituals:{familyId}
```

**Pattern d'implementation NestJS :**

```typescript
@WebSocketGateway({ namespace: 'family' })
export class FamilyGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('task:update')
  handleTaskUpdate(client: Socket, payload: TaskUpdateDto) {
    // Broadcast a tous les membres de la famille sauf l'emetteur
    client.to(`family:${payload.familyId}`).emit('task:updated', payload);
  }
}
```

**Evenements temps reel pour l'app familiale :**
- `task:created`, `task:updated`, `task:completed` - Gestion des taches
- `ritual:started`, `ritual:completed`, `ritual:streak_updated` - Suivi des rituels
- `member:location_updated` - Geolocalisation familiale
- `ai:response_stream` - Streaming des reponses IA
- `notification:received` - Notifications en temps reel

### 4.4 Considerations de production

- **Redis Adapter** : Indispensable pour le deploiement multi-instance (Kubernetes, PM2 cluster). Le `@socket.io/redis-adapter` permet la communication entre instances NestJS.
- **Authentification** : Utiliser des middlewares Socket.IO pour valider le JWT a la connexion et associer le socket a une famille.
- **Rate limiting** : Prevenir les abus avec un rate limiter par socket.
- **Compression** : Activer la compression `perMessageDeflate` pour reduire la bande passante.
- **Heartbeat** : Socket.IO gere automatiquement le ping/pong pour detecter les deconnexions.

### 4.5 Maturite et production-readiness

- **Socket.IO** : Tres mature (v4.x). Utilise en production par des millions d'applications. Integration NestJS de premiere classe. **Production-ready.**
- **Redis Adapter** : Stable et bien documente. **Production-ready.**
- **Client React Native** : `socket.io-client` fonctionne nativement dans React Native. **Production-ready.**

### 4.6 Cout

- **Socket.IO** : Open source, gratuit.
- **Redis** : $0 (auto-heberge) a $5-50/mois (Redis Cloud, Upstash).
- **Bande passante** : Negligeable pour les cas d'usage familiaux (~centaines de messages/jour par famille).

### 4.7 Risques et compromis

- **Batterie mobile** : Les connexions WebSocket persistantes consomment de la batterie. Implementer une strategie de deconnexion/reconnexion intelligente (deconnecter en arriere-plan apres X minutes, utiliser les push notifications pour reveiller).
- **Scalabilite** : Socket.IO avec Redis gere facilement des milliers de connexions simultanees. Suffisant pour une app familiale.
- **Firewalls/proxies** : Certains reseaux d'entreprise bloquent les WebSockets. Le fallback HTTP de Socket.IO est un atout majeur.

### 4.8 Sources

- [WebSocket vs Socket.IO Guide - jsdev.space](https://jsdev.space/websocket-socketio/)
- [WebSockets in NestJS - OneUptime](https://oneuptime.com/blog/post/2026-02-02-nestjs-websockets/view)
- [Real-time chat NestJS + Socket.io - Medium](https://medium.com/nestjs-ninja/real-time-chat-with-nestjs-and-socket-io-642d10044201)
- [Socket.IO vs WebSocket Guide 2025 - Velt](https://velt.dev/blog/socketio-vs-websocket-guide-developers)
- [NestJS WebSocket 2025 - VideoSDK](https://www.videosdk.live/developer-hub/websocket/nest-js-websocket)
- [Load-Balanced WebSockets NestJS - Medium](https://medium.com/@connect.hashblock/load-balanced-websockets-with-socket-io-and-nestjs-clusters-b7960be69c89)
- [NestJS WebSockets Real-Time - Loren Stewart](https://www.lorenstew.art/blog/nestjs-websockets-real-time)

---

## 5. Notifications Push Cross-Platform

### 5.1 Etat de l'art (2025-2026)

Les notifications push restent essentielles pour une application familiale (rappels, alertes de rituels, geofencing). L'ecosysteme Expo offre une solution integree et simplifiee.

### 5.2 Options disponibles

| Solution | Description | Cout | Complexite |
|---|---|---|---|
| **Expo Push Service** | Service gratuit d'Expo qui gere l'envoi via APNs (iOS) et FCM (Android) | Gratuit | Faible |
| **Firebase Cloud Messaging (FCM)** | Service Google, gere Android nativement et iOS via APNs | Gratuit | Moyenne |
| **OneSignal** | Service tiers avec segmentation avancee | Gratuit jusqu'a 10K devices | Moyenne |
| **Native Notify** | Service simplifie pour Expo | A partir de $5/mois | Tres faible |

### 5.3 Architecture recommandee

**Expo Push Service comme solution principale :**

```
[NestJS Backend]
    |
    | expo-server-sdk-node
    |
    v
[Expo Push Service] --> [APNs] --> [iPhone]
                    --> [FCM]  --> [Android]
```

**Cote serveur (NestJS) :**
- Le package `expo-server-sdk-node` (officiel Expo) permet d'envoyer des notifications push depuis NestJS.
- Le module `@twirelab/nestjs-expo-notifications` fournit un client injectable pour NestJS avec support du token d'acces.
- Le module `nestjs-expo-sdk` simplifie l'integration avec `expo-server-sdk`.

**Cote client (Expo) :**
- Installation : `npx expo install expo-notifications expo-device`
- L'API `expo-notifications` gere les permissions, l'obtention du token push, et l'ecoute des notifications (foreground et background).

### 5.4 Notifications web (Next.js)

Pour la partie web, les Web Push Notifications via l'API Push standard et un Service Worker sont necessaires. Firebase Cloud Messaging offre une solution unifiee pour web et mobile.

**Architecture unifiee :**
```
[NestJS Notification Service]
    |
    |--> Expo Push Service (mobile)
    |--> FCM / Web Push API (web)
    |--> Socket.IO (in-app real-time)
```

### 5.5 Types de notifications pour "Family Home"

| Type | Canal | Priorite | Exemples |
|---|---|---|---|
| **Rappel de rituel** | Push + in-app | Haute | "C'est l'heure du brossage de dents !" |
| **Tache assignee** | Push + in-app | Moyenne | "Papa t'a assigne : ranger ta chambre" |
| **Geofencing** | Push | Haute | "Maman est arrivee a la maison" |
| **Suggestion IA** | In-app | Basse | "Voulez-vous planifier le diner de ce soir ?" |
| **Alerte urgente** | Push (critical) | Critique | "Le bus scolaire arrive dans 5 min" |

### 5.6 Considerations de production

- **Regroupement (batching)** : L'Expo Push Service accepte jusqu'a 100 notifications par requete. Implementer un systeme de queue (BullMQ avec Redis) dans NestJS.
- **Gestion des erreurs** : L'SDK expose les "receipts" pour verifier le statut de livraison et invalider les tokens expiries.
- **Permissions** : Sur iOS, le taux d'opt-in est ~60%. Concevoir l'UX pour maximiser l'acceptation (demander au bon moment, expliquer la valeur).
- **Mode silencieux** : Utiliser les notifications silencieuses pour la synchronisation en arriere-plan (actualisation des donnees).
- **Notification channels (Android)** : Creer des canaux distincts par type (rituels, taches, alertes) pour que l'utilisateur puisse controler les preferences.

### 5.7 Maturite et cout

- **Expo Push Service** : Gratuit, production-ready, utilise par des milliers d'apps Expo.
- **FCM** : Gratuit, extremement mature (des milliards de notifications/jour).
- **Infrastructure** : Seul cout = Redis/BullMQ pour la queue ($5-15/mois).

### 5.8 Risques et compromis

- **Dependance a Expo Push Service** : L'API est push-service agnostic, on peut basculer vers FCM direct si necessaire.
- **Delai de livraison** : Les push notifications ne sont pas garanties en temps reel (~95% delivrees en <5 secondes, mais des delais possibles).
- **Limitations iOS** : Le nombre de notifications silencieuses est limite par iOS (~6/heure). Ne pas en abuser pour la synchronisation.
- **Fragmentation Android** : Certains fabricants (Xiaomi, Huawei) tuent agressivement les processus en arriere-plan. Recommander aux utilisateurs de desactiver l'optimisation de batterie pour l'app.

### 5.9 Sources

- [Expo Push Notifications Overview](https://docs.expo.dev/push-notifications/overview/)
- [Expo Push Notifications Setup](https://docs.expo.dev/push-notifications/push-notifications-setup/)
- [expo-server-sdk-node - GitHub](https://github.com/expo/expo-server-sdk-node)
- [nestjs-expo-notifications - Twirelab](https://github.com/Twirelab/nestjs-expo-notifications)
- [nestjs-expo-sdk - GitHub](https://github.com/fsjorgeluis/nestjs-expo-sdk)
- [Expo Notifications API](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [NestJS + Firebase Push Notifications](https://www.amarjanica.com/server-side-push-notifications-with-nestjs-and-firebase/)
- [Push Notifications in Expo - Medium](https://medium.com/@rohandhalpe05/wake-up-your-app-everything-about-mobile-push-notifications-in-expo-react-native-100144faf7b6)

---

## 6. Strategie Offline-First

### 6.1 Etat de l'art (2025-2026)

L'approche offline-first est en plein essor dans l'ecosysteme React Native, portee par le mouvement "local-first" qui privilegie les donnees stockees localement avec synchronisation opportuniste. Pour une application familiale, c'est essentiel : les enfants utilisent l'app a l'ecole (souvent sans connexion), les parents dans le metro, etc.

### 6.2 Comparaison des solutions

| Solution | Type | Sync bidirectionnelle | Backend requis | Expo compatible | Maturite | Cout |
|---|---|---|---|---|---|---|
| **PowerSync** | Sync engine (Postgres <-> SQLite) | Oui | PostgreSQL | Oui | Production-ready (v1.0+) | Freemium ($0 dev, plans payants prod) |
| **WatermelonDB** | Base locale + sync primitives | Oui (a implementer) | Tout backend | Oui | Mature | Gratuit (open source) |
| **ElectricSQL** | Sync engine (Postgres <-> SQLite) | Oui | PostgreSQL | Oui | En reecriture (Electric-Next) | Open source |
| **RxDB** | Base reactive + sync | Oui | Flexible | Oui | Mature | Open source + Premium |
| **MMKV + custom sync** | Key-value store | Non natif | Tout | Oui | Stable | Gratuit |

### 6.3 Analyse detaillee

#### PowerSync (recommande)

**Points forts :**
- Synchronisation transparente PostgreSQL <-> SQLite sur le client.
- Les ecritures sont appliquees localement et mises en file d'attente pour l'upload vers le backend.
- Le streaming des changements se fait via des "Sync Rules" configurables.
- SDK officiel pour React Native et Expo (`@powersync/react-native`, version 1.25.1).
- Support PostgreSQL, MongoDB, MySQL (beta), SQL Server (alpha).
- Schemaless cote client : pas de migrations a gerer.
- Compatible avec Supabase.

**Points faibles :**
- Pas entierement open source (modele open-core prevu).
- Dependance a un service tiers (PowerSync Cloud ou auto-heberge).
- Cout en production (plans payants).

#### WatermelonDB

**Points forts :**
- Haute performance, optimise pour les grandes quantites de donnees avec lazy loading.
- Base reactive : les composants React se mettent a jour automatiquement.
- Synchronisation via un mecanisme pull-push avec deux endpoints API.
- Entierement open source et gratuit.
- Bien documente avec des tutoriels Supabase + Expo.

**Points faibles :**
- La logique de sync est a implementer soi-meme (endpoints pull/push cote backend NestJS).
- La resolution de conflits est basique (last-write-wins par defaut).
- Necessites de gerer les migrations de schema manuellement.

#### ElectricSQL

**Points forts :**
- Open source.
- Sync automatique PostgreSQL <-> SQLite.

**Points faibles :**
- En cours de reecriture majeure (Electric-Next). Pas recommande pour un nouveau projet en 2026.
- Maturite insuffisante.

### 6.4 Architecture recommandee pour "Family Home"

**Option A : PowerSync (recommandee pour la rapidite de developpement)**

```
[Expo App]
    |
    [PowerSync SDK] <--> [SQLite local]
    |
    | Sync Rules
    |
    v
[PowerSync Service] <--> [PostgreSQL (NestJS backend)]
```

**Option B : WatermelonDB (recommandee pour le controle total)**

```
[Expo App]
    |
    [WatermelonDB] <--> [SQLite local]
    |
    | Pull/Push API
    |
    v
[NestJS Backend]
    |
    [PostgreSQL]
```

### 6.5 Donnees a synchroniser pour "Family Home"

| Donnee | Criticite offline | Frequence de sync | Volume |
|---|---|---|---|
| Taches / to-do | Haute | Temps reel | Faible |
| Rituels et streaks | Haute | Temps reel | Faible |
| Calendrier familial | Haute | Quasi temps reel | Moyen |
| Messages / chat | Moyenne | Temps reel | Moyen |
| Photos / media | Basse | Batch | Eleve |
| Historique IA | Basse | Batch | Moyen |
| Parametres | Moyenne | Eventual | Faible |

### 6.6 Resolution de conflits

Pour une application familiale, les conflits de synchronisation sont rares mais possibles (deux parents modifient la meme tache en meme temps). Strategies :

1. **Last-Write-Wins (LWW)** : Simple, adapte pour la majorite des cas (taches, rituels).
2. **Merge intelligent** : Pour les listes (courses), fusionner les ajouts et marquer les modifications conflictuelles.
3. **Resolution cote serveur** : PowerSync centralise la resolution des conflits sur le serveur PostgreSQL, ce qui simplifie la logique.

### 6.7 Cout

- **PowerSync** : Gratuit pour le developpement. Plans production a definir (probablement $20-100/mois selon le nombre d'utilisateurs).
- **WatermelonDB** : Gratuit (open source). Cout = temps de developpement de la couche de sync.
- **Infrastructure** : PostgreSQL ($0-20/mois), stockage SQLite (inclus dans l'appareil).

### 6.8 Risques et compromis

- **PowerSync lock-in** : Si PowerSync cesse d'exister, la migration serait couteuse. Attenua par le fait que les donnees restent dans PostgreSQL.
- **Complexite de la sync** : La synchronisation bidirectionnelle est un probleme fondamentalement difficile. PowerSync l'abstrait, WatermelonDB l'expose.
- **Taille de la base locale** : Pour une famille, la base locale reste petite (<100 Mo). Pas de probleme de performance.
- **Conflit de schema** : Les mises a jour de schema necessitent une migration cote serveur ET cote client. PowerSync simplifie cela avec son approche schemaless.

### 6.9 Sources

- [PowerSync - Site officiel](https://www.powersync.com)
- [PowerSync React Native SDK](https://docs.powersync.com/client-sdks/reference/react-native-and-expo)
- [React Native Local Database Options - PowerSync Blog](https://www.powersync.com/blog/react-native-local-database-options)
- [Offline-first Expo + WatermelonDB + Supabase](https://supabase.com/blog/react-native-offline-first-watermelon-db)
- [WatermelonDB - GitHub](https://github.com/Nozbe/WatermelonDB)
- [WatermelonDB Offline Data Sync - LogRocket](https://blog.logrocket.com/watermelondb-offline-data-sync/)
- [Offline-first React Native - LogRocket](https://blog.logrocket.com/creating-offline-first-react-native-app/)
- [ElectricSQL Alternatives](https://electric-sql.com/docs/reference/alternatives)
- [RxDB Alternatives](https://rxdb.info/alternatives.html)

---

## 7. Geofencing et Localisation en Arriere-Plan

### 7.1 Etat de l'art (2025-2026)

Le geofencing est particulierement pertinent pour une application familiale : savoir quand un enfant arrive a l'ecole, quand un parent rentre a la maison, declencher des rituels lies a un lieu. Cependant, c'est l'un des domaines les plus contraints par les politiques de batterie des OS mobiles.

En 2026, iOS 18+ et Android 15 ont introduit des logiques d'optimisation de batterie encore plus agressives, rendant le tracking en arriere-plan plus difficile.

### 7.2 Solutions disponibles

| Solution | Fonctionnalites | Expo compatible | Cout | Fiabilite arriere-plan |
|---|---|---|---|---|
| **expo-location** | Geofencing basique (`startGeofencingAsync`), background location | Oui (dev build) | Gratuit | Moyenne |
| **react-native-background-geolocation (Transistor)** | Geofencing avance, motion detection, batterie optimisee | Oui (config plugin) | $0 (debug) / licence prod | Elevee |

### 7.3 expo-location (Expo natif)

**Fonctionnalites :**
- `startGeofencingAsync()` : Demarre le geofencing pour des regions definies et appelle une tache via TaskManager quand l'appareil entre ou sort d'une region.
- `startLocationUpdatesAsync()` : Mises a jour de localisation en arriere-plan.
- Integre avec `expo-task-manager` pour les taches en arriere-plan.

**Limitations connues :**
- **Android** : L'app terminee ne redemarrera PAS automatiquement lors d'un evenement de geofencing (limitation de la plateforme). Sur iOS, le systeme redemarrera l'app.
- **Expo Go** : TaskManager n'est pas disponible sur Android dans Expo Go, et ne supporte pas l'execution en arriere-plan sur iOS. Un development build est necessaire.
- **Precision** : Des problemes de precision des geofences ont ete reportes (evenements errones, precision ignoree).
- **Suppression des regions** : `stopGeofencingAsync` ne nettoie pas toujours correctement les regions sur Android.
- **Crash de l'app** : Les geofences creees avec `startGeofencingAsync` cessent de fonctionner si l'app crash ou est tuee.

### 7.4 react-native-background-geolocation (Transistor Software)

**Fonctionnalites avancees :**
- Detection de mouvement intelligente et consciente de la batterie.
- Geofencing robuste avec notification d'entree/sortie/dwell.
- Fonctionne meme apres redemarrage de l'appareil.
- Compatible Expo via un config plugin.
- Synchronisation automatique avec un backend.
- Mode economie de batterie avec algorithme adaptatif.

**Licence :**
- Gratuit pour le developpement et le debug.
- Licence commerciale requise pour la production (~$300-500 one-time ou abonnement).

### 7.5 Architecture recommandee pour "Family Home"

```
[Expo App]
    |
    [react-native-background-geolocation]
    |
    |--> Geofence: "Maison" (rayon 100m)
    |--> Geofence: "Ecole" (rayon 200m)
    |--> Geofence: "Bureau" (rayon 150m)
    |
    | Evenement entre/sorti
    |
    v
[NestJS Backend via API]
    |
    |--> Mise a jour du statut de presence
    |--> Declenchement de notifications push
    |--> Activation de rituels contextuels
    |--> Socket.IO broadcast aux membres de la famille
```

**Cas d'usage geofencing pour "Family Home" :**
1. **Arrivee a la maison** : Declencher le rituel "devoirs" automatiquement.
2. **Depart de l'ecole** : Notifier les parents que l'enfant a quitte l'ecole.
3. **Arrivee au travail** : Mettre a jour le statut du parent.
4. **Zones personnalisees** : Les familles peuvent creer leurs propres geofences (salle de sport, parc, etc.).

### 7.6 Considerations iOS/Android specifiques

**iOS :**
- Necessite `UIBackgroundModes: ["location"]` dans Info.plist.
- iOS redemarrera l'app en arriere-plan pour les evenements de geofencing.
- Limite de ~20 geofences simultanees (limitation iOS).
- Necessite `NSLocationAlwaysAndWhenInUseUsageDescription`.

**Android :**
- Les permissions `ACCESS_BACKGROUND_LOCATION` requierent une justification lors de la revue Google Play.
- Les fabricants (Xiaomi, Samsung, Huawei) tuent agressivement les processus en arriere-plan. react-native-background-geolocation gere mieux cela qu'expo-location.
- Android 15 impose des contraintes supplementaires sur le tracking en arriere-plan.

### 7.7 Cout

- **expo-location** : Gratuit (inclus dans Expo SDK).
- **react-native-background-geolocation** : $0 (dev) / ~$300-500 (licence production).
- **Backend** : Negligeable (stockage de coordonnees et calculs de distance).

### 7.8 Risques et compromis

- **Confidentialite** : Le tracking de localisation des enfants est un sujet sensible. Necessaire d'etre transparent, de permettre la desactivation, et de minimiser les donnees collectees.
- **Revue App Store/Play Store** : Apple et Google scrutinent les apps utilisant le tracking en arriere-plan. Justification claire requise.
- **Consommation batterie** : Le geofencing est relativement econome (utilise le coprocesseur de localisation), mais le tracking continu est gourmand. Privilegier le geofencing sur le tracking GPS continu.
- **Fiabilite** : Le geofencing n'est pas garanti a 100% (delais de detection, imprecision GPS en interieur). Concevoir l'UX pour tolerer les faux positifs/negatifs.
- **expo-location vs Transistor** : Pour une app en production, react-native-background-geolocation est nettement plus fiable malgre son cout de licence.

### 7.9 Sources

- [Expo Location Documentation](https://docs.expo.dev/versions/latest/sdk/location/)
- [react-native-background-geolocation - GitHub](https://github.com/transistorsoft/react-native-background-geolocation)
- [Transistor Software - Background Geolocation](https://www.transistorsoft.com/shop/products/react-native-background-geolocation)
- [Expo + Background Geolocation Install Guide](https://github.com/transistorsoft/react-native-background-geolocation/blob/master/help/INSTALL-EXPO.md)
- [Geofence API - Transistor](https://transistorsoft.github.io/react-native-background-geolocation/interfaces/geofence.html)
- [Background Tasks React Native 2026 - DEV](https://dev.to/eira-wexford/run-react-native-background-tasks-2026-for-optimal-performance-d26)
- [Location-Based Features Expo - Coffey.codes](https://coffey.codes/articles/building-location-based-features-using-expo-location)
- [Geofencing Issues expo-location](https://github.com/expo/expo/issues/33429)
- [Location + Geofencing React Native - SevenSquare](https://www.sevensquaretech.com/react-native-real-time-location-geofencing-github-code/)

---

## 8. Synthese et Recommandations Architecturales

### 8.1 Vue d'ensemble de l'architecture recommandee

```
                        [Utilisateur Mobile (Expo)]
                               |        |
                          [Voix]    [Texte/UI]
                               |        |
                    [expo-speech-recognition]
                               |
                               v
                    [Vercel AI SDK 6 (Expo)]
                         | streaming |
                         v          v
            [Next.js API/Web] <-> [NestJS Backend]
                |                    |        |        |
                |              [LangGraph]  [Socket.IO] [Notifications]
                |              [Agents IA]  [Redis]     [Expo Push]
                |                    |        |        |
                |              [PostgreSQL]  [Broadcast] [APNs/FCM]
                |                    |
                |              [PowerSync]
                |                    |
                |              [SQLite local (Expo)]
                |
            [react-native-background-geolocation]
                |
            [Geofencing + Location Events]
```

### 8.2 Tableau recapitulatif des technologies recommandees

| Domaine | Solution principale | Alternative | Maturite | Cout mensuel estime |
|---|---|---|---|---|
| **IA/LLM** | Vercel AI SDK 6 + routage multi-modele | LangChain.js direct | Production-ready | $5-15/famille |
| **LLM Provider** | Claude Haiku (rapide) + GPT-5 (complexe) | Gemini 2.5 Flash + Pro | Production-ready | Inclus ci-dessus |
| **STT** | expo-speech-recognition (on-device) | Deepgram Nova-3 (cloud) | Mature | $0-2/famille |
| **TTS** | expo-speech (on-device) | ElevenLabs (premium) | Mature | $0-15/famille |
| **Temps reel** | Socket.IO + NestJS + Redis | WebSocket brut | Production-ready | $5-15 (Redis) |
| **Push** | Expo Push Service + expo-server-sdk | FCM direct | Production-ready | $0-5 (queue) |
| **Offline-first** | PowerSync | WatermelonDB | Production-ready | $0-100 |
| **Geofencing** | react-native-background-geolocation | expo-location | Mature | $300-500 (licence) |

### 8.3 Estimation du cout total infrastructure IA/temps reel

**Pour 1000 familles actives (4 membres chacune) :**

| Poste | Cout mensuel estime |
|---|---|
| LLM API (routage intelligent) | $500-1500 |
| STT/TTS (hybride on-device + cloud) | $100-300 |
| Redis (Socket.IO + queues) | $20-50 |
| PowerSync | $50-200 |
| PostgreSQL | $20-100 |
| Push notifications | $0 (Expo Push gratuit) |
| Geofencing | $0 (licence one-time deja payee) |
| **Total** | **$690-2150/mois** |

**Cout par famille : $0.69-2.15/mois** (hors hebergement serveur)

### 8.4 Risques majeurs identifies

1. **Cout LLM a l'echelle** : Le routage multi-modele et le prompt caching sont essentiels pour controler les couts. Prevoir des limites d'utilisation par famille/plan.

2. **Complexite d'integration** : L'architecture combine 7+ technologies majeures. Privilegier une approche incrementale : commencer par le chat texte + taches, puis ajouter voix, geofencing, etc.

3. **Batterie mobile** : La combinaison WebSocket + geofencing + notifications peut drainer la batterie. Optimiser agressivement les connexions en arriere-plan.

4. **Confidentialite des donnees familiales** : Les donnees envoyees aux API LLM et de localisation sont sensibles. Privilegier le on-device quand possible, utiliser les tiers Enterprise des providers cloud.

5. **Fragmentation Android** : Les fabricants Android implementent des politiques de gestion de batterie variees qui impactent le geofencing et les notifications. Tester sur un large panel d'appareils.

6. **Offline-sync conflicts** : Bien que rares pour une app familiale, les conflits de synchronisation doivent etre geres gracieusement. PowerSync centralise la resolution cote serveur.

### 8.5 Feuille de route suggeree

| Phase | Fonctionnalites | Technologies |
|---|---|---|
| **MVP (Mois 1-3)** | Chat IA texte, taches, rituels, notifications push | Vercel AI SDK 6, Socket.IO, Expo Push, PostgreSQL |
| **V1.1 (Mois 4-5)** | Controle vocal, offline-first | expo-speech-recognition, expo-speech, PowerSync |
| **V1.2 (Mois 6-7)** | Geofencing, routage LLM intelligent, suggestions proactives | react-native-background-geolocation, multi-model routing |
| **V2.0 (Mois 8+)** | Voix premium (ElevenLabs), IA on-device, calendar intelligence | ElevenLabs SDK, react-native-ai, integrations calendrier |

---

*Rapport genere le 6 fevrier 2026 sur la base de recherches web actualisees. Les prix et disponibilites sont susceptibles d'evoluer. Toutes les sources sont citees dans chaque section.*
