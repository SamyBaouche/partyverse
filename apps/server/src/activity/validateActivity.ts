import type { RoomActivity } from "../session.js";

export const RoomActivityBody = {
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

/** Narrow unknown JSON into a RoomActivity payload for the activity API. */
export function isRoomActivity(value: unknown): value is RoomActivity {
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
