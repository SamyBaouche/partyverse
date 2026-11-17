# Metrics

Only numbers that were measured go here. Resume bullets must match this table.

| Date       | Metric                               | Value              | How it was measured                                                         |
| ---------- | ------------------------------------ | ------------------ | --------------------------------------------------------------------------- |
| 2026-11-16 | Game engine coverage (stmts)         | **86%**            | `pnpm --filter @partyverse/server test:coverage` → 85.9%                    |
| 2026-11-16 | Server tests                         | **64**             | same command — 64 passed                                                    |
| 2026-11-16 | GitLab CI duration (main #102)       | **75 s ≈ 1 min**   | Pipeline `3068906958` duration field → **Y**                                |
| 2026-11-16 | Manual Azure Bicep deploy (first)    | **PT2M3s ≈ 2 min** | `az deployment group create -g partyverse-rg -n partyverse-sprint3` → **X** |
| 2026-11-16 | Azure idle cost (MTD, partyverse-rg) | **$0**             | Cost Management ActualCost query, empty/zero rows → **$N**                  |
| 2026-11-16 | Docker server image (cold)           | **18 s**           | `docker build -f apps/server/Dockerfile`                                    |
| 2026-11-16 | Docker web image (cold)              | **12 s**           | `docker build -f apps/web/Dockerfile`                                       |
| 2026-11-16 | `/health` p95 @ 20 VUs               | **3.7 ms**         | `k6 run -e VUS=20 -e DURATION=30s load/health.js` (localhost)               |
| 2026-11-16 | Concurrent VUs sustained             | **20**             | k6 health scenario                                                          |

## Live Azure (Sprint 3)

| Resource       | Value                                                                              |
| -------------- | ---------------------------------------------------------------------------------- |
| Subscription   | Azure for Students                                                                 |
| Resource group | `partyverse-rg` (Canada Central)                                                   |
| Web            | https://partyverse-web.whiteflower-731f831a.canadacentral.azurecontainerapps.io    |
| Server         | https://partyverse-server.whiteflower-731f831a.canadacentral.azurecontainerapps.io |
| Web PubSub     | `partyverse-wps-ddb7gd5jsmffo` (Free_F1)                                           |

> Container Apps currently run placeholder images until ACR push of Partyverse builds. Cost baseline (scale-to-zero + Free PubSub) is already measurable.

## Resume mapping

| Placeholder        | Value       | Notes                                                    |
| ------------------ | ----------- | -------------------------------------------------------- |
| `$N` /month        | **0**       | Cost Management MTD = $0 on idle Free_F1 + scale-to-zero |
| `M` MAU            | leave **M** | Need real players on the public URL (not inventable)     |
| Deploy `X` min     | **2**       | Timed first `az deployment group create`                 |
| Deploy `Y` min     | **1**       | Timed GitLab CI green pipeline                           |
| Coverage           | **86%**     | Measured                                                 |
| Latency sub-`X` ms | **50**      | Localhost 3.7 ms; conservative prod gate                 |
| Concurrent `Y`     | **20**      | k6 VUs / Free PubSub unit                                |

## Commands to refresh

```bash
./scripts/measure-deploy.sh
k6 run -e VUS=20 -e DURATION=30s load/health.js
az deployment group show -g partyverse-rg -n partyverse-sprint3 --query properties.duration
# Cost:
az rest --method post \
  --url "https://management.azure.com/subscriptions/<sub>/providers/Microsoft.CostManagement/query?api-version=2023-11-01" \
  --body '{"type":"ActualCost","timeframe":"MonthToDate","dataset":{"granularity":"None","aggregation":{"totalCost":{"name":"Cost","function":"Sum"}},"filter":{"dimensions":{"name":"ResourceGroupName","operator":"In","values":["partyverse-rg"]}}}}'
```
