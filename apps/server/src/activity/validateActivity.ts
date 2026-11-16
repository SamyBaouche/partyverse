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

const PARTY_GAME_IDS = new Set([
  "imposter",
  "word-rush",
  "bomb-party",
  "trivia-blitz",
  "charades",
  "spyfall",
  "red-flag",
]);

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

function isObjectState(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function hasPlayersStatus(value: unknown): boolean {
  if (!isObjectState(value)) {
    return false;
  }
  return Array.isArray(value.players) && typeof value.status === "string";
}

/** Narrow unknown JSON into a RoomActivity payload for the activity API. */
export function isRoomActivity(value: unknown): value is RoomActivity {
  if (!value || typeof value !== "object") {
    return false;
  }
  const phase = (value as { phase?: unknown }).phase;
  const gameId = (value as { gameId?: unknown }).gameId;
  const state = (value as { state?: unknown }).state;

  if (phase === "lobby" || phase === "catalog") {
    return true;
  }
  if (phase === "draw-modes") {
    return gameId === "draw-guess";
  }
  if (phase === "draw-ready") {
    const mode = (value as { mode?: unknown }).mode;
    return gameId === "draw-guess" && (mode === "vote" || mode === "duo");
  }
  if (phase === "c4-modes") {
    return gameId === "connect-four";
  }
  if (phase === "c4-lobby" || phase === "c4-play") {
    return gameId === "connect-four" && isConnectFourState(state);
  }
  if (phase === "ttt-modes") {
    return gameId === "tic-tac-toe";
  }
  if (phase === "ttt-lobby" || phase === "ttt-play") {
    return gameId === "tic-tac-toe" && hasPlayersStatus(state);
  }
  if (phase === "rps-modes") {
    return gameId === "rock-paper-scissors";
  }
  if (phase === "rps-lobby" || phase === "rps-play") {
    return gameId === "rock-paper-scissors" && hasPlayersStatus(state);
  }
  if (phase === "kart-modes") {
    return gameId === "wish-kart";
  }
  if (phase === "kart-lobby" || phase === "kart-play") {
    return gameId === "wish-kart" && hasPlayersStatus(state);
  }
  if (phase === "party-lobby" || phase === "party-play") {
    return typeof gameId === "string" && PARTY_GAME_IDS.has(gameId) && hasPlayersStatus(state);
  }
  return false;
}
