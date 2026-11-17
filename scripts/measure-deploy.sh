#!/usr/bin/env bash
# Sprint 3/4 timing helper — records "before" (manual compose build) vs incremental rebuild.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
OUT="${ROOT}/docs/metrics-raw"
mkdir -p "$OUT"

echo "== Partyverse deploy timing =="

start=$(date +%s)
pnpm install --frozen-lockfile >/tmp/pv-install.log 2>&1
pnpm --filter @partyverse/shared build >/tmp/pv-shared.log 2>&1
pnpm --filter @partyverse/server build >/tmp/pv-server.log 2>&1
pnpm --filter @partyverse/web build >/tmp/pv-web.log 2>&1
end=$(date +%s)
manual=$((end - start))
echo "manual_pnpm_build_sec=${manual}" | tee "${OUT}/manual-build.txt"

if command -v docker >/dev/null 2>&1; then
  start=$(date +%s)
  docker build -f apps/server/Dockerfile -t partyverse-server:measure . >/tmp/pv-docker-server.log 2>&1
  docker build -f apps/web/Dockerfile -t partyverse-web:measure . >/tmp/pv-docker-web.log 2>&1
  end=$(date +%s)
  docker_sec=$((end - start))
  echo "docker_images_build_sec=${docker_sec}" | tee "${OUT}/docker-build.txt"

  start=$(date +%s)
  docker build -f apps/server/Dockerfile -t partyverse-server:measure . >/tmp/pv-docker-server-cache.log 2>&1
  end=$(date +%s)
  cached=$((end - start))
  echo "docker_server_rebuild_cached_sec=${cached}" | tee -a "${OUT}/docker-build.txt"
fi

echo "Done. See ${OUT}/"
