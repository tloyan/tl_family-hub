---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
  - step-e-01-discovery
  - step-e-02-review
  - step-e-03-edit
lastEdited: '2026-02-09'
editHistory:
  - date: '2026-02-09'
    changes: 'Post-implementation-readiness edit: added vocal STT/TTS to MVP (FR24 updated), added FR55-FR58 systeme de demandes familiales, documented 5 roles (owner/admin/adulte/enfant/prestataire replacing 4-role model), added Home Hub contextuel and rituels imbriques to MVP scope, updated FR26 aide integree, updated traceability matrix, moved vocal from Won-t-Have to Must-Have, updated roadmap Phase 1'
  - date: '2026-02-06'
    changes: 'Post-validation edit: eliminated implementation leakage (18 technology references removed), improved information density, added measurability to FRs/NFRs, added persona Nadia (parcours + traceability), added domain compliance sections (obligations operationnelles, droit a oubli FR52-54), added SEO strategy, reformulated ~20 system-centric FRs to actor-capability pattern'
classification:
  projectType: 'multi-platform (mobile-first + web + kiosk)'
  domain: 'famtech / organisation familiale'
  complexity: 'high'
  projectContext: 'greenfield'
inputDocuments:
  - product-brief-family-hub-2026-02-06.md
  - market-apps-gestion-familiale-research-2026-02-06.md
  - domain-family-tech-famtech-research-2026-02-06.md
  - technical-outils-et-domaines-ecosysteme-family-home-research-2026-02-06.md
  - brainstorming-session-2026-02-05.md
documentCounts:
  briefs: 1
  research: 3
  brainstorming: 1
  projectDocs: 0
workflowType: 'prd'
date: '2026-02-06'
author: 'Thomas'
project_name: 'family-hub'
---

# Product Requirements Document - family-hub

**Author:** Thomas
**Date:** 2026-02-06

## Executive Summary

family-hub est une application multi-plateforme (mobile-first + web) d'organisation familiale centree sur trois innovations combinees :

1. **Rituels familiaux comme primitive** — structurer la vie quotidienne autour de routines collectives par membre et par moment (matin/midi/soir), pas autour de to-do froides
2. **Graphe familial a 5 cercles** — modeliser les relations familiales reelles (Personnel, Couple, Foyer, Famille elargie, Connaissances) pour gerer familles recomposees, garde partagee et prestataires
3. **IA conversationnelle comme interface principale** — le chat IA est LA facon d'interagir avec l'app, pas un module secondaire

**Utilisateurs cibles** : Familles avec enfants (2-12 ans) ou le partage de la charge mentale est un enjeu quotidien. Personas principaux : parent organisateur (Sophie), second parent (Marc), parent au foyer a temps plein (Nadia), enfant autonome (Lucas), prestataire (Marie).

**Marche** : FamTech, $5.5-7.5B, retention mediane catastrophique (J30 : 5.7%). Aucun acteur ne combine rituels + graphe familial + IA agentique. Fenetre d'opportunite : 2026-2027.

**Modele** : Freemium, pricing ethique (max 10 EUR/mois), zero monetisation des donnees. Privacy-first comme avantage concurrentiel.

**Contexte technique** : Projet greenfield, developpeur solo senior (Thomas). Application multi-plateforme (mobile iOS/Android + web + kiosk tablette). Hebergement EU, infrastructure low-cost (~4 EUR/mois au lancement).

## Success Criteria

### User Success

| Critere | Cible | Mesure |
|---|---|---|
| **Utilisation quotidienne** | ≥ 70% des membres actifs/jour | DAU/MAU par foyer |
| **Repartition equilibree** | Ecart de charge < 30% entre parents | Ratio de completion par membre/semaine |
| **Completion des rituels** | ≥ 3 rituels actifs/famille, > 60% completion | Rituels completes / rituels planifies |
| **Autonomie des enfants** | Progression mensuelle mesurable | % rituels enfant coches par l'enfant |
| **Adoption de l'IA** | > 30% des actions quotidiennes via le chat IA | Actions IA / actions totales |

**Signal de succes ultime** : Le parent "charge mentale" constate au recapitulatif hebdomadaire que l'ensemble du foyer contribue a l'organisation.

**Moment "aha!" du MVP** : Le premier matin ou chaque membre voit ses rituels en colonnes, les coche en temps reel, et un parent dit a l'IA "Ajoute sortie piscine samedi pour toute la famille" — ajout instantane.

### Business Success

**A 3 mois post-lancement :**

| Objectif | Cible | Priorite |
|---|---|---|
| Retention J1 | > 35% | P0 |
| Retention J7 | > 20% | P0 |
| Retention J30 | > 15% (vs 5,7% mediane) | P0 |
| Familles actives (beta) | 50-200 familles | P1 |
| Engagement quotidien | DAU/MAU > 50% | P0 |
| Family Activation Rate | > 40% (2+ membres actifs en 7 jours) | P0 — leading indicator |

**A 12 mois :**

| Objectif | Cible | Priorite |
|---|---|---|
| Familles actives | 1 000 - 5 000 | P0 |
| NPS | > 40 | P1 |
| Seed round | Boucle | P1 |
| Conversion freemium | > 3% | P2 |
| ARPU | 3-5 EUR/mois | P2 |

### Technical Success

| Critere | Description |
|---|---|
| **Architecture scalable** | Monolithe modulaire avec frontieres de domaine strictes, pret a evoluer vers microservices |
| **Graphe familial operationnel** | 5 cercles en base avec isolation des donnees par foyer, meme si l'UI n'expose qu'un cercle au MVP |
| **Code quality senior** | Typage strict end-to-end, tests, CI/CD, patterns solides — le projet reflete une expertise senior |
| **Evolutivite prouvee** | Chaque module futur (calendrier, communication, geolocalisation) peut s'ajouter sans migration |
| **Cout maitrise** | Infrastructure < 5 EUR/mois au lancement, cout IA < 2 EUR/famille/mois |

### Measurable Outcomes

- **Minimum deployable valide** : un foyer cree, membres invites, rituels configures et utilises quotidiennement, chat IA fonctionnel pour les operations de base
- **MVP itere valide** : retention J30 > 15%, Family Activation Rate > 40%, feedback qualitatif positif sur la reduction de charge mentale
- **Signal de passage au payant** : IA integree a 3+ briques, utilisateurs test confirment valeur percue suffisante pour 3-5 EUR/mois

## Product Scope

### MVP — Minimum Deployable (Socle 1)

**Fonctionnalites exposees :**
- Creation de foyer et ajout de membres (invitation lien/email/QR)
- Roles a 5 niveaux (owner, admin, adulte, enfant, prestataire) avec permissions par defaut
- Rituels/routines recurrentes par moment (matin/midi/soir)
- Vue colonnes par membre avec tranches horaires
- Validation de statut temps reel (a faire / en cours / termine)
- Pictogrammes pour jeunes enfants
- Onboarding ultra-court (2 questions)
- Export des donnees (anti-lock-in)
- **Chat IA textuel et vocal** : creation/modification de rituels et taches par langage naturel (texte ou voix via STT/TTS natif), requetes contextuelles, aide integree sur le fonctionnement de l'app
- **Home Hub contextuel** : point d'entree de l'app avec grille de FeatureBlocks contextualisee (heure, role, etat des modules)
- **Rituels imbriques** : un rituel parent peut contenir des micro-rituels (sous-etapes) avec progression incrementale et validation cascade

**Architecture anticipee (en DB, non exposee en UI) :**
- Multi-foyer (Member appartient a N Households)
- 5 cercles (Personnel, Couple, Foyer, Famille elargie, Connaissances)
- Graphe familial (LinkedHouseholds)
- Visibilite par cercle sur chaque ressource
- Role par foyer

### Growth Features (Post-MVP — Iterations rapides)

**v1.1 — Consolidation :**
- Taches ponctuelles (to-do one-shot)
- Rotation automatique des roles
- Templates de rituels predefinis
- Checklists detaillees (Definition of Done)
- Auto-detection tache vs rituel

**v1.2 — Calendrier & Cercle Couple :**
- Calendrier foyer et evenements
- Cercle Couple expose en UI
- Fiche Membre unifiee
- Interface adaptee par profil d'age

**v1.3 — IA avancee :**
- IA contextuelle (adapte selon qui/ou/quand)
- Navigation par moment ("Ce matin", "Cette semaine")
- Detection de conflits d'agenda
- IA comme module premium

### Vision (Future)

