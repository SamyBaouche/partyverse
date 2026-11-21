# Roadmap — v1.0 final (31 Dec 2026)

## Tag hygiene

| Tag / label                              | Meaning                                                                                 |
| ---------------------------------------- | --------------------------------------------------------------------------------------- |
| Git tag **`v1.0`** (21 Nov 2026)         | **Interim MVP** — treat as **v0.9**: CA web+server, PubSub, soft reconnect, ship smoke. |
| Milestone **v1.0 — Ship by Dec 31 2026** | Full DoD: GameMode games, Azure diagram, OIDC CI, monitoring, docs.                     |
| Final release (target)                   | Re-tag / release **`v1.0.0`** (or replace notes) after 20 Dec tech freeze.              |

## Azure resource group

**Source of truth for live play:** `partyverse-rg` (Canada Central).

`rg-partyverse-dev` currently holds only an orphan Web PubSub (`wps-partyverse-dev-sb`) — do **not** deploy there until Phase 2 consolidates. Prefer deleting that orphan in Phase 2 after backup of any unused connection strings.

## Phase 0 (done in this branch)

- Display names: **Four in a Row**, **Kart Rush** (no third-party IP copy).
- Wire ids remain `connect-four` / `wish-kart` until GameMode migration (Phase 1).
- Non-v1 catalog games: **locked** + “Coming soon”.
- Padlock shown for every locked bubble.

## Phase 1 progress

- [x] GameMode registry (`@partyverse/shared` + server) + migrate Draw (#31 / ADR 0010)
- [x] Tic Tac Toe server-authoritative (`POST /api/rooms/:code/ttt`)
- [x] RPS first-to-N server-authoritative (`POST /api/rooms/:code/rps`)
- [x] Four in a Row server-authoritative (`POST /api/rooms/:code/c4`)
- [ ] Kart Rush 10 Hz (7-day timebox)
