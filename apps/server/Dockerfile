# syntax=docker/dockerfile:1.7
# Sprint 3 — containerized game authority (tsx runtime; shared stays TS source).
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/server apps/server
COPY packages/shared packages/shared
RUN pnpm install --frozen-lockfile --filter @partyverse/server...
WORKDIR /app/apps/server
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1
CMD ["pnpm", "exec", "tsx", "--env-file-if-exists=.env", "src/index.ts"]
