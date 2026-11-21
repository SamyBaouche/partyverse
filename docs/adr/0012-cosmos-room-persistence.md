# ADR 0012 — Cosmos free tier for durable rooms (supersedes ADR 0007 for Dec 31)

- Status: Accepted
- Date: 2026-11-21
- Supersedes: ADR 0007 (soft reconnect only) for the Dec 31 v1.0.0 DoD

## Context

Scale-to-zero and single-replica recycles wipe in-memory rooms. ADR 0007 shipped a 15s soft reconnect for the interim Sunday tag. Phase 2 of the Dec 31 roadmap requires durable membership + activity (#41).

## Decision

1. Deploy **one Cosmos DB free-tier** account (`infra/cosmos.bicep`) with database `partyverse` / container `rooms` (partition `/code`, TTL 24h).
2. Optional env `COSMOS_CONNECTION_STRING` — when set, server dual-writes room docs (host, players, activity) and hydrates on reconnect / activity GET after a cold start.
3. Keep the 15s in-memory grace for same-replica disconnects; Cosmos is the cross-recycle path.
4. Draw Guess **XState mid-round context** is still not snapshotted (players return to lobby engine on hydrate). Activity-driven games (TTT/RPS/C4/Kart once merged) restore their activity blob.

## Consequences

- Free tier is one-per-subscription; deploy fails if already consumed elsewhere.
- Express ACA still uses connection string via KV value-sync (ADR 0011), not MI data-plane auth.
- Tests use `createMemoryRoomStore()` without Azure.
- **2026-11-21:** `az deployment` of free-tier Cosmos in **Canada Central** failed with regional capacity (`ServiceUnavailable` / high demand). Azure Students policy also blocks other regions (`RequestDisallowedByAzure`). Code path is ready; re-run `infra/cosmos.bicep` when quota/capacity opens ([aka.ms/cosmosdbquota](https://aka.ms/cosmosdbquota)). Until then the server runs memory-only (soft reconnect ADR 0007 behavior).
