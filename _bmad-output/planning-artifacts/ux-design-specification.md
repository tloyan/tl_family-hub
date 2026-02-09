---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
lastStep: 14
inputDocuments:
  - product-brief-family-hub-2026-02-06.md
  - prd.md
  - brainstorming-session-2026-02-05.md
  - market-apps-gestion-familiale-research-2026-02-06.md
  - domain-family-tech-famtech-research-2026-02-06.md
date: '2026-02-06'
author: 'Thomas'
project_name: 'family-hub'
---

# UX Design Specification family-hub

**Author:** Thomas
**Date:** 2026-02-06

---

## Executive Summary

### Vision Projet

family-hub est une plateforme d'organisation familiale AI-first qui reinvente la gestion du quotidien autour de **rituels collectifs** plutot que de to-do froides. L'application cible un marche FamTech de 5,5-7,5 Mrd USD avec une retention catastrophique (J30 : 5,7%) — signe que personne ne resout correctement le probleme de coordination familiale.

Trois innovations combinees positionnent family-hub sur un territoire vierge valide par la recherche :

1. **Rituels familiaux comme primitive de gestion** — structurer la journee par membre et par moment (matin/midi/soir), pas des to-do froides
2. **Graphe familial a 5 cercles** — modeliser fidelement les relations familiales reelles (Personnel, Couple, Foyer, Famille elargie, Connaissances), multi-foyers natif
3. **IA conversationnelle comme interface principale** — parler est plus naturel que cliquer sur cinq boutons

L'ambition est de devenir l'outil d'organisation de reference dans chaque foyer, avec un pricing ethique d'interet quasi-public (max 10 EUR/mois), une approche privacy-first comme avantage concurrentiel, et une fenetre d'opportunite 2026-2027 validee par la convergence des technologies IA agentiques et du cadre reglementaire europeen.

### Utilisateurs Cibles

| Persona | Profil | Role | Besoin UX cle |
|---|---|---|---|
| **Sophie** | 36 ans, responsable marketing, 3 enfants | Parent organisateur sous pression | Reduire la charge mentale, visibilite partagee, interface rapide |
| **Marc** | 39 ans, developpeur web, mari de Sophie | Second parent tech-savvy | Savoir quoi faire sans demander, zero-config a l'arrivee |
| **Lucas** | 11 ans, eleve de 6eme | Enfant en quete d'autonomie | Interface simple, pictogrammes, validation autonome, fierte |
| **Nadia** | 34 ans, mere au foyer, 2 enfants | Parent au foyer, charge invisible | Rendre visible sa contribution, recapitulatif comme preuve |
| **Marie** | 22 ans, etudiante, babysitter | Prestataire | Acces restreint, consignes claires, zero friction d'entree |

### Defis de Design Cles

1. **Multi-profils radicalement differents sur une meme app** — Sophie (parent admin avance), Lucas (enfant 11 ans), Nadia (recherche de simplicite), Marie (acces ephemere prestataire). L'UI doit s'adapter au profil d'age et au role sans creer N apps differentes.

2. **L'IA comme interface principale sans effrayer** — le chat IA doit etre le mode naturel d'interaction, mais les utilisateurs moins tech-savvy (Nadia) et les enfants doivent pouvoir tout faire sans IA. L'IA enrichit, elle ne bloque jamais.

3. **Onboarding et "Family Activation Rate"** — la retention depend de l'adhesion du second parent en < 7 jours. Le parcours d'invitation (Marc rejoint via lien) doit etre zero-friction, zero-config, avec une valeur percue immediate (les colonnes sont la, sa colonne est prete).

4. **Hierarchie d'information contextuelle** — afficher la bonne information au bon moment (rituels du matin le matin, du soir le soir) sans surcharger l'interface. Le piege de FamilyWall (interface accablante) est a eviter absolument.

5. **Conformite sans friction** — consentement parental RGPD, transparence IA (EU AI Act), permissions enfants — tout doit etre integre naturellement dans les flux, pas comme des murs bureaucratiques.

### Opportunites de Design

1. **La vue colonnes comme signature visuelle** — aucun concurrent ne propose cette vue. C'est le moment "aha!" de l'app. L'equivalent du board Trello ou du feed Instagram — immediatement reconnaissable et differenciant.

2. **Le recapitulatif hebdomadaire comme outil emotionnel** — pas seulement des stats, mais un moment de fierte familiale. "Cette semaine, Marc a fait 38%, Sophie 42%, Lucas a tout coche 2 fois seul." Levier de retention et moteur de changement comportemental.

3. **L'onboarding generatif** — 2 questions puis routine generee. L'IA montre sa valeur des la premiere minute. Un moment magique si bien execute.

4. **Calm technology comme positionnement UX** — dans un marche ou les apps stressent (notifications excessives, interfaces surchargees), family-hub est l'anti-stress : information contextuelle, pull vs push, jamais invasif.

## Core User Experience

### Experience Definissante

**L'action coeur : consulter et valider ses rituels du moment.**

L'utilisateur ouvre l'app (ou regarde le kiosk) et voit immediatement ce qui le concerne *maintenant* — ses rituels du moment, pour lui et son foyer. Il coche, le statut se met a jour en temps reel pour tout le monde. C'est la boucle fondamentale : **voir → agir → feedback partage**.

L'IA est un mode complementaire de cette action coeur : "Ajoute sortie piscine samedi" est une autre facon d'agir sur les rituels, plus naturelle dans certains contextes (mains occupees, en deplacement).

**Principe fondateur : zero punition.** Un rituel manque disparait. Pas de rouge, pas de compteur de retard, pas de "vous avez rate 3 rituels". L'app est un compagnon bienveillant, pas un surveillant. L'historique existe (recapitulatif hebdomadaire), mais le quotidien est toujours tourne vers l'avant.

**Principe fondateur : tout est contextuel.** Le temps et le lieu determinent ce qui s'affiche. Le matin = rituels du matin. A la maison = vue foyer. En deplacement = ma colonne. Le contexte est l'intelligence de l'interface — mais l'acces a la vue globale et aux autres modules reste toujours a portee.

### Strategie Plateforme

| Plateforme | Role | Interaction | Priorite |
|---|---|---|---|
| **Mobile (iOS + Android)** | Interface principale individuelle | Tactile, IA texte/voix | P0 — MVP |
| **Web** | Dashboard parent, onboarding, landing | Souris/clavier + tactile | P0 — MVP |
| **Kiosk (tablette cuisine)** | Tableau familial partage, visible de tous | Tactile, gros boutons, enfants/seniors | P1 — Vision strategique, exposition progressive |

**Le kiosk est strategiquement central** meme si le hardware dedie viendra plus tard. Des le MVP, l'experience "tablette posee dans la cuisine" avec une PWA ou un mode plein ecran doit etre pensee. C'est l'image mentale du produit : le tableau du foyer, toujours visible, que toute la famille consulte en passant.

**Offline** : lecture des rituels du jour + validation de statut disponibles hors ligne. Sync automatique au retour. Le chat IA necessite une connexion.

### Interactions Sans Effort

| Interaction | Ce qui doit etre sans effort | Comment |
|---|---|---|
| **Voir mes rituels** | Ouvrir l'app = voir immediatement ce qui me concerne maintenant | Vue contextuelle par defaut (moment + membre) |
| **Cocher un rituel** | Un tap, feedback instantane, visible par tous | Optimistic update, sync temps reel |
| **Creer un rituel par IA** | Dire/ecrire en langage naturel | Chat IA accessible en un tap (FAB ou onglet), texte ou vocal |
| **Rejoindre un foyer** | Le second parent arrive et voit sa colonne prete | Invitation par lien, zero-config, valeur immediate |
| **Naviguer entre modules** | Passer des rituels au calendrier (v1.2) sans friction | Architecture modulaire, navigation coherente et extensible |

**Suggestions contextuelles IA** : l'IA ne vit pas seulement dans le chat. Elle apparait a des moments cles sous forme de suggestions discretes — "Lucas oublie souvent la douche le soir — ajouter un rappel ?", "Demain est ferie — adapter les rituels ?". Pull, pas push.

### Moments de Succes Critiques

| Moment | Pourquoi c'est critique | Persona concerne |
|---|---|---|
| **Premier matin avec les colonnes** | C'est le "aha!" — si les colonnes sont la, claires, contextuelles, l'utilisateur accroche | Sophie, Marc |
| **Le second parent voit sa colonne** | Family Activation Rate — si Marc voit sa colonne prete sans config, il reste | Marc |
| **L'enfant coche seul ses rituels** | La promesse d'autonomie se realise | Lucas |
| **Le premier recapitulatif hebdomadaire** | Sophie voit que la repartition approche l'equilibre — moment emotionnel fort | Sophie, Nadia |
| **"Ajoute X" via l'IA et ca marche** | L'IA prouve sa valeur en une seconde | Sophie, Marc |
| **La babysitter ouvre l'app et sait quoi faire** | L'acces prestataire fonctionne sans friction | Marie |

### Principes d'Experience

1. **Zero punition, toujours vers l'avant** — un rituel manque n'est jamais mis en evidence negativement. L'app encourage, elle ne juge pas. L'historique existe pour analyser (recapitulatif), pas pour culpabiliser.

2. **Contexte d'abord, global ensuite** — l'interface montre ce qui est pertinent maintenant (moment + lieu + membre), mais l'acces a la vue globale et aux autres modules est toujours disponible. L'intelligence est dans le defaut, pas dans la restriction.

3. **L'IA enrichit, elle ne bloque jamais** — tout est faisable sans IA. L'IA est un accelerateur accessible en un tap (texte ou vocal) et via des suggestions contextuelles. Elle rend l'experience meilleure, elle n'est jamais un prerequis.

4. **Modulaire et extensible** — l'architecture UX est concue pour accueillir de nouveaux modules (calendrier, communication, finances...) sans refonte. La navigation, les patterns d'interaction et la structure visuelle supportent la croissance du produit.

5. **Visible de tous, le kiosk dans la tete** — meme sur mobile, l'experience porte l'ADN du "tableau familial affiche dans la cuisine". La vue colonnes est faite pour etre vue, partagee, consultee en passant. Le kiosk n'est pas un mode secondaire, c'est la vision.

## Desired Emotional Response

### Objectifs Emotionnels Primaires

**L'emotion signature de family-hub : la serenite.**

family-hub n'est pas une app qui excite, qui motive, qui pousse. C'est une app qui apaise. L'utilisateur ouvre l'app et sait ou il en est. Il voit que ca tourne. Il n'a pas besoin d'y penser. La charge mentale se dissout dans la structure.

