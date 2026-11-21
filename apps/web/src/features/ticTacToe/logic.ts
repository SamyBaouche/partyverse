/** Re-export shared authoritative rules — keep feature imports stable. */
export {
  createTttLobby,
  formatTttStatus,
  joinTttTeam,
  placeTttMark,
  rematchTtt,
  startTtt,
  tttCanJoin,
  tttLobbyReady,
  tttRequiredPlayers,
  tttTeamCapacity,
  tttTeamCount,
  type DuelMode,
  type TicTacToeMark,
  type TicTacToePlayer,
  type TicTacToeState,
} from "@partyverse/shared";
