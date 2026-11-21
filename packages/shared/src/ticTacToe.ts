import { z } from "zod";

export const DuelMode = z.enum(["1v1", "2v2"]);
export type DuelMode = z.infer<typeof DuelMode>;

export const TicTacToeMark = z.enum(["x", "o"]);
export type TicTacToeMark = z.infer<typeof TicTacToeMark>;

export const TicTacToePlayer = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(16),
  team: TicTacToeMark,
});
export type TicTacToePlayer = z.infer<typeof TicTacToePlayer>;

export const TicTacToeState = z.object({
  mode: DuelMode,
  players: z.array(TicTacToePlayer),
  board: z.array(TicTacToeMark.nullable()).length(9),
  turn: TicTacToeMark,
  winner: z.union([TicTacToeMark, z.literal("draw")]).nullable(),
  status: z.enum(["lobby", "playing", "ended"]),
});
export type TicTacToeState = z.infer<typeof TicTacToeState>;

const WINS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

export function createTttLobby(mode: DuelMode): TicTacToeState {
  return {
    mode,
    players: [],
    board: Array.from({ length: 9 }, () => null),
    turn: "x",
    winner: null,
    status: "lobby",
  };
}

export function tttTeamCapacity(mode: DuelMode): number {
  return mode === "1v1" ? 1 : 2;
}

export function tttRequiredPlayers(mode: DuelMode): number {
  return mode === "1v1" ? 2 : 4;
}

export function tttTeamCount(players: TicTacToePlayer[], team: TicTacToeMark): number {
  return players.filter((player) => player.team === team).length;
}

export function tttCanJoin(state: TicTacToeState, team: TicTacToeMark): boolean {
  return tttTeamCount(state.players, team) < tttTeamCapacity(state.mode);
}

export function tttLobbyReady(state: TicTacToeState): boolean {
  return (
    tttTeamCount(state.players, "x") >= 1 &&
    tttTeamCount(state.players, "o") >= 1 &&
    state.players.length >= Math.min(2, tttRequiredPlayers(state.mode))
  );
}

export function joinTttTeam(
  state: TicTacToeState,
  player: { id: string; name: string },
  team: TicTacToeMark,
): TicTacToeState | null {
  if (state.status !== "lobby" || !tttCanJoin(state, team)) {
    return null;
  }
  if (state.players.some((entry) => entry.id === player.id)) {
    return {
      ...state,
      players: state.players.map((entry) =>
        entry.id === player.id ? { ...entry, team, name: player.name } : entry,
      ),
    };
  }
  return {
    ...state,
    players: [...state.players, { id: player.id, name: player.name, team }],
  };
}

export function startTtt(state: TicTacToeState): TicTacToeState | null {
  if (state.status !== "lobby" || !tttLobbyReady(state)) {
    return null;
  }
  return {
    ...state,
    board: Array.from({ length: 9 }, () => null),
    turn: "x",
    winner: null,
    status: "playing",
  };
}

function findWinner(board: Array<TicTacToeMark | null>): TicTacToeMark | "draw" | null {
  for (const line of WINS) {
    const [a, b, c] = line;
    const mark = board[a];
    if (mark && mark === board[b] && mark === board[c]) {
      return mark;
    }
  }
  if (board.every((cell) => cell !== null)) {
    return "draw";
  }
  return null;
}

/** Server-authoritative place: verifies the acting player owns the current turn. */
export function placeTttMark(
  state: TicTacToeState,
  index: number,
  playerId: string,
): TicTacToeState | null {
  if (state.status !== "playing" || state.winner || index < 0 || index > 8) {
    return null;
  }
  if (state.board[index] !== null) {
    return null;
  }
  const actor = state.players.find((player) => player.id === playerId);
  if (!actor || actor.team !== state.turn) {
    return null;
  }
  const board = [...state.board];
  board[index] = state.turn;
  const winner = findWinner(board);
  return {
    ...state,
    board,
    turn: state.turn === "x" ? "o" : "x",
    winner,
    status: winner ? "ended" : "playing",
  };
}

export function rematchTtt(state: TicTacToeState): TicTacToeState | null {
  if (state.status !== "ended") {
    return null;
  }
  return startTtt({ ...state, status: "lobby", winner: null });
}

export function formatTttStatus(state: TicTacToeState): string {
  if (state.winner === "draw") {
    return "Draw";
  }
  if (state.winner === "x") {
    return "X wins";
  }
  if (state.winner === "o") {
    return "O wins";
  }
  return state.turn === "x" ? "X to play" : "O to play";
}

export function tttActivityPhase(
  state: TicTacToeState,
): "ttt-lobby" | "ttt-play" {
  return state.status === "lobby" ? "ttt-lobby" : "ttt-play";
}
