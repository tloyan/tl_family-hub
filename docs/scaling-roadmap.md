# Scaling Roadmap — Family Hub

Guide de mise a l'echelle quand le projet passe sur des plans payants.

---

## Phase 1 : Post-MVP (premiers utilisateurs)

**Declencheur :** Lancement beta, ~10-50 foyers

### Supabase Free → Pro ($25/mois)

- **Pourquoi :** Supprime la pause apres 1 semaine d'inactivite, 8 GB storage, backups quotidiens
- **Migration :** Dashboard → Billing → Upgrade. Zero downtime, meme connection string.
- **Gains :**
  - Pas de cold start
  - Point-in-Time Recovery (PITR) pour les backups
  - 500 MB → 8 GB de stockage
  - **Branching** pour preview les migrations de schema avant apply en prod
- **Evolution des environnements :**
  - **Actuel (Free) :** 2 projets separes (`family-hub-dev` + `family-hub-prod`)
  - **Pro :** Conserver les 2 projets (dev + prod). Utiliser les **branches Supabase** pour tester les migrations de schema dans des environnements ephemeres avant de les appliquer en dev puis en prod.
  - Les branches Supabase sont des copies ephemeres de la DB — ideales pour valider un `prisma migrate` sans risquer la prod

### Upstash Free → Pay-as-you-go ($0 base)

- **Pourquoi :** Separer les instances dev et prod, limites plus hautes
- **Migration :** Creer une 2e database pour prod, mettre a jour `REDIS_URL` dans Railway prod
- **Gains :**
  - 2 instances separees (isolation dev/prod)
  - 10 000 → illimite commandes/jour (facturees $0.2/100K)
  - Possible d'activer la persistence

### Railway Trial → Hobby ($5/mois)

- **Pourquoi :** Le trial expire apres consommation des $5 de credit
- **Migration :** Dashboard → Billing → Upgrade. Aucun changement de config.
- **Gains :**
  - 500h → illimite d'execution
  - Support des cron jobs
  - Metriques plus detaillees

### Vercel Hobby → Pro ($20/mois)

- **Pourquoi :** Si les limites de bandwidth ou de builds sont atteintes
- **Migration :** Dashboard → Billing → Upgrade
- **Gains :**
  - Bandwidth : 100 GB → 1 TB
  - Builds : 100h → 400h/mois
  - Web Analytics inclus
  - Preview deployments protegees par mot de passe

**Cout total Phase 1 : ~$50/mois**

---

## Phase 2 : Croissance (100-500 foyers)

**Declencheur :** Utilisateurs actifs quotidiens, besoin de performance

### Domaine dedie + Cloudflare Free

- **Action :** Acheter un domaine dedie (ex: `familyhub.fr`, ~$10/an)
- **Setup Cloudflare Free :**
  - CDN global avec caching intelligent
  - WAF (Web Application Firewall) avec regles OWASP
  - TLS 1.3 + certificats automatiques
  - Protection DDoS L3/L4
  - Page Rules pour le caching des assets statiques
- **DNS :** Migrer les enregistrements vers Cloudflare, pointer Railway et Vercel via CNAME proxied

### Railway Hobby → Pro ($20/mois)

- **Pourquoi :** Scaling horizontal, SLA garanti
- **Gains :**
  - Autoscaling horizontal (replicas)
  - SLA 99.9%
  - Networking prive entre services
  - Metriques avancees + alerting
- **Config :**
  - Min replicas : 1
  - Max replicas : 3
  - Scale trigger : CPU > 70% ou memoire > 80%

### Monitoring

- **Sentry** (Free tier → Team $26/mois) : Error tracking + performance monitoring
- **Better Stack** (Free tier) : Uptime monitoring + status page
- **Config :**
  - Health check toutes les 30s
  - Alertes Slack/Discord sur downtime
  - Status page publique

**Cout total Phase 2 : ~$120/mois**

---

## Phase 3 : Scale (500-5000 foyers)

**Declencheur :** Performance ou limites de stockage atteintes

### Supabase Pro → Team ($599/mois) OU migration PostgreSQL

