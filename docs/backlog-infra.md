# Backlog Infrastructure & CI/CD

Liste informelle des choses a mettre en place ulterieurement. Pas de priorite stricte — a adresser au fil de l'eau selon les besoins.

Derniere mise a jour : fevrier 2026.

---

## Production (`main`) — Deploiement complet

Actuellement la CI/CD est operationnelle sur `dev` uniquement. Pour que `main` fonctionne en production :

- [ ] **Doppler `prd`** : Remplir tous les secrets de production (DATABASE_URL prod, BETTER_AUTH_SECRET different, GOOGLE_CLIENT_ID/SECRET prod, REDIS_URL prod, URLs prod)
- [ ] **Doppler integration Railway prod** : Mapper le config `prd` → Railway environment `production`
- [ ] **Doppler integration Vercel prod** : Mapper le config `prd` → Vercel environment `Production`
- [ ] **Doppler service token `prd`** : Creer le token `github-actions-prd`, l'ajouter dans GitHub Environment `production` → secret `DOPPLER_TOKEN`
- [ ] **GitHub Environment `production`** : Verifier que tous les secrets de deploiement sont presents (`RAILWAY_TOKEN`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `EXPO_TOKEN`, `DOPPLER_TOKEN`)
- [ ] **GitHub Environment `production` — protection rules** : Ajouter une regle de review obligatoire (au moins 1 approbation) avant deploy en prod
- [ ] **Railway environnement `production`** : Verifier que le service est configure (branche `main`, domaine public, PORT=8080)
- [ ] **Vercel production** : Verifier que le domaine `familyhub.tloyan.com` pointe vers le bon deploiement
- [ ] **Supabase prod** : Verifier que le projet `family-hub-prod` est operationnel et que le connection string est dans Doppler `prd`
- [ ] **Upstash prod** : Instance Redis de production (separee de dev si possible)
- [ ] **Tester un merge `dev` → `main`** de bout en bout : CI passe → deploy workflow se declenche → les 3 jobs (API, Web, Mobile) deploient en production → health checks passent
- [ ] **Premier tag de version** : Creer `v0.1.0` sur le premier merge reussi vers `main`

---

## Cloudflare

La configuration Cloudflare n'est pas encore en place. Les domaines utilisent actuellement Vercel DNS directement.

- [ ] **Creer un compte Cloudflare Free** et importer le domaine `tloyan.com`
- [ ] **Configurer les DNS** : CNAME `api-familyhub` → Railway prod, CNAME `dev-api-familyhub` → Railway dev
- [ ] **Activer le proxy Cloudflare** (bouton orange) sur les enregistrements API pour beneficier du CDN + WAF
- [ ] **Configurer le mode SSL** : Full (strict) — Cloudflare verifie le certificat d'origine
- [ ] **Page Rules** : Cache des assets statiques, redirection HTTP → HTTPS
- [ ] **WAF** : Activer les regles OWASP de base (gratuit)
- [ ] **Rate limiting** : Regle basique sur `/graphql` pour eviter l'abus (gratuit : 1 regle)
- [ ] **Mettre a jour la doc** `docs/infrastructure-setup.md` et `docs/cloudflare-setup.md`

---

## Rollback automatique

Le deploy workflow ne fait aucun rollback si le health check echoue. Le deploiement casse reste en ligne.

- [ ] **Railway** : Appeler l'API Railway pour rollback au deploiement precedent si le health check echoue (`POST /v2/deployments/{id}/rollback`)
- [ ] **Vercel** : Utiliser `vercel rollback` si le health check echoue
- [ ] **Mobile** : Pas de rollback natif sur EAS Update — pousser un nouvel update avec le code precedent
- [ ] **Enregistrer le SHA deploye** : Creer des tags `deployed/dev` et `deployed/production` ou utiliser la GitHub Deployments API pour tracker quel SHA est live

---

## Notifications de deploiement

- [ ] **Slack ou Discord** : Notifier sur deploy success/failure (webhook dans le workflow)
- [ ] **GitHub Deployments API** : Creer un deployment record pour chaque deploy (visible dans l'onglet "Environments" du repo)

---

## Monitoring et observabilite

- [ ] **Sentry** : Error tracking + performance monitoring (free tier)
- [ ] **Better Stack / UptimeRobot** : Uptime monitoring sur les health checks API et Web
- [ ] **Status page** : Page publique avec l'etat des services

---

## Coverage etendue

La coverage est collectee pour `apps/api` uniquement.

- [ ] **`apps/web`** : Ajouter `@vitest/coverage-v8` quand les premiers tests seront ecrits
- [ ] **`apps/mobile`** : Idem
- [ ] **`packages/*`** : Ajouter la coverage pour les packages avec de la logique testable (`shared`, `db`, `auth`)
- [ ] **Mettre a jour `sonar-project.properties`** : Ajouter les paths lcov supplementaires au fur et a mesure

---

## Quality gates supplementaires

- [ ] **PR checks obligatoires** : Proteger la branche `dev` pour exiger CI vert avant merge
- [ ] **SonarCloud PR decoration** : Verifier que les commentaires SonarCloud apparaissent sur les PRs (necessite l'app GitHub SonarCloud)
- [ ] **Branch protection `main`** : Exiger CI vert + au moins 1 review + SonarCloud quality gate passe

---

## Securite

- [ ] **Secret scanning** : Activer dans GitHub (Settings → Code security and analysis)
- [ ] **Push protection** : Bloquer les pushes contenant des secrets detectes
- [ ] **Dependabot security updates** : Verifier que les alertes de securite sont actives
- [ ] **CORS** : Configurer les origines autorisees sur l'API pour les domaines de production
