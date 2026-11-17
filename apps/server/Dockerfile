# syntax=docker/dockerfile:1.7
# Sprint 3 #23 — multi-stage, non-root, healthcheck.
# Runtime still uses tsx because @partyverse/shared ships TypeScript source.

FROM node:24-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/server apps/server
COPY packages/shared packages/shared
RUN pnpm install --frozen-lockfile --filter @partyverse/server...

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# wget for HEALTHCHECK; no pnpm/corepack at runtime — call tsx binary directly.
RUN apk add --no-cache wget
COPY --from=deps --chown=node:node /app /app
USER node
WORKDIR /app/apps/server
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1
CMD ["./node_modules/.bin/tsx", "src/index.ts"]
