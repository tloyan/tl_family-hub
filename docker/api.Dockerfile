# ── Stage 1: Base ────────────────────────────────────────────────────────────
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate
RUN apk add --no-cache wget

# ── Stage 2: Pruner ──────────────────────────────────────────────────────────
FROM base AS pruner
WORKDIR /app
RUN pnpm add -g turbo@^2
COPY . .
RUN turbo prune @family-hub/api --docker

# ── Stage 3: Builder ─────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

# Install dependencies first (leverages Docker layer cache)
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY --from=pruner /app/out/full/ .
# Dummy DATABASE_URL for prisma generate (no actual connection made)
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
    pnpm turbo run build --filter=@family-hub/api

# ── Stage 4: Production deps ────────────────────────────────────────────────
FROM base AS prod-deps
WORKDIR /app

COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# ── Stage 5: Runner ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nestjs && \
    adduser --system --uid 1001 nestjs

# Copy production node_modules (clean install, no broken symlinks)
COPY --from=prod-deps --chown=nestjs:nestjs /app/node_modules ./node_modules
COPY --from=prod-deps --chown=nestjs:nestjs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=prod-deps --chown=nestjs:nestjs /app/packages/db/node_modules ./packages/db/node_modules

# Copy built API
COPY --from=builder --chown=nestjs:nestjs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nestjs /app/apps/api/package.json ./apps/api/package.json

# Copy built db package (includes generated Prisma client)
COPY --from=builder --chown=nestjs:nestjs /app/packages/db/dist ./packages/db/dist
COPY --from=builder --chown=nestjs:nestjs /app/packages/db/package.json ./packages/db/package.json
COPY --from=builder --chown=nestjs:nestjs /app/packages/db/prisma ./packages/db/prisma

# Copy shared package
COPY --from=builder --chown=nestjs:nestjs /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder --chown=nestjs:nestjs /app/packages/shared/package.json ./packages/shared/package.json

# Copy root package.json and pnpm-workspace for workspace resolution
COPY --from=builder --chown=nestjs:nestjs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nestjs /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

USER nestjs

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

WORKDIR /app/apps/api
CMD ["node", "dist/main"]
