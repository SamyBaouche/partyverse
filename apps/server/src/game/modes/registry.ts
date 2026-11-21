import {
  GAME_MODES,
  getGameMode,
  listGameModes,
  type GameModeId,
  type GameModeMeta,
} from "@partyverse/shared";
import { createActor, type Actor } from "xstate";
import { gameMachine } from "../machine.js";

/**
 * Server-side GameMode plugin.
 * Draw Guess is the first mode with a real engine factory; others register meta only until migrated.
 */
export type ServerGameMode = {
  meta: GameModeMeta;
  /** Create the authoritative actor for a new room (server modes only). */
  createEngine?: (words: string[]) => Actor<typeof gameMachine>;
};

const drawGuessMode: ServerGameMode = {
  meta: getGameMode("draw-guess"),
  createEngine: (words) => {
    const actor = createActor(gameMachine, { input: { words } });
    actor.start();
    return actor;
  },
};

const registry = new Map<GameModeId, ServerGameMode>([
  ["draw-guess", drawGuessMode],
  ...GAME_MODES.filter((mode) => mode.id !== "draw-guess").map(
    (mode) => [mode.id, { meta: mode }] as const,
  ),
]);

export function getServerGameMode(id: GameModeId): ServerGameMode {
  const mode = registry.get(id);
  if (!mode) {
    throw new Error(`Game mode not registered on server: ${id}`);
  }
  return mode;
}

export function listServerGameModes(): ServerGameMode[] {
  return listGameModes().map((meta) => getServerGameMode(meta.id));
}

/** Default mode for classic PubSub rooms (Draw Guess). */
export const DEFAULT_ROOM_MODE: GameModeId = "draw-guess";
