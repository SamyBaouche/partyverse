import Fastify from "fastify";
import { getRoomActivity, setRoomActivity, type RoomActivity } from "./session.js";

const RoomActivityBody = {
  type: "object",
  required: ["phase"],
  properties: {
    phase: { type: "string" },
    gameId: { type: "string" },
    mode: { type: "string" },
    state: { type: "object", additionalProperties: true },
  },
  additionalProperties: false,
} as const;

function isConnectFourState(value: unknown): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }
  const state = value as Record<string, unknown>;
  return (
    (state.mode === "1v1" || state.mode === "2v2") &&
    Array.isArray(state.players) &&
    Array.isArray(state.board) &&
    typeof state.hoverCol === "number" &&
    (state.turn === "yellow" || state.turn === "red") &&
    (state.status === "lobby" || state.status === "playing" || state.status === "ended")
  );
}

function isRoomActivity(value: unknown): value is RoomActivity {
  if (!value || typeof value !== "object") {
    return false;
  }
  const phase = (value as { phase?: unknown }).phase;
  if (phase === "lobby" || phase === "catalog") {
    return true;
  }
  if (phase === "draw-modes") {
    return (value as { gameId?: unknown }).gameId === "draw-guess";
  }
  if (phase === "draw-ready") {
    const mode = (value as { mode?: unknown }).mode;
    return (
      (value as { gameId?: unknown }).gameId === "draw-guess" && (mode === "vote" || mode === "duo")
    );
  }
  if (phase === "c4-modes") {
    return (value as { gameId?: unknown }).gameId === "connect-four";
  }
  if (phase === "c4-lobby" || phase === "c4-play") {
    return (
      (value as { gameId?: unknown }).gameId === "connect-four" &&
      isConnectFourState((value as { state?: unknown }).state)
    );
  }
  return false;
}

export function buildApp() {
  const app = Fastify({ logger: true });

  app.addHook("onRequest", async (_request, reply) => {
    reply.header("Access-Control-Allow-Origin", "*");
    reply.header("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
    reply.header("Access-Control-Allow-Headers", "Content-Type");
  });

  app.options("/*", async (_request, reply) => {
    return reply.status(204).send();
  });

  app.get("/health", async () => {
    return { status: "ok", uptime: process.uptime() };
  });

  app.get<{ Params: { code: string } }>("/api/rooms/:code/activity", async (request, reply) => {
    const code = request.params.code.toUpperCase();
    if (!/^[A-Z]{4}$/.test(code)) {
      return reply.status(400).send({ error: "INVALID_ROOM_CODE" });
    }
    return { activity: getRoomActivity(code) };
  });

  app.put<{ Params: { code: string }; Body: unknown }>(
    "/api/rooms/:code/activity",
    { schema: { body: RoomActivityBody } },
    async (request, reply) => {
      const code = request.params.code.toUpperCase();
      if (!/^[A-Z]{4}$/.test(code)) {
        return reply.status(400).send({ error: "INVALID_ROOM_CODE" });
      }
      if (!isRoomActivity(request.body)) {
        return reply.status(400).send({ error: "INVALID_ACTIVITY" });
      }
      const activity = setRoomActivity(code, request.body);
      return { activity };
    },
  );

  return app;
}
