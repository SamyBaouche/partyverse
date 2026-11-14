import type { Phase, Player, ServerMessage, Stroke } from "@partyverse/shared";

export type ConnectionStatus = "idle" | "connecting" | "connected" | "disconnected" | "error";

/** Client-side party snapshot driven only by parsed `ServerMessage` (plus local meta). */
export type PartySnapshot = {
  connection: ConnectionStatus;
  lastError: string | null;
  code: string | null;
  selfId: string | null;
  selfName: string | null;
  phase: Phase;
  round: number;
  players: Player[];
  strokes: Stroke[];
  drawerId: string | null;
  wordLength: number;
  /** Drawer-only secret while drawing; cleared for guessers in UI. */
  secretWord: string | null;
  revealedWord: string | null;
  /** Set by transport when a round ends (survives phaseChanged clearing lastGuess). */
  lastRoundCorrect: boolean | null;
  lastGuesserId: string | null;
  endsAt: number;
  lastGuess: { playerId: string; correct: boolean } | null;
};

export const initialPartySnapshot = (): PartySnapshot => ({
  connection: "idle",
  lastError: null,
  code: null,
  selfId: null,
  selfName: null,
  phase: "lobby",
  round: 0,
  players: [],
  strokes: [],
  drawerId: null,
  wordLength: 0,
  secretWord: null,
  revealedWord: null,
  lastRoundCorrect: null,
  lastGuesserId: null,
  endsAt: 0,
  lastGuess: null,
});

/** Pure reducer: apply a validated server message to the party snapshot. */
export function applyServerMessage(state: PartySnapshot, message: ServerMessage): PartySnapshot {
  switch (message.type) {
    case "playerJoined": {
      if (state.players.some((player) => player.id === message.player.id)) {
        return state;
      }
      return { ...state, players: [...state.players, message.player] };
    }
    case "playerLeft":
      return {
        ...state,
        players: state.players.filter((player) => player.id !== message.playerId),
      };
    case "phaseChanged": {
      const next: PartySnapshot = {
        ...state,
        phase: message.phase,
        round: message.round,
        lastGuess: null,
      };
      if (message.phase === "drawing") {
        return {
          ...next,
          strokes: [],
          revealedWord: null,
        };
      }
      if (message.phase === "lobby") {
        return {
          ...next,
          strokes: [],
          revealedWord: null,
          secretWord: null,
          wordLength: 0,
          endsAt: 0,
          drawerId: null,
        };
      }
      return next;
    }
    case "strokeDrawn":
      return { ...state, strokes: [...state.strokes, message.stroke] };
    case "canvasCleared":
      return { ...state, strokes: [] };
    case "guessResult":
      return {
        ...state,
        lastGuess: { playerId: message.playerId, correct: message.correct },
      };
    case "scoresUpdated":
      return { ...state, players: message.players };
    case "error":
      return { ...state, lastError: message.message, connection: "error" };
    default:
      return state;
  }
}