**v1.5** : Communication foyer, famille elargie exposee, calm technology
**v2.0** : Multi-foyer UI complet, geofencing, concierge familial IA proactif, boite noire familiale
**v3.0+** : Gamification, finances, suivi scolaire, hardware, plugins communautaires

*Pour l'analyse detaillee MoSCoW (Must-Have / Should-Have / Won't-Have) et la roadmap phasee avec dependances, voir la section [Project Scoping & Developpement Phase](#project-scoping--developpement-phase).*

## User Journeys

### Parcours 1 : Sophie — De la charge mentale au lacher-prise

**Persona** : Sophie, 36 ans, responsable marketing, mariee a Marc, 3 enfants (Lucas 11 ans, Emma 7 ans, Leo 3 ans). Zone urbaine.

**Scene d'ouverture — Le point de rupture**

Mercredi soir, 21h30. Sophie vient de coucher Leo apres 20 minutes de negociation. Elle s'assoit sur le canape, ouvre son telephone et realise qu'elle a oublie le rendez-vous pediatre de Leo — le deuxieme en trois mois. Son mari Marc, en face, regarde son ecran. Elle lui dit "Tu aurais pu me rappeler", il repond "Je ne savais meme pas qu'il y avait un rendez-vous." Conflit. Frustration. Sophie se sent seule a porter le foyer.

Ce soir-la, apres que tout le monde dort, elle tape "app organisation famille" sur l'App Store. Elle tombe sur family-hub — la video de presentation montre des colonnes par membre avec les routines du matin qui se cochent en temps reel. "C'est exactement ce qu'il me faut."

**Action montante — Les premiers pas**

Sophie telecharge l'app. L'onboarding pose 2 questions : "Combien de membres dans votre foyer ?" (5) et "Quel moment est le plus chaotique ?" (Matin). En 30 secondes, une premiere routine matinale est generee avec des creneaux pour chaque membre. Sophie ajoute les prenoms, ajuste quelques rituels.

Elle teste le chat IA : "Ajoute preparation cartable a 19h pour Lucas." L'IA repond "Rituel ajoute pour Lucas, tous les soirs de semaine a 19h." Sophie sourit — c'est une seconde, pas cinq ecrans de formulaire.

Le lendemain matin, elle ouvre l'app : ses 5 colonnes sont la. Lucas voit ses rituels sur son telephone. Emma a des pictogrammes colores. Sophie coche "Preparer petit-dejeuner" — Marc voit le statut passer en "termine" sur son ecran.

**Climax — Le moment de bascule**

Vendredi soir, fin de la premiere semaine. Sophie ouvre le recapitulatif hebdomadaire. Elle voit : Marc a complete 38% des rituels. Elle en a fait 42%. Lucas a coche 15% de ses routines seul. C'est la premiere fois en des annees que la repartition approche l'equilibre. Elle montre l'ecran a Marc : "Regarde, on est presque a 50/50." Marc est surpris — il n'avait pas realise qu'il contribuait autant juste en suivant sa colonne.

**Resolution — La nouvelle realite**

Un mois plus tard. Les routines du matin sont un reflexe. Sophie ne repete plus 3 fois a Lucas de preparer son cartable — il le voit dans sa colonne et le coche. Elle dit a l'IA "Ajoute cours de natation le mercredi a 16h pour Emma" et la routine du mercredi se met a jour pour toute la famille, avec une notification automatique a Marc. Sophie recommande l'app a deux amies.

Le rendez-vous pediatre ? Plus jamais oublie. L'IA le rappelle la veille.

**Capacites** : onboarding rapide, creation de foyer, gestion des rituels, vue colonnes, chat IA textuel, recapitulatif hebdomadaire, notifications, synchronisation temps reel.

---

### Parcours 2 : Marc — De l'impuissance a la visibilite

**Persona** : Marc, 39 ans, developpeur web, mari de Sophie, pere de 3 enfants.

**Scene d'ouverture — "Je veux bien aider, mais..."**

Marc sait que Sophie porte trop. Il le voit, il le sent dans les tensions du soir. Mais quand il demande "Qu'est-ce que je peux faire ?", Sophie soupire — elle n'a pas l'energie de lister, expliquer, deleguer. Et les post-its sur le frigo, ca ne lui parle pas.

**Action montante — L'invitation**

Sophie lui envoie un lien d'invitation family-hub. Marc l'ouvre, cree son profil en 30 secondes. Pas de configuration, pas de tutoriel — il arrive directement sur les colonnes du jour. Sa colonne est la, avec ses rituels du matin : "Preparer petit-dej enfants", "Verifier cartable Emma", "Depart ecole 8h15."

En tant que dev, il apprecie l'interface epuree. Il teste le chat IA : "Qu'est-ce qui est prevu ce week-end ?" L'IA lui repond avec la synthese des rituels et evenements du samedi et dimanche. Pas besoin d'appeler Sophie.

**Climax — Le week-end solo**

Sophie part pour un week-end entre amies. Marc ouvre l'app le samedi matin. Tout est la : les routines de chaque enfant, les horaires du cours de judo de Lucas, les allergies de Leo pour le dejeuner. Il gere le week-end sans un seul appel a Sophie. Le dimanche soir, Sophie rentre et demande "Ca s'est bien passe ?". Marc sourit : "Regarde" — il lui montre l'app, tout est coche.

**Resolution**

Marc ne demande plus "Qu'est-ce que je peux faire ?". Il ouvre l'app, il sait. La charge mentale n'est plus invisible — elle est partagee, en colonnes.

**Capacites** : invitation par lien, onboarding zero-config pour le second parent, vue colonnes instantanee, chat IA pour requetes contextuelles, gestion autonome du foyer.

---

### Parcours 3 : Lucas — De "Ma mere me repete tout" a "J'ai tout fait seul"

**Persona** : Lucas, 11 ans, eleve de 6eme, fils aine.

**Scene d'ouverture — La frustration de l'enfant**

Lucas en a marre. Chaque soir, sa mere lui dit 3 fois de preparer son cartable. Chaque mercredi, il oublie ses affaires de sport. Il aimerait qu'on lui fasse confiance, mais il n'a pas d'outil pour prouver qu'il peut gerer.

**Action montante — Son espace a lui**

Sa mere lui montre l'app sur son telephone. Lucas voit sa colonne avec des pictogrammes clairs : cartable, douche, devoirs, sport mercredi. C'est simple, c'est a lui. Il coche "Cartable" le soir — un feedback visuel confirme. Personne ne lui a dit de le faire.

Le mercredi, il voit "Affaires de sport" dans sa colonne du matin. Il les met dans son sac sans qu'on le lui rappelle.

**Climax — La fierte**

Un soir, Lucas a tout coche sans un seul rappel parental. Sophie recoit une notification discrete : "Lucas a complete 100% de ses routines aujourd'hui." Au diner, elle le felicite devant toute la famille. Lucas rayonne — il a prouve qu'il est grand.

**Resolution**

Avec le temps, ses parents debloquent progressivement de nouvelles permissions. Lucas peut maintenant proposer des modifications a ses rituels : "Je prefere faire mes devoirs avant la douche." L'app devient son outil d'autonomie, pas un outil de controle parental.

**Capacites** : profil enfant avec pictogrammes, permissions inversees (minimum par defaut), validation de statut par l'enfant, notifications aux parents, deblocage progressif des permissions.

---

### Parcours 4 : Marie la babysitter — Arriver et savoir quoi faire

**Persona** : Marie, 22 ans, etudiante, babysitter reguliere chez Sophie et Marc.

**Scene d'ouverture — L'angoisse du "Et si..."**

Marie garde les enfants un samedi soir. D'habitude, Sophie lui envoie un SMS de 15 lignes avec les horaires, les allergies de Leo, les consignes pour le coucher. Marie le relit 3 fois, stresse d'oublier quelque chose. Et si Leo a une reaction allergique et qu'elle ne retrouve pas le SMS ?

**Action montante — L'acces prestataire**

Sophie invite Marie dans l'app avec un role "Prestataire". Marie recoit un lien, se connecte sans creer de compte complet. Elle voit uniquement ce qui la concerne : les routines du soir des 3 enfants, les consignes specifiques (allergie noix de Leo, medicament de Leo a 19h), les numeros d'urgence.

**Climax — La confiance**

Marie arrive, ouvre l'app. Tout est la, a jour. Elle suit les routines du soir : bain d'Emma, medicament de Leo, lecture pour Lucas. Elle coche chaque etape. Sophie, au restaurant, voit les statuts passer en "termine" un par un. Aucun SMS echange, aucune inquietude.

**Resolution**

Marie devient la babysitter reguliere. A chaque garde, les routines sont a jour sans que Sophie ait besoin de reenvoyer des instructions. Les consignes d'urgence sont toujours accessibles en un tap. Marie se sent professionnelle, Sophie se sent sereine.

**Capacites** : role prestataire avec acces restreint, invitation par lien sans compte complet, vue filtree par cercle de visibilite, consignes et fiches membre, statuts en temps reel visibles par les parents.

---

### Parcours 5 : Nadia — Du foyer invisible au foyer reconnu

**Persona** : Nadia, 34 ans, mere au foyer a temps plein, 2 enfants (Lina 5 ans, Adam 8 ans). Nadia gere 100% de la logistique quotidienne. Son mari travaille en horaires decales.

**Scene d'ouverture — L'invisible**

Nadia ne travaille pas a l'exterieur, mais elle travaille sans arret. Repas, ecole, activites, rendez-vous medicaux, menage — tout repose sur elle. Son mari rentre le soir et demande "T'as fait quoi aujourd'hui ?" Elle ne sait meme pas par ou commencer. Sa charge mentale est totale mais invisible.

**Action montante — Rendre visible**

Nadia cree un foyer family-hub et configure les rituels de la journee pour chaque membre. Pour la premiere fois, tout ce qu'elle fait est visible en colonnes : preparation petit-dejeuner, depart ecole, courses, activite Lina, devoirs Adam, preparation diner. Elle invite son mari — il decouvre l'ampleur de la logistique quotidienne.

**Climax — La prise de conscience**

Le recapitulatif hebdomadaire montre : Nadia complete 85% des rituels, son mari 10%. Les chiffres sont la, objectifs. Son mari prend en charge les routines du soir. En 2 semaines, la repartition passe a 65/30 (5% enfants). Nadia dit a l'IA "Ajoute rendez-vous dentiste Adam mercredi 15h" — fini les post-its oublies.

**Resolution**

Nadia utilise l'app comme preuve tangible de sa contribution au foyer. Les pictogrammes aident Lina (5 ans) a suivre sa routine du matin en autonomie. L'export hebdomadaire sert de base de discussion pour equilibrer la charge.

**Capacites** : creation de foyer, rituels par moment, vue colonnes, recapitulatif hebdomadaire comme outil de visibilite, chat IA, pictogrammes enfants, permissions par role, export donnees.

---

### Parcours 6 : Thomas (Admin/Ops) — Le developpeur solo qui veille

**Persona** : Thomas, developpeur full-stack senior, createur et operateur solo de family-hub.

**Scene d'ouverture — Du code a la production**

Thomas vient de deployer la premiere version sur une infrastructure EU. 5 familles de son cercle proche testent l'app. Le matin, il verifie le monitoring : 0 erreurs critiques. Les temps de reponse API sont < 200ms. Les rituels se synchronisent en temps reel entre les appareils.

**Action montante — Le premier incident**

Un utilisateur signale que les statuts des rituels ne se mettent plus a jour en temps reel. Thomas identifie un probleme de connexion sur la couche pub/sub apres un redeploy. Il corrige le health check, pousse un fix via le CI/CD. Le correctif mobile est envoye en OTA — pas besoin d'attendre la validation des stores.

**Climax — La scalabilite**

Apres 3 mois, 50 familles utilisent l'app. Thomas migre la base de donnees vers une instance dediee. Le monolithe modulaire tient : chaque module a ses frontieres strictes, la migration ne casse rien. Il ajoute le module calendrier en v1.2 — l'architecture anticipee fait que le schema de donnees etait deja pret.

**Resolution**

Thomas monitore les metriques business (retention, DAU) et techniques (erreurs, performance) depuis un dashboard ops. Le cout infra est a 7 EUR/mois pour 50 familles. L'architecture qu'il a concue tient ses promesses de scalabilite. Il prepare le pitch pour le seed round avec des metriques solides.

**Capacites** : deploiement CI/CD, monitoring erreurs et performance, OTA updates, architecture modulaire evoluable, migration progressive sans casse, dashboard ops.

---

### Parcours 7 : Le co-parent (Vision v2.0) — Resume

**Contexte futur** : Apres une separation, deux foyers distincts sont connectes via le graphe familial. Le profil enfant multi-foyer permet a chaque parent de voir les routines dans son propre foyer et de coordonner les activites partagees dans une zone neutre. L'architecture multi-foyer, deja en base depuis le MVP, est alors exposee en UI. Ce parcours sera detaille lors du developpement de la v2.0.

---

### Journey Requirements Summary

| Parcours | Capacites cles revelees |
|---|---|
| **Sophie (parcours complet)** | Onboarding rapide, rituels, vue colonnes, chat IA, recapitulatif hebdo, notifications, sync temps reel |
| **Marc (adoption conjoint)** | Invitation par lien, zero-config second parent, visibilite immediate, chat IA contextuel |
| **Lucas (autonomie enfant)** | Profil enfant + pictogrammes, permissions inversees, validation par l'enfant, deblocage progressif |
| **Marie (babysitter)** | Role prestataire, acces restreint par cercle, consignes, fiche membre, statuts temps reel |
| **Nadia (parent au foyer)** | Visibilite de la charge mentale via recapitulatif, repartition equilibree, rituels par moment, chat IA |
| **Thomas (admin/ops)** | CI/CD, monitoring, OTA updates, architecture modulaire, migration progressive |
| **Co-parent (v2.0)** | Multi-foyer UI, profil enfant multi-foyer, zone neutre de coordination |

**Capacites transversales** identifiees dans tous les parcours :
- Synchronisation temps reel entre appareils
- Systeme de permissions par role et par cercle de visibilite
- Chat IA comme interface naturelle pour les operations courantes
- Notifications intelligentes et non-invasives
- Architecture anticipee permettant l'evolution sans migration

## Domain-Specific Requirements

### Compliance & Reglementaire

**Critique pour le MVP (avant beta publique) :**

| Reglementation | Echeance | Impact MVP |
|---|---|---|
| **RGPD Article 8** (mineurs < 15 ans en France) | En vigueur | Consentement parental obligatoire pour chaque enfant. Privacy by design. DPIA obligatoire. |
| **COPPA 2026** (USA) | 22 avril 2026 | Si familles americaines : consentement parental verifiable, interdiction monetisation donnees enfants, consentement separe pour IA |
| **EU AI Act Article 50** (transparence IA) | 2 aout 2026 | Divulguer clairement que l'utilisateur interagit avec une IA |
| **Californie SB 243** (chatbots IA) | En vigueur | Divulgation IA aux mineurs, rappel toutes les 3h, protocoles anti-contenu inapproprie |

**Important mais planifiable pour les iterations :**

| Reglementation | Echeance | Phase |
|---|---|---|
| Certification kidSAFE ou iKeepSafe (Safe Harbor COPPA) | Beta publique USA | v1.1-1.2 |
| EU AI Act application generale (systemes IA haut risque) | 2 aout 2026 | Surveiller classification |
| Lois de verification d'age US (TX/UT/LA/CA) | 2026-2027 | Surveiller |

**Strategie de conformite** : Pour le MVP cible France/Europe, priorite RGPD + EU AI Act transparence. COPPA critique uniquement si ouverture USA.

### Obligations Operationnelles (Avant Beta)

| Obligation | Detail | Fondement legal |
|---|---|---|
| **Droit a l'oubli** | Processus de suppression de compte par role : membre individuel, parent pour un profil enfant, suppression de foyer complet. Cascade : donnees personnelles supprimees, donnees partagees anonymisees (rituels historiques attribues a "membre supprime"). Delai : < 30 jours apres demande. | RGPD Art. 17 |
| **Politique de retention** | Rituels actifs : illimitee. Historique de completion : 24 mois. Conversations IA : 90 jours. Comptes inactifs : notification a 6 mois, suppression a 12 mois. Donnees enfants : retention minimale, suppression immediate sur demande parentale. | RGPD Art. 5(1)(e) |
| **Notification de breach** | Detection : monitoring automatise des acces anormaux. Notification CNIL : < 72h. Notification utilisateurs : sans delai indu si risque eleve. Template de notification pre-redige. Registre des incidents. | RGPD Art. 33-34 |
| **Verification du consentement parental** | Double opt-in : le parent createur recoit un email de confirmation avec lien de verification. Le profil enfant est bloque jusqu'a confirmation. Consentement enregistre avec horodatage dans un registre auditable. Re-consentement si politique de donnees modifiee. | RGPD Art. 8 |
| **Verification d'age** | Auto-declaration de date de naissance a la creation du profil enfant. Seuil France : 15 ans. Pas de creation de compte autonome pour < 15 ans sans rattachement a un parent admin. | RGPD Art. 8, COPPA |
| **DPIA** | Realisation obligatoire avant beta publique. Couverture : traitement donnees mineurs, profilage (recapitulatif), IA conversationnelle avec mineurs. | RGPD Art. 35 |

### Contraintes Techniques

| Contrainte | Detail | Phase |
|---|---|---|
| **Donnees d'enfants** | Comptes enfants prives par defaut, pas de partage automatique de localisation, collecte minimale justifiee | MVP |
| **Chiffrement** | TLS 1.3 en transit, chiffrement au repos, tokens chiffres AES-256 | MVP |
| **Isolation multi-foyer** | Isolation des donnees au niveau base de donnees — aucune requete ne peut retourner des donnees d'un foyer non-autorise | MVP |
| **Transparence IA** | Indiquer clairement "Vous parlez a une IA" dans le chat, marquage des outputs IA | MVP |
| **Export des donnees** | Droit a la portabilite RGPD — export complet des donnees familiales | MVP |
| **Localisation des donnees** | Hebergement EU (Allemagne ou Finlande) = conformite RGPD native | MVP |
| **Audit SDK tiers** | Responsabilite operateur sur donnees collectees par SDK integres. Audit trimestriel. | Pre-beta |

### Risques Domaine et Mitigations

| Risque | Probabilite | Impact | Mitigation |
|---|---|---|---|
| **Violation RGPD donnees mineurs** | Moyenne | Eleve (4% CA mondial) | DPIA pre-lancement + Privacy by Design + consentement parental |
| **Monetisation accidentelle des donnees** | Faible | Critique | Politique zero-monetisation des donnees. Pas de pub, pas de data brokers. |
| **Contenu inapproprie genere par IA pour mineurs** | Moyenne | Eleve | Guardrails IA (NeMo), filtrage output, classification outils par niveau de risque |
| **Perte de confiance (precedent Life360)** | Faible | Critique | Transparence totale, privacy-first comme argument marketing |
| **Classification "haut risque" EU AI Act** | Moyenne | Eleve | Surveiller Annexe III, documenter proactivement la conformite |

### La conformite comme avantage strategique

87% des consommateurs sont prets a payer plus pour des marques de confiance. Les entreprises de confiance voient leurs clients depenser 51% de plus. Faire de la conformite un argument marketing ("Privacy-First Family App") plutot qu'un simple cout est un positionnement strategique valide.

**Budget conformite estime premiere annee** : 15 000 - 65 000 USD (KWS gratuit + certification Safe Harbor + DPIA + conseil juridique).

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. Rituels familiaux comme primitive de gestion — Territoire vierge**

Aucune application existante ne structure la journee familiale autour de routines collectives par membre et par moment (matin/midi/soir). Les concurrents gerent des "to-do" froides et ponctuelles. family-hub reconceptualise la vie familiale comme un tissu de rituels a cultiver — pas une liste de taches a optimiser. Le mot "rituel" lui-meme porte un vocabulaire positif qui differencie l'experience.

La science comportementale (boucle declencheur/routine/recompense) appliquee aux routines familiales collectives n'a aucun equivalent marche. Les apps d'habitudes (Fabulous, Routinery) sont individuelles — aucune ne fonctionne au niveau du foyer.

**2. Graphe familial a 5 cercles — Architecture inedite**

Le modele Personnel → Couple → Foyer → Famille elargie → Connaissances modelise fidelement les relations familiales reelles. Les familles recomposees, la garde partagee, les grands-parents et les prestataires sont des citoyens de premiere classe, pas des exceptions.

Aucun acteur existant ne modelise les relations familiales au-dela du foyer unique. Apple Family Sharing, Google Family Link et les concurrents directs (Cozi, FamilyWall) gerent un seul foyer sans interconnexions. Ce modele est impossible a repliquer par Apple/Google sans refonte architecturale.

**3. IA conversationnelle comme interface principale — Premier entrant**

L'IA n'est pas un module parmi d'autres — c'est LA facon d'interagir avec l'app. "Parler est plus naturel que cliquer sur cinq boutons." L'emergence de Nori (100K familles en 2 mois, fevrier 2026) valide le concept de "Family Brain" IA, mais aucun concurrent ne combine IA agentique + graphe familial structure + rituels.

La convergence GraphRAG (Knowledge Graph + LLM) offre une architecture technique mature pour interroger le graphe familial de maniere contextualisee — "Qui peut recuperer les enfants jeudi ?" en tenant compte des disponibilites de chaque cercle.

### Market Context & Competitive Landscape

| Innovation | Concurrent le plus proche | Ecart |
|---|---|---|
| Rituels comme primitive | OurHome (taches gamifiees) | Conceptuel — OurHome gere des corvees, pas des rituels de vie |
| Graphe familial 5 cercles | Life360 (cercles de localisation) | Structurel — Life360 a des cercles plats, pas un graphe multi-foyer |
| IA conversationnelle = interface | Nori (Family Brain, fev. 2026) | Combinatoire — Nori n'a pas le graphe ni les rituels |
| Pricing ethique d'interet public | Tous (subscription classique) | Philosophique — monetiser les couts reels, pas les features |

**Le vide strategique** : aucun acteur ne combine ecosysteme complet + fonctionnalites avancees (IA + multi-foyer + rituels). FamilyWall s'en approche mais echoue sur l'execution (138K$ de revenus).

**Fenetre d'opportunite : 2026-2027.** Les technologies cles (LLM, Knowledge Graph, on-device AI) sont matures, le cadre reglementaire europeen favorise les nouveaux entrants privacy-first, et le croisement unique graphe x rituels x IA agentique reste non occupe.

### Validation Approach

| Innovation | Methode de validation | Signal de succes |
|---|---|---|
| **Rituels** | Beta avec cercle proche (5-10 familles), suivi du taux de completion quotidien | > 60% de completion apres 2 semaines |
| **Graphe familial** | Architecture en DB des le MVP, exposition UI progressive | Pas de migration lors de l'ajout du multi-foyer v2.0 |
| **IA textuelle** | A/B test : foyers avec/sans IA, mesure du nombre d'actions quotidiennes | > 30% des actions via IA apres 1 mois |
| **Pricing ethique** | Enquete qualitative aupres des beta testeurs sur la valeur percue | Disposition a payer 3-5 EUR/mois confirmee |

*Pour l'analyse detaillee des risques et leurs mitigations, voir la section [Strategie de mitigation des risques de scope](#strategie-de-mitigation-des-risques-de-scope).*

## Exigences Specifiques Multi-Platform (Mobile-First + Web + Kiosk)

### Vue d'ensemble des plateformes

family-hub est une application multi-plateforme avec trois surfaces :

| Plateforme | Technologie | Role | Priorite |
|---|---|---|---|
| **Mobile (iOS + Android)** | Application cross-platform React Native | Interface principale des membres du foyer | P0 — MVP |
| **Web** | Application web avec SSR/SSG (pages publiques) + SPA (app authentifiee) | Dashboard parent, onboarding, landing page | P0 — MVP |
| **Kiosk (tablette familiale)** | PWA ou application dediee en mode plein ecran | Ecran partage dans un espace commun (cuisine) | P2 — v1.2+ |

**Strategie cross-platform** : Monorepo avec partage de code metier via packages internes. Les UI sont specifiques a chaque surface (pas de "write once, run everywhere" force) pour respecter les conventions de chaque plateforme.

### Exigences par plateforme

#### Mobile

| Exigence | Detail |
|---|---|
| **OS minimum** | iOS 16+ / Android 10+ (API 29) |
| **Mise a jour** | OTA pour bugfixes JavaScript, store updates pour changements natifs |
| **Taille app cible** | < 50 Mo telechargement initial |
| **Navigation** | File-based routing |
| **Composants UI** | Bibliotheque conforme Material Design ou equivalent cross-platform |

#### Web

| Exigence | Detail |
|---|---|
| **Navigateurs** | Chrome/Edge 120+, Safari 17+, Firefox 120+ (2 dernieres versions majeures) |
| **Responsive** | Mobile-first, breakpoints : mobile (< 640px), tablet (640-1024px), desktop (> 1024px) |
| **Rendu** | SSR/SSG pour pages publiques (landing, marketing). SPA pour l'app authentifiee. |
| **Performance** | LCP < 2.5s, FID < 100ms, CLS < 0.1 (Core Web Vitals) |

#### Strategie SEO

| Aspect | Approche |
|---|---|
| **Perimetre** | Pages publiques uniquement (landing page, pages marketing). L'app authentifiee est exclue de l'indexation (noindex). |
| **Meta tags** | Title, description, Open Graph et Twitter Cards sur toutes les pages publiques |
| **Donnees structurees** | Schema.org (SoftwareApplication) sur la landing page |
| **Sitemap** | Sitemap XML auto-genere pour les pages publiques |
| **Analytics** | Solution privacy-conscious (pas de cookies tiers). Mesure : trafic organique, taux de conversion landing → inscription. |

#### Kiosk (v1.2+)

| Exigence | Detail |
|---|---|
| **Cible** | Tablette Android/iPad fixee dans un espace commun |
| **Mode** | PWA plein ecran ou application dediee avec mode kiosk |
| **Interaction** | Tactile, gros boutons, pas de clavier — orientee enfants et personnes agees |
| **Contenu** | Vue colonnes du jour par membre, statuts temps reel, minuteries rituels |
| **Securite** | Pas de donnees sensibles affichees, session foyer permanente |

### Permissions Device (Mobile)

| Permission | Usage | Moment de demande | Fallback si refusee |
|---|---|---|---|
| **Notifications push** | Rappels rituels, statuts temps reel, alertes | Apres premier rituel cree (pas a l'onboarding) | Fonctionnel sans — rappels in-app uniquement |
| **Camera** | Scan QR code d'invitation | A la premiere invitation | Saisie manuelle du code |
| **Stockage local** | Cache offline, photos de profil | Automatique (pas de prompt OS) | N/A |
| **Biometrie** | Deverrouillage rapide de l'app | Apres 3eme connexion | Code PIN ou mot de passe |
| **Localisation** | Geofencing (v2.0 uniquement) | Jamais au MVP | N/A — feature future |

**Principe** : Demande progressive ("just-in-time permissions"). Ne jamais demander une permission avant que l'utilisateur n'ait besoin de la fonctionnalite correspondante.

### Strategie Offline

| Aspect | Approche |
|---|---|
| **Approche** | Synchronisation bidirectionnelle avec stockage local SQLite |
| **Scope offline MVP** | Lecture des rituels du jour + validation de statut (a faire/en cours/termine) |
| **Sync** | Synchronisation bidirectionnelle avec resolution de conflits (last-write-wins pour les statuts, merge pour les creations) |
| **Stockage local** | SQLite embarque |
| **Indicateur** | Badge visuel discret quand l'app est hors ligne, sync automatique au retour |
| **Limite** | Chat IA non disponible offline (necessite API LLM). Message clair : "L'IA sera disponible quand la connexion sera retablie." |

**Priorite offline** :
1. P0 : Affichage des rituels du jour (lecture cache)
2. P0 : Validation de statut des rituels (queue de sync)
3. P1 : Creation de rituels simples (sync a la reconnexion)
4. P2 : Historique et recapitulatifs (v1.1)

### Strategie Push Notifications

| Type | Contenu | Frequence | Personnalisation |
|---|---|---|---|
| **Rappel rituel** | "C'est l'heure de [rituel] pour [membre]" | Selon planning, max 5/jour/membre | Delai avant rappel configurable |
| **Statut temps reel** | "Lucas a termine ses routines du matin" | A chaque completion 100% d'un moment | Desactivable par type |
| **Recapitulatif** | "Recap de la semaine : 85% des rituels completes" | 1x/semaine (dimanche soir) | Jour et heure configurables |
| **Invitation** | "Sophie vous invite a rejoindre le foyer" | Ponctuelle | N/A |
| **IA** | Reponse a une requete IA si l'app est en arriere-plan | Ponctuelle | Desactivable |

**Principes notifications** :
- **Calm technology** : Jamais intrusives. Les notifications informent, elles ne stressent pas.
- **Respect des profils** : Les enfants ne recoivent PAS de notifications push par defaut (configurable par le parent).
- **Groupement intelligent** : Pas de notification individuelle pour chaque statut — grouper par moment (matin/midi/soir).
- **Infrastructure** : Services push natifs de chaque plateforme (iOS, Android).

### Conformite Stores

| Store | Exigence | Impact |
|---|---|---|
| **App Store (Apple)** | Review Guidelines 1.3 (enfants) : si categorie "Famille", restrictions strictes sur collecte donnees, pas de pub, pas de tracking | Categoriser en "Productivite" au MVP, pas en "Famille" pour eviter les contraintes Kids Category. Migrer si necessaire. |
| **App Store (Apple)** | Review Guideline 5.1.1 (iv) : consentement parental pour comptes enfants | Flux de consentement parental integre a la creation de profil enfant |
| **Play Store (Google)** | Families Policy : si "Designed for Families", Teacher Approved requirements | Meme strategie — categorie "Productivite" au lancement |
| **App Store & Play Store** | Privacy labels / Data Safety | Declaration exhaustive des donnees collectees. Avantage : collecte minimale = labels simples. |
| **Mises a jour OTA** | Les deux stores autorisent les mises a jour OTA pour JS bundle mais PAS pour le code natif | Separer les releases : OTA pour features/bugfixes JS, store update pour changements natifs uniquement |

**Strategie store** : Categorie "Productivite" au MVP pour eviter les restrictions "Kids Category" tout en restant conforme. Documenter la conformite enfants en parallele pour une migration future vers la categorie "Famille" si le positionnement marketing l'exige.

### Architecture Temps Reel

| Couche | Capacite | Usage |
|---|---|---|
| **Transport** | Connexion bidirectionnelle persistante (WebSocket) | Communication temps reel client <-> serveur |
| **Pub/Sub** | Distribution d'evenements entre instances backend | Scalabilite horizontale du temps reel |
| **API** | Abonnements aux changements (subscriptions) | Notification automatique des changements de statut des rituels |
| **Sync offline** | Reconciliation bidirectionnelle | Rattrapage des changements apres deconnexion |

**Evenements temps reel critiques (MVP)** :
- `ritual.status.changed` — Un membre coche/decoche un rituel
- `ritual.created` / `ritual.updated` — Un rituel est cree/modifie (via UI ou IA)
- `member.joined` — Un nouveau membre rejoint le foyer
- `household.updated` — Configuration du foyer modifiee

### Considerations d'Implementation

**Partage de code (Monorepo Turborepo)** :

| Package | Contenu | Consommateurs |
|---|---|---|
| `shared` | Types, constantes, validations | Mobile, Web, Backend |
| `api-client` | Client API type | Mobile, Web |
| `ui-primitives` | Composants UI partages (si pertinent) | Mobile, Web (via adaptation) |
| `auth` | Logique authentification client | Mobile, Web |

**Performance mobile** :
- Lazy loading des ecrans non critiques
- Optimistic updates pour les validations de statut (cocher un rituel = instantane cote UI, sync en background)
- Liste virtualisee pour les vues colonnes avec beaucoup de rituels
- Cache images de profil avec strategie stale-while-revalidate

**Accessibilite (a11y)** :
- WCAG 2.1 AA minimum pour le web
- VoiceOver (iOS) / TalkBack (Android) : labels sur tous les elements interactifs
- Pictogrammes accompagnes de texte (alt text) pour les profils enfants
- Contraste minimum 4.5:1 pour le texte, 3:1 pour les elements graphiques
- Navigation clavier complete sur le web

## Project Scoping & Developpement Phase

### Strategie MVP

**Approche MVP** : Experience MVP — livrer une experience complete et differenciante sur un perimetre reduit, plutot qu'un ensemble large de features superficielles.

**Philosophie** : "Un foyer qui vit ses rituels quotidiens avec fluidite" plutot que "une app qui fait un peu de tout." Le MVP doit prouver que les rituels familiaux comme primitive + le chat IA comme interface fonctionnent ensemble.

**Ressources** : Developpeur solo senior (Thomas). Pas d'equipe, pas de designer dedie. L'architecture doit compenser par sa qualite ce que l'equipe n'a pas en taille.

**Timeline estimee** : Non definie — le rythme est drive par la qualite et l'apprentissage, pas par une deadline artificielle.

### MVP Feature Set (Phase 1 — Socle)

**Parcours utilisateurs couverts au MVP :**

| Parcours | Couverture MVP | Justification |
|---|---|---|
| Sophie (parent organisateur) | Complete | C'est le parcours critique — si Sophie n'accroche pas, rien ne marche |
| Marc (second parent) | Complete | Family Activation Rate exige 2+ membres actifs en 7 jours |
| Lucas (enfant) | Partielle — vue et validation, pas de proposition de modifications | Suffisant pour prouver l'autonomie enfant |
| Marie (babysitter) | Minimale — invitation prestataire, vue restreinte | Demontrer la valeur du modele de cercles |
| Thomas (admin/ops) | Complete | Prerequis technique non negociable |
| Co-parent | Aucune (v2.0) | Architecture anticipee en DB suffit |

**Capacites Must-Have (sans ca, le produit echoue) :**

| Capacite | Raison |
|---|---|
| Creation de foyer + invitation membres | Prerequis a tout |
| Roles a 5 niveaux (owner, admin, adulte, enfant, prestataire) | Securite et permissions de base — owner peut supprimer le foyer et transferer la propriete, admin gere les invitations/roles, adulte est le role par defaut des parents non-admin |
| Rituels/routines recurrentes par moment (matin/midi/soir) | Coeur du produit — la primitive differenciante |
| Vue colonnes par membre avec tranches horaires | Interface signature, moment "aha!" |
| Validation de statut temps reel (a faire/en cours/termine) | Feedback loop, visibilite partagee |
| Chat IA textuel et vocal (creation/modification rituels, requetes, aide integree) | Deuxieme pilier d'innovation — valide si > 30% actions via IA. Vocal via STT/TTS natif (API plateforme). |
| Home Hub contextuel | Point d'entree de l'app, grille de FeatureBlocks contextualisee — differenciant |
| Rituels imbriques (parent -> micro-rituels) | Progression incrementale, validation cascade — enrichit l'experience rituel |
| Systeme de demandes familiales (post-it) | Permet aux membres d'exprimer des besoins, et a l'IA de proposer des demandes quand les permissions sont insuffisantes |
| Onboarding ultra-court (2 questions) | Conversion et retention J1 |
| Synchronisation temps reel | Sophie et Marc doivent voir les changements instantanement |
| Authentification securisee | Securite de base |
| Pictogrammes pour jeunes enfants | Accessibilite profil enfant — differenciant |

**Capacites Should-Have (degradent l'experience si absentes, mais le produit survit) :**

| Capacite | Raison | Fallback si absent |
|---|---|---|
| Notifications push (rappels rituels) | Engagement quotidien | Rappels in-app uniquement |
| Recapitulatif hebdomadaire | Signal de succes pour Sophie — "aha!" | Consultation manuelle de l'historique |
| Export des donnees | Conformite RGPD portabilite | Peut etre un script admin au debut |
| Mode offline (lecture + validation) | Usage dans zones mal couvertes | App fonctionnelle uniquement en ligne |
| Invitation par QR code | Fluidite d'onboarding Marc | Invitation par lien/email suffit |

**Capacites Won't-Have au MVP (explicitement exclues) :**

| Capacite | Phase prevue | Raison de l'exclusion |
|---|---|---|
| Taches ponctuelles (to-do one-shot) | v1.1 | Risque de diluer le concept "rituels" |
| Rotation automatique des roles | v1.1 | Enhancement, pas essentiel a la validation |
| Calendrier et evenements | v1.2 | Module complexe, valeur additive |
| Cercle Couple expose en UI | v1.2 | Architecture en DB suffit au MVP |
| IA contextuelle avancee | v1.3 | L'IA basique suffit a valider le concept |
| Communication foyer | v1.5 | Pas dans le coeur rituel |
| Multi-foyer UI | v2.0 | Complexite UI significative |
| Geofencing | v2.0 | Necessite permissions sensibles |
| Gamification | v3.0+ | Feature de retention, pas de validation |
| Finances familiales | v3.0+ | Domaine regulatoire supplementaire |

### Roadmap de developpement phasee

**Phase 1 — MVP (Socle)** : Rituels + IA textuelle/vocale + Foyer + Home Hub + Demandes

```
Creation foyer -> Invitation membres -> Rituels (CRUD + recurrence + imbriques)
-> Home Hub contextuel -> Vue colonnes -> Statuts temps reel
-> Chat IA textuel et vocal (STT/TTS natif) -> Onboarding
-> Pictogrammes enfants -> Auth securisee -> Demandes familiales
-> Notifications push basiques -> Recapitulatif hebdomadaire
-> Export donnees -> Mode offline (lecture + validation)
```

Validation : 5-10 familles du cercle proche. Signal = completion rituels > 60% apres 2 semaines + Family Activation Rate > 40%.

**Phase 2 — Growth (v1.1 -> v1.3)** : Consolidation + Calendrier + IA avancee

| Version | Features | Signal de passage |
|---|---|---|
| **v1.1** | Taches ponctuelles, rotation roles, templates rituels, checklists DoD, auto-detection tache/rituel | MVP valide (retention J30 > 15%) |
| **v1.2** | Calendrier foyer, Cercle Couple UI, Fiche Membre, interface par age, mode Kiosk | v1.1 stable, 50+ familles actives |
| **v1.3** | IA contextuelle, navigation par moment, detection conflits, IA premium | v1.2 stable, signal de monetisation |

**Phase 3 — Expansion (v1.5 -> v3.0+)** : Ecosysteme complet

| Version | Features | Prerequis |
|---|---|---|
| **v1.5** | Communication foyer, famille elargie UI, calm technology | Base utilisateurs solide |
| **v2.0** | Multi-foyer UI complet, geofencing, concierge IA proactif, boite noire familiale | Seed round boucle |
| **v3.0+** | Gamification, finances, suivi scolaire, hardware, plugins communautaires | PMF confirme, equipe en place |

### Dependances critiques entre phases

```
Authentification --> Tout
Graphe familial (DB) --> Roles/Permissions --> Cercles UI (v1.2) --> Multi-foyer UI (v2.0)
Rituels CRUD --> Vue colonnes --> Recapitulatif --> Templates (v1.1) --> Calendrier (v1.2)
Chat IA textuel + vocal (MVP) --> IA contextuelle (v1.3) --> Concierge proactif (v2.0)
Transport temps reel + Pub/Sub --> Temps reel --> Notifications --> Calm technology (v1.5)
Sync offline --> Offline lecture --> Offline ecriture (v1.1)
```

### Strategie de mitigation des risques de scope

**Risques techniques :**

| Risque | Probabilite | Impact | Mitigation |
|---|---|---|---|
| Synchronisation offline complexe | Moyenne | Eleve | Prototyper l'offline en premier sprint. Fallback : online-only au MVP, offline en v1.1 |
| Integration IA conversationnelle | Moyenne | Moyen | Spike technique de 1-2 semaines avant le dev principal. L'app fonctionne sans IA. |
| Transport temps reel | Faible | Moyen | Patterns bien documentes. Fallback : polling court-terme si blocage. |
| Setup monorepo initial | Faible | Faible | Setup one-time, outillage mature. |

**Risques marche :**

| Risque | Probabilite | Impact | Mitigation |
|---|---|---|---|
| Le concept "rituels" ne resonne pas | Faible | Critique | Vocabulaire fallback "routines". Tester le wording avec les beta testeurs. |
| Nori prend le lead avant notre lancement | Moyenne | Eleve | Nori n'a pas le graphe familial ni les rituels — differenciation structurelle. Vitesse d'execution. |
| Trop peu de familles beta testeurs | Moyenne | Moyen | Cercle proche (5-10 familles) suffit pour validation initiale. Pas besoin de marketing. |

**Risques ressources (developpeur solo) :**

| Risque | Probabilite | Impact | Mitigation |
|---|---|---|---|
| Scope creep — trop de features au MVP | Elevee | Critique | Ce document comme garde-fou. Must-Have seulement. Dire non. |
| Burnout / perte de motivation | Moyenne | Critique | Iterations courtes, feedback utilisateur regulier, celebrate les milestones. |
| Complexite sous-estimee d'un module | Moyenne | Moyen | Chaque module a un fallback identifie. Offline et IA sont les plus risques -> prototyper en premier. |

**Feature minimale de survie** (si tout va mal et qu'il faut couper encore) :
Foyer + membres + rituels + vue colonnes + statuts temps reel. Pas d'IA, pas d'offline, pas de notifications push. Ca fonctionne comme un "tableau familial numerique" basique. Si meme ca cree de la valeur, le concept est valide.

## Functional Requirements

### Gestion du Foyer & Membres

- FR1: Un utilisateur peut creer un nouveau foyer en renseignant un nom et le nombre de membres
- FR2: Un parent admin peut inviter des membres a rejoindre le foyer par lien, email ou QR code
- FR3: Un utilisateur invite peut rejoindre un foyer existant en acceptant une invitation sans configuration prealable
- FR4: Un parent admin peut attribuer un role a chaque membre du foyer (owner, admin, adulte, enfant, prestataire). Le owner peut supprimer le foyer et transferer la propriete. L'admin gere les invitations et les roles. L'adulte est le role par defaut des parents non-admin.
- FR5: Un parent admin peut creer un profil enfant avec pictogramme, tranche d'age et permissions par defaut
- FR6: Un parent admin peut inviter un prestataire (babysitter, nounou) avec un acces limite a 30 jours, en lecture seule sur les rituels et consignes des membres dont il a la charge
- FR7: Un prestataire peut acceder aux routines, consignes, allergies et numeros d'urgence des membres dont il a la charge, sans creer de compte complet
- FR8: Un membre peut consulter la fiche de chaque membre du foyer (nom, role, allergies, consignes, numero d'urgence)
- FR9: L'architecture supporte les 5 cercles de visibilite (Personnel, Couple, Foyer, Famille elargie, Connaissances), seul le cercle Foyer etant expose en UI au MVP

### Rituels & Routines

- FR10: Un parent peut creer un rituel recurrent associe a 1 a N membres du foyer et a un moment de la journee (matin, midi, soir)
- FR11: Un parent peut modifier ou supprimer un rituel existant
- FR12: Un parent peut definir la recurrence d'un rituel (quotidien, jours specifiques de la semaine)
- FR13: Un membre peut consulter ses rituels du jour organises par moment (matin, midi, soir)
- FR14: Un membre peut mettre a jour le statut d'un rituel qui lui est assigne (a faire, en cours, termine)
- FR15: Un enfant peut valider le statut de ses propres rituels de maniere autonome
- FR16: Un enfant de profil < 7 ans voit un pictogramme associe a chaque rituel (1 pictogramme par rituel, selectionnable par le parent)
- FR17: Un membre voit les changements de statut des rituels sur ses autres appareils en moins de 2 secondes
- FR18: Un parent peut consulter un recapitulatif hebdomadaire presentant le taux de completion des rituels par membre

### Vue & Interface Quotidienne

- FR19: Un membre peut visualiser l'ensemble des rituels du foyer sous forme de colonnes par membre avec tranches horaires
- FR20: Un parent peut consulter la vue complete du foyer (tous les membres, tous les moments)
- FR21: Un enfant voit uniquement sa colonne et les rituels associes a son profil d'age (pictogrammes pour < 7 ans, texte pour >= 7 ans)
- FR22: Un prestataire voit uniquement les colonnes des membres dont il a la charge et leurs consignes
- FR23: Un nouvel utilisateur peut completer l'onboarding en 2 questions max (nombre de membres, moment le plus chaotique) et obtenir une premiere routine generee en < 60 secondes

### Intelligence Artificielle Conversationnelle

- FR24: Un membre autorise peut interagir avec un assistant IA via un chat textuel et vocal integre a l'application (STT input natif + TTS output natif)
- FR25: Un membre peut creer, modifier ou supprimer des rituels par commande en langage naturel via le chat IA
- FR26: Un membre peut poser des questions contextuelles a l'IA sur l'organisation du foyer (planning du jour, activites prevues, consignes) et sur le fonctionnement de l'application (aide integree)
- FR27: Un membre voit un indicateur permanent "Vous parlez a une IA" dans l'interface du chat (conformite EU AI Act Article 50)
- FR28: Un membre mineur interagit avec une IA dont les reponses sont filtrees : zero contenu violent, sexuel ou inapproprie (liste de categories bannies configurable par l'admin)
- FR29: Un membre ne peut declencher via l'IA que les actions autorisees pour son role (ex: un enfant ne peut pas supprimer un rituel via l'IA)

### Permissions & Securite

- FR30: Un profil enfant est cree avec les permissions minimales par defaut : consultation de sa colonne, validation de statut de ses rituels, chat IA en lecture seule
- FR31: Un parent admin peut debloquer des permissions supplementaires pour un enfant parmi : creation de rituels, modification de ses rituels, chat IA interactif, consultation des colonnes des autres membres
- FR32: Un membre ne peut acceder qu'aux donnees des foyers auxquels il appartient — aucune requete ne retourne des donnees d'un foyer non-autorise
- FR33: Un parent admin peut gerer les roles et permissions de tous les membres du foyer
- FR34: Un parent admin doit fournir un consentement parental verifie (double opt-in email) avant la creation de tout profil enfant (conformite RGPD Article 8)
- FR35: Un membre peut s'authentifier de maniere securisee (email/mot de passe, magic link, ou biometrie apres configuration)

### Notifications & Communication

- FR36: Un parent peut recevoir des notifications push pour les rappels de rituels selon le planning configure
- FR37: Un parent peut recevoir une notification lorsqu'un enfant a complete 100% de ses rituels pour un moment donne
- FR38: Un membre peut configurer ses preferences de notification (types, frequence, horaires)
- FR39: Un membre recoit au maximum 1 notification groupee par moment (matin/midi/soir), regroupant tous les rappels du moment
- FR40: Un profil enfant ne recoit pas de notifications push par defaut. Un parent admin peut activer les notifications pour un enfant.

### Donnees & Conformite

- FR41: Un membre peut exporter l'integralite de ses donnees personnelles et familiales dans un format portable (conformite RGPD droit a la portabilite)
- FR42: Le service collecte uniquement les donnees suivantes : nom/prenom, email, date de naissance (enfants), roles, rituels, statuts, conversations IA. Aucune donnee de localisation, financiere ou biometrique n'est collectee au MVP.
- FR43: Un administrateur technique peut verifier que toutes les donnees sont stockees au sein de l'Union Europeenne
- FR44: Toutes les communications sont chiffrees en transit (TLS 1.3) et les donnees sensibles (tokens, mots de passe) sont chiffrees au repos (AES-256)

### Mode Offline & Synchronisation

- FR45: Un membre peut consulter ses rituels du jour meme sans connexion internet
- FR46: Un membre peut mettre a jour le statut de ses rituels hors ligne, avec synchronisation automatique au retour de la connexion
- FR47: Un membre voit un indicateur visuel de l'etat de connexion (en ligne / hors ligne / synchronisation en cours)
- FR48: Les conflits de synchronisation sont resolus de maniere deterministe : dernier ecrivain gagne pour les statuts, fusion pour les creations

### Droit a l'oubli & Retention

- FR52: Un membre peut supprimer son compte. Ses donnees personnelles sont supprimees en < 30 jours. Les donnees partagees (rituels) sont anonymisees ("membre supprime").
- FR53: Un parent admin peut supprimer le profil d'un enfant. Les donnees personnelles de l'enfant sont supprimees immediatement, les rituels associes sont conserves en anonyme.
- FR54: Un parent admin peut consulter et telecharger l'ensemble des donnees collectees sur un profil enfant (conformite RGPD droit d'acces parental).

### Administration & Operations

- FR49: L'administrateur technique peut deployer des mises a jour de l'application mobile sans passage par les stores (OTA pour le code JS)
- FR50: L'administrateur technique peut surveiller les erreurs, performances et metriques d'usage via des outils de monitoring
- FR51: L'administrateur technique peut consulter les metriques business (retention, DAU, Family Activation Rate) depuis un dashboard

### Systeme de demandes familiales

- FR55: Un membre peut creer une demande (post-it) a destination d'un ou plusieurs membres du foyer, avec un titre et une description optionnelle
- FR56: Un membre destinataire peut consulter ses demandes en attente, les approuver ou les refuser
- FR57: L'emetteur d'une demande est notifie du resultat (approuve/refuse) via notification push
- FR58: L'IA propose automatiquement de creer une demande a un admin lorsqu'une action demandee depasse les permissions du membre

## Non-Functional Requirements

### Performance

| NFR | Critere mesurable | Contexte |
|---|---|---|
| **NFR1** : Les actions utilisateur courantes (cocher un rituel, ouvrir une vue) repondent en moins de 200ms cote UI | p95 < 200ms (optimistic update) | Le feedback instantane est essentiel pour l'adoption quotidienne |
| **NFR2** : Les changements de statut d'un rituel sont visibles sur les autres appareils du foyer en moins de 1 seconde | p95 < 1s | Sophie doit voir Marc cocher son rituel en quasi temps reel |
| **NFR3** : L'API backend repond aux requetes en moins de 300ms | p95 < 300ms hors requetes IA | Base de reference pour les operations CRUD standard |
| **NFR4** : Le temps de reponse du chat IA (premier token) est inferieur a 2 secondes | p95 < 2s (time-to-first-token) | Au-dela de 2s, l'utilisateur perd confiance dans l'interface |
| **NFR5** : L'application mobile demarre et affiche les rituels du jour en moins de 3 secondes (warm start) | p95 < 3s sur appareil milieu de gamme | Le matin, chaque seconde compte |
| **NFR6** : Le web atteint les Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1) sur les pages publiques | Mesure Lighthouse score > 90 | SEO et premiere impression landing page |

### Securite

| NFR | Critere mesurable | Contexte |
|---|---|---|
| **NFR7** : Toutes les communications client-serveur sont chiffrees via TLS 1.3 | 100% des connexions HTTPS | Protection des donnees en transit |
| **NFR8** : Les donnees sensibles (tokens, mots de passe) sont chiffrees au repos avec AES-256 | Audit de la couche de stockage | Protection en cas de compromission serveur |
| **NFR9** : L'isolation des donnees par foyer empeche tout acces cross-foyer | Tests automatises : 100% des endpoints valides pour l'absence de fuite cross-foyer | Confiance des familles — condition sine qua non |
| **NFR10** : Les sessions expirent apres 30 jours d'inactivite, avec refresh token rotation | Tokens a duree limitee, rotation automatique | Securite sans friction pour un usage quotidien |
| **NFR11** : L'IA ne peut executer que les actions autorisees pour le role du membre qui interagit | Tests automatises sur chaque outil IA par role | Prevenir l'escalade de privileges via l'IA |
| **NFR12** : Les profils enfants ne peuvent etre crees qu'avec un consentement parental verifie | Flux de consentement bloquant | Conformite RGPD Article 8 |
| **NFR13** : Aucune donnee utilisateur n'est partagee avec des tiers a des fins de monetisation | Politique zero-partage, audit trimestriel des SDK tiers. Zero SDK publicitaire ou analytique tiers non-conforme. | Positionnement privacy-first, conformite COPPA |

### Scalabilite

| NFR | Critere mesurable | Contexte |
|---|---|---|
| **NFR14** : L'architecture supporte de 5 a 5 000 foyers actifs sans changement d'architecture | Meme codebase, scaling vertical puis horizontal | Trajectoire de croissance sur 12 mois |
| **NFR15** : La base de donnees supporte 50 000 rituels actifs avec des temps de requete < 100ms | Requetes indexees, plan d'execution valide | 5 000 foyers x ~10 rituels/foyer |
| **NFR16** : Le systeme temps reel supporte 500 connexions WebSocket simultanees sur une instance | Test de charge valide | 5 000 foyers avec ~10% de connectes simultanes |
| **NFR17** : Le cout d'infrastructure reste inferieur a 0.05 EUR/foyer/mois jusqu'a 5 000 foyers | Suivi mensuel du cout | Viabilite economique — objectif ~250 EUR/mois max pour 5 000 foyers |

### Fiabilite

| NFR | Critere mesurable | Contexte |
|---|---|---|
| **NFR18** : Aucune perte de donnees utilisateur, meme en cas de panne serveur | Backups quotidiens, recovery teste | Les donnees familiales sont irremplacables |
| **NFR19** : Le mode offline preserve l'integrite des donnees locales lors de la resynchronisation | < 0.1% de pertes de donnees sur les tests de conflits offline/online | Un rituel coche offline ne doit jamais etre perdu |
| **NFR20** : Le systeme recupere automatiquement apres un crash sans intervention manuelle | Recovery automatique en < 5 min (health checks + auto-restart) | Developpeur solo — pas de on-call 24/7 |
| **NFR21** : Les mises a jour OTA n'interrompent pas l'utilisation en cours de l'application | Telechargement en arriere-plan, application au prochain lancement | Calm technology — pas de popups "mise a jour disponible" |

### Accessibilite

| NFR | Critere mesurable | Contexte |
|---|---|---|
| **NFR22** : L'application web respecte le niveau WCAG 2.1 AA | Audit automatise (axe-core) + audit manuel des parcours critiques | Accessibilite legale et ethique |
| **NFR23** : L'application mobile est utilisable avec VoiceOver (iOS) et TalkBack (Android) | 100% des parcours principaux completables avec lecteur d'ecran (test manuel) | Parents ou grands-parents malvoyants |
| **NFR24** : Tous les elements interactifs ont un contraste minimum de 4.5:1 (texte) et 3:1 (elements graphiques) | Validation automatisee dans le CI | Lisibilite pour tous |
| **NFR25** : Les pictogrammes enfants sont toujours accompagnes d'un texte alternatif | Couverture 100% des pictogrammes | Accessibilite + comprehension multi-ages |

### Maintenabilite

| NFR | Critere mesurable | Contexte |
|---|---|---|
| **NFR26** : L'ajout d'un nouveau module fonctionnel (ex: calendrier) ne necessite pas de modification des modules existants | Zero imports circulaires entre modules, interfaces publiques definies. Verification : ajout d'un module test sans toucher au code existant. | Architecture evoluable — critere de succes technique |
| **NFR27** : Le code TypeScript est en mode strict end-to-end (backend, web, mobile) | `strict: true` dans tous les tsconfig, zero `any` autorise en CI | Qualite senior, prevention des bugs |
| **NFR28** : La couverture de tests couvre les chemins critiques (creation foyer, rituels CRUD, permissions, sync) | > 80% de couverture sur les chemins critiques. Tests d'integration sur les 5 parcours principaux. | Filet de securite pour le developpeur solo |
| **NFR29** : Le pipeline CI/CD valide le build, les tests et le linting avant chaque deploiement | Aucun deploiement sans CI vert | Prevention des regressions |

## Traceability Matrix

### FRs → Parcours Utilisateurs

| Domaine FR | Sophie | Marc | Nadia | Lucas | Marie | Thomas | Co-parent (v2.0) |
|---|---|---|---|---|---|---|---|
| Gestion Foyer (FR1-9) | FR1,2,4,5,8 | FR3 | FR1,2,4,5,8 | — | FR6,7 | — | FR9 |
| Rituels (FR10-18) | FR10-14,17,18 | FR13,14,17 | FR10-14,17,18 | FR13-16 | FR13,14 | — | — |
| Vue Quotidienne (FR19-23) | FR19,20,23 | FR19,20 | FR19,20 | FR21 | FR22 | — | — |
| IA Conversationnelle (FR24-29) | FR24-26 | FR24,26 | FR24-26 | FR24 (limite) | — | — | — |
| Demandes familiales (FR55-58) | FR55-57 | FR55-57 | FR55-57 | FR55,56,58 | FR55,56 | — | — |
| Permissions (FR30-35) | FR33,34,35 | FR35 | FR33,34,35 | FR30,31 | FR32 | — | — |
| Notifications (FR36-40) | FR36-39 | FR36,38 | FR36-39 | FR40 | — | — | — |
| Donnees & Retention (FR41-44, FR52-54) | FR41,52 | FR41,52 | FR41,52 | — | — | FR43,44 | — |
| Offline (FR45-48) | FR45,46 | FR45,46 | FR45,46 | FR45,46 | — | — | — |
| Admin/Ops (FR49-51) | — | — | — | — | — | FR49-51 | — |

### Success Criteria → FRs

| Critere de succes | FRs qui l'enablent |
|---|---|
| Utilisation quotidienne (DAU/MAU > 50%) | FR13,14,17,19 (vue colonnes + statuts temps reel = raison de revenir) |
| Repartition equilibree (ecart < 30%) | FR18,19,20 (recapitulatif + visibilite = conscience partagee) |
| Completion rituels (> 60%) | FR10-16,23 (CRUD rituels + pictogrammes + onboarding) |
| Autonomie enfants | FR15,16,21,30,31 (validation autonome + permissions progressives) |
| Adoption IA (> 30% actions) | FR24-26,29 (chat IA textuel et vocal + outils par role) |
| Family Activation Rate (> 40%) | FR2,3,23 (invitation + zero-config + onboarding rapide) |
| Graphe familial operationnel | FR9 (5 cercles en base avec isolation par foyer) |
| Retention J30 (> 15%) | FR17,18,36,37 (temps reel + recapitulatif + notifications) |
