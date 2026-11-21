# ADR 0007 — Soft reconnect without Cosmos for v1.0

- Status: Superseded by ADR 0012 (Dec 31 durable rooms)
- Date: 2026-11-21

## Context

v1.0 needs phone refresh / brief network drop to restore the same player. Full Cosmos persistence (#41) is larger than the Sunday ship window.

## Decision

Use an in-memory **15s reconnect grace** after PubSub disconnect: delay `PLAYER_LEAVE`, expose `POST /api/rooms/:code/reconnect`, persist server `playerId` in `localStorage`. Document that a server recycle still loses rooms (single replica + scale-to-zero).

## Consequences

- Refresh within 15s works; after that the player joins as new.
- Cosmos + durable reconnect remain post-v1.0 (#41).
