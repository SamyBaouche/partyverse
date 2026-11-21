#!/usr/bin/env bash
# Sync Key Vault secret *values* into Container Apps (Phase 2.1).
#
# Live `partyverse-env` is an Express environment: ACA Key Vault secret refs are
# NOT supported (ExpressKeyVaultSecretsNotSupported). Key Vault remains the
# source of truth; this script copies values into ACA secrets at wire time.
# Managed Identity is still assigned for future Blob/Cosmos access.
#
# Prerequisites: az login; infra/keyvault.bicep already deployed.
set -euo pipefail

RESOURCE_GROUP="${RESOURCE_GROUP:-partyverse-rg}"
SERVER_APP="${SERVER_APP:-partyverse-server}"
WEB_APP="${WEB_APP:-partyverse-web}"
KV_NAME="${KV_NAME:-pv-kv-ddb7gd5jsmffo}"
MI_NAME="${MI_NAME:-partyverse-mi-ddb7gd5jsmffo}"

MI_ID=$(az identity show -n "${MI_NAME}" -g "${RESOURCE_GROUP}" --query id -o tsv)

echo "== Wire KV → ACA secrets (value sync; Express env) =="
echo "  KV: ${KV_NAME}"
echo "  MI: ${MI_ID}"

echo "Assigning user-assigned identity to server + web…"
az containerapp identity assign \
  --name "${SERVER_APP}" \
  --resource-group "${RESOURCE_GROUP}" \
  --user-assigned "${MI_ID}" \
  --output none
az containerapp identity assign \
  --name "${WEB_APP}" \
  --resource-group "${RESOURCE_GROUP}" \
  --user-assigned "${MI_ID}" \
  --output none

echo "Reading secrets from Key Vault…"
WPS_CS=$(az keyvault secret show --vault-name "${KV_NAME}" --name webpubsub-connection-string --query value -o tsv)
AI_CS=$(az keyvault secret show --vault-name "${KV_NAME}" --name appinsights-connection-string --query value -o tsv)

SECRET_ARGS=(
  "webpubsub-connection-string=${WPS_CS}"
  "appinsights-connection-string=${AI_CS}"
)
ENV_ARGS=(
  "WEBPUBSUB_CONNECTION_STRING=secretref:webpubsub-connection-string"
  "APPLICATIONINSIGHTS_CONNECTION_STRING=secretref:appinsights-connection-string"
)

if az keyvault secret show --vault-name "${KV_NAME}" --name cosmos-connection-string --query value -o tsv >/dev/null 2>&1; then
  COSMOS_CS=$(az keyvault secret show --vault-name "${KV_NAME}" --name cosmos-connection-string --query value -o tsv)
  SECRET_ARGS+=("cosmos-connection-string=${COSMOS_CS}")
  ENV_ARGS+=("COSMOS_CONNECTION_STRING=secretref:cosmos-connection-string")
  echo "  + cosmos-connection-string"
fi

echo "Writing ACA secrets (values; registry secret left untouched)…"
az containerapp secret set \
  --name "${SERVER_APP}" \
  --resource-group "${RESOURCE_GROUP}" \
  --secrets "${SECRET_ARGS[@]}" \
  --output none

echo "Ensuring server env refs…"
az containerapp update \
  --name "${SERVER_APP}" \
  --resource-group "${RESOURCE_GROUP}" \
  --set-env-vars "${ENV_ARGS[@]}" \
  --output none

SERVER_FQDN=$(az containerapp show -n "${SERVER_APP}" -g "${RESOURCE_GROUP}" --query properties.configuration.ingress.fqdn -o tsv)
az containerapp update \
  --name "${WEB_APP}" \
  --resource-group "${RESOURCE_GROUP}" \
  --set-env-vars \
    "API_UPSTREAM=${SERVER_FQDN}" \
    "API_SCHEME=https" \
  --output none

echo "Done."
echo "  identity: az containerapp show -n ${SERVER_APP} -g ${RESOURCE_GROUP} --query identity"
echo "  health:   curl -sS https://${SERVER_FQDN}/health"
