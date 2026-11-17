#!/usr/bin/env bash
# Push Partyverse images to GitLab Container Registry (#25).
# Usage:
#   ./scripts/push-gitlab-registry.sh
# Optional env:
#   CI_REGISTRY=registry.gitlab.com
#   CI_REGISTRY_IMAGE=registry.gitlab.com/samybaouche/partyverse
#   TAG=$(git rev-parse --short HEAD)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

CI_REGISTRY="${CI_REGISTRY:-registry.gitlab.com}"
CI_REGISTRY_IMAGE="${CI_REGISTRY_IMAGE:-registry.gitlab.com/samybaouche/partyverse}"
TAG="${TAG:-$(git rev-parse --short HEAD)}"

echo "Logging into ${CI_REGISTRY} (glab / docker credentials)..."
if [[ -n "${CI_REGISTRY_USER:-}" && -n "${CI_REGISTRY_PASSWORD:-}" ]]; then
  echo "${CI_REGISTRY_PASSWORD}" | docker login "${CI_REGISTRY}" -u "${CI_REGISTRY_USER}" --password-stdin
elif command -v glab >/dev/null 2>&1; then
  glab auth status >/dev/null
  # Prefer existing docker login; otherwise prompt once.
  docker login "${CI_REGISTRY}" || true
else
  docker login "${CI_REGISTRY}"
fi

echo "Building server → ${CI_REGISTRY_IMAGE}/server:${TAG}"
docker build -f apps/server/Dockerfile -t "${CI_REGISTRY_IMAGE}/server:${TAG}" -t "${CI_REGISTRY_IMAGE}/server:latest" .
docker push "${CI_REGISTRY_IMAGE}/server:${TAG}"
docker push "${CI_REGISTRY_IMAGE}/server:latest"

echo "Building web → ${CI_REGISTRY_IMAGE}/web:${TAG}"
docker build -f apps/web/Dockerfile -t "${CI_REGISTRY_IMAGE}/web:${TAG}" -t "${CI_REGISTRY_IMAGE}/web:latest" .
docker push "${CI_REGISTRY_IMAGE}/web:${TAG}"
docker push "${CI_REGISTRY_IMAGE}/web:latest"

echo "Done."
echo "  server: ${CI_REGISTRY_IMAGE}/server:${TAG}"
echo "  web:    ${CI_REGISTRY_IMAGE}/web:${TAG}"
