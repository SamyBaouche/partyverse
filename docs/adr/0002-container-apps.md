# ADR 0002 — Azure Container Apps for the game server and web

- Status: Accepted
- Date: 2026-11-17

## Context

Partyverse needs a cheap, public HTTP host for the Fastify game authority and the static web client, with scale-to-zero for resume cost metric `$N`.

## Decision

Run both **server** and **web** on **Azure Container Apps** (Consumption), `minReplicas: 0`.

## Consequences

- Idle cost ~$0 with Free Web PubSub.
- Cold starts on first join after idle.
- No AKS/Redis/Front Door (near-zero cost rule).
