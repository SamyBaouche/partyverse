#!/usr/bin/env bash
# Manual Azure deploy for Partyverse v1.0 (OIDC deferred — see ADR 0009).
#
# Prerequisites (local machine, never commit secrets):
#   az login
#   docker login registry.gitlab.com   # deploy token or glab
#
# Usage:
#   ./scripts/deploy-azure.sh                  # build+push SHA tags, update ACA
#   TAG=amd64-abc1234 ./scripts/deploy-azure.sh  # skip build; update only
#   SKIP_PUSH=1 TAG=amd64-abc1234 ./scripts/deploy-azure.sh
#
# Optional env:
#   RESOURCE_GROUP=partyverse-rg
#   SERVER_APP=partyverse-server
#   WEB_APP=partyverse-web
#   CI_REGISTRY_IMAGE=registry.gitlab.com/samybaouche/partyverse
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

RESOURCE_GROUP="${RESOURCE_GROUP:-partyverse-rg}"
SERVER_APP="${SERVER_APP:-partyverse-server}"
WEB_APP="${WEB_APP:-partyverse-web}"
CI_REGISTRY_IMAGE="${CI_REGISTRY_IMAGE:-registry.gitlab.com/samybaouche/partyverse}"
TAG="${TAG:-$(git rev-parse --short HEAD)}"
SKIP_PUSH="${SKIP_PUSH:-0}"

SERVER_IMAGE="${SERVER_IMAGE:-${CI_REGISTRY_IMAGE}/server:${TAG}}"
WEB_IMAGE="${WEB_IMAGE:-${CI_REGISTRY_IMAGE}/web:${TAG}}"

if ! command -v az >/dev/null 2>&1; then
  echo "az CLI required. Install: https://learn.microsoft.com/cli/azure/install-azure-cli" >&2
  exit 1
fi

echo "== Partyverse Azure deploy =="
echo "  resource group: ${RESOURCE_GROUP}"
echo "  server image:   ${SERVER_IMAGE}"
echo "  web image:      ${WEB_IMAGE}"

if [[ "${SKIP_PUSH}" != "1" ]]; then
  TAG="${TAG}" CI_REGISTRY_IMAGE="${CI_REGISTRY_IMAGE}" ./scripts/push-gitlab-registry.sh
fi

echo "Updating Container Apps…"
start=$(date +%s)
az containerapp update \
  --name "${SERVER_APP}" \
  --resource-group "${RESOURCE_GROUP}" \
  --image "${SERVER_IMAGE}" \
  --output none
az containerapp update \
  --name "${WEB_APP}" \
  --resource-group "${RESOURCE_GROUP}" \
  --image "${WEB_IMAGE}" \
  --output none
end=$(date +%s)
echo "ACA update duration: $((end - start))s (paste into docs/metrics.md as Y if useful)"

WEB_FQDN=$(az containerapp show -n "${WEB_APP}" -g "${RESOURCE_GROUP}" --query properties.configuration.ingress.fqdn -o tsv)
SERVER_FQDN=$(az containerapp show -n "${SERVER_APP}" -g "${RESOURCE_GROUP}" --query properties.configuration.ingress.fqdn -o tsv)

echo "Done."
echo "  web:    https://${WEB_FQDN}"
echo "  server: https://${SERVER_FQDN}"
echo ""
echo "Infra changes (KV, probes, budget): use Bicep separately —"
echo "  az deployment group create -g ${RESOURCE_GROUP} -n partyverse-\$(date +%Y%m%d) \\"
echo "    --template-file infra/main.bicep --parameters infra/main.bicepparam"
echo "Never put registry passwords or Key Vault secrets in git."
