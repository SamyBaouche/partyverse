# ADR 0004 — GitLab Container Registry (not ACR)

- Status: Accepted
- Date: 2026-11-17

## Context

Images must be stored somewhere Container Apps can pull from. Azure Container Registry adds cost; the repo already lives on GitLab.

## Decision

Push `server` and `web` images to **GitLab Container Registry** (`registry.gitlab.com/.../partyverse/{server,web}`), tagged with the git SHA.

Build path: local `scripts/push-gitlab-registry.sh` and/or Kaniko in CI (self-hosted runner lacks privileged DinD).

## Consequences

- Zero extra registry bill on Azure for Students.
- Container Apps need a registry secret (deploy token) to pull private images.
- CI DinD on the current runner is abandoned in favor of Kaniko / local push.
