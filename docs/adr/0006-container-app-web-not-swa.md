# ADR 0006 — Keep web on Container Apps (defer Static Web Apps)

- Status: Accepted
- Date: 2026-11-21

## Context

v1.0 DoD mentioned Azure Static Web Apps for the frontend. The web app already runs as a nginx Container App next to the server, with `/api` proxy via `API_UPSTREAM`.

## Decision

For v1.0, keep **web on Container Apps**. Defer Static Web Apps until after ship.

## Consequences

- One runtime model (CA) and one registry pull path.
- Cold starts apply to web as well (scale-to-zero).
- Issue #27 SWA remains open as post-v1.0.
