# ADR 0003 — Bicep as infrastructure as code

- Status: Accepted
- Date: 2026-11-17

## Context

Manual Azure clicks are not reproducible and cannot feed deploy metric **X**.

## Decision

All Azure resources for Partyverse are declared in `infra/main.bicep` (+ `main.bicepparam`) and deployed with `az deployment group create`.

## Consequences

- Timed, repeatable deploys (metric X).
- MR `what-if` can gate infra changes (Sprint 4).
- Students subscription region constraints must be respected (`canadacentral`).
