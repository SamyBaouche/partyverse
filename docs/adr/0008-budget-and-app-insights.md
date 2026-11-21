# ADR 0008 — \$5 budget alert + Application Insights (minimal)

- Status: Accepted
- Date: 2026-11-21

## Context

Need \$N cost guardrails and basic observability for v1.0 without a full ops stack.

## Decision

- Azure Consumption budget `partyverse-monthly-5` on `partyverse-rg` (\$5/month, email at 80%).
- Application Insights `partyverse-insights` with connection string injected into the server Container App as a secret (`APPLICATIONINSIGHTS_CONNECTION_STRING`). Fastify request logs remain the primary signal for v1.0.

## Consequences

- Idle cost still ~\$0; budget catches accidental spend.
- Full dashboards/alerts remain Sprint 6 polish (#45).
