# Architecture de Securite et Patrons de Protection des Donnees pour family-hub

**Date :** 2026-02-06
**Contexte :** Application family-hub -- plateforme de gestion familiale traitant des donnees sensibles : donnees d'enfants (RGPD Article 8), suivi de localisation, informations de sante, photos. Construite avec NestJS, PostgreSQL RLS, Better Auth. Multi-foyer avec 5 cercles de visibilite et permissions basees sur les roles.
**Perimetre :** Securite applicative, conformite RGPD, chiffrement, audit, autorisation avancee, securite GraphQL.

---

## Table des matieres

1. [Durcissement de securite NestJS (OWASP)](#1-durcissement-de-securite-nestjs-owasp)
2. [Securite GraphQL : Profondeur, Complexite, Rate Limiting](#2-securite-graphql--profondeur-complexite-rate-limiting)
3. [Conformite RGPD pour les donnees des enfants (Article 8)](#3-conformite-rgpd-pour-les-donnees-des-enfants-article-8)
4. [Patrons d'autorisation : RBAC, ABAC et CASL](#4-patrons-dautorisation--rbac-abac-et-casl)
5. [Chiffrement des donnees au repos avec PostgreSQL](#5-chiffrement-des-donnees-au-repos-avec-postgresql)
6. [Journalisation d'audit et tracabilite RGPD](#6-journalisation-daudit-et-tracabilite-rgpd)
7. [Synthese et recommandations pour family-hub](#7-synthese-et-recommandations-pour-family-hub)

---

## 1. Durcissement de securite NestJS (OWASP)

### Description du patron de securite

Le durcissement d'une application NestJS selon les recommandations OWASP couvre un ensemble de mesures defensives en profondeur. L'OWASP Top 10:2025 identifie les risques les plus critiques pour les applications web, et NestJS offre des mecanismes natifs ou via des bibliotheques tierces pour les attenuer.

Les principaux axes de durcissement sont :

| Axe de securite | Mecanisme NestJS | Risque OWASP couvert |
|---|---|---|
| Validation des entrees | `class-validator` + DTOs | Injection (A03:2021) |
| Authentification | Guards + Better Auth / JWT | Broken Authentication (A07:2021) |
| Gestion des secrets | `@nestjs/config` + variables d'environnement | Security Misconfiguration (A05:2021) |
| Rate Limiting | `@nestjs/throttler` | DDoS / Brute Force |
| CORS | Configuration stricte des origines | Cross-Origin Attacks |
| Helmet | Headers HTTP securises | Security Misconfiguration |
| CSRF Protection | Tokens CSRF pour sessions | Cross-Site Request Forgery |
| Gestion des dependances | `npm audit` / Snyk / Dependabot | Vulnerable Components (A06:2021) |

### Application a family-hub (multi-foyer / multi-cercles)

Pour family-hub, le durcissement OWASP est particulierement critique car :

- **Donnees d'enfants** : Toute faille d'injection ou d'authentification pourrait exposer des donnees de mineurs, avec des sanctions RGPD aggravees.
- **Multi-foyer** : Chaque foyer est un tenant logique. Une mauvaise configuration CORS ou un defaut d'isolation pourrait permettre un acces croise entre foyers.
- **5 cercles de visibilite** : La validation des entrees doit garantir qu'un utilisateur ne peut pas manipuler les parametres pour acceder a un cercle auquel il n'appartient pas (IDOR -- Insecure Direct Object Reference).
- **Better Auth + Sessions** : Better Auth fournit un `AuthGuard` global qui protege toutes les routes par defaut, avec un decorateur `@AllowAnonymous()` pour les routes publiques. La generation d'identifiants de session de 128 bits minimum est recommandee pour empecher les attaques par force brute.

### Approche d'implementation NestJS + PostgreSQL

```
// Exemple : Configuration de securite globale (main.ts)
app.use(helmet());                         // Headers securises
app.enableCors({ origin: allowedOrigins }); // CORS strict
app.useGlobalPipes(new ValidationPipe({     // Validation des entrees
  whitelist: true,                          // Rejeter les champs inconnus
  forbidNonWhitelisted: true,
  transform: true,
}));

// Rate Limiting global
@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,   // 1 minute
      limit: 100,   // 100 requetes max
    }]),
  ],
})
```

**Integration avec Better Auth :**
- Better Auth s'integre via un `AuthModule` qui enregistre un `AuthGuard` global par defaut.
- Le decorateur `@Session()` permet d'acceder a la session utilisateur dans les controlleurs.
- Le decorateur `@Roles('admin', 'parent')` restreint l'acces aux utilisateurs ayant les roles specifies.

### Implications RGPD

- **Article 32 (Securite du traitement)** : L'implementation de ces mesures de durcissement constitue une obligation legale. Le RGPD exige des "mesures techniques et organisationnelles appropriees" pour garantir la securite des donnees.
- **Principe de minimisation** : La configuration `whitelist: true` du `ValidationPipe` garantit que seules les donnees attendues sont traitees.
- **Tracabilite** : La journalisation des evenements de securite (tentatives de connexion echouees, violations de rate limiting) est une exigence implicite du RGPD.

### Sources

- [OWASP Top 10:2025](https://owasp.org/Top10/2025/)
- [OWASP Node.js Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)
- [OWASP NestJS Project](https://owasp.org/www-project-nest/)
- [Best Security Implementation Practices in NestJS (DEV Community)](https://dev.to/drbenzene/best-security-implementation-practices-in-nestjs-a-comprehensive-guide-2p88)
- [Securing NestJS Apps: Implementing Key OWASP Protections (Medium)](https://medium.com/@febriandwikimhan/securing-nestjs-apps-implementing-key-owasp-protections-8ef60df6ecf8)
- [Better Auth -- NestJS Integration](https://www.better-auth.com/docs/integrations/nestjs)
- [NestJS + BetterAuth, Part 1 (Medium)](https://medium.com/@andysenclave/nestjs-betterauth-part-1-from-zero-to-login-prisma-cookies-cfcc3e7ecec0)
- [Top NestJS Security Best Practices (Moldstud)](https://moldstud.com/articles/p-top-nestjs-security-best-practices-comprehensive-faq-for-developers)

---

## 2. Securite GraphQL : Profondeur, Complexite, Rate Limiting

### Description du patron de securite

GraphQL presente des vecteurs d'attaque specifiques absents des API REST traditionnelles. La flexibilite des requetes GraphQL permet a un attaquant de construire des requetes profondement imbriquees, extremement complexes, ou massifiees par batch, pouvant provoquer un deni de service (DoS) ou une extraction excessive de donnees.

Les patrons de securite GraphQL couvrent :

| Mesure de securite | Description | Outil / Bibliotheque |
|---|---|---|
| Limitation de profondeur | Restreindre le nombre de niveaux d'imbrication | `graphile/depth-limit`, `graphql-depth-limit` |
| Analyse de complexite | Ponderer les champs et rejeter les requetes couteuses | `graphql-query-complexity`, `graphql-validation-complexity` |
| Rate Limiting | Limiter le nombre de requetes par periode | `@nestjs/throttler` (compatible GraphQL) |
| Requetes persistees (Persisted Queries) | N'autoriser que des requetes pre-approuvees | Apollo Server persisted queries |
| Desactivation de l'introspection | Empecher l'exploration du schema en production | Config Apollo Server |
| Protection anti-batch | Limiter les operations par requete batch | Middleware de validation |
| Limitation de la taille du body | Empecher les payloads excessifs | Configuration Express/Fastify |
| Timeout d'execution | Interrompre les requetes trop longues | Configurable au niveau resolver |

### Application a family-hub (multi-foyer / multi-cercles)

Le modele de donnees de family-hub avec ses relations imbriquees (foyer -> membres -> cercles -> evenements -> commentaires) cree naturellement une surface d'attaque par profondeur :

- **Requetes imbriquees dangereuses** : Un utilisateur pourrait tenter `{ household { members { households { members { ... } } } } }` creant une boucle d'imbrication exponentielle.
- **Complexite des cercles** : Les 5 cercles de visibilite multiplient les chemins de resolution possibles. Une requete traversant plusieurs cercles simultanement pourrait etre extremement couteuse.
- **Requetes en batch** : Un attaquant pourrait combiner dans un seul batch des requetes sur les calendriers, les localisations, les photos, et les taches de plusieurs foyers.
- **Introspection** : En production, l'introspection doit etre desactivee pour empecher un attaquant de decouvrir les types `HealthInfo`, `ChildLocation`, etc.

### Approche d'implementation NestJS + PostgreSQL

**1. Limitation de profondeur avec graphile/depth-limit :**

```typescript
// Configuration Apollo Server dans NestJS
import { createDepthLimitRule } from 'graphile-depth-limit';

GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  validationRules: [
    createDepthLimitRule({
      maxDepth: 7,
      // Limites specifiques par champ
      fieldConfigByFieldName: {
        'members': { maxListDepth: 2 },
        'households': { maxListDepth: 1 },
      },
    }),
  ],
});
```

**2. Analyse de complexite :**

```typescript
import queryComplexity, { simpleEstimator, fieldExtensionsEstimator } from 'graphql-query-complexity';

GraphQLModule.forRoot<ApolloDriverConfig>({
  validationRules: [
    queryComplexity({
      maximumComplexity: 1000,
      estimators: [
        fieldExtensionsEstimator(),
        simpleEstimator({ defaultComplexity: 1 }),
      ],
      onComplete: (complexity) => {
        logger.log(`Query complexity: ${complexity}`);
      },
    }),
  ],
});
```

**3. Rate Limiting GraphQL avec @nestjs/throttler :**

Le module `@nestjs/throttler` supporte nativement GraphQL. Le `ThrottlerGuard` peut etre adapte pour fonctionner avec le contexte GraphQL au lieu du contexte HTTP standard.

**4. Requetes persistees (Persisted Queries) :**

Pour une securite maximale en production, implementer un systeme de "trusted documents" :
- En developpement : les clients soumettent leurs operations GraphQL au serveur.
- Chaque document est stocke avec un identifiant unique (son hash).
- En production : les clients envoient uniquement l'identifiant du document, jamais la requete brute.
- Le serveur n'execute que les operations connues.

**5. Desactivation de l'introspection en production :**

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  introspection: process.env.NODE_ENV !== 'production',
  playground: process.env.NODE_ENV !== 'production',
});
```

### Implications RGPD

- **Minimisation des donnees (Article 5)** : La limitation de profondeur et de complexite empeche l'extraction massive de donnees via des requetes GraphQL non contraintes. Cela renforce le principe de minimisation en s'assurant que les clients ne peuvent recuperer que les donnees strictement necessaires.
- **Securite du traitement (Article 32)** : Les mesures anti-DoS protegent la disponibilite du service, une composante de la securite RGPD.
- **Protection des enfants** : L'introspection desactivee empeche un attaquant de decouvrir les types de donnees sensibles relatifs aux enfants.

### Sources

- [OWASP GraphQL Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/GraphQL_Cheat_Sheet.html)
- [Graphile Depth-Limit (GitHub)](https://github.com/graphile/depth-limit)
- [Securing GraphQL API with Rate Limits and Depth Limits (LogRocket)](https://blog.logrocket.com/securing-graphql-api-using-rate-limits-and-depth-limits/)
- [GraphQL Query Complexity + NestJS + Dataloader (DEV Community)](https://dev.to/kasir-barati/graphql-query-complexity-nestjs-dataloader-2p2m)
- [@nestjs/throttler (GitHub)](https://github.com/nestjs/throttler)
- [Apollo GraphQL -- Request Limits](https://www.apollographql.com/docs/graphos/routing/security/request-limits)
- [Apollo GraphQL -- Persisted Queries Safelisting](https://www.apollographql.com/docs/graphos/platform/security/persisted-queries)
- [How to Secure GraphQL APIs (OneUptime, 2026)](https://oneuptime.com/blog/post/2026-02-03-graphql-security/view)
- [GraphQL Security (graphql.org)](https://graphql.org/learn/security/)
- [9 Ways to Secure Your GraphQL API (Apollo Blog)](https://www.apollographql.com/blog/9-ways-to-secure-your-graphql-api-security-checklist)
- [Limiting GraphQL Query Depth the Right Way (DEV Community)](https://dev.to/mateodiaz/limiting-graphql-query-depth-the-right-way-1h65)

---

## 3. Conformite RGPD pour les donnees des enfants (Article 8)

### Description du patron de securite

L'Article 8 du RGPD etablit des conditions specifiques pour le traitement des donnees personnelles des enfants dans le cadre des services de la societe de l'information. Les principes cles sont :

| Exigence | Detail |
|---|---|
| **Age du consentement** | 16 ans minimum (les Etats membres peuvent abaisser a 13 ans). En France : 15 ans. |
| **Consentement parental** | Obligatoire pour les enfants en dessous de l'age seuil. Le responsable du traitement doit "s'efforcer raisonnablement" de verifier que le consentement est donne par le titulaire de la responsabilite parentale. |
| **Verification d'identite** | Le CEPD (Comite Europeen de la Protection des Donnees) a emis en fevrier 2025 une declaration sur la verification de l'age, exigeant une approche basee sur le risque et proportionnee. |
| **Parametres prives par defaut** | A partir de 2025, l'UE exige des parametres prives par defaut pour les mineurs. |
| **Conception ethique** | Interdiction des "dark patterns" et des mecanismes de manipulation destines aux mineurs. |
| **Evaluations d'impact (DPIA)** | Obligatoires pour les plateformes accessibles par des mineurs. |
| **Minimisation des donnees** | Renforcement du principe : ne collecter que les donnees strictement necessaires. |

### Evolutions 2025-2026

Les 7 changements cles pour la protection des donnees des enfants en 2025 selon le Digital Services Act (DSA) et les directives europeennes :

1. **Parametres prives par defaut** : Les comptes de mineurs doivent avoir les parametres les plus restrictifs par defaut.
2. **Verification d'age renforcee** : Mise en oeuvre de mecanismes de verification d'age plus robustes, tout en respectant la minimisation des donnees.
3. **Conception ethique pour les enfants** : Interdiction de la publicite ciblee pour les mineurs et des mecanismes de retention addictifs.
4. **Evaluations des risques** : DPIA obligatoire pour les plateformes accessibles aux mineurs.
5. **Age numerique harmonise** : Le Parlement europeen a appele en novembre 2025 a un age limite numerique europeen harmonise de 16 ans pour les reseaux sociaux, avec possibilite d'abaissement par accord parental.
6. **Droit a l'effacement renforce** : Les mineurs doivent pouvoir facilement demander la suppression de leurs donnees.
7. **Transparence adaptee** : Les informations sur le traitement doivent etre redigees dans un langage accessible aux enfants.

### Application a family-hub (multi-foyer / multi-cercles)

family-hub est directement concerne par l'Article 8 car il traite des donnees d'enfants dans un contexte familial :

- **Consentement parental verifiable** : Le systeme doit garantir que les comptes d'enfants sont crees et geres par un parent ou tuteur legal. Le role "parent" dans le systeme de permissions doit etre la condition prealable a l'ajout d'un profil enfant.
- **Profils enfants vs. comptes enfants** : Distinction fondamentale -- les enfants en bas age n'ont pas de compte propre, mais un profil gere par le parent. Les adolescents (selon l'age seuil) peuvent avoir un acces limite.
- **Cercles de visibilite pour les enfants** : Les donnees des enfants (localisation, sante, photos) doivent avoir des restrictions de visibilite par defaut maximales. Seul le cercle "Foyer" (le plus restreint) devrait avoir acces par defaut.
- **Suivi de localisation** : La localisation des enfants est une donnee hautement sensible. L'implementation doit inclure une granularite configurable (precision GPS reduite pour les cercles elargis), un consentement explicite du parent pour l'activation, et une retention limitee dans le temps.
- **Donnees de sante** : Les informations de sante des enfants (allergies, vaccinations, medicaments) constituent des donnees de categorie speciale (Article 9 RGPD). Elles necessitent un consentement explicite, un chiffrement au repos, et un acces restreint.
- **Photos** : Les photos d'enfants doivent etre partagees uniquement dans les cercles autorises par le parent. Le droit a l'effacement doit etre implemente de maniere robuste.

### Approche d'implementation NestJS + PostgreSQL

```typescript
// Modele de verification du consentement parental
@Entity()
export class ChildProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @ManyToOne(() => User)
  parentGuardian: User;  // Reference au parent/tuteur legal

  @Column({ default: false })
  parentalConsentGiven: boolean;

  @Column({ type: 'timestamp', nullable: true })
  parentalConsentDate: Date;

  @Column({ default: 'household_only' })
  defaultVisibilityCircle: string;  // Cercle le plus restrictif par defaut

  @Column({ type: 'jsonb', default: '{}' })
  dataProcessingConsents: Record<string, boolean>;
  // { locationTracking: false, healthData: false, photoSharing: false }
}
```

**Politique RLS PostgreSQL pour les donnees d'enfants :**

```sql
-- Seuls les parents/tuteurs du foyer peuvent acceder aux profils enfants
CREATE POLICY child_profile_access ON child_profiles
  FOR ALL
  USING (
    parent_guardian_id = current_setting('app.current_user_id')::uuid
    OR EXISTS (
      SELECT 1 FROM household_members hm
      WHERE hm.household_id = child_profiles.household_id
        AND hm.user_id = current_setting('app.current_user_id')::uuid
        AND hm.role IN ('parent', 'co_parent')
    )
  );
```

**Gestion du consentement granulaire :**

```typescript
@Injectable()
export class ChildDataConsentService {
  async updateConsent(
    parentId: string,
    childProfileId: string,
    consentType: 'locationTracking' | 'healthData' | 'photoSharing',
    granted: boolean,
  ): Promise<void> {
    // Verifier que le demandeur est bien le parent/tuteur
    await this.verifyParentalAuthority(parentId, childProfileId);

    // Enregistrer le consentement avec horodatage
    await this.consentRepository.save({
      childProfileId,
      parentId,
      consentType,
      granted,
      timestamp: new Date(),
      ipAddress: this.request.ip,  // Pour l'audit
    });

    // Journaliser pour l'audit RGPD
    await this.auditService.log({
      action: granted ? 'CONSENT_GRANTED' : 'CONSENT_REVOKED',
      actor: parentId,
      subject: childProfileId,
      dataType: consentType,
    });
  }
}
```

### Implications RGPD

- **Article 8** : L'implementation du consentement parental verifiable est une obligation legale directe.
- **Article 5(1)(c) -- Minimisation** : Les parametres par defaut doivent etre les plus restrictifs. Les cercles de visibilite doivent etre configures au minimum par defaut pour les donnees d'enfants.
- **Article 9 -- Categories speciales** : Les donnees de sante des enfants necessitent un consentement explicite et des mesures de protection renforcees.
- **Article 17 -- Droit a l'effacement** : Un mecanisme de suppression complet doit etre implemente pour les donnees des enfants, incluant les photos, l'historique de localisation, et les donnees de sante.
- **Article 25 -- Protection des donnees des la conception** : Le systeme doit etre concu des le depart avec les protections maximales pour les enfants (privacy by design).
- **Article 35 -- DPIA** : Une evaluation d'impact est obligatoire pour le traitement des donnees d'enfants.

### Sources

- [Article 8 RGPD -- Texte officiel](https://gdpr-info.eu/art-8-gdpr/)
- [GDPRhub -- Article 8 GDPR](https://gdprhub.eu/Article_8_GDPR)
- [EU Children's Data Privacy Rules for 2025 -- 7 Key Changes](https://www.gdprregister.eu/gdpr/eu-childrens-data-privacy-2025-7-changes/)
- [Commission Europeenne -- Garanties pour les donnees des enfants](https://commission.europa.eu/law/law-topic/data-protection/rules-business-and-organisations/legal-grounds-processing-data/are-there-any-specific-safeguards-data-about-children_en)
- [ICO -- Regles ISS et consentement des enfants](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/children-and-the-uk-gdpr/what-are-the-rules-about-an-iss-and-consent/)
- [Online Age Assurance: EU and French Frameworks (Baker McKenzie)](https://connectontech.bakermckenzie.com/online-age-assurance-update-about-eu-and-french-frameworks/)
- [Examples of GDPR Article 8 (GDPRInfo.eu)](https://gdprinfo.eu/examples-of-gdpr-article-8)

---

## 4. Patrons d'autorisation : RBAC, ABAC et CASL

### Description du patron de securite

L'autorisation dans les applications complexes repose sur deux modeles principaux, souvent combines :

| Modele | Description | Cas d'usage |
|---|---|---|
| **RBAC** (Role-Based Access Control) | Les permissions sont attribuees a des roles. Les utilisateurs heritent des permissions de leurs roles. | Modeles simples : admin/user/guest |
| **ABAC** (Attribute-Based Access Control) | Les decisions d'acces sont basees sur des attributs de l'utilisateur, de la ressource, de l'action et de l'environnement. | Modeles complexes : multi-tenant, conditions dynamiques |
| **RBAC + ABAC hybride (via CASL)** | Combinaison des deux : roles pour la structure grossiere, conditions (attributs) pour le controle fin. | Applications multi-foyer avec cercles de visibilite |

**CASL (Code Access Security Layer)** est une bibliotheque JavaScript isomorphe pour l'autorisation declarative. Elle permet de definir ce qu'un utilisateur peut faire en termes de :

- **Action** : verbe (create, read, update, delete, manage)
- **Sujet** : type de ressource (Household, CalendarEvent, ChildProfile, Photo)
- **Champs** : proprietes specifiques de la ressource
- **Conditions** : restrictions basees sur les attributs (ex: `{ householdId: user.householdId }`)

### Application a family-hub (multi-foyer / multi-cercles)

Le modele d'autorisation de family-hub est un cas textbook pour CASL avec un hybride RBAC+ABAC :

**Roles identifies :**

| Role | Description | Portee |
|---|---|---|
| `owner` | Createur du foyer | Foyer |
| `parent` | Parent/tuteur legal | Foyer + Cercles |
| `co_parent` | Co-parent (foyer separe) | Acces partiel inter-foyer |
| `child_teen` | Adolescent avec acces limite | Foyer (restreint) |
| `extended_family` | Famille elargie | Cercles 2-3 |
| `trusted_contact` | Contact de confiance (nounou, voisin) | Cercle 4 |
| `community` | Communaute | Cercle 5 (le plus large) |

**Matrice de permissions par cercle :**

```
Cercle 1 (Foyer intime)     : Toutes les donnees du foyer
Cercle 2 (Famille proche)   : Calendrier, evenements, photos partagees
Cercle 3 (Famille elargie)  : Evenements familiaux, photos selectionnees
Cercle 4 (Contacts confiance): Informations pratiques, urgences
Cercle 5 (Communaute)       : Evenements publics, annonces
```

**Definition CASL pour family-hub :**

```typescript
import { AbilityBuilder, createMongoAbility } from '@casl/ability';

type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage' | 'share';
type Subjects =
  | 'Household' | 'CalendarEvent' | 'ChildProfile'
  | 'HealthRecord' | 'Photo' | 'Location' | 'Task' | 'all';

export function defineAbilitiesFor(user: UserWithRoles) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  // Roles globaux
  if (user.role === 'owner' || user.role === 'parent') {
    // Acces complet au foyer propre
    can('manage', 'Household', { id: user.householdId });
    can('manage', 'CalendarEvent', { householdId: user.householdId });
    can('manage', 'ChildProfile', { householdId: user.householdId });
    can('manage', 'HealthRecord', { householdId: user.householdId });
    can('manage', 'Photo', { householdId: user.householdId });
    can('manage', 'Location', { householdId: user.householdId });
    can('manage', 'Task', { householdId: user.householdId });

    // Partage selon les cercles
    can('share', 'CalendarEvent', { visibilityCircle: { $lte: 3 } });
    can('share', 'Photo', { visibilityCircle: { $lte: 3 } });
  }

  if (user.role === 'co_parent') {
    // Acces lecture aux donnees des enfants partages
    can('read', 'ChildProfile', { id: { $in: user.sharedChildrenIds } });
    can('read', 'CalendarEvent', {
      householdId: { $in: user.linkedHouseholdIds },
      visibilityCircle: { $lte: 2 },
    });
    // Pas d'acces aux donnees de sante sauf consentement explicite
    cannot('read', 'HealthRecord').because(
      'Le consentement explicite du parent principal est requis'
    );
  }

  if (user.role === 'child_teen') {
    // Lecture seule sur son propre profil et le calendrier du foyer
    can('read', 'ChildProfile', { id: user.childProfileId });
    can('read', 'CalendarEvent', { householdId: user.householdId });
    can('create', 'Task', { assigneeId: user.id, householdId: user.householdId });
    // Interdiction explicite des donnees sensibles
    cannot('read', 'HealthRecord');
    cannot('read', 'Location');
    cannot('delete', 'all');
  }

  if (user.role === 'extended_family') {
    can('read', 'CalendarEvent', {
      householdId: { $in: user.linkedHouseholdIds },
      visibilityCircle: { $lte: user.circleLevel },
    });
    can('read', 'Photo', {
      householdId: { $in: user.linkedHouseholdIds },
      visibilityCircle: { $lte: user.circleLevel },
    });
  }

  return build();
}
```

### Approche d'implementation NestJS + PostgreSQL

**1. Guard CASL NestJS :**

```typescript
@Injectable()
export class CaslAbilityGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<RequiredPermission[]>(
      'permissions', context.getHandler()
    );
    if (!requiredPermissions) return true;

    const user = context.switchToHttp().getRequest().user;
    const ability = defineAbilitiesFor(user);

    return requiredPermissions.every(({ action, subject }) =>
      ability.can(action, subject)
    );
  }
}
```

**2. Synergie CASL + PostgreSQL RLS :**

La combinaison CASL (couche applicative) + RLS (couche base de donnees) cree une defense en profondeur :

- **CASL** : Premiere ligne de defense au niveau du resolver GraphQL ou du controleur.
- **RLS** : Deuxieme ligne de defense au niveau de la base de donnees, garantissant qu'aucune requete SQL ne retourne de donnees non autorisees, meme en cas de bypass de la couche applicative.

```sql
-- RLS complementaire : filtrage par cercle de visibilite
CREATE POLICY circle_visibility ON calendar_events
  FOR SELECT
  USING (
    visibility_circle >= (
      SELECT min_circle_level FROM user_household_access
      WHERE user_id = current_setting('app.current_user_id')::uuid
        AND household_id = calendar_events.household_id
    )
  );
```

**3. Persistence des permissions (base de donnees) :**

CASL supporte les permissions persistees en base de donnees, permettant une gestion dynamique sans redeploiement :

```typescript
// Les permissions sont stockees en JSON dans la table user_roles
// et chargees dynamiquement a chaque requete
@Entity()
export class UserRole {
  @Column({ type: 'jsonb' })
  permissions: CaslPermission[];
  // Ex: [{ action: 'read', subject: 'CalendarEvent', conditions: { householdId: '...' } }]
}
```

**4. Alternative : node-casbin (nest-authz) :**

Pour des modeles encore plus complexes, `nest-authz` (base sur node-casbin) supporte ACL, RBAC, ABAC et meme les modeles REBAc (Relationship-Based Access Control) via des fichiers de politique configurables.

### Implications RGPD

- **Article 25 -- Protection des donnees des la conception** : L'autorisation fine par attributs garantit que chaque utilisateur n'accede qu'aux donnees strictement necessaires a son role et son cercle.
- **Principe de minimisation** : Les conditions CASL filtrent les donnees au niveau le plus granulaire.
- **Responsabilite du sous-traitant** : Les permissions persistees en base de donnees fournissent une preuve auditable de qui avait acces a quoi, a quel moment.
- **Droit d'acces (Article 15)** : La matrice de permissions CASL permet de documenter facilement les acces de chaque utilisateur pour repondre aux demandes RGPD.

### Sources

- [Mastering Complex RBAC in NestJS with CASL and Prisma (Dev Genius)](https://blog.devgenius.io/mastering-complex-rbac-in-nestjs-integrating-casl-with-prisma-orm-for-granular-authorization-767941a05ef1)
- [CASL -- Roles with Persisted Permissions in NestJS (Medium)](https://medium.com/yavar/casl-roles-with-persisted-permissions-in-nestjs-152129f4a6fb)
- [NestJS Official Documentation -- Authorization](https://docs.nestjs.com/security/authorization)
- [Conditional Authorization with NestJS and CASL (Money Forward)](https://mfi.engineering/conditional-authorization-with-nestjs-and-casl-6293266aa896)
- [CASL Official -- Roles with Persisted Permissions](https://casl.js.org/v6/en/cookbook/roles-with-persisted-permissions)
- [CASL GitHub Repository](https://github.com/stalniy/casl)
- [nest-authz -- RBAC & ABAC based on Node-Casbin (GitHub)](https://github.com/node-casbin/nest-authz)
- [Demystifying Access Control: RBAC vs CASL in NestJS (Medium)](https://medium.com/@kathishcivil94/demystifying-access-control-rbac-vs-casl-in-nestjs-e1cde782e5c0)
- [RBAC Authorization in NestJS (Permit.io)](https://www.permit.io/blog/how-to-protect-a-url-inside-a-nestjs-app-using-rbac-authorization)

---

## 5. Chiffrement des donnees au repos avec PostgreSQL

### Description du patron de securite

Le chiffrement des donnees au repos protege les donnees stockees contre l'acces physique non autorise aux supports de stockage. Pour les donnees familiales sensibles (sante, localisation, photos), plusieurs niveaux de chiffrement sont possibles :

| Niveau | Description | Outil | Granularite |
|---|---|---|---|
| **Disque complet (FDE)** | Chiffrement de la partition / du volume | LUKS, BitLocker, cloud provider | Tout le disque |
| **Transparent Data Encryption (TDE)** | Chiffrement transparent des fichiers de la BDD | Percona TDE, Cybertec TDE | Tablespace / fichiers |
| **Chiffrement au niveau colonnes** | Chiffrement selectif des colonnes sensibles | `pgcrypto` (pgp_sym_encrypt/decrypt) | Colonne / champ |
| **Chiffrement applicatif** | Chiffrement avant envoi a la BDD | NestJS + crypto / libsodium | Champ individuel |

### Application a family-hub (multi-foyer / multi-cercles)

Pour family-hub, une strategie de chiffrement multicouche est recommandee :

**Donnees necessitant un chiffrement au niveau colonne :**

| Type de donnee | Sensibilite | Methode recommandee |
|---|---|---|
| Coordonnees GPS (localisation enfants) | Tres haute | Chiffrement applicatif (libsodium) |
| Donnees de sante (allergies, medicaments) | Tres haute (Art. 9 RGPD) | `pgcrypto` pgp_sym_encrypt |
| Notes medicales | Tres haute | `pgcrypto` pgp_sym_encrypt |
| Photos (metadonnees EXIF) | Haute | Suppression EXIF + chiffrement stockage |
| Numeros de telephone | Moyenne | `pgcrypto` pgp_sym_encrypt |
| Adresses postales | Moyenne | `pgcrypto` pgp_sym_encrypt |

**Donnees ne necessitant pas de chiffrement colonne :**

| Type de donnee | Raison |
|---|---|
| Noms, prenoms | Necessaires pour les recherches et l'affichage (RLS suffit) |
| Evenements calendrier (titres) | Filtres par RLS et cercles de visibilite |
| Taches menageres | Sensibilite faible |

### Approche d'implementation NestJS + PostgreSQL

**1. Chiffrement au niveau colonne avec pgcrypto :**

```sql
-- Activer l'extension pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Table des donnees de sante avec chiffrement
CREATE TABLE health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_profile_id UUID NOT NULL REFERENCES child_profiles(id),
  household_id UUID NOT NULL,
  -- Donnees chiffrees
  allergies_encrypted BYTEA,
  medications_encrypted BYTEA,
  medical_notes_encrypted BYTEA,
  -- Metadonnees en clair (pour le filtrage RLS)
  record_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insertion avec chiffrement
INSERT INTO health_records (child_profile_id, household_id, allergies_encrypted, record_type)
VALUES (
  $1, $2,
  pgp_sym_encrypt('Arachides, Gluten', $3),  -- $3 = cle de chiffrement
  'allergy'
);

-- Lecture avec dechiffrement
SELECT
  id,
  pgp_sym_decrypt(allergies_encrypted, $1) AS allergies
FROM health_records
WHERE child_profile_id = $2;
```

**2. Chiffrement applicatif avec NestJS (pour les donnees les plus sensibles) :**

```typescript
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';

  async encrypt(plaintext: string, encryptionKey: Buffer): Promise<EncryptedData> {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, encryptionKey, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    return {
      ciphertext: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  }

  async decrypt(data: EncryptedData, encryptionKey: Buffer): Promise<string> {
    const decipher = createDecipheriv(
      this.algorithm,
      encryptionKey,
      Buffer.from(data.iv, 'hex'),
    );
    decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));

    let decrypted = decipher.update(data.ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
```

**3. Gestion des cles de chiffrement :**

La gestion des cles est le point le plus critique. Recommandations :

- **Ne jamais stocker les cles dans le code source** ni dans la base de donnees.
- **Utiliser un KMS (Key Management Service)** : AWS KMS, HashiCorp Vault, ou Azure Key Vault.
- **Rotation des cles** : Implementer un mecanisme de rotation periodique des cles avec re-chiffrement des donnees.
- **Cles par foyer** : Pour une isolation maximale, chaque foyer peut avoir sa propre cle de chiffrement derivee d'une cle maitre (Key Derivation Function -- HKDF).
- **Enveloppe de chiffrement (Envelope Encryption)** : Utiliser une cle maitre (KEK) pour chiffrer les cles de donnees (DEK), permettant la rotation sans re-chiffrement massif.

```typescript
// Derivation de cle par foyer
async deriveHouseholdKey(masterKey: Buffer, householdId: string): Promise<Buffer> {
  return promisify(scrypt)(masterKey, householdId, 32) as Promise<Buffer>;
}
```

**4. Impact sur les performances et les requetes :**

Le chiffrement au niveau colonne a des implications importantes :

- **Impossible de faire des WHERE sur les colonnes chiffrees** (ni index, ni recherche full-text).
- **Solution** : Maintenir des colonnes de metadonnees en clair pour le filtrage (ex: `record_type`), combinees avec RLS pour l'isolation.
- **Performance** : Le dechiffrement ajoute un cout CPU. Pour les donnees frequemment lues, envisager un cache applicatif securise (Redis avec TLS + cles ephemeres).

### Implications RGPD

- **Article 32 -- Securite du traitement** : Le chiffrement est explicitement mentionne comme mesure technique appropriee dans le RGPD.
- **Article 34 -- Notification de violation** : Si les donnees chiffrees sont compromises mais que les cles ne le sont pas, la notification aux personnes concernees peut ne pas etre requise (le risque est attenue).
- **Article 9 -- Categories speciales** : Les donnees de sante exigent des mesures de protection renforcees. Le chiffrement au niveau colonne est une mesure proportionnee.
- **Considerant 83** : Le RGPD encourage le pseudonymisation et le chiffrement comme mesures de reduction des risques.

### Sources

- [PostgreSQL Documentation -- Encryption Options](https://www.postgresql.org/docs/current/encryption-options.html)
- [Data Encryption in Postgres: A Guidebook (Crunchy Data)](https://www.crunchydata.com/blog/data-encryption-in-postgres-a-guidebook)
- [PostgreSQL Transparent Data Encryption (Cybertec)](https://www.cybertec-postgresql.com/en/products/postgresql-transparent-data-encryption/)
- [Transparent Data Encryption: Benefits, Types, Best Practices (EnterpriseDB)](https://www.enterprisedb.com/blog/everything-need-know-postgres-data-encryption)
- [PostgreSQL Data Column Encryption Guide (Vultr)](https://docs.vultr.com/how-to-encrypt-data-columns-in-postgresql)
- [GDPR-Compliant Data Obfuscation in PostgreSQL (Medium)](https://medium.com/@ShivIyer/implementing-gdpr-compliant-data-obfuscation-in-postgresql-strategies-and-techniques-1d62d2af9fda)
- [Comprehensive Guide to RLS and Encryption at Rest in PostgreSQL (PostgresHelp)](https://postgreshelp.com/postgresql-rls/)
- [Percona Transparent Data Encryption for Postgres (The New Stack)](https://thenewstack.io/percona-brings-transparent-data-encryption-to-postgres/)

---

## 6. Journalisation d'audit et tracabilite RGPD

### Description du patron de securite

La journalisation d'audit enregistre systematiquement "qui a fait quoi, quand, sur quoi, et depuis ou". C'est un pilier de la conformite RGPD (Article 32) et une exigence implicite pour demontrer la responsabilite du responsable de traitement (Article 5(2) -- principe de responsabilite).

Les composantes d'un systeme d'audit complet :

| Composante | Description | Donnees capturees |
|---|---|---|
| **Audit d'acces** | Qui a consulte quelles donnees | userId, resourceType, resourceId, timestamp |
| **Audit de modification** | Qui a modifie quoi, ancienne/nouvelle valeur | userId, entityType, entityId, oldValue, newValue, timestamp |
| **Audit d'authentification** | Connexions, deconnexions, echecs | userId, action, ipAddress, userAgent, success |
| **Audit de consentement** | Modifications des consentements | userId, consentType, granted/revoked, timestamp |
| **Audit d'export/suppression** | Demandes RGPD (Art. 15, 17) | userId, requestType, dataScope, timestamp |

### Application a family-hub (multi-foyer / multi-cercles)

Pour family-hub, l'audit est particulierement important car :

- **Donnees d'enfants** : Toute consultation des donnees d'enfants doit etre tracee pour demontrer la conformite a l'Article 8.
- **Multi-foyer** : L'audit doit capturer les acces inter-foyers (co-parents, famille elargie) pour verifier que les cercles de visibilite sont respectes.
- **Donnees de sante** : Chaque acces aux donnees de sante (categorie speciale, Art. 9) doit etre journalise.
- **Localisation** : L'acces a la localisation des enfants est une operation hautement sensible qui doit etre tracee.
- **Demandes RGPD** : Le systeme doit journaliser toutes les demandes d'exercice de droits (acces, rectification, effacement, portabilite).

**Evenements d'audit specifiques a family-hub :**

```
CHILD_PROFILE_VIEWED       - Consultation d'un profil enfant
CHILD_LOCATION_ACCESSED    - Acces a la localisation d'un enfant
HEALTH_RECORD_VIEWED       - Consultation d'un dossier de sante
HEALTH_RECORD_MODIFIED     - Modification d'un dossier de sante
PHOTO_SHARED_TO_CIRCLE     - Photo partagee vers un cercle
CIRCLE_ACCESS_GRANTED      - Acces a un cercle accorde
CIRCLE_ACCESS_REVOKED      - Acces a un cercle revoque
CONSENT_UPDATED            - Consentement modifie
GDPR_DATA_EXPORT_REQUESTED - Demande d'export de donnees
GDPR_DATA_DELETION_REQUESTED - Demande de suppression
CROSS_HOUSEHOLD_ACCESS     - Acces inter-foyer
```

### Approche d'implementation NestJS + PostgreSQL

**1. Table d'audit PostgreSQL :**

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Qui
  user_id UUID NOT NULL,
  user_role VARCHAR(50),
  ip_address INET,
  user_agent TEXT,
  -- Quoi
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  -- Contexte familial
  household_id UUID,
  target_circle_level INTEGER,
  -- Details
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,  -- donnees contextuelles supplementaires
  -- Quand
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Immutabilite : pas de UPDATE ni DELETE
  CONSTRAINT no_update CHECK (true)  -- symbolique
);

-- Index pour les requetes d'audit frequentes
CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_household ON audit_logs(household_id);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- Revoke UPDATE et DELETE pour l'immutabilite
REVOKE UPDATE, DELETE ON audit_logs FROM app_user;

-- Partitionnement par mois pour les performances et la retention
CREATE TABLE audit_logs (
  -- ... memes colonnes ...
) PARTITION BY RANGE (created_at);

-- Partition par mois automatique
CREATE TABLE audit_logs_2026_01 PARTITION OF audit_logs
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

**2. Service d'audit NestJS :**

```typescript
@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepository: Repository<AuditLog>,
    private eventEmitter: EventEmitter2,
  ) {}

  async log(entry: CreateAuditLogDto): Promise<void> {
    // Emission asynchrone pour ne pas bloquer la requete principale
    this.eventEmitter.emit('audit.log', entry);
  }

  @OnEvent('audit.log')
  async handleAuditLog(entry: CreateAuditLogDto): Promise<void> {
    await this.auditRepository.save({
      userId: entry.userId,
      userRole: entry.userRole,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      householdId: entry.householdId,
      targetCircleLevel: entry.targetCircleLevel,
      oldValues: entry.oldValues,
      newValues: entry.newValues,
      metadata: entry.metadata,
    });
  }
}
```

**3. Intercepteur d'audit global NestJS :**

```typescript
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(async (responseData) => {
        // Ne journaliser que les operations mutantes ou les acces sensibles
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
          await this.auditService.log({
            userId: user?.id,
            userRole: user?.role,
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
            action: `${request.method} ${request.path}`,
            entityType: this.extractEntityType(request.path),
            entityId: request.params?.id,
            householdId: user?.currentHouseholdId,
            metadata: {
              duration: Date.now() - startTime,
              statusCode: context.switchToHttp().getResponse().statusCode,
            },
          });
        }
      }),
    );
  }
}
```

**4. Subscribers TypeORM pour le suivi des changements d'entites :**

```typescript
@EventSubscriber()
export class EntityAuditSubscriber implements EntitySubscriberInterface {
  constructor(
    dataSource: DataSource,
    private auditService: AuditService,
  ) {
    dataSource.subscribers.push(this);
  }

  // Ecouter TOUTES les entites
  listenTo() {
    return undefined; // Toutes les entites
  }

  async afterUpdate(event: UpdateEvent<any>): Promise<void> {
    if (event.entity && this.isSensitiveEntity(event.metadata.tableName)) {
      await this.auditService.log({
        action: 'ENTITY_UPDATED',
        entityType: event.metadata.tableName,
        entityId: event.entity.id,
        oldValues: event.databaseEntity,
        newValues: event.entity,
      });
    }
  }

  private isSensitiveEntity(tableName: string): boolean {
    return [
      'child_profiles', 'health_records', 'locations',
      'photos', 'user_consents', 'household_members',
    ].includes(tableName);
  }
}
```

**5. Conformite RGPD des logs eux-memes :**

Les logs d'audit contiennent eux-memes des donnees personnelles (userId, ipAddress). Pour la conformite :

```typescript
@Injectable()
export class GdprCompliantLoggingInterceptor implements NestInterceptor {
  private readonly sensitiveFields = ['email', 'password', 'token', 'ssn', 'phoneNumber'];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(() => {
        const request = context.switchToHttp().getRequest();
        // Masquer les champs sensibles dans les logs
        const sanitizedBody = this.maskSensitiveData(request.body);
        // Logger uniquement les donnees assainies
      }),
    );
  }

  private maskSensitiveData(data: any): any {
    if (!data || typeof data !== 'object') return data;
    const masked = { ...data };
    for (const field of this.sensitiveFields) {
      if (masked[field]) {
        masked[field] = '***MASKED***';
      }
    }
    return masked;
  }
}
```

### Implications RGPD

- **Article 5(2) -- Responsabilite** : Les logs d'audit constituent la preuve que le responsable de traitement respecte ses obligations RGPD.
- **Article 15 -- Droit d'acces** : Les logs permettent de repondre aux demandes "qui a accede a mes donnees" en fournissant un historique complet des acces.
- **Article 30 -- Registre des activites** : Les logs d'audit alimentent le registre des activites de traitement.
- **Article 32 -- Securite** : La journalisation des evenements de securite est une mesure technique requise.
- **Article 33/34 -- Notification de violation** : En cas de violation, les logs d'audit permettent d'identifier rapidement la portee de la compromission.
- **Retention des logs** : Les logs doivent avoir une politique de retention definie (ex: 2 ans pour les logs d'audit, 6 mois pour les logs techniques). Le partitionnement PostgreSQL facilite la suppression des partitions anciennes.
- **Minimisation dans les logs** : Ne pas logger les donnees personnelles en clair dans les logs. Utiliser des identifiants (UUID) plutot que des noms ou emails.

### Sources

- [Building a Comprehensive Audit System in NestJS (Medium)](https://medium.com/@usottah/building-a-comprehensive-audit-system-in-nestjs-and-express-js-b34af8588f58)
- [Building an Audit Trail System in NestJS (Medium, Nov 2025)](https://medium.com/@solomoncodes/building-an-audit-trail-system-in-nestjs-222a4604a6a2)
- [GDPR Compliant Logging in NestJS: Masking User Data (ByteHide)](https://www.bytehide.com/blog/gdpr-compliant-logging-in-nestjs)
- [GDPR Compliant Logging in NestJS (DEV Community)](https://dev.to/bytehide/gdpr-compliant-logging-in-nestjs-masking-user-data-in-real-time-46ep)
- [@forlagshuset/nestjs-audit-logging (npm)](https://www.npmjs.com/package/@forlagshuset/nestjs-audit-logging)
- [nestjs-auditlog SDK (GitHub)](https://github.com/thanhlcm90/nestjs-auditlog)
- [Implementing Audit Logging in NestJS (Cropsly)](https://cropsly.com/blog/implementing-audit-logging-in-a-nestjs-application/)
- [Auditing Changes with NestJS and TypeORM (Medium)](https://medium.com/@oskralvarez814/auditing-changes-with-nestjs-and-typeorm-059415e329f2)
- [Subscribers (Entity Listeners) in TypeORM with NestJS for Audit Log (Medium)](https://medium.com/@thapasamresh9/subscribers-entity-listeners-in-typeorm-with-nestjs-for-audit-log-63b7813eb804)
- [GDPR Audit: Complete Compliance Guide 2025 (ComplyDog)](https://complydog.com/blog/gdpr-audit-complete-compliance-audit-guide-2025)

---

## 7. Synthese et recommandations pour family-hub

### Architecture de securite multicouche recommandee

```
                    +--------------------------+
                    |   Client (Web / Mobile)  |
                    +------------+-------------+
                                 |
                    +------------v-------------+
                    |    Rate Limiting          |  <-- @nestjs/throttler
                    |    CORS / Helmet          |  <-- Middleware NestJS
                    |    Validation Entrees     |  <-- class-validator + DTOs
                    +------------+-------------+
                                 |
                    +------------v-------------+
                    |    Better Auth Guard      |  <-- Authentification
                    |    Session Management     |  <-- Cookies securises
                    +------------+-------------+
                                 |
                    +------------v-------------+
                    |    GraphQL Security       |
                    |    - Depth Limiting       |  <-- graphile/depth-limit (max 7)
                    |    - Complexity Analysis  |  <-- graphql-query-complexity
                    |    - Persisted Queries    |  <-- Trusted documents (prod)
                    |    - No Introspection     |  <-- Desactive en production
                    +------------+-------------+
                                 |
                    +------------v-------------+
                    |    CASL Authorization     |  <-- RBAC + ABAC hybride
                    |    - Roles (7 types)      |
                    |    - Cercles (5 niveaux)  |
                    |    - Conditions dynamiques|
                    +------------+-------------+
                                 |
                    +------------v-------------+
                    |    Audit Interceptor      |  <-- Journalisation d'audit
                    |    - Acces sensibles      |
                    |    - Modifications         |
                    |    - Consentements         |
                    +------------+-------------+
                                 |
                    +------------v-------------+
                    |    PostgreSQL             |
                    |    +------------------+   |
                    |    | Row Level Security|   |  <-- 2eme ligne de defense
                    |    | (par foyer/cercle)|   |
                    |    +------------------+   |
                    |    +------------------+   |
                    |    | pgcrypto          |   |  <-- Chiffrement colonnes
                    |    | (sante, location) |   |      sensibles
                    |    +------------------+   |
                    |    +------------------+   |
                    |    | Audit Table       |   |  <-- Logs immutables
                    |    | (partitionnee)    |   |      partitionnes par mois
                    |    +------------------+   |
                    +--------------------------+
                                 |
                    +------------v-------------+
                    |    KMS (Gestion des cles)|  <-- HashiCorp Vault / AWS KMS
                    +--------------------------+
```

### Priorites d'implementation

| Priorite | Composante | Justification |
|---|---|---|
| **P0 (Critique)** | Better Auth + CASL + RLS | Sans autorisation correcte, toutes les donnees sont exposees |
| **P0 (Critique)** | Consentement parental (Art. 8) | Obligation legale pour le traitement des donnees d'enfants |
| **P0 (Critique)** | Durcissement OWASP (validation, helmet, CORS) | Fondamentaux de securite applicative |
| **P1 (Haute)** | Chiffrement des donnees de sante et localisation | Categories speciales RGPD (Art. 9) |
| **P1 (Haute)** | Journalisation d'audit | Exigence RGPD Art. 32 et preuve de conformite |
| **P1 (Haute)** | Securite GraphQL (profondeur + complexite) | Protection contre les DoS |
| **P2 (Moyenne)** | Requetes persistees GraphQL | Securite avancee pour la production |
| **P2 (Moyenne)** | Rotation des cles de chiffrement | Securite operationnelle continue |
| **P2 (Moyenne)** | DPIA (Evaluation d'impact) | Obligation legale pour donnees d'enfants |
| **P3 (Normale)** | Partitionnement de la table d'audit | Optimisation performance a long terme |
| **P3 (Normale)** | Chiffrement par foyer (cles derivees) | Isolation cryptographique maximale |

### Decisions architecturales cles

1. **CASL plutot que Casbin** : CASL est isomorphe (partageable frontend/backend), plus leger, et son modele de conditions s'aligne naturellement avec les cercles de visibilite de family-hub. Casbin est plus puissant mais surdimensionne pour ce cas d'usage.

2. **Chiffrement hybride pgcrypto + applicatif** : Utiliser pgcrypto pour les donnees de sante (exploitant les fonctions SQL) et le chiffrement applicatif (libsodium/crypto) pour les localisations GPS (necessitant un controle fin cote serveur).

3. **RLS + CASL en defense en profondeur** : CASL au niveau applicatif pour les decisions rapides et le partage des regles avec le frontend. RLS au niveau PostgreSQL comme filet de securite ultime empechant tout acces non autorise meme en cas de bug applicatif.

4. **Audit asynchrone via EventEmitter** : Les logs d'audit sont emis de maniere asynchrone pour ne pas degrader les performances des requetes utilisateur. Les evenements critiques (acces enfants, sante) peuvent etre doubles vers un stockage immutable externe (S3, Cloudwatch).

5. **Requetes persistees en production** : Pour la version de production, migrer vers un systeme de trusted documents GraphQL, eliminant les risques de requetes malicieuses arbitraires.

### Checklist RGPD pour family-hub

- [ ] **DPIA** realisee pour le traitement des donnees d'enfants
- [ ] **Consentement parental** verifiable avant tout traitement de donnees d'enfants
- [ ] **Parametres prives par defaut** pour tous les profils (surtout enfants)
- [ ] **Chiffrement au repos** des donnees de sante et de localisation
- [ ] **Audit trail** complet pour tous les acces aux donnees sensibles
- [ ] **Droit a l'effacement** implemente et teste (cascade sur toutes les tables)
- [ ] **Droit a la portabilite** (export JSON/CSV des donnees familiales)
- [ ] **Politique de retention** definie pour chaque type de donnee
- [ ] **Registre des activites de traitement** (Art. 30) documente
- [ ] **Notification de violation** (Art. 33/34) -- processus defini et teste
- [ ] **DPO** designe si applicable (traitement a grande echelle de donnees de mineurs)
- [ ] **Mentions legales et politique de confidentialite** adaptees aux enfants (langage simple)
