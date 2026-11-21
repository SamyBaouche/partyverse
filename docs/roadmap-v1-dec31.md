# Roadmap — v1.0 final (31 Dec 2026)

## Tag hygiene

| Tag / label                              | Meaning                                                                                 |
| ---------------------------------------- | --------------------------------------------------------------------------------------- |
| Git tag **`v1.0`** (21 Nov 2026)         | **Interim MVP** — treat as **v0.9**: CA web+server, PubSub, soft reconnect, ship smoke. |
| Milestone **v1.0 — Ship by Dec 31 2026** | Full DoD: GameMode games, Azure diagram, OIDC CI, monitoring, docs.                     |
| Final release (target)                   | Re-tag / release **`v1.0.0`** (or replace notes) after 20 Dec tech freeze.              |

## Azure resource group

**Source of truth for live play:** `partyverse-rg` (Canada Central).

`rg-partyverse-dev` orphan Web PubSub (`wps-partyverse-dev-sb`) **deleted** in Phase 2.1. Only `partyverse-rg` remains.

## Phase 0 (done in this branch)

- Display names: **Four in a Row**, **Kart Rush** (no third-party IP copy).
- Wire ids remain `connect-four` / `wish-kart` until GameMode migration (Phase 1).
- Non-v1 catalog games: **locked** + “Coming soon”.
- Padlock shown for every locked bubble.

## Phase 1 progress (MRs !46–!49 stacked)

- [x] GameMode registry (`@partyverse/shared` + server) + migrate Draw (#31 / ADR 0010)
- [x] Tic Tac Toe server-authoritative (`POST /ttt`) — !46
- [x] RPS first-to-N server-authoritative (`POST /rps`) — !47
- [x] Four in a Row server-authoritative (`POST /c4`) — !48
- [x] Kart Rush 10 Hz server sim (`POST /kart` + loop) — !49

## Phase 2 — Azure « cerveau » (on `partyverse-rg`)

- [x] 2.1 Key Vault + Managed Identity + secrets wired into ACA (`infra/keyvault.bicep` + ADR 0011)
- [ ] 2.2 Cosmos DB free + durable rooms / reconnect (#41; supersedes ADR 0007 for Dec 31)
- [ ] 2.3 Storage Blob (drawings / thumbnails)
- [ ] 2.4 Azure Functions (round-end + thumbnails)
- [ ] 2.5 Event Grid (blob → thumbnails)
- [ ] 2.6 Service Bus Basic (round timers)
- [ ] 2.7 Cleanup job (Container Apps Jobs)
- [x] Delete orphan `rg-partyverse-dev` / `wps-partyverse-dev-sb`
