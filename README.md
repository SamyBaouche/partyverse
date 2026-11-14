# Partyverse

**TV shows the party. Phones are the controllers.**

Scan a QR, join in one tap, play mini-games together — no app install, no accounts.

[![pipeline](https://gitlab.com/SamyBaouche/partyverse/badges/main/pipeline.svg)](https://gitlab.com/SamyBaouche/partyverse/-/pipelines)
[![coverage](https://gitlab.com/SamyBaouche/partyverse/badges/main/coverage.svg)](https://gitlab.com/SamyBaouche/partyverse/-/pipelines)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> Source of truth: **[GitLab](https://gitlab.com/SamyBaouche/partyverse)**.  
> GitHub is a read-only mirror.

---

## What you can play today

| Game                    | Status                          | How it works                                                |
| ----------------------- | ------------------------------- | ----------------------------------------------------------- |
| **Draw Guess**          | Live (mock or Azure Web PubSub) | Drawer paints, others guess. Server owns the word & timers. |
| **Connect Four**        | Local sync via room activity    | 1v1 / 2v2 lobbies, QR join.                                 |
| **Tic-Tac-Toe**         | Local sync                      | Same duel flow as C4.                                       |
| **Rock Paper Scissors** | Local sync                      | Same duel flow as C4.                                       |
| Imposter+               | Locked                          | Coming later.                                               |

---

## Quick start

```bash
# 1. Install (Node 24 + pnpm 12 via Corepack)
corepack enable
pnpm install

# 2. Run TV + API together
pnpm dev
```

| App                | URL                                                          |
| ------------------ | ------------------------------------------------------------ |
| TV / web           | [http://localhost:5173](http://localhost:5173)               |
| Phone (same Wi‑Fi) | Network URL printed by Vite, e.g. `http://192.168.x.x:5173`  |
| API health         | [http://localhost:3000/health](http://localhost:3000/health) |

**Tip:** open the host on the **Network** URL so the QR works on phones.  
`localhost` on a phone means the phone itself — not your Mac.

Vite proxies `/api` → `http://127.0.0.1:3000`, so phones share the same origin as the TV.

### Mock vs real realtime

| Mode                             | How                                                                                     |
| -------------------------------- | --------------------------------------------------------------------------------------- |
| **Mock** (default in `pnpm dev`) | No Azure. Draw Guess uses a local transport.                                            |
| **Real Web PubSub**              | See [Run with Azure Web PubSub](#run-with-azure-web-pubsub). Set `VITE_USE_MOCK=false`. |

---

## Monorepo map

```
partyverse/
├── apps/web/          TV + phone UI (React, Vite, Tailwind)
├── apps/server/       Game authority (Fastify, XState, Web PubSub)
├── apps/functions/    Azure Functions stub (later)
├── packages/shared/   Zod schemas shared by web + server
└── docs/              Architecture diagrams, metrics, ADRs
```

### `apps/web` — what the player sees

| Folder                   | Role                                                |
| ------------------------ | --------------------------------------------------- |
| `src/pages/`             | Routes: host TV, phone join, demos                  |
| `src/features/catalog/`  | Living-room game picker (chips, reel, how-it-works) |
| `src/features/realtime/` | Zustand party store + mock / Azure transports       |
| `src/features/drawing/`  | Canvas, strokes, drawer UI                          |
| `src/features/join/`     | Nickname form, join API helpers                     |
| `src/features/*/`        | One folder per mini-game (C4, TTT, RPS, …)          |
| `src/components/`        | Shared UI + brand                                   |
| `src/lib/`               | Audio, theme, join URL helpers                      |

### `apps/server` — source of truth

| Folder          | Role                                               |
| --------------- | -------------------------------------------------- |
| `src/game/`     | XState machine, rooms, session timers & broadcasts |
| `src/realtime/` | Negotiate, publisher, event handler                |
| `src/activity/` | Validation for HTTP room-activity payloads         |
| `src/config.ts` | Env (connection string, hub, port)                 |

Clients **never** publish to PubSub groups.  
They only `sendEvent` → server validates (Zod) → machine → broadcast.

### `packages/shared`

Zod contracts for `ClientMessage` / `ServerMessage`, room codes, strokes, players.  
If it crosses the wire, it lives here.

---

## Commands

| Command                                | What it does              |
| -------------------------------------- | ------------------------- |
| `pnpm dev`                             | Web + server in parallel  |
| `pnpm --filter @partyverse/web dev`    | Vite only                 |
| `pnpm --filter @partyverse/server dev` | Fastify with `.env`       |
| `pnpm test`                            | All package tests         |
| `pnpm lint` / `pnpm format`            | ESLint / Prettier         |
| `pnpm typecheck`                       | `tsc --noEmit` everywhere |
| `pnpm -r build`                        | Production builds         |

---

## Run with Azure Web PubSub

1. Create a Web PubSub resource and copy the connection string.
2. Local secrets (never commit `.env`):

```bash
cp apps/server/.env.example apps/server/.env
# WEBPUBSUB_CONNECTION_STRING=...
# WEBPUBSUB_HUB=partyverse
# PORT=3000
```

3. Tunnel upstream events to your laptop:

```bash
awps-tunnel run --hub partyverse --upstream http://localhost:3000
```

Point the hub event handler at the tunnel URL (`/eventhandler`).

4. Start apps **without** mock:

```bash
# web: VITE_USE_MOCK=false
pnpm --filter @partyverse/server dev
pnpm --filter @partyverse/web dev
```

5. Host Draw Guess on the TV → scan QR on two phones → **Start match**.

---

## How a Draw Guess round flows

```
Phone / TV                  Azure Web PubSub              Server
   |                              |                          |
   |-- POST /api/rooms ---------->|------------------------->| create room
   |-- POST .../players --------->|------------------------->| join
   |-- GET  /api/negotiate ------>|------------------------->| token (no roles)
   |<--------- wss url -----------|<-------------------------|
   |-- sendEvent(guess) --------->|-- webhook /eventhandler->| Zod + machine
   |<-- group / user message -----|<-- toRoom / toUser ------|
```

- **Drawer only** gets `{ type: "yourWord" }` (never the room).
- Everyone sees the word in the **reveal** phase.
- Timers (60s draw / 5s reveal) live on the server.

---

## Routes

| Path                | Who      | Purpose                 |
| ------------------- | -------- | ----------------------- |
| `/` → `/host`       | TV       | Catalog + lobbies       |
| `/play/:code`       | Phone    | Join + play             |
| `/backgrounds`      | Dev      | Arcade backgrounds      |
| `/ui`, `/draw-demo` | Dev only | Gallery / canvas mirror |

---

## Tech stack

| Layer    | Choices                                             |
| -------- | --------------------------------------------------- |
| UI       | React 19, Vite 8, Tailwind v4, Motion, React Router |
| API      | Node 24, Fastify 5, XState 5                        |
| Contract | Zod 4 (`@partyverse/shared`)                        |
| Realtime | Azure Web PubSub (authoritative server)             |
| Quality  | Vitest, ESLint, Prettier, GitLab CI                 |

Target Azure layout: [`docs/architecture/overview.drawio.svg`](docs/architecture/overview.drawio.svg)

---

## Quality & CI

Every MR on a self-hosted GitLab Runner (`node:24-alpine`):

1. **quality** — format, lint, typecheck
2. **test** — server coverage
3. **build** — web + server

`main` is protected: green pipeline required.

---

## Roadmap (short)

| Sprint | Focus                                   | Status   |
| ------ | --------------------------------------- | -------- |
| 0–1    | Foundations, engine, arcade UI          | Done     |
| **2**  | Front-end polish + Web PubSub + docs    | **Done** |
| 3+     | Docker, Bicep, Azure deploy, resilience | Planned  |

Full schedule and metrics: [`docs/metrics.md`](docs/metrics.md)

---

## Contributing

1. Branch from `main`: `feat/<issue>-short-name` or `docs/...`
2. Conventional Commits (`feat:`, `fix:`, `docs:`, …)
3. MR with `Closes #<issue>` — merge when CI is green

---

## Credits & license

Fonts & audio notes: [`apps/web/CREDITS.md`](apps/web/CREDITS.md)  
SFX/music are synthesized in code (Web Audio) — no audio files.

[MIT](LICENSE) © Samy Baouche