| Emotion cible | Ce que ca veut dire concretement |
|---|---|
| **Serenite** | "Tout est visible, tout est gere, je peux lacher prise" |
| **Confiance** | "L'app fait ce que j'attends, elle ne me surprend pas negativement" |
| **Fierte familiale** | "On y arrive ensemble" — pas une fierte individuelle, une fierte collective |
| **Autonomie** | "Je sais quoi faire sans qu'on me le dise" (Marc, Lucas) |
| **Reconnaissance** | "Ce que je fais est visible" (Nadia, Sophie) |

**Emotions a eviter absolument :**

| Emotion a eviter | Pourquoi | Comment l'eviter |
|---|---|---|
| **Culpabilite** | Un rituel manque ne doit jamais faire sentir "j'ai echoue" | Zero punition, pas de rouge, pas de compteur negatif |
| **Condescendance** | L'app ne doit jamais "feliciter" comme un coach artificiel | Ton factuel et chaleureux, pas de "Bravo !", pas de faux enthousiasme |
| **Pression** | L'app ne doit jamais creer d'urgence artificielle | Pas de streaks, pas de "vous avez rate X jours", calm technology |
| **Surveillance** | Les enfants ne doivent pas sentir un controle parental deguise | Permissions progressives, autonomie visible, pas de tracking cache |

### Parcours Emotionnel

| Phase | Emotion visee | Ce qui la declenche |
|---|---|---|
| **Decouverte (App Store)** | Curiosite + espoir | "Ca a l'air simple et different" — la video montre les colonnes en action |
| **Onboarding** | Surprise positive | 2 questions et une routine est generee. "C'est tout ? Ca marche deja ?" |
| **Premier matin** | Clarte + soulagement | Les colonnes sont la. Chaque membre sait quoi faire. Pas de chaos. |
| **Premiere semaine** | Confiance croissante | Les rituels deviennent des reflexes. L'app tient ses promesses. |
| **Premier recapitulatif** | Fierte familiale | Les chiffres montrent que tout le foyer contribue. Moment partage. |
| **Usage quotidien** | Serenite + invisibilite | L'app fait partie du decor. On ne "pense" plus a l'app, on vit avec. |
| **Quand ca ne va pas** | Transparence + calme | Erreur = message clair, pas de panique. Hors ligne = badge discret, sync au retour. |

### Micro-Emotions et Feedback

**Principes de feedback pour adultes :**
- **Factuel, jamais condescendant.** "Rituel termine" — pas "Bravo, vous avez termine votre rituel !"
- **Le ton est celui d'un outil de confiance**, pas d'un coach de vie. L'app constate, elle ne juge pas, elle ne celebre pas artificiellement.
- **La chaleur vient des moments familiaux**, pas de l'app elle-meme. L'app facilite le moment ou Marc dit "Regarde, on est presque a 50/50" — c'est Marc qui celebre, pas l'app.

**Principes de feedback pour enfants (5-12 ans) :**
- **Feedback visuel sobre mais satisfaisant** — le geste de cocher est recompensant en lui-meme. Une micro-animation douce (check qui apparait, couleur qui change) suffit.
- **Pas de feux d'artifice, pas de points, pas de "super !"** — la fierte vient du regard des parents, pas de l'app.
- **Les pictogrammes passent de "a faire" a "fait"** avec un changement visuel clair mais calme.
- **L'app notifie discretement les parents** quand l'enfant a tout complete — le parent peut alors feliciter en personne. C'est plus puissant que n'importe quelle animation.

### Le Recapitulatif Hebdomadaire comme Rituel Familial

Le recapitulatif n'est pas une notification. C'est un **rituel familial** — un moment a vivre ensemble, comme un bilan du dimanche soir.

**Format propose :**
- **Factuel d'abord** : chiffres de completion par membre, repartition de la charge, rituels les plus reguliers
- **Ton chaleureux sans etre faux** : des phrases simples qui contextualisent les chiffres ("Cette semaine, 4 membres du foyer ont contribue aux rituels du matin") — pas de "Felicitations a toute la famille !"
- **Non force** : le recapitulatif est disponible, pas impose. Si la famille ne le consulte pas un dimanche, il n'y a pas de relance
- **Concu pour etre lu ensemble** : format adapte a l'ecran kiosk, lisible quand toute la famille est autour de la table

### Principes de Design Emotionnel

1. **L'app est un miroir, pas un coach** — elle reflette ce qui se passe dans le foyer (faits, chiffres, statuts), elle ne dit jamais ce que l'utilisateur devrait ressentir. Les emotions naissent de la realite, pas de l'interface.

2. **La chaleur est dans le contenu, pas dans le chrome** — pas d'emojis forces, pas de couleurs criardes, pas de messages motivationnels. La chaleur vient des prenoms des enfants dans les colonnes, des pictogrammes choisis par les parents, du recapitulatif lu ensemble.

3. **Le silence est une emotion** — quand tout va bien, l'app est silencieuse. Pas de notification "tout va bien !". L'absence de probleme EST le signal que ca fonctionne. Calm technology.

4. **La fierte se vit en famille, pas sur un ecran** — l'app cree les conditions de la fierte (notification discrete aux parents quand Lucas a tout coche) mais le moment emotionnel se vit entre les personnes, pas entre l'utilisateur et l'app.

## UX Pattern Analysis & Inspiration

### Analyse des Produits Inspirants

**1. Le Bullet Journal (methode Ryder Carroll)**

Le bullet journal est la reference directe de l'experience family-hub. Ce qui fonctionne :
- **Rapide a consulter** — un coup d'oeil et on sait ou on en est
- **Structure par moment** — on planifie par jour, par semaine, par mois. family-hub fait pareil par matin/midi/soir.
- **Le geste de cocher est satisfaisant en soi** — pas besoin de gamification, le "fait" suffit
- **Flexible** — chacun adapte son bullet journal a ses besoins
- **Ce qui echoue** : il faut de la discipline pour le maintenir a jour. L'app elimine cette friction : les rituels recurrents se regenerent automatiquement, pas besoin de les reecrire chaque jour.

**Pattern a retenir** : la densite d'information du bullet journal (compact, scannable, sans decoration) est le bon modele pour la vue colonnes.

**2. Things 3 (Cultured Code) — reference de design epure et profond**

Things 3 est l'archetype du "sobre mais complet" :
- **Surface minimale** : a l'ouverture, on voit l'essentiel — aujourd'hui, ce soir, a venir
- **Profondeur progressive** : on peut ajouter des tags, des projets, des echeances, des checklists — mais seulement quand on en a besoin
- **Micro-interactions soignees** : le geste de cocher est doux, satisfaisant, avec une animation subtile
- **Zero bruit** : pas de badges, pas de couleurs agressives, pas de notifications par defaut
- **Navigation claire** : sidebar discrete, contenu central, pas de surcharge

**Pattern a retenir** : la divulgation progressive (progressive disclosure) — montrer l'essentiel, reveler la complexite a la demande.

**3. Trello / Kanban — la vue colonnes**

La vue colonnes de family-hub s'inspire du pattern kanban, mais repensee :
- **Trello** : colonnes par etat (A faire → En cours → Fait). family-hub : colonnes par **membre**.
- **Ce qui fonctionne** : la visibilite instantanee de l'etat de chaque element, le scan rapide
- **Ce qui ne fonctionne pas pour family-hub** : trop de cartes visibles, interface qui devient vite chargee

**Pattern a retenir** : les colonnes comme structure visuelle principale, mais avec un filtrage contextuel fort (seuls les rituels du moment apparaissent par defaut).

**4. Apple Rappels / Apple Calendar — reference de calm technology**

- **Design systeme coherent** : typographie claire, couleurs sobres, espaces genereux
- **Feedback discret** : check doux, animations subtiles, pas de celebration
- **Integration naturelle** : Siri pour ajouter des rappels en langage naturel (meme pattern que le chat IA)
- **Contextuel** : les rappels geolocalises apparaissent au bon moment

**Pattern a retenir** : le ton visuel — sobre, confiant, pas de decoration inutile.

**5. Le tableau mural dans la cuisine — l'inspiration physique**

Le tableau mural est la metaphore fondatrice du kiosk :
- **Toujours visible** : pas besoin d'ouvrir une app, l'information est la
- **Partage par defaut** : tout le monde voit la meme chose
- **Mise a jour manuelle simple** : on raye, on coche, on ajoute
- **Limite naturelle** : on ne met que l'essentiel, la surface physique force la priorisation

**Pattern a retenir** : le kiosk doit avoir cette qualite "d'un coup d'oeil". Pas de scroll, pas de menu — l'information du moment, lisible a 2 metres.

### Patterns UX Transferables

**Patterns de navigation :**

| Pattern | Source | Application family-hub |
|---|---|---|
| **Vue contextuelle par defaut** | Things 3 ("Aujourd'hui") | Ouvrir l'app = rituels du moment actuel |
| **Divulgation progressive** | Things 3, Apple apps | Surface epuree, details accessibles en un tap |
| **Colonnes scannables** | Trello/Kanban | Vue colonnes par membre, lisible d'un coup d'oeil |
| **Navigation par moment** | Bullet journal (daily/weekly) | Matin / Midi / Soir comme navigation primaire temporelle |

**Patterns d'interaction :**

| Pattern | Source | Application family-hub |
|---|---|---|
| **Check satisfaisant** | Things 3, Bullet journal | Micro-animation sobre au check d'un rituel |
| **Langage naturel** | Apple Siri, ChatGPT | Chat IA : "Ajoute X pour Y" → action instantanee |
| **Optimistic update** | Notion, Linear | Cocher = instantane cote UI, sync en background |
| **Invitation zero-friction** | Slack, WhatsApp | Lien d'invitation → profil pret → colonne visible |

**Patterns visuels :**

| Pattern | Source | Application family-hub |
|---|---|---|
| **Typographie comme design** | Things 3, Linear | Les prenoms, les rituels, les moments — la typo porte l'info |
| **Couleurs par membre** | Bullet journal (codes couleur) | Chaque membre a sa couleur, visible dans les colonnes |
| **Espace blanc genereux** | Apple, Things 3 | Respiration visuelle, pas de surcharge |
| **Pictogrammes enfants** | Apps educatives | Pictogrammes grands, clairs, reconnaissables pour < 7 ans |

### Anti-Patterns a Eviter

| Anti-pattern | Source | Pourquoi l'eviter |
|---|---|---|
| **Interface surchargee** | FamilyWall | Trop de fonctionnalites visibles = paralysie. L'info noit l'info. |
| **Paywall premature** | Cozi, OurFamilyWizard | Le prix refrene avant meme de percevoir la valeur. Le freemium doit offrir une vraie experience. |
| **Gamification forcee** | OurHome, apps d'habitudes | Contraire au principe "miroir, pas coach". Pas de points, pas de streaks, pas de badges au MVP. |
| **Onboarding interminable** | FamilyWall, apps d'entreprise | Plus de 2 etapes = abandon. L'onboarding est l'ennemi de la retention J1. |
| **Notifications excessives** | La majorite des apps | Chaque notification non pertinente est un pas vers la desinstallation. |
| **Tout montrer d'un coup** | FamilyWall, apps all-in-one | Modulaire = activer ce dont on a besoin. Ne pas exposer le calendrier si la famille ne l'utilise pas. |
| **Feedback condescendant** | Apps d'habitudes, fitness apps | "Bravo !" d'un outil = faux et agacant pour les adultes. |

