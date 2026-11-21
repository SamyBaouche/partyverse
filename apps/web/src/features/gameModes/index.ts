import { getGameMode, listGameModes, type GameModeId, type GameModeMeta } from "@partyverse/shared";

export type { GameModeId, GameModeMeta };
export { getGameMode, listGameModes };

/** Host lobby capacity for a mode (Draw uses server authority). */
export function lobbyCapacity(modeId: GameModeId): { min: number; max: number } {
  const mode = getGameMode(modeId);
  return { min: mode.minPlayers, max: mode.maxPlayers };
}
