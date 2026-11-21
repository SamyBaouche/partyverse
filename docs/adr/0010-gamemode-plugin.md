# ADR 0010 — GameMode plugin registry

- Status: Accepted
- Date: 2026-11-21

## Context

v1.0 needs five playable games with a shared lobby picker. Draw Guess already has a server XState engine over Web PubSub; other games still sync via room activity. We need one contract before migrating each title.

## Decision

- Publish **`GameModeMeta`** + **`GAME_MODES`** in `@partyverse/shared` (id, titles, min/max players, `authority`: `server` | `activity`).
- Server registry (`apps/server/src/game/modes/registry.ts`) attaches engines. **Draw Guess** is the first mode with `createEngine`.
- Classic `POST /api/rooms` creates a **draw-guess** room and returns `modeId`.
- `GET /api/game-modes` lists plugin metadata for clients / ops.
- Web catalog builds the unlocked reel from `GAME_MODES`.

## Consequences

- Migrating TTT / RPS / Four in a Row / Kart Rush means registering a server engine and flipping `authority` to `server`.
- Wire ids (`connect-four`, `wish-kart`) stay stable; UI titles stay Four in a Row / Kart Rush.
