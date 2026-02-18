# Cloudflare Free Setup Guide

## Current State (February 2026)

The API and web app are deployed without Cloudflare:

- **API (NestJS):** Railway with auto-generated domain (`tlfamily-hub-dev.up.railway.app`)
- **Web (Next.js):** Vercel with auto-generated domain
- **TLS:** Provided natively by Railway and Vercel (Let's Encrypt, TLS 1.3)
- **DNS:** `tloyan.com` managed by Vercel DNS

This setup is sufficient for development and MVP. Cloudflare is deferred until a dedicated domain is purchased.

## Why Defer Cloudflare

1. **`tloyan.com` is on Vercel DNS.** Migrating to Cloudflare requires changing nameservers and re-creating all existing DNS records, affecting other projects on the same domain.
2. **Railway and Vercel already provide TLS 1.3** via Let's Encrypt. There is no security gap.
3. **A dedicated domain** (e.g., `familyhub.fr`) makes the migration clean — no existing records to migrate.

## When to Set Up Cloudflare

When you purchase a dedicated domain for the project (e.g., `familyhub.fr`, `familyhub.app`).

## Setup Steps

### 1. Purchase a Domain

Buy from any registrar (Cloudflare Registrar, Namecheap, OVH, etc.). Cloudflare Registrar charges at-cost (no markup).

### 2. Add Domain to Cloudflare

1. Create a Cloudflare account at https://dash.cloudflare.com
2. Click **Add a site** and enter your domain
3. Select the **Free plan**
4. Cloudflare will scan for existing DNS records (none for a new domain)

### 3. Change Nameservers

Update the nameservers at your registrar to the ones provided by Cloudflare (e.g., `anna.ns.cloudflare.com`, `bob.ns.cloudflare.com`). Propagation takes up to 24 hours.

### 4. Configure DNS Records

| Type  | Name         | Value                           | Proxy                 |
| ----- | ------------ | ------------------------------- | --------------------- |
| CNAME | `api`        | `<railway-prod>.up.railway.app` | DNS only (grey cloud) |
| CNAME | `dev-api`    | `<railway-dev>.up.railway.app`  | DNS only (grey cloud) |
| CNAME | `@` or `www` | `cname.vercel-dns.com`          | DNS only (grey cloud) |
| CNAME | `dev`        | `cname.vercel-dns.com`          | DNS only (grey cloud) |

**Important:** Start with **DNS only** (grey cloud icon) for Railway and Vercel records. Cloudflare proxy (orange cloud) can cause issues with these platforms because they already handle TLS termination. Enable proxy only if you need WAF/DDoS protection and after testing.

### 5. Add Custom Domains to Railway

For each Railway environment:

1. Go to your service → **Settings** → **Networking** → **Custom Domain**
2. Add `api.yourdomain.com` (prod) and `dev-api.yourdomain.com` (dev)
3. Railway will verify the CNAME automatically

### 6. Add Custom Domains to Vercel

1. Go to your Vercel project → **Settings** → **Domains**
2. Add `yourdomain.com` (production) and `dev.yourdomain.com` (preview/dev)
3. Vercel will verify the CNAME automatically

### 7. Configure SSL/TLS

In Cloudflare dashboard → **SSL/TLS**:

- Set encryption mode to **Full (strict)** — both Railway and Vercel provide valid certificates
- Enable **Always Use HTTPS**
- Set **Minimum TLS Version** to **1.2** (1.3 is used automatically when supported)

### 8. Enable Security Features (Free Plan)

- **WAF:** Cloudflare Managed Rules are included in Free plan (basic protection)
- **DDoS Protection:** Always-on, included in Free plan
- **Bot Management:** Basic bot protection included
- **Rate Limiting:** 1 rule included in Free plan

### 9. Update Environment Variables

After custom domains are active, update the environment variables:

| Variable                  | Dev Environment                          | Prod Environment                     |
| ------------------------- | ---------------------------------------- | ------------------------------------ |
| `BETTER_AUTH_URL`         | `https://dev-api.yourdomain.com`         | `https://api.yourdomain.com`         |
| `NEXT_PUBLIC_GRAPHQL_URL` | `https://dev-api.yourdomain.com/graphql` | `https://api.yourdomain.com/graphql` |

## Architecture Decision

| Criteria        | Current (no Cloudflare) | With Cloudflare Free      |
| --------------- | ----------------------- | ------------------------- |
| TLS 1.3         | Railway + Vercel native | Cloudflare + origin certs |
| CDN             | Vercel Edge only        | Cloudflare global CDN     |
| WAF             | None                    | Basic managed rules       |
| DDoS Protection | Railway/Vercel basic    | Cloudflare always-on      |
| Cost            | $0                      | $0 (Free plan)            |
| Custom Domain   | Not required            | Required                  |
