# ADR 0005 — Single logical replica + scale-to-zero

- Status: Accepted
- Date: 2026-11-17

## Context

Game rooms are in-memory on one Node process. Horizontal scale would split room state without a shared store (Cosmos comes later).

## Decision

Ship **one** active server replica when traffic exists (`maxReplicas: 3` ceiling, `minReplicas: 0`). Accept cold start after idle. Do not add Redis.

## Consequences

- Correct realtime behaviour for MVP game nights.
- Metric `$N` stays near zero at idle.
- Reconnect/Cosmos (Sprint 5) required before true multi-replica.
