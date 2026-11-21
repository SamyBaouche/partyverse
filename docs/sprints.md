# Sprints 3–8 (metrics track)

Goal: fill resume placeholders with **measured** numbers only.

| Sprint | Theme                                | Metric produced            | Status                                                                  |
| ------ | ------------------------------------ | -------------------------- | ----------------------------------------------------------------------- |
| 3      | Docker + Bicep + first manual deploy | **X = 2** min (before)     | Done — Dockerfile #23, KV+MI, ADRs 0002–0005, Registry path (Kaniko)    |
| 4      | CI/CD images + deploy path           | **Y = 1** min (after)      | Kaniko + Trivy + what-if + `deploy-azure.sh`; OIDC deferred ADR 0009   |
| 5      | Resilience + cost                    | **$N = 0**/month           | Baseline idle done; Cosmos/Functions still open                         |
| 6      | App Insights + E2E                   | **M** users                | Pending real traffic on public URL                                      |
| 7      | k6 load test                         | **p95 3.7 ms** @ **20** VU | Done locally                                                            |
| 8      | Docs / demo / v1.0                   | Freeze 3 bullets           | Ready except **M**                                                      |

## How to refresh numbers

```bash
# Coverage (Z) — fails under 80% statements / 65% branches
pnpm --filter @partyverse/server test:coverage

# Deploy timings (X / Y)
chmod +x scripts/measure-deploy.sh && ./scripts/measure-deploy.sh

# Registry push (#25 local fallback)
./scripts/push-gitlab-registry.sh

# Latency + concurrency (p95 / players)
pnpm --filter @partyverse/server dev &
k6 run -e VUS=20 -e DURATION=30s load/health.js
k6 run -e VUS=8 -e DURATION=20s load/rooms.js
```

Record every result in [`metrics.md`](./metrics.md) with date + command.
