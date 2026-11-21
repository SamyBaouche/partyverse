# syntax=docker/dockerfile:1.7
FROM node:24-alpine AS build
WORKDIR /app
RUN corepack enable
ARG VITE_USE_MOCK=false
ENV VITE_USE_MOCK=$VITE_USE_MOCK
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/web apps/web
COPY packages/shared packages/shared
RUN pnpm install --frozen-lockfile --filter @partyverse/web... \
  && pnpm --filter @partyverse/web build

FROM nginx:1.27-alpine
# envsubst at start → /etc/nginx/conf.d/default.conf
ENV API_SCHEME=http
ENV API_UPSTREAM=server:3000
COPY apps/web/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz || exit 1
CMD ["nginx", "-g", "daemon off;"]
