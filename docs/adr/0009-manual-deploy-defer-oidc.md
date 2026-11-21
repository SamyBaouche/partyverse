# ADR 0009 — Manual deploy script for v1.0; defer GitLab→Azure OIDC

- Status: Accepted
- Date: 2026-11-21

## Context

Issue #37 / #61 prefer federated OIDC so CI can deploy Container Apps without long-lived secrets. Wiring App Registration + federated credentials + GitLab CI variables is more than a Sunday ship slice, and live Azure is already reachable via local `az login`.

## Decision

- **v1.0:** Documented, scripted deploy: `scripts/deploy-azure.sh` (build/push images → `az containerapp update`). No Azure credentials in the repo.
- **CI:** Keep Kaniko image builds on `main`, Bicep compile / what-if on MRs (`bicep-what-if`), and Trivy filesystem/config scans. No automatic Azure deploy job until OIDC lands.
- **Post-v1.0:** Revisit #37 — GitLab OIDC federated credential + `deploy` job on `main` with manual approval for prod (#38).

## Consequences

- Operators need Azure CLI + registry login locally (or a secure runner with secrets outside git).
- Metric **Y** can still be measured from GitLab pipeline duration + scripted ACA update time.
- OIDC remains the preferred end state; this ADR is an explicit temporary path, not a permanent design.
