import { z } from "zod";

/**
 * Plugin id for a living-room mini-game.
 * Wire ids stay stable (`connect-four`, `wish-kart`) while UI titles may differ.
 */
export const GameModeId = z.enum([
  "draw-guess",
  "tic-tac-toe",
  "rock-paper-scissors",
  "connect-four",
  "wish-kart",
]);

export type GameModeId = z.infer<typeof GameModeId>;

/** Where game rules live today — migrate toward `server` over Phase 1. */
export const GameModeAuthority = z.enum(["server", "activity"]);
export type GameModeAuthority = z.infer<typeof GameModeAuthority>;

export const GameModeMeta = z.object({
  id: GameModeId,
  title: z.string().min(1),
  tagline: z.string().min(1),
  blurb: z.string().min(1),
  accent: z.string().min(1),
  minPlayers: z.number().int().min(1).max(16),
  maxPlayers: z.number().int().min(1).max(16),
  authority: GameModeAuthority,
});

export type GameModeMeta = z.infer<typeof GameModeMeta>;

/** Canonical v1.0 playable modes (lobby picker source of truth). */
export const GAME_MODES: readonly GameModeMeta[] = [
  {
    id: "draw-guess",
    title: "Draw Guess",
    tagline: "DRAW & GUESS",
    blurb: "One draws the secret word. Everyone else races to guess it live.",
    accent: "#5E9E6C",
    minPlayers: 2,
    maxPlayers: 8,
    authority: "server",
  },
  {
    id: "tic-tac-toe",
    title: "Tic-Tac-Toe",
    tagline: "THREE IN A ROW",
    blurb: "The classic 30-second showdown. Loser picks the next game.",
    accent: "#E8EEF5",
    minPlayers: 2,
    maxPlayers: 2,
    authority: "activity",
  },
  {
    id: "rock-paper-scissors",
    title: "Rock Paper Scissors",
    tagline: "PICK IN SECRET",
    blurb: "Both lock in at once, then reveal. Settle any argument.",
    accent: "#76A2AF",
    minPlayers: 2,
    maxPlayers: 8,
    authority: "activity",
  },
  {
    id: "connect-four",
    title: "Four in a Row",
    tagline: "DROP & STACK",
    blurb: "Drop discs, block sneaky diagonals, line up four first.",
    accent: "#2452FF",
    minPlayers: 2,
    maxPlayers: 4,
    authority: "activity",
  },
  {
    id: "wish-kart",
    title: "Kart Rush",
    tagline: "OVAL SPRINT",
    blurb: "Oval track, phone or gamepad. Four karts, zero shame.",
    accent: "#FFE566",
    minPlayers: 2,
    maxPlayers: 8,
    authority: "activity",
  },
] as const;

export function getGameMode(id: GameModeId): GameModeMeta {
  const mode = GAME_MODES.find((entry) => entry.id === id);
  if (!mode) {
    throw new Error(`Unknown game mode: ${id}`);
  }
  return mode;
}

export function listGameModes(): readonly GameModeMeta[] {
  return GAME_MODES;
}
