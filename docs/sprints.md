# Sprints 3–8 (metrics track)

Goal: fill resume placeholders with **measured** numbers only.

| Sprint | Theme                                | Metric produced            | Status             |
| ------ | ------------------------------------ | -------------------------- | ------------------ |
| 3      | Docker + Bicep + first manual deploy | **X** min (before)         | In progress        |
| 4      | CI/CD images + OIDC path             | **Y** min (after)          | In progress        |
| 5      | Resilience + cost                    | **$N**/month               | Pending Azure bill |
| 6      | App Insights + E2E                   | **M** users                | Pending traffic    |
| 7      | k6 load test                         | **p95** + concurrent **Y** | Runnable locally   |
| 8      | Docs / demo / v1.0                   | Freeze 3 bullets           | Pending            |

## How to refresh numbers

```bash
# Coverage (Z)
pnpm --filter @partyverse/server test:coverage

# Deploy timings (X / Y)
chmod +x scripts/measure-deploy.sh && ./scripts/measure-deploy.sh

# Latency + concurrency (p95 / players)
pnpm --filter @partyverse/server dev &
k6 run -e VUS=20 -e DURATION=30s load/health.js
k6 run -e VUS=8 -e DURATION=20s load/rooms.js
```

Record every result in [`metrics.md`](./metrics.md) with date + command.