**Option A — Supabase Team :**

- PITR 28 jours
- SOC2 compliance
- Priority support
- Compute dedier

**Option B — Migration vers un PostgreSQL dedie :**

- **Neon** (Scale $69/mois) : Serverless, branching, autoscaling
- **Railway PostgreSQL** : Managed, meme plateforme
- **Migration :** Dump Supabase → Restore sur la nouvelle DB → Update `DATABASE_URL`

### Upstash → Upstash Pro OU Redis dedie

**Option A — Upstash Pro ($10/mois) :**

- 100 000 commandes/jour incluses
- Multi-region replication
- Read replicas

**Option B — Railway Redis :**

- Managed Redis sur la meme plateforme
- Persistence garantie
- Pas de limites de commandes

### CDN + Assets

- **Cloudflare R2** ($0.015/GB/mois) pour le stockage d'images/fichiers
  - Compatible S3 API
  - Pas de frais d'egress
  - Workers pour le traitement d'images

### Background Jobs

- **BullMQ** via Redis pour les jobs asynchrones :
  - Envoi de notifications push
  - Generation AI
  - Exports RGPD
  - Nettoyage periodique
- **Railway Cron** pour les taches planifiees

**Cout total Phase 3 : ~$300-700/mois selon l'option DB**

---

## Phase 4 : Enterprise (5000+ foyers)

**Declencheur :** Exigences de compliance, multi-region, haute disponibilite

### Infrastructure

| Composant  | Solution                                          | Cout estime   |
| ---------- | ------------------------------------------------- | ------------- |
| Database   | PostgreSQL dedie (Neon Scale ou RDS)              | $200-500/mois |
| Cache      | Redis cluster (Upstash Enterprise ou ElastiCache) | $50-200/mois  |
| API        | Railway Pro multi-region ou Kubernetes            | $100-300/mois |
| Web        | Vercel Enterprise ou self-hosted                  | $150+/mois    |
| CDN/WAF    | Cloudflare Pro ($20/mois)                         | $20/mois      |
| Monitoring | Datadog ou Grafana Cloud                          | $50-200/mois  |
| Secrets    | Doppler Team ($18/user/mois)                      | $50-100/mois  |

### Architecture

- **Multi-region :** API deployee en EU-West + EU-Central (failover)
- **Read replicas :** PostgreSQL read replicas pour les queries lourdes
- **Queue :** BullMQ → migration vers un message broker dedie si besoin (RabbitMQ, SQS)
- **Observabilite :** Distributed tracing (OpenTelemetry), log aggregation, metriques custom

### Compliance

- **RGPD :** Toutes les donnees en EU, DPO nomme, registre de traitements
- **SOC2 :** Si clients entreprise (audit annuel)
- **Backups :** PITR avec retention 30 jours, tests de restauration mensuels

**Cout total Phase 4 : ~$1000-2000/mois**

---

## Resume des paliers

| Phase        | Foyers   | Cout/mois        | Cout/foyer/mois |
| ------------ | -------- | ---------------- | --------------- |
| MVP (actuel) | 1-10     | ~$0 (free tiers) | $0              |
| Phase 1      | 10-50    | ~$50             | $1-5            |
| Phase 2      | 100-500  | ~$120            | $0.24-1.20      |
| Phase 3      | 500-5000 | ~$500            | $0.10-1.00      |
| Phase 4      | 5000+    | ~$1500           | < $0.30         |

> **Objectif NFR17 :** < $0.05/foyer/mois a l'echelle. Atteignable a partir de ~30 000 foyers avec l'architecture Phase 4.

---

## Checklist avant chaque upgrade

- [ ] Mesurer les metriques actuelles (CPU, memoire, latence, storage)
- [ ] Identifier le goulot d'etranglement precis
- [ ] Estimer le ROI de l'upgrade vs optimisation du code
- [ ] Planifier la migration pendant une fenetre de maintenance
- [ ] Tester en environnement dev d'abord
- [ ] Mettre a jour les variables d'environnement
- [ ] Verifier les health checks post-migration
- [ ] Monitorer les metriques pendant 24h apres migration
