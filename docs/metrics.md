# Metrics

Only numbers that were measured go here. Resume bullets must match this table.

| Date       | Metric                         | Value            | How it was measured                                                |
| ---------- | ------------------------------ | ---------------- | ------------------------------------------------------------------ |
| 2026-11-16 | Game engine coverage (stmts)   | **86%**          | `pnpm --filter @partyverse/server test:coverage` → All files 85.9% |
| 2026-11-16 | Server tests                   | **64**           | same command — 64 passed                                           |
| 2026-11-16 | GitLab CI duration (main #102) | **75 s ≈ 1 min** | Pipeline `3068906958` duration field                               |
| 2026-11-16 | Docker server image (cold)     | **18 s**         | `docker build -f apps/server/Dockerfile`                           |
| 2026-11-16 | Docker web image (cold)        | **12 s**         | `docker build -f apps/web/Dockerfile`                              |
| 2026-11-16 | Docker server rebuild (cache)  | **1 s**          | second `docker build`                                              |
| 2026-11-16 | `/health` p95 @ 20 VUs         | **3.7 ms**       | `k6 run -e VUS=20 -e DURATION=30s load/health.js` (localhost)      |
| 2026-11-16 | Room create p95 @ 8 VUs        | **3.6 ms**       | `k6 run -e VUS=8 -e DURATION=20s load/rooms.js` (localhost)        |
| 2026-11-16 | Concurrent VUs sustained       | **20**           | k6 health scenario (matches Web PubSub Free connection unit)       |

## Resume mapping (fill only proven cells)

| Placeholder             | Status                                                | Value       |
| ----------------------- | ----------------------------------------------------- | ----------- |
| `$N` /month             | Pending Azure bill after Sprint 5                     | leave **N** |
| `M` MAU                 | Pending real traffic after Sprint 6                   | leave **M** |
| Deploy `X` min (before) | Pending first timed manual prod deploy (Sprint 3)     | leave **X** |
| Deploy `Y` min (after)  | CI green path measured                                | **1**       |
| Coverage `Z`%           | Measured                                              | **86**      |
| Latency sub-`X` ms p95  | Localhost measured 3.7 ms; use conservative prod gate | **50**      |
| Concurrent `Y` players  | k6 VUs sustained                                      | **20**      |

## Commands to refresh

```bash
./scripts/measure-deploy.sh
k6 run -e VUS=20 -e DURATION=30s load/health.js
k6 run -e VUS=8 -e DURATION=20s load/rooms.js
pnpm --filter @partyverse/server test:coverage
```
