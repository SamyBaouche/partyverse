/** Re-export shared authoritative rules — keep feature imports stable. */
export {
  C4_COLS,
  C4_ROWS,
  c4ActivityPhase,
  c4CanJoin as canJoinTeam,
  c4LobbyReady as isLobbyReady,
  c4RequiredPlayers as requiredPlayers,
  c4TeamCapacity as teamCapacity,
  c4TeamCount as teamCount,
  cellToColor,
  colorToCell,
  createC4Lobby as createLobbyState,
  createMock1v1Match,
  dropC4,
  dropInColumn,
  emptyBoard,
  formatConnectFourStatus,
  gammaToColumn,
  joinC4Team,
  pointerXToColumn,
  rematchC4 as rematch,
  setC4Hover,
  startC4 as startPlaying,
  type ConnectFourCell,
  type ConnectFourColor,
  type ConnectFourMode,
  type ConnectFourPlayer,
  type ConnectFourState,
} from "@partyverse/shared";

import { dropC4, type ConnectFourState } from "@partyverse/shared";

/** Local/demo helper used by the offline mirror — prefers shared drop when playerId known. */
export function applyDrop(state: ConnectFourState, col: number): ConnectFourState {
  const actor = state.players.find((player) => player.team === state.turn);
  if (!actor) {
    return state;
  }
  return dropC4(state, col, actor.id) ?? state;
}
