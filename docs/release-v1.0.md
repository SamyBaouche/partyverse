# Partyverse v1.0 (interim MVP — treat as v0.9)

Tagged: `v1.0` · Milestone: Ship by Sunday Nov 22

> **Dec 31 path:** full DoD lives in milestone **v1.0 — Ship by Dec 31 2026**. See [`roadmap-v1-dec31.md`](./roadmap-v1-dec31.md).

## Public URLs

- Web: https://partyverse-web.whiteflower-731f831a.canadacentral.azurecontainerapps.io
- API: https://partyverse-server.whiteflower-731f831a.canadacentral.azurecontainerapps.io
- How to play: `/how-to-play`

## What’s in v1.0

- TV host + phone join (QR / room code), Draw Guess (mock or Azure Web PubSub)
- Soft reconnect (15s grace) without Cosmos (ADR 0007)
- Azure Container Apps + Free Web PubSub, \$5 budget + App Insights (ADR 0008)
- GitLab CI: quality, coverage gate, Kaniko, Trivy, Bicep what-if, Playwright smoke
- Manual deploy path (`scripts/deploy-azure.sh`); OIDC deferred (ADR 0009)

## Verification (2026-11-21)

- `GET /health` → 200 on live server
- `POST /api/rooms` → room `MQTG`; two players joined (Alice, Bob)
- Playwright mock smoke: host + 2 phones + Draw Vote (CI green)

## Metrics snapshot

See [`metrics.md`](./metrics.md) — X≈2 min, Y≈1 min, Z≈86%, \$N≈0, M=3 concurrent seats in ship game-night, p95 3.7 ms @ 20 VUs.