### Strategie d'Inspiration

**A adopter directement :**
- Divulgation progressive (Things 3) — l'essentiel d'abord, la profondeur a la demande
- Check satisfaisant et sobre (Things 3, Bullet journal) — micro-animation douce
- Colonnes par membre scannables (Kanban adapte) — vue signature
- Langage naturel pour les actions (Siri/ChatGPT) — chat IA

**A adapter pour family-hub :**
- Le kanban Trello → colonnes par **membre** (pas par etat), filtrees par **moment**
- Le bullet journal → rituels recurrents auto-generes (eliminer la friction de reecriture quotidienne)
- Le tableau mural → kiosk numerique lisible a distance, info du moment seulement

**A eviter absolument :**
- L'approche FamilyWall (tout montrer d'entree, interface brouillon)
- La gamification comme coeur de l'experience (OurHome)
- Le paywall avant la valeur percue (Cozi Gold, OurFamilyWizard)
- Les notifications agressives et le feedback condescendant

## Design System Foundation

### Choix du Design System

**ShadCN UI** comme fondation pour le web, avec son equivalent React Native (React Native Reusables ou similaire) pour le mobile. Approche cross-platform basee sur Tailwind CSS / NativeWind.

| Aspect | Decision |
|---|---|
| **Web** | ShadCN UI (composants copy-paste, Tailwind CSS, Radix UI) |
| **Mobile (React Native)** | Equivalent ShadCN pour React Native (NativeWind + composants adaptes) |
| **Kiosk** | Application React Native avec mode kiosk active (meme codebase que le mobile) |
| **Theming** | Tailwind CSS variables + CSS custom properties pour les tokens de design |
| **Icones** | Lucide Icons (inclus dans l'ecosysteme ShadCN) |

### Justification du Choix

1. **Thomas le connait deja** — pas de courbe d'apprentissage, productivite immediate
2. **Zero lock-in** — les composants sont dans le projet, pas dans un `node_modules`. Modification directe, pas de surcharge.
3. **Esthetique alignee** — ShadCN produit un rendu sobre, typographique, avec de l'espace blanc — exactement le style Things 3 / Apple vise
4. **Gratuit et open source** — aucun cout de licence
5. **Ecosysteme Tailwind** — coherence entre web et mobile via NativeWind, design tokens partages
6. **Customisation par IA** — Thomas utilise deja l'IA pour customiser les composants, ce workflow est maintenu

### Approche d'Implementation

**Monorepo avec design tokens partages :**

```
packages/
  ui/               # Composants ShadCN customises (web)
  ui-native/         # Composants React Native equivalents
  tokens/            # Design tokens partages (couleurs, typo, spacing)
```

**Strategie de tokens :**
- **Couleurs** : palette sobre (neutres dominants) + une couleur par membre du foyer
- **Typographie** : une famille de police lisible, hierarchie claire (titres / corps / labels)
- **Spacing** : systeme de spacing coherent (4px base grid)
- **Radius** : arrondis doux, coherents entre composants
- **Dark mode** : prevu des le depart via les CSS variables de ShadCN

**Composants custom a creer (non couverts par ShadCN) :**

| Composant | Usage | Specificite |
|---|---|---|
| **RitualCard** | Carte de rituel dans la vue colonnes | Check, statut, pictogramme, couleur membre |
| **MemberColumn** | Colonne d'un membre dans la vue principale | Header avec avatar/couleur, liste de rituels |
| **MomentSelector** | Navigation matin/midi/soir | Tabs ou segments, mise en avant du moment actuel |
| **ChatBubble** | Messages dans le chat IA | Distinction utilisateur/IA, transparence IA |
| **PictogramPicker** | Selection de pictogramme pour un rituel enfant | Grille de pictogrammes, preview |
| **WeeklyRecap** | Recapitulatif hebdomadaire | Barres de progression par membre, ton factuel |
| **StatusBadge** | Indicateur de statut (a faire / en cours / termine) | Couleurs sobres, transition animee |

### Strategie de Customisation

**Profils visuels adaptatifs :**

| Profil | Adaptations |
|---|---|
| **Parent (defaut)** | Taille standard, interface complete, toutes les actions |
| **Enfant >= 7 ans** | Taille legerement plus grande, interface simplifiee |
| **Enfant < 7 ans** | Pictogrammes grands, texte minimal, boutons larges tactiles |
| **Prestataire** | Interface reduite aux vues autorisees, lecture prioritaire |
| **Kiosk** | Mode React Native plein ecran, elements plus grands, lisible a distance, pas de navigation complexe |

Ces adaptations sont gerees par les tokens Tailwind (tailles, espacement) et la logique de composants (quels elements afficher selon le role), pas par des themes visuellement differents.

## Experience Definissante

### L'Experience Signature

**family-hub en une phrase : "C'est l'app qui gere toute ta famille."**

Pas juste les taches. Pas juste le calendrier. Pas juste la communication. Tout. Centree sur la famille, pas sur un individu. L'utilisateur ouvre l'app et voit ce qui le concerne maintenant, dans le contexte de son foyer.

**L'interaction signature :** Tu ouvres l'app le matin, tu vois TA colonne avec tes rituels du matin. Tu coches, le rituel se grise et descend. Tu swipes pour voir la colonne de ton conjoint ou de tes enfants. Tout le monde voit les changements en temps reel.

**Exemples de reference :**

| Produit | Experience definissante | family-hub |
|---|---|---|
| Tinder | "Swipe pour matcher" | "Swipe pour voir les colonnes de ta famille" |
| Instagram | "Scroll ton feed de photos" | "Scroll tes rituels du moment" |
| Trello | "Deplace des cartes entre colonnes" | "Coche tes rituels dans ta colonne" |
| WhatsApp | "Envoie un message a n'importe qui" | "Dis a l'IA ce que tu veux, c'est fait" |

### Modele Mental des Utilisateurs

**Comment les familles gerent aujourd'hui :**

| Outil actuel | Ce qu'il couvre | Ce qu'il manque |
|---|---|---|
| **Groupes WhatsApp** | Communication familiale (elargie et foyer) | Pas d'organisation, pas de structure, les messages se noient |
| **Apps de partage photos** (FamilyAlbum, etc.) | Photos avec la famille elargie | Deconnecte de l'organisation quotidienne |
| **Google Calendar partage** | Rendez-vous, evenements | Pas de rituels, pas de vue par membre, pas de statut |
| **Post-its / tableau mural** | Rappels visuels, taches du jour | Pas partage, pas de suivi, pas de recapitulatif |
| **La memoire d'un parent** | Tout le reste | Charge mentale, oublis, conflits |

**Le modele mental que family-hub doit creer :**

Les familles pensent aujourd'hui en outils fragmentes ("WhatsApp pour parler, le calendrier pour les rdv, les post-its pour les courses"). family-hub doit installer un nouveau modele : **"Tout ce qui concerne ma famille est dans un seul endroit."** Le passage du fragment a l'unifie.

Ce modele est familier — c'est ce que les entreprises ont fait avec Slack, Notion ou Google Workspace. family-hub fait la meme chose pour le foyer.

### Criteres de Succes de l'Experience Coeur

| Critere | Mesure | Seuil |
|---|---|---|
| **"Ca marche tout de suite"** | Temps entre l'ouverture de l'app et la premiere action utile | < 3 secondes |
| **"Je vois ce qui me concerne"** | La colonne du membre s'affiche avec les rituels du bon moment | 100% contextuel (matin = rituels du matin) |
| **"C'est fait"** | Le geste de validation est satisfaisant et le feedback immediat | < 200ms feedback UI |
| **"Les autres le voient"** | Le changement de statut est visible sur les autres appareils | < 2 secondes sync |
| **"Je n'ai pas besoin qu'on m'explique"** | Aucun tutoriel necessaire pour cocher un rituel | Zero onboarding pour l'action coeur |

### Patterns UX — Combinaison Familier + Innovant

**Ce qui est familier (pas besoin d'eduquer) :**
- Swipe horizontal entre les vues (Instagram stories, Tinder)
- Swipe vertical pour naviguer entre sections (apps modernes)
- Cocher une case pour valider (to-do lists universelles)
- Chat textuel avec un assistant (ChatGPT, Siri)

**Ce qui est innovant (le twist family-hub) :**
- Les colonnes ne sont pas par etat (a faire/fait) mais par **membre de la famille** — c'est nouveau
- Le contexte temporel est la navigation principale (matin/midi/soir) — pas vu ailleurs
- La navigation 2D : swipe horizontal = membres, swipe vertical = moments — unique
- L'IA agit sur la structure familiale, pas sur un espace personnel — unique
- Le geste de validation a un effet visible par les autres en temps reel — social sans reseau social

**Comment on enseigne le nouveau :**
- L'onboarding genere une premiere routine → l'utilisateur decouvre la vue colonnes organiquement
- Le swipe horizontal est suggere par un indicateur visuel discret (les bords des colonnes voisines sont visibles)
- Le swipe vertical est suggere par les tabs matin/midi/soir visibles en haut (indicateur de position)
- Le contexte temporel (matin/midi/soir) est affiche comme des tabs ou segments en haut — pattern familier de navigation

### Mecanique de l'Experience Coeur

**1. Initiation — Ouvrir l'app**
- L'app s'ouvre sur **ma colonne, moment actuel**
- Si c'est le matin → rituels du matin. Si c'est 14h → rituels du midi.
- Les bords des colonnes voisines sont visibles a gauche et a droite (invitation au swipe horizontal)
- Un selecteur matin/midi/soir est visible en haut comme indicateur de position

**2. Navigation 2D — Grille membres x moments**
- **Swipe horizontal** = naviguer entre les colonnes des **membres** de la famille
- **Swipe vertical** = naviguer entre les **moments** (matin ↕ midi ↕ soir)
- Le selecteur matin/midi/soir en haut se met a jour selon la position verticale
- Chaque position dans la grille = un membre + un moment = une liste de rituels

**3. Interaction — Consulter et valider**
- Les rituels sont affiches en liste verticale dans la colonne
- Chaque rituel montre : pictogramme (si enfant < 7 ans), nom du rituel, statut actuel
- **Pour valider** : un tap sur le rituel ou un swipe sur la ligne
- **Feedback de validation** : le rituel se grise avec une micro-animation douce, descend dans la liste sous les rituels actifs
- Les rituels "a faire" restent en haut, les "termines" en bas en grise — hierarchie visuelle claire

**4. Feedback — Confirmation et synchronisation**
- Optimistic update : le grisage est instantane (< 200ms)
- Sync temps reel : les autres membres voient le changement en < 2 secondes
- Pas de toast "Rituel termine !", pas de popup — le changement visuel suffit
- Si hors ligne : le rituel se grise quand meme, un badge discret indique "synchronisation en attente"

**5. Navigation — Voir les autres**
- Chaque colonne a un header avec le prenom et la couleur du membre
- Un parent voit toutes les colonnes, un enfant voit la sienne (+ celles autorisees par les parents)
- Un tap sur le header d'une colonne membre ouvre la fiche membre (consignes, allergies, etc.)

**6. Extension — Au-dela des rituels**
- Le chat IA est accessible en un tap (FAB ou onglet en bas)
- Les suggestions contextuelles apparaissent en haut de la colonne quand pertinent
- La navigation vers les autres modules (calendrier v1.2, communication v1.5) se fait via une barre de navigation principale en bas ou un menu lateral

## Visual Design Foundation

### Systeme de Couleurs

**Philosophie : neutralite comme base, couleur des membres comme identite.**

family-hub ne s'impose pas visuellement. La palette de base est neutre et lumineuse — les couleurs viennent des membres de la famille, pas de l'app.

**Palette de base (neutres) :**

| Token | Valeur | Usage |
|---|---|---|
| `--bg-primary` | `#FAFAFA` | Fond principal (mode clair) |
| `--bg-secondary` | `#F5F5F5` | Fond des cartes, colonnes |
| `--bg-elevated` | `#FFFFFF` | Elements en elevation (modals, popovers) |
| `--text-primary` | `#1A1A1A` | Texte principal |
| `--text-secondary` | `#6B7280` | Texte secondaire, labels |
| `--text-muted` | `#9CA3AF` | Texte desactive, placeholders |
| `--border-default` | `#E5E7EB` | Bordures, separateurs |
| `--border-subtle` | `#F3F4F6` | Bordures subtiles |

**Couleurs des membres (attribuees automatiquement, personnalisables) :**

| Slot | Couleur par defaut | Usage |
|---|---|---|
| Membre 1 | `#3B82F6` (bleu) | Header colonne, avatar ring, rituels |
| Membre 2 | `#8B5CF6` (violet) | Header colonne, avatar ring, rituels |
| Membre 3 | `#F59E0B` (ambre) | Header colonne, avatar ring, rituels |
| Membre 4 | `#10B981` (emeraude) | Header colonne, avatar ring, rituels |
| Membre 5 | `#EF4444` (rouge doux) | Header colonne, avatar ring, rituels |
| Membre 6+ | `#6366F1` (indigo) | Extension de palette |

Les couleurs des membres sont le seul element chromatique fort de l'interface. Elles servent a identifier visuellement qui est qui dans la vue colonnes et dans les recapitulatifs.

**Couleurs semantiques :**

| Token | Valeur | Usage |
|---|---|---|
| `--success` | `#10B981` | Rituel termine (check) |
| `--warning` | `#F59E0B` | Attention douce (suggestion IA) |
| `--error` | `#EF4444` | Erreur, etat critique |
| `--info` | `#3B82F6` | Information, lien |

### Theme Contextuel Temporel

**L'app change subtilement d'atmosphere selon le moment de la journee.**

| Moment | Ambiance | Fond | Accents | Temperature |
|---|---|---|---|---|
| **Matin** (6h-12h) | Chaud, lumineux, energisant | Blanc chaud `#FFFBF5` | Tons dores/ambre legers | Chaude |
| **Midi** (12h-17h) | Neutre, clair, productif | Blanc neutre `#FAFAFA` | Palette par defaut | Neutre |
| **Soir** (17h-21h) | Doux, ambre, apaise | Creme doux `#FFF8F0` | Tons chauds attenues | Chaude douce |
| **Nuit** (21h-6h) | Sombre, calme, minimal | Dark mode `#0F172A` | Couleurs desaturees | Froide douce |

La transition entre les ambiances est progressive (fondu de 30 minutes). Le changement est ressenti, pas remarque — comme la lumiere naturelle qui change dans une piece.

**Le theming famille** (v2+) permettra a chaque foyer de personnaliser sa palette : couleurs des membres, fond de base, mode sombre force ou adaptatif.

### Systeme Typographique

**Police principale : Inter**

Inter est choisie pour :
- Excellente lisibilite sur ecran (concue pour les interfaces)
- Support complet des caracteres latins etendus (francais, accents)
- Variable font = poids multiples sans chargement supplementaire
- Gratuite, open source, largement supportee
- Esthetique sobre et moderne, coherente avec le ton Things 3 / Apple

**Echelle typographique :**

| Token | Taille | Poids | Line-height | Usage |
|---|---|---|---|---|
| `--text-xs` | 12px | 400 | 1.5 | Badges, metadata, timestamps |
| `--text-sm` | 14px | 400 | 1.5 | Labels, texte secondaire |
| `--text-base` | 16px | 400 | 1.6 | Corps de texte, noms de rituels |
| `--text-lg` | 18px | 500 | 1.5 | Sous-titres, prenoms dans colonnes |
| `--text-xl` | 20px | 600 | 1.4 | Titres de sections |
| `--text-2xl` | 24px | 600 | 1.3 | Titres principaux |
| `--text-3xl` | 30px | 700 | 1.2 | Kiosk — prenoms, moment actuel |
| `--text-4xl` | 36px | 700 | 1.1 | Kiosk — heure, titre principal |

**Hierarchie typographique par contexte :**

| Contexte | Taille de base | Adaptation |
|---|---|---|
| **Mobile** | 16px | Compact, lisible au pouce |
| **Web** | 16px | Espacement genereux |
| **Kiosk** | 20-24px | Plus grand, lisible a 2m |
| **Enfant < 7 ans** | 18-20px | Plus grand, plus gras |

### Systeme de Spacing et Layout

**Grille de base : 4px**

Tout l'espacement est base sur des multiples de 4px pour une coherence systematique.

| Token | Valeur | Usage |
|---|---|---|
| `--space-1` | 4px | Micro-espacement (entre icone et texte) |
| `--space-2` | 8px | Espacement serre (intra-composant) |
| `--space-3` | 12px | Padding composants compacts |
| `--space-4` | 16px | Padding standard composants |
| `--space-5` | 20px | Gap entre elements |
| `--space-6` | 24px | Gap entre sections |
| `--space-8` | 32px | Separation de blocs |
| `--space-10` | 40px | Marges de page (mobile) |
| `--space-12` | 48px | Separation majeure |
| `--space-16` | 64px | Padding page (desktop/kiosk) |

**Arrondis (border-radius) :**

| Token | Valeur | Usage |
|---|---|---|
| `--radius-sm` | 4px | Badges, petits elements |
| `--radius-md` | 8px | Boutons, inputs |
| `--radius-lg` | 12px | Cartes, rituels |
| `--radius-xl` | 16px | Modals, sheets |
| `--radius-full` | 9999px | Avatars, FAB |

**Layout par plateforme :**

| Plateforme | Disposition colonnes | Navigation moments |
|---|---|---|
| **Mobile** | 1 colonne visible + bords voisins, swipe horizontal entre membres | Swipe vertical entre matin/midi/soir, tabs indicateurs en haut |
| **Web** | 2-4 colonnes visibles selon largeur, scroll horizontal | Tabs matin/midi/soir clickables en haut |
| **Kiosk** | Toutes les colonnes visibles (2-5 membres), pas de scroll | Moment actuel affiches, navigation par tap sur les tabs |

### Accessibilite

**Standard : WCAG 2.1 niveau AA**

| Critere | Exigence | Implementation |
|---|---|---|
| **Contraste texte** | Ratio minimum 4.5:1 (texte normal), 3:1 (gros texte) | Palette testee sur tous les fonds, mode clair et sombre |
| **Cibles tactiles** | Minimum 44x44px | Boutons, checks, zones de tap des rituels |
| **Taille de police** | Minimum 14px pour le texte lisible | Pas de texte en dessous de 12px (`--text-xs` pour metadata uniquement) |
| **Couleur seule** | Ne jamais transmettre une info uniquement par la couleur | Icones + couleur pour les statuts, labels textuels disponibles |
| **Mouvement** | Respecter `prefers-reduced-motion` | Animations desactivables, pas d'animation essentielle |
| **Mode sombre** | Contraste maintenu en dark mode | Tokens adaptatifs, test systematique des deux modes |
| **Enfants** | Interface enfant avec pictogrammes + texte | Pictogrammes toujours accompagnes de labels (sauf < 7 ans : pictogramme seul OK si univoque) |

## Design Direction Decision

### Directions de Design Explorees

Six directions visuelles ont ete generees et presentees via un showcase HTML interactif (`ux-design-directions.html`) :

1. **Bullet Journal** — Ultra-minimal, typographique, paper-like
2. **Tableau Familial** — Cartes chaleureuses, fond chaud, barre d'outils
3. **Dashboard Moderne** — Structure claire, progression visible, style productivite
4. **Kiosk-First** — Texte tres grand, cibles tactiles genereuses
5. **Contextuel Immersif** — Atmosphere temporelle comme heros visuel
6. **Hybride Epure** — Synthese equilibree, propre et fonctionnel

### Direction Choisie

**Base : Dashboard Moderne (Direction 3)** avec des modifications significatives :

1. **Rituels en cartes, pas en lignes** — Chaque rituel est une carte plus haute et plus large (pas une ligne de to-do). Pictogramme, nom du rituel, couleur du membre. L'objectif est de donner une texture "rituel familial" et non "tache a cocher". La validation d'un rituel produit un effet visuel doux (fondu, grisage progressif) plutot qu'un simple check.

2. **Navigation par Home Hub contextuel** — L'app ne s'ouvre pas directement sur les rituels mais sur un **ecran d'accueil avec des blocs de fonctionnalites** (Rituels, Chat, Calendrier, Taches, etc.). Les blocs sont suggeres et priorises par le contexte (heure, lieu). Chaque bloc montre un apercu contextuel ("3/5 rituels faits", "RDV 14h dentiste"). Un scroll vers le bas revele la liste complete de toutes les fonctionnalites disponibles.

3. **Assistant IA en FAB flottant** — Pas de panneau slide-up ni de barre integree. Un petit bouton flottant (style Direction 1 — Bullet Journal) accessible en un tap depuis n'importe quel ecran (Home Hub + a l'interieur des modules). Ouvre l'assistant IA en mode texte ou vocal.

4. **Selecteur Matin/Midi/Soir conserve** — Le selecteur de moment en haut de la vue rituels est valide tel quel.

5. **Navigation de moment par scroll continu** — Le passage entre Matin/Midi/Soir se fait de deux facons combinees : tap sur les tabs en haut, ou scroll vertical continu dans la liste de rituels. Quand l'utilisateur scrolle au-dela du dernier rituel du Matin, la vue transitionne vers Midi et le selecteur en haut se met a jour automatiquement. Le flux est un long defilement segmente par moments.

6. **Kiosk comme flux configurable** — Le mode kiosk a son propre flux de navigation, distinct du mobile, mais utilisant les memes composants. L'administrateur du foyer configure : l'ecran par defaut (vue rituels foyer, calendrier, hub restreint...), les modules accessibles, le niveau de navigation autorise. Le kiosk peut revenir sur un hub plus restreint (moins d'outils) ou sur le hub complet selon la configuration. La navigation gauche/droite entre membres est possible si configuree.

### Rationale de Design

| Decision | Pourquoi |
|---|---|
| Dashboard Moderne comme base | Structure claire, informationnel, progression visible — correspond au besoin de "savoir ou on en est" |
| Rituels en cartes | Differencier family-hub d'un gestionnaire de taches. Les rituels sont des moments de vie, pas des lignes a cocher. La carte donne une texture plus chaleureuse et familiale. |
| Home Hub contextuel | L'app a vocation a heberger beaucoup de fonctionnalites a terme. Un hub permet d'en ajouter sans refondre la navigation. Le contexte (temps/lieu) priorise automatiquement ce qui est pertinent — divulgation progressive appliquee a la navigation. |
| FAB IA flottant | Acces constant a l'assistant sans encombrer l'interface. Un tap = l'assistant s'ouvre. Coherent avec le principe "IA enrichit, ne bloque jamais". |
| Scroll continu entre moments | Plus naturel que des tabs cloisonnes. Le scroll vertical est un geste instinctif. La double interaction (tap tabs + scroll) couvre tous les usages. |
| Kiosk configurable | Le kiosk n'est pas un "mode simplifie" mais un vrai produit avec son propre flux. L'admin configure ce qui s'affiche — ca donne de la valeur au kiosk comme produit a part entiere. |

### Approche d'Implementation

**Flux de navigation principal (mobile/web) :**

```
Home Hub (contextuel)
  ├── Bloc Rituels → Module Rituels (vue colonnes, cartes, moments)
  ├── Bloc Chat → Module Communication (canaux, messages)
  ├── Bloc Calendrier → Module Calendrier (vue jour/semaine)
  ├── Bloc Taches → Module Taches (taches ponctuelles)
  ├── ... (modules futurs)
  └── Scroll vers le bas → Liste complete de tous les modules
```

**Flux de navigation kiosk :**

```
Ecran par defaut (configure par l'admin)
  ├── Navigation gauche/droite entre membres (si autorise)
  ├── Navigation entre moments (tabs ou scroll)
  ├── Retour vers Hub Kiosk (restreint ou complet selon config)
  └── Acces IA (si autorise par l'admin)
```

**Composants cles a designer :**

| Composant | Description |
|---|---|
| **HomeHub** | Ecran d'accueil avec grille de blocs contextuels, suggeree par le contexte |
| **FeatureBlock** | Carte de module avec icone, titre, apercu contextuel (ex: "3/5 rituels faits") |
| **RitualCard** | Carte de rituel dans le module Rituels — pictogramme, nom, statut, couleur membre. Plus haute qu'une ligne, plus chaleureuse. |
| **MomentSelector** | Selecteur Matin/Midi/Soir en haut du module Rituels, synchronise avec le scroll vertical |
| **ContinuousScrollMoments** | Container de scroll continu qui segmente les rituels par moment et met a jour le MomentSelector |
| **AIFloatingButton** | FAB flottant pour l'assistant IA, present sur tous les ecrans |
| **ModuleHeader** | Header de module avec bouton retour vers le Home Hub |
| **KioskConfig** | Interface admin pour configurer le flux kiosk — ecran par defaut, modules autorises, niveau de navigation |
| **KioskHub** | Version du Home Hub adaptee au kiosk — blocs plus grands, selection restreinte selon la config admin |

## User Journey Flows

### Flux 1 : Onboarding Sophie — De l'App Store au premier matin

**Objectif** : Sophie telecharge l'app, cree son foyer, et voit ses colonnes fonctionnelles en < 90 secondes.

**Sequence ecran par ecran :**

| Ecran | Contenu | Interaction | Duree cible |
|---|---|---|---|
| **Bienvenue** | Logo, baseline "L'app qui gere toute ta famille", bouton "Commencer" | Tap | 3s |
| **Question 1** | "Combien de membres dans votre foyer ?" — stepper numerique (2-10) | Tap +/- | 5s |
| **Question 2** | "Quel moment est le plus chaotique ?" — 3 choix : Matin / Midi / Soir | Tap | 3s |
| **Generation IA** | Animation discrete de generation (2-3s), puis affichage de la routine | Attente | 3s |
| **Routine generee** | Liste des rituels generes par moment, modifiables. "L'IA a cree ca pour vous — ajustez si besoin" | Scroll, edit, tap "Continuer" | 30s |
| **Decouverte IA** | Zoom/spotlight sur le FAB IA : "A tout moment, dites a l'assistant ce que vous voulez. Il cree, modifie ou supprime vos rituels en une phrase." + exemple anime | Tap "Compris" ou tap FAB pour essayer | 5s |
| **Prenoms** | Champ par membre (Membre 1, 2...), couleur attribuee automatiquement | Saisie texte | 20s |
| **Home Hub** | Premier affichage — bloc "Rituels du matin" en evidence | Tap sur le bloc | 2s |
| **Vue colonnes** | Sa colonne avec ses rituels en cartes. Bords des colonnes voisines visibles | Tap pour cocher | Infini |

**Temps total onboarding : < 90 secondes** avant d'arriver au Home Hub.

**Principes** : Pas de tutoriel (le premier tap sur une ritual card EST le tutoriel). L'IA montre sa valeur immediatement (routine generee en 2 questions). Le seul moment "guide" est le spotlight sur le FAB IA (5 secondes).

### Flux 2 : Invitation Marc — Du lien au "sa colonne est prete"

**Deux scenarios selon que le profil existe ou non :**

**Scenario A : Sophie a deja cree le profil de Marc (avec rituels assignes)**

Le lien d'invitation contient un token lie au profil existant. A l'activation, le compte Marc s'attache automatiquement au profil. Rituels, couleur, historique — tout est deja la.

| Ecran (cote Marc) | Contenu | Duree cible |
|---|---|---|
| **Lien recu** | Deep link ou lien web → ouvre l'app ou l'App Store | 2s |
| **Ecran d'invitation** | "Sophie vous invite — le profil Marc vous attend" | 3s |
| **Prenom + authentification** | Confirmer le prenom + email ou Apple/Google sign-in | 10s |
| **Home Hub** | Sa colonne est la avec tous ses rituels deja assignes | Immediat |

**Scenario B : Pas de profil prealable (invitation directe)**

Le lien est generique (foyer). Un nouveau profil membre est cree a l'activation. La colonne est vide, l'IA propose de generer des rituels.

| Ecran (cote Marc) | Contenu | Duree cible |
|---|---|---|
| **Lien recu** | Deep link → ecran d'invitation | 2s |
| **Ecran d'invitation** | "Sophie vous invite a rejoindre le foyer Dupont" | 3s |
| **Prenom + authentification** | Entrer son prenom + authentification | 10s |
| **Home Hub** | Colonne vide + suggestion IA : "Voulez-vous generer des rituels ?" | Immediat |

**Liaison profil** : Sophie peut aussi creer un profil, assigner des rituels, puis inviter plus tard — le lien se lie au profil existant. Et elle peut assigner un profil orphelin a un compte existant depuis le module Famille.

**Temps total adoption : < 30 secondes** entre le tap sur le lien et la premiere colonne visible.

### Flux 3 : Rituel quotidien — La boucle coeur

**Objectif** : Ouvrir l'app → voir mes rituels du moment → cocher → les autres voient.

| Action | Ce qui se passe | Feedback | Duree |
|---|---|---|---|
| **Ouvrir l'app** | Home Hub avec blocs contextuels. Rituels du matin a 7h, du midi a 12h, du soir a 18h | Apercu "3/5 faits" sur le bloc | < 1s |
| **Tap bloc Rituels** | Transition vers le module Rituels. Ma colonne, moment actuel | Animation douce | < 300ms |
| **Voir mes rituels** | Ritual cards empilees : a faire en haut, termines en bas (grises). Rituels parents affichent la progression (ex: "3/5") | Pictogramme + nom + statut | Instantane |
| **Cocher un rituel** | Tap sur la card → micro-animation → card se grise et glisse vers le bas | Optimistic update < 200ms | < 200ms |
| **Expand un rituel parent** | Tap sur un rituel imbrique → la carte s'expand pour montrer les micro-rituels | Accordion anime | < 300ms |
| **Scroll vertical** | Depasser les rituels du matin → transition vers midi → selecteur se met a jour | Transition fluide | Continu |
| **Swipe horizontal** | Voir la colonne d'un autre membre | Bords des colonnes voisines visibles | Gesture naturel |
| **Retour Home Hub** | Bouton retour ou swipe back. Le bloc Rituels affiche le nouveau compte | Mise a jour du badge | < 300ms |
| **FAB IA** | Tap → modal s'ouvre. "Ajoute X pour Y" en texte ou vocal | Reponse IA + confirmation | 2-5s |

**Navigation de moment** : Le passage entre Matin/Midi/Soir se fait de deux facons combinees — tap sur les tabs en haut, ou scroll vertical continu dans la liste de rituels. Le selecteur se synchronise avec la position de scroll.

### Flux 4 : Babysitter Marie — Zero-friction, vue restreinte

**Cote Sophie (configuration) :**

| Etape | Detail |
|---|---|
| **Inviter prestataire** | Depuis le module Famille : prenom, role (babysitter/nounou/grand-parent), duree d'acces (ce soir / recurrent) |
| **Acces autorises** | Checkboxes : Rituels du soir ✓, Consignes/allergies ✓, Calendrier ✗, Chat ✗ |
| **Lien genere** | Partage via SMS/WhatsApp avec expiration configurable |

**Cote Marie :**

| Ecran | Contenu | Duree cible |
|---|---|---|
| **Lien recu** | Deep link → ecran d'invitation | 2s |
| **Invitation** | "Sophie vous invite comme babysitter ce soir" | 3s |
| **Prenom** | Un champ, pas d'email, pas de mot de passe — acces par jeton | 5s |
| **Home Hub restreint** | Seulement les blocs autorises : Rituels du soir + Consignes | 2s |
| **Vue colonnes enfants** | Colonnes de Lucas, Emma, Leo avec rituels du soir en cartes | Immediat |
| **Consignes** | Fiches enfants : allergies, medicaments, numeros d'urgence — en un tap | A la demande |

**Temps total Marie : < 15 secondes.** Pas de compte complet — l'acces est un jeton temporaire ou recurrent. Sophie et Marc voient en temps reel que Marie progresse.

### Flux 5 : Enfant Lucas — Autonomie, fierte et IA

**Adaptations du profil enfant (>= 7 ans) :**

| Aspect | Adulte | Enfant >= 7 ans |
|---|---|---|
| **Home Hub** | Tous les blocs | Blocs reduits (Rituels principalement) |
| **Ritual cards** | Texte + pictogramme optionnel | Pictogramme toujours present + texte, cards plus grandes |
| **Navigation** | Toutes les colonnes, tous les modules | Sa colonne par defaut, colonnes autorisees en swipe |
| **FAB IA** | Actif | Desactive par defaut (activable par les parents) |
| **Validation** | Tap simple | Tap simple — meme geste, meme dignite |

**L'IA comme voix de l'enfant :**

Quand l'IA enfant est activee par les parents, l'enfant peut s'exprimer avec ses mots :
- "J'aimerais qu'on fasse une soiree film" → L'IA traduit en action concrete
- Si l'enfant a la permission → l'IA execute (cree le rituel)
- Si l'enfant n'a pas la permission → l'IA redirige vers le parent : "Je vais demander a tes parents" → notification d'approbation envoyee au parent
- "Je veux faire mes devoirs avant la douche" → l'IA reordonne les micro-rituels de sa colonne

**Principes IA enfant** : L'enfant s'exprime avec ses mots, l'IA comprend sans syntaxe precise. L'IA reformule : "Si j'ai bien compris, tu voudrais..." (pedagogique). Pas de "Tu n'as pas le droit" → toujours "Je vais demander a tes parents" (zero punition). Garde-fous : pas de suppression, pas de modification des rituels des autres.

**Deblocage progressif des permissions :**

| Etape | Permission | Declencheur |
|---|---|---|
| **Depart** | Voir et cocher SA colonne uniquement | Profil cree |
| **+2 semaines** | Voir les colonnes des freres/soeurs | Parent active manuellement |
| **+1 mois** | Proposer des modifications a ses rituels | Parent active |
| **+3 mois** | Acces au chat IA (supervise) | Parent active |

### Flux supplementaire : Ajout d'un device Kiosk

| Etape | Detail |
|---|---|
| **Admin** | Ouvre Reglages → Section Appareils / Kiosk → "Ajouter un appareil kiosk" |
| **Code genere** | QR code ou code a saisir affiche |
| **Sur la tablette** | Ouvrir l'app en mode kiosk → scanner le QR ou entrer le code |
| **Liaison** | Tablette liee au foyer en **profil foyer** (pas un profil membre) |
| **Configuration** | Admin definit : ecran par defaut, modules autorises, niveau de navigation |
| **Identification optionnelle** | Un membre peut s'identifier sur le kiosk (tap avatar) pour attribuer l'action, puis retour en mode foyer apres inactivite |

**Profil foyer (kiosk)** : Represente le foyer entier, pas une personne. Les actions sont marquees "Depuis le kiosk" dans l'historique (ou attribuees si identification optionnelle). Vue par defaut = toutes les colonnes ou vue configuree par l'admin.

### Pattern : Rituels imbriques (parent → micro-rituels)

**Principe** : Un rituel peut contenir un ensemble de micro-rituels (sous-etapes). Le feed affiche une seule carte pour le rituel parent — tap pour expand et voir le detail.

**Structure :**

| Niveau | Exemple | Affichage |
|---|---|---|
| **Rituel parent** | "Routine du matin" (06:45-08:15) | 1 carte avec progression "2/5" |
| **Micro-rituel 1** | "Se brosser les dents" | Ligne dans l'expand de la carte |
| **Micro-rituel 2** | "Faire le lit" | Ligne dans l'expand |
| **Micro-rituel 3** | "S'habiller" | Ligne dans l'expand |

**Validation :**

| Action | Resultat |
|---|---|
| Cocher le rituel parent | Tous les micro-rituels marques fait d'un coup |
| Cocher les micro-rituels un par un | Le parent affiche la progression (3/5) et se complete quand tout est coche |
| Mix | Certains micro-rituels coches + coche le parent → le reste marque fait |

**Configuration d'un rituel (divulgation progressive) :**

| Niveau | Visible | Detail |
|---|---|---|
| **Creation simple** | Nom + "Creer" (ou via IA) | Par defaut |
| **+1 tap** | Date, heure, recurrence | Tap "Options" |
| **+1 tap** | Ajouter des sous-etapes (micro-rituels) | Bouton "Ajouter des etapes" |
| **+1 tap** | Assignation membre, notifications, pictogramme | Section avancee |

**Usage par profil** : Un adulte presse voit "Routine du matin" collapse et peut tout cocher d'un tap. Un enfant en apprentissage voit la routine expand par defaut pour cocher etape par etape. Le parent configure si l'expand est par defaut ou non.

### Pattern : Historique d'activite

**L'historique est un module transversal** accessible depuis le Home Hub.

| Aspect | Detail |
|---|---|
| **Contenu** | Toutes les actions de tous les membres, tous modules confondus |
| **Exemples** | "Sophie a coche Preparer cartables (08:12)", "Marc a cree Cours de judo", "Lucas a propose Soiree film (en attente)", "Rituel Dentiste assigne a Marc par Sophie", "Coche depuis le kiosk" |
| **Filtres** | Par membre, par module, par date |
| **Acces** | Parents : historique complet. Enfants : leur propre historique. Prestataire : historique de leur session. |
| **Alimente** | Le recapitulatif hebdomadaire (stats), les suggestions IA ("Lucas oublie souvent la douche le soir"), la vue admin |

### Journey Patterns

**Patterns de navigation :**

| Pattern | Description | Utilise dans |
|---|---|---|
| **Home Hub → Module → Retour** | Le Home Hub est le point d'ancrage. Chaque module a un bouton retour. | Tous les flux |
| **Lien invitation → Ecran minimal → Colonne prete** | L'invitation est un deep link. Minimum d'info demande. Valeur immediate. | Flux 2, 4 |
| **Scroll continu entre moments** | Le scroll vertical transitionne entre matin/midi/soir sans rupture. | Flux 3, 5 |
| **Hub adapte au role** | Le Home Hub montre des blocs differents selon le profil. | Flux 4, 5 |

**Patterns de feedback :**

| Pattern | Description | Utilise dans |
|---|---|---|
| **Optimistic update** | Action refletee immediatement cote UI, sync en arriere-plan | Tous (cocher rituel) |
| **Notification discrete aux parents** | Enfant ou prestataire complete ses rituels | Flux 4, 5 |
| **Apercu contextuel sur le bloc** | Le bloc Hub montre "3/5 faits" sans entrer dans le module | Flux 3 |
| **Zero feedback celebratif** | Pas de "Bravo!", pas de confettis. Le changement visuel suffit. | Tous |

### Flow Optimization Principles

| Principe | Application |
|---|---|
| **Moins de taps, plus de valeur** | Onboarding en 2 questions. Invitation en 1 champ. Cocher en 1 tap. |
| **Le contexte elimine les choix** | Moment actuel selectionne. Ma colonne affichee. Blocs pertinents en haut. |
| **Erreur = invisible** | Pas de message d'erreur rouge. Hors ligne = badge discret. Sync echouee = retry silencieux. |
| **L'onboarding est l'usage** | Pas de tutoriel. Le premier tap sur une ritual card enseigne l'interaction. |
| **L'IA est toujours a un tap** | FAB flottant sur tous les ecrans. Spotlight a l'onboarding pour montrer sa valeur. |
| **La profondeur existe, elle ne s'impose pas** | Rituel simple par defaut, configuration avancee a la demande. Rituels imbriques pour ceux qui en ont besoin. |

## Component Strategy

### Design System Components

**ShadCN UI** fournit les composants fondation reutilisables directement :

| Categorie | Composants ShadCN utilises |
|---|---|
| **Navigation** | Tabs (selecteur moment), NavigationMenu, Breadcrumb, Sheet (bottom sheet pour panels) |
| **Formulaires** | Input, Button, Checkbox, Switch, Select, Form, Label |
| **Feedback** | Toast (notifications discretes), Badge (compteurs), Progress (barres de progression), Skeleton (loading) |
| **Layout** | Card (base des composants custom), Separator, ScrollArea, Accordion (base rituel expandable) |
| **Overlay** | Dialog (modals), Popover (tooltips contextuels), Tooltip, DropdownMenu |
| **Data** | Avatar (base MemberAvatar), Table (historique) |

Ces composants sont utilises comme **primitives** sur lesquelles les composants custom sont construits. Chaque composant custom compose des primitives ShadCN avec les design tokens de family-hub.

### Custom Components

#### RitualCard

**But** : Afficher un rituel avec son statut et permettre la validation en un tap. Composant le plus utilise de l'app.

| Aspect | Detail |
|---|---|
| **Anatomie** | Pictogramme (gauche) + Nom du rituel (centre) + Indicateur horaire optionnel + Zone de check (droite) + Barre couleur membre (subtile, bord gauche ou fond) |
| **Etats** | `pending` (fond blanc, actif, en haut de liste), `done` (grise, micro-animation douce, descend en bas de liste), `expanded` (montre les micro-rituels si rituel parent), `overdue` (aucun traitement punitif — meme apparence que pending) |
| **Variantes** | `standard` (adulte — texte 16px), `large` (enfant >= 7 ans — pictogramme grand, texte 18-20px), `parent` (avec barre de progression micro-rituels "3/5") |
| **Interaction** | Tap = toggle done/pending avec micro-animation. Tap long ou chevron = expand si micro-rituels. |
| **Accessibilite** | `role="checkbox"`, `aria-checked`, `aria-label` avec nom du rituel, navigation clavier (Espace pour toggle) |
| **Contenu** | Nom court (max ~40 caracteres), pictogramme Lucide ou emoji, horaire optionnel |

#### RitualCardExpandable

**But** : Extension de RitualCard pour les rituels parents contenant des micro-rituels.

| Aspect | Detail |
|---|---|
| **Anatomie** | RitualCard parent + indicateur de progression ("3/5") + chevron expand + liste de micro-rituels en accordion |
| **Etats** | `collapsed` (1 carte, progression visible), `expanded` (carte ouverte, micro-rituels listes), `completed` (tous micro-rituels faits) |
| **Interaction** | Tap chevron/card = expand/collapse. Cocher parent = complete tout. Cocher micro-rituels = progression incrementale. |
| **Accessibilite** | `aria-expanded`, `aria-controls` sur le conteneur des micro-rituels |

#### FeatureBlock

**But** : Representer un module sur le Home Hub avec apercu contextuel.

| Aspect | Detail |
|---|---|
| **Anatomie** | Icone module (Lucide) + Titre du module + Apercu contextuel (ex: "3/5 rituels", "2 messages", "RDV 14h") + Badge optionnel |
| **Etats** | `default`, `highlighted` (suggere par le contexte — legerement eleve/mis en avant), `new` (badge "Nouveau"), `disabled` (module non active) |
| **Variantes** | `standard` (mobile — grille 2 colonnes), `large` (kiosk — grille plus grande), `restricted` (prestataire — blocs non autorises non cliquables) |
| **Interaction** | Tap = navigation vers le module. L'apercu se met a jour en temps reel. |
| **Accessibilite** | `role="link"`, `aria-label` avec titre + apercu, focus visible |

#### HomeHub

**But** : Ecran d'accueil avec grille de FeatureBlocks contextualises.

| Aspect | Detail |
|---|---|
| **Anatomie** | Header (salutation + date) + Grille de FeatureBlocks (2 colonnes mobile) + Section "Tous les modules" en scroll bas |
| **Etats** | `default` (blocs contextuels en haut), `scrolled` (revele la liste complete des modules) |
| **Variantes** | `parent` (tous les blocs), `child` (blocs reduits), `caretaker` (blocs restreints), `kiosk` (blocs configures par admin) |
| **Interaction** | Scroll pour reveler tous les modules. Tap sur un bloc = navigation vers le module. FAB IA toujours visible. |

#### MemberColumn

**But** : Conteneur d'une colonne membre dans le module Rituels.

| Aspect | Detail |
|---|---|
| **Anatomie** | Header (MemberAvatar + prenom + couleur membre) + Liste de RitualCards + Separateurs de moment (si scroll continu) |
| **Etats** | `active` (ma colonne, plein ecran mobile), `peek` (bord visible quand on est sur une autre colonne — invitation au swipe), `readonly` (enfant consultant la colonne d'un frere) |
| **Interaction** | Swipe horizontal entre colonnes. Scroll vertical pour les rituels et entre moments. Tap sur header = fiche membre. |
| **Accessibilite** | `role="region"`, `aria-label` avec prenom du membre, navigation par tabs entre colonnes |

#### MomentSelector

**But** : Selecteur Matin/Midi/Soir synchronise avec le scroll vertical.

| Aspect | Detail |
|---|---|
| **Anatomie** | 3 segments/pills (Matin, Midi, Soir) avec indicateur du moment actif |
| **Etats** | `matin`, `midi`, `soir` — mis a jour automatiquement selon le scroll OU selon le tap |
| **Interaction** | Tap = sauter au moment. Scroll vertical dans la colonne = mise a jour automatique du selecteur. |
| **Base ShadCN** | Construit sur Tabs ShadCN avec logique de sync scroll ajoutee |

#### ContinuousScrollMoments

**But** : Conteneur de scroll qui segmente les rituels par moment et synchronise le MomentSelector.

| Aspect | Detail |
|---|---|
| **Anatomie** | 3 sections (Matin, Midi, Soir) empilees verticalement avec separateurs visuels. Intersection Observer pour detecter la section visible. |
| **Interaction** | Scroll vertical continu. Quand une section entre dans le viewport, le MomentSelector se met a jour. |

#### AIFloatingButton (FAB)

**But** : Bouton flottant pour acceder a l'assistant IA depuis n'importe quel ecran.

| Aspect | Detail |
|---|---|
| **Anatomie** | Bouton rond (48-56px), icone chat (Lucide MessageCircle), ombre legere |
| **Etats** | `default` (visible, discret), `active` (panel ouvert), `badge` (suggestion IA en attente) |
| **Position** | Coin inferieur droit, au-dessus de la barre de navigation si presente |
| **Accessibilite** | `aria-label="Ouvrir l'assistant"`, focus visible, Echap pour fermer le panel |

#### AIChatPanel

**But** : Interface de chat avec l'IA, texte et vocal.

| Aspect | Detail |
|---|---|
| **Anatomie** | Header ("Assistant") + Zone de messages (bulles user/IA) + Chips de suggestions contextuelles + Input texte + Bouton vocal |
| **Etats** | `closed`, `open` (panel visible), `listening` (mode vocal actif — indicateur visuel), `processing` (IA reflechit — skeleton) |
| **Variantes** | `adult` (suggestions standard), `child` (suggestions simplifiees, reformulation automatique, garde-fous) |
| **Accessibilite** | `role="dialog"`, `aria-live="polite"` sur les messages IA, labels sur input/boutons |

#### MemberAvatar

**But** : Avatar d'un membre avec ring de couleur et indicateur de statut.

| Aspect | Detail |
|---|---|
| **Anatomie** | Avatar (initiale ou photo) + Ring couleur membre (2-3px) + Badge statut optionnel |
| **Base ShadCN** | Construit sur Avatar ShadCN avec ring et badge ajoutes |

#### InvitationScreen

**But** : Ecran d'accueil pour les invites arrivant via deep link.

| Aspect | Detail |
|---|---|
| **Anatomie** | Avatar de l'invitant + "X vous invite a rejoindre le foyer Y" + champ prenom + bouton "Rejoindre" |
| **Variantes** | `member` (profil existant detecte — "Le profil Z vous attend"), `new` (pas de profil — creation), `caretaker` (acces temporaire, pas de compte complet) |

#### ActivityFeed

**But** : Historique chronologique de toutes les actions du foyer, filtrable.

| Aspect | Detail |
|---|---|
| **Anatomie** | Liste chronologique d'evenements. Chaque evenement : timestamp + avatar membre + description action + module source |
| **Filtres** | Par membre, par module, par date |
| **Acces** | Parents : historique complet. Enfants : leur propre historique. Prestataire : historique de leur session. |

#### KioskConfig

**But** : Interface admin pour configurer le flux d'un appareil kiosk.

| Aspect | Detail |
|---|---|
| **Anatomie** | Liste des appareils kiosk lies + pour chaque : ecran par defaut (select), modules autorises (checkboxes), niveau de navigation (select) |
| **Interaction** | CRUD sur les appareils kiosk. QR code / code de liaison. Preview de la vue configuree. |

#### PictogramPicker

**But** : Selection d'un pictogramme pour un rituel (particulierement pour les enfants).

| Aspect | Detail |
|---|---|
| **Anatomie** | Grille de pictogrammes (Lucide icons + emojis), barre de recherche, categories (matin, hygiene, ecole, sport...), preview |
| **Interaction** | Tap pour selectionner, recherche par mot-cle |

#### WeeklyRecap

**But** : Recapitulatif hebdomadaire avec stats par membre.

| Aspect | Detail |
|---|---|
| **Anatomie** | Periode (semaine du X au Y) + barres de completion par membre (couleur membre) + faits marquants + ton chaleureux factuel |
| **Variantes** | `mobile` (scroll vertical), `kiosk` (vue large, lisible a distance pour lecture en famille) |

#### PermissionToggle

**But** : Toggle avec description contextuelle pour les permissions parent/enfant.

| Aspect | Detail |
|---|---|
| **Anatomie** | Label permission + description + Switch ShadCN + indication de l'impact |
| **Exemple** | "Acces a l'assistant IA — Lucas peut poser des questions a l'assistant. Les actions hors permissions seront soumises a votre approbation." |

### Component Implementation Strategy

**Approche** : Chaque composant custom est construit en composant des primitives ShadCN UI avec les design tokens de family-hub. Les tokens (couleurs, typo, spacing, radius) sont partages entre web (ShadCN/Tailwind) et mobile (NativeWind/React Native Reusables).

**Structure monorepo :**

```
packages/
  tokens/            # Design tokens partages (couleurs membres, spacing, typo)
  ui/                # Composants web (ShadCN + custom)
  ui-native/         # Composants React Native (equivalents custom)
```

**Regles de construction :**
- Utiliser les primitives ShadCN quand elles existent (Card, Avatar, Tabs, Accordion, Dialog...)
- Construire les composants custom par composition, pas par fork
- Les tokens definissent les couleurs, tailles et espacements — pas le CSS inline
- Chaque composant a ses variantes (adulte/enfant/kiosk) gerees par les tokens Tailwind et la logique de props
- L'accessibilite (ARIA, clavier, contraste) est integree des la creation, pas ajoutee apres

### Implementation Roadmap

**Phase 1 — MVP Core (v1.0)**

| Composant | Criticite | Pourquoi |
|---|---|---|
| RitualCard | P0 | Composant le plus utilise — chaque rituel en depend |
| RitualCardExpandable | P0 | Rituels imbriques — difference cle avec un to-do |
| MemberColumn | P0 | La vue signature de l'app |
| MomentSelector | P0 | Navigation temporelle coeur |
| ContinuousScrollMoments | P0 | Scroll continu entre moments |
| HomeHub | P0 | Point d'entree de l'app |
| FeatureBlock | P0 | Brique du Home Hub |
| AIFloatingButton | P0 | Acces IA depuis partout |
| AIChatPanel | P0 | Interface chat IA |
| MemberAvatar | P0 | Identite visuelle des membres |
| InvitationScreen | P0 | Flux d'invitation critique |
| PictogramPicker | P1 | Necessaire pour les profils enfants |
| PermissionToggle | P1 | Configuration des permissions enfants |

**Phase 2 — Enrichissement (v1.1-v1.2)**

| Composant | Criticite | Pourquoi |
|---|---|---|
| WeeklyRecap | P1 | Recapitulatif hebdomadaire — levier de retention |
| ActivityFeed | P1 | Historique d'activite — transparence |
| KioskConfig | P1 | Configuration du mode kiosk par l'admin |

**Phase 3 — Extensions (v1.5+)**

Les composants des modules futurs (calendrier, communication, finances) seront concus au moment de leur developpement, en suivant les memes patterns et tokens.

## UX Consistency Patterns

### Hierarchie d'Actions

| Niveau | Style | Usage | Exemple |
|---|---|---|---|
| **Action primaire** | Bouton plein (couleur d'accent), large | Une par ecran max, l'action la plus importante | "Commencer", "Rejoindre le foyer", "Creer" |
| **Action coeur (rituel)** | Tap sur la RitualCard entiere | L'action la plus frequente de l'app | Cocher un rituel |
| **Action secondaire** | Bouton outline ou ghost | Actions complementaires | "Modifier", "Voir tout", "Annuler" |
| **Action contextuelle** | Icone seule (Lucide) | Actions dans les headers, barres, listes | Retour, menu, filtre, recherche |
| **Action destructive** | Texte rouge, jamais en primaire | Suppression, deconnexion | "Supprimer le rituel", "Quitter le foyer" |
| **FAB IA** | Bouton rond flottant, toujours visible | Acces IA | Ouvrir l'assistant |

**Regle** : Jamais 2 actions primaires sur le meme ecran. Si deux actions sont en concurrence, l'une est primaire, l'autre secondaire.

### Feedback Patterns

| Situation | Feedback | Style |
|---|---|---|
| **Rituel coche** | Card se grise + micro-animation douce + descend | Optimistic update < 200ms, pas de toast |
| **Action reussie** | Toast discret en bas, disparait en 3s | Texte factuel : "Rituel cree" — pas de "Bravo!" |
| **Erreur utilisateur** | Message inline sous le champ concerne | Rouge doux, texte explicatif, jamais juste "Erreur" |
| **Erreur systeme** | Toast en bas avec option "Reessayer" | Ton calme : "La synchronisation a echoue. Reessayer ?" |
| **Chargement** | Skeleton du composant (forme grisee animee) | Jamais de spinner plein ecran. Skeleton = l'UI est deja la, le contenu arrive. |
| **Synchronisation** | Invisible quand ca marche. Badge discret si en attente. | "Synchronisation en attente" en petit, pas de popup |
| **Suggestion IA** | Chip ou banniere discrete, rejetable d'un swipe | Texte factuel : "Lucas a un controle jeudi — revoir les exercices ?" |
| **Notification parent** | Notification systeme discrete | "Lucas a complete 100% de ses rituels" — factuel, pas celebratif |

**Regle zero feedback celebratif** : L'app ne dit jamais "Bravo!", "Bien joue!", "Super!". Le changement d'etat visuel est le feedback. La fierte se vit en famille, pas sur l'ecran.

### Navigation Patterns

| Pattern | Comportement | Geste |
|---|---|---|
| **Home Hub → Module** | Tap sur un FeatureBlock → transition vers le module. Header avec bouton retour. | Tap + swipe back pour revenir |
| **Entre colonnes** | Swipe horizontal. Bords des colonnes voisines toujours visibles (peek). | Swipe gauche/droite |
| **Entre moments** | Scroll vertical continu + tabs en haut synchronises. Tap sur tab = saut direct. | Scroll up/down ou tap |
| **Retour** | Toujours un bouton retour en haut a gauche dans les modules. Swipe back (iOS) / bouton systeme (Android). | Tap ou geste systeme |
| **Profondeur** | Ecran de detail = push (empile sur le precedent). Jamais plus de 3 niveaux de profondeur. | Tap pour entrer, retour pour sortir |
| **Modal / Sheet** | Actions rapides (IA, creation rapide) = bottom sheet. Config complexe = ecran dedie (push). | Swipe down pour fermer un sheet |

**Regle** : L'utilisateur sait toujours ou il est (module actif + moment actif + membre actif) et comment revenir (bouton retour + geste).

### Form Patterns

| Pattern | Comportement |
|---|---|
| **Creation simple** | Minimum de champs visibles. Nom + "Creer". Options avancees en divulgation progressive (chevron ou "Plus d'options"). |
| **Creation par IA** | FAB → "Ajoute X pour Y" → l'IA cree et confirme. Le formulaire n'est jamais necessaire si l'IA est utilisee. |
| **Validation en temps reel** | Les champs se valident a la saisie (debounce 300ms). Message inline sous le champ, jamais un popup. |
| **Labels** | Toujours un label visible au-dessus du champ. Pas de label uniquement en placeholder (disparait a la saisie). |
| **Actions formulaire** | Bouton primaire a droite ("Creer", "Enregistrer"). Bouton secondaire a gauche ("Annuler"). |
| **Formulaire en etapes** | Si plus de 5 champs, decouper en etapes avec indicateur de progression. Max 3 etapes. |

### Empty States & Loading

| Situation | Ce qui s'affiche |
|---|---|
| **Premiere ouverture (apres onboarding)** | Home Hub avec blocs + contenu genere par l'IA. Jamais un ecran vide apres l'onboarding. |
| **Colonne vide (nouveau membre)** | Illustration legere + "Aucun rituel pour le moment" + bouton "Creer un rituel" + suggestion IA |
| **Module vide (pas encore active)** | Breve description du module + bouton "Activer" |
| **Aucun resultat de recherche** | "Aucun resultat pour [terme]" + suggestions alternatives |
| **Chargement initial** | Skeleton du layout (forme des composants en gris anime). L'UI est reconnaissable meme en chargement. |
| **Chargement incremental** | Skeleton uniquement sur les elements en cours de chargement, pas sur toute la page. |

### Offline Patterns

| Situation | Comportement |
|---|---|
| **Lecture hors ligne** | Les rituels du jour, les fiches membres et les consignes sont caches localement. Lecture disponible sans connexion. |
| **Ecriture hors ligne** | Cocher un rituel = optimistic update local. Action mise en file d'attente. |
| **Indicateur** | Badge discret "Hors ligne" dans le header. Pas de popup, pas de blocage. |
| **Retour en ligne** | Sync automatique silencieuse. Les actions en file sont envoyees. En cas de conflit, la derniere action gagne. |
| **Chat IA hors ligne** | Message : "L'assistant a besoin d'une connexion internet." Pas de faux chat local. |

## Responsive Design & Accessibility

### Responsive Strategy

family-hub a 4 contextes de rendu avec une approche **mobile-first** :

| Contexte | Technologie | Largeur cible | Specificite |
|---|---|---|---|
| **Mobile** | React Native | 320-428px | Interface principale, 1 colonne visible, swipe |
| **Web mobile** | ShadCN/Tailwind | 320-767px | Meme layout que l'app mobile native |
| **Web desktop** | ShadCN/Tailwind | 768px+ | Multi-colonnes, dashboard parent, onboarding |
| **Kiosk** | React Native | 768-1024px (tablette) | Toutes colonnes visibles, elements grands, lisible a distance |

### Breakpoint Strategy

| Breakpoint | Nom | Layout |
|---|---|---|
| **< 640px** | `sm` | Mobile — 1 colonne, Home Hub grille 2 blocs, FAB visible |
| **640-767px** | `md` | Grand mobile — idem, espacement legerement plus genereux |
| **768-1023px** | `lg` | Tablette/Kiosk — 2-3 colonnes visibles, Home Hub grille 3 blocs |
| **1024-1279px** | `xl` | Desktop — 3-4 colonnes visibles, sidebar navigation possible |
| **>= 1280px** | `2xl` | Grand desktop — 4-5 colonnes, dashboard complet |

### Adaptation par Plateforme

| Element | Mobile | Web desktop | Kiosk |
|---|---|---|---|
| **Home Hub** | Grille 2 colonnes de blocs, scroll pour tout voir | Grille 3-4 colonnes, tout visible | Grille configurable, blocs plus grands |
| **Vue colonnes** | 1 colonne + peek, swipe horizontal | 2-4 colonnes visibles cote a cote | Toutes colonnes visibles, pas de scroll |
| **RitualCard** | Largeur pleine, hauteur standard | Largeur proportionnelle a la colonne | Plus grande, texte 20px+, cibles tactiles 56px+ |
| **MomentSelector** | Tabs en haut + scroll vertical | Tabs clickables, pas de scroll continu | Tabs grands, moment actuel tres visible |
| **FAB IA** | Coin inferieur droit, 48px | Coin inferieur droit, 48px | 56-64px, plus visible |
| **AIChatPanel** | Bottom sheet plein ecran | Panel lateral droit (sidebar) | Bottom sheet ou panel configurable |
| **Navigation** | Home Hub → module → retour | Sidebar + contenu principal | Ecran configure → hub restreint |
| **WeeklyRecap** | Scroll vertical, graphiques empiles | Layout horizontal, graphiques cote a cote | Grand format, lisible a 2m |

### Accessibility Strategy — WCAG 2.1 AA

**Standard cible : WCAG 2.1 niveau AA.**

**Specificites family-hub :**

| Enjeu | Regle | Pourquoi |
|---|---|---|
| **Enfants** | Pictogrammes + texte, cibles tactiles >= 48px, contrastes renforces | Les enfants des 5 ans utilisent l'app |
| **Daltonisme** | Ne jamais transmettre une info uniquement par la couleur. Icones + labels toujours. | Les couleurs des membres ne sont pas le seul identifiant — le prenom est toujours affiche |
| **Motricite reduite** | Cibles tactiles >= 44px (48px recommande), espacement entre elements cliquables >= 8px | Enfants, seniors sur kiosk |
| **Lecteur d'ecran** | Structure semantique, ARIA labels sur tous les composants custom, `aria-live` sur les mises a jour temps reel | Parents aveugles ou malvoyants |
| **Clavier** | Navigation complete par Tab, Espace pour cocher, Echap pour fermer, focus visible | Web desktop |
| **Mouvement** | Respecter `prefers-reduced-motion`. Micro-animations desactivables. | Epilepsie, sensibilite au mouvement |
| **Mode sombre** | Contrastes maintenus. Tokens adaptatifs testes dans les deux modes. | Mode nuit automatique |

### Testing Strategy

| Type | Outil / Methode | Frequence |
|---|---|---|
| **Accessibilite auto** | axe-core / eslint-plugin-jsx-a11y en CI | Chaque commit |
| **Contraste** | Plugin Figma ou Chrome DevTools contrast checker | A chaque nouveau composant |
| **Lecteur d'ecran** | VoiceOver (iOS/Mac), TalkBack (Android) | Avant chaque release |
| **Clavier** | Navigation manuelle Tab/Espace/Echap sur web | Avant chaque release |
| **Daltonisme** | Simulation Chrome DevTools | A chaque nouveau composant |
| **Responsive** | Xcode Simulator, Android Emulator, Chrome DevTools | Continu en dev |
| **Kiosk** | Test sur tablette physique (iPad ou Android) | Avant chaque release kiosk |
| **Utilisateurs reels** | Beta test avec 5 familles du cercle proche | Mensuel |

### Implementation Guidelines

**Responsive :**
- Utiliser les breakpoints Tailwind (`sm`, `md`, `lg`, `xl`, `2xl`) pour le web
- NativeWind pour React Native avec les memes tokens
- Pas de px fixes pour les largeurs — `%`, `flex`, `grid` et tokens de spacing
- Images adaptatives (srcset web, resize a la volee mobile)

**Accessibilite :**
- HTML semantique : `<nav>`, `<main>`, `<section>`, `<button>` (pas de `<div onClick>`)
- ARIA : `role`, `aria-label`, `aria-checked`, `aria-expanded`, `aria-live` sur les composants custom
- Focus : `outline` visible sur `:focus-visible`, skip links sur web
- Composants ShadCN : deja accessibles par defaut (Radix UI). Les composants custom doivent suivre le meme standard.
