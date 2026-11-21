# ADR 0011 — Key Vault + Managed Identity for ACA secrets

- Status: Accepted
- Date: 2026-11-21

## Context

Phase 2 needs secrets (Web PubSub, App Insights, later Cosmos) out of plain Container Apps secret values and into Key Vault, readable via user-assigned Managed Identity. A full `main.bicep` redeploy against the live RG would wipe registry pull secrets and `API_UPSTREAM` unless every live value is re-passed.

## Decision

1. **Additive template** `infra/keyvault.bicep` creates KV + MI + RBAC + secrets only (references existing Web PubSub).
2. **Live ACA env rejects Key Vault secret refs** (`ExpressKeyVaultSecretsNotSupported`). Therefore `scripts/wire-kv-secrets.sh` **copies secret values** from KV into ACA secrets (KV = source of truth; ACA holds runtime copies) and assigns the MI for future Blob/Cosmos.
3. **`main.bicep`** stays the greenfield SoT (KV refs + AI secret + `API_UPSTREAM` + `anonymousConnectPolicy: allow`) for non-Express / future envs. Do not blind-redeploy `main.bicep` against the live Express env without registry + image params.

## Consequences

- Live Phase 2.1 does not require a destructive full-stack Bicep apply.
- Rotating a secret = update KV, then re-run `wire-kv-secrets.sh`.
- Operators still need `az login` (OIDC deploy remains ADR 0009).
- Orphan `rg-partyverse-dev` PubSub is deleted separately after confirming unused.
- Migrating off Express (if Azure requires it for native KV refs) is a later infra decision.
