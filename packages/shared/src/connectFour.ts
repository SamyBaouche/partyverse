import { z } from "zod";
import { DuelMode } from "./ticTacToe.js";

export const C4_ROWS = 6;
export const C4_COLS = 7;

export const ConnectFourMode = DuelMode;
export type ConnectFourMode = z.infer<typeof ConnectFourMode>;

export const ConnectFourColor = z.enum(["yellow", "red"]);
export type ConnectFourColor = z.infer<typeof ConnectFourColor>;

export const ConnectFourCell = z.union([z.literal(0), z.literal(1), z.literal(2)]);
export type ConnectFourCell = z.infer<typeof ConnectFourCell>;

export const ConnectFourPlayer = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(16),
  team: ConnectFourColor,
});
export type ConnectFourPlayer = z.infer<typeof ConnectFourPlayer>;

export const ConnectFourState = z.object({
  mode: ConnectFourMode,
  players: z.array(ConnectFourPlayer),
  board: z.array(z.array(ConnectFourCell).length(C4_COLS)).length(C4_ROWS),
  hoverCol: z.number().int().min(0).max(C4_COLS - 1),
  turn: ConnectFourColor,
  winner: z.union([ConnectFourColor, z.literal("draw")]).nullable(),
  status: z.enum(["lobby", "playing", "ended"]),
});
export type ConnectFourState = z.infer<typeof ConnectFourState>;

export function emptyBoard(): ConnectFourCell[][] {
  return Array.from({ length: C4_ROWS }, () =>
    Array.from({ length: C4_COLS }, () => 0 as ConnectFourCell),
  );
}

export function createC4Lobby(mode: ConnectFourMode): ConnectFourState {
  return {
    mode,
    players: [],
    board: emptyBoard(),
    hoverCol: 3,
    turn: "yellow",
    winner: null,
    status: "lobby",
  };
}

export function c4TeamCapacity(mode: ConnectFourMode): number {
  return mode === "1v1" ? 1 : 2;
}

export function c4RequiredPlayers(mode: ConnectFourMode): number {
  return mode === "1v1" ? 2 : 4;
}

export function c4TeamCount(players: ConnectFourPlayer[], team: ConnectFourColor): number {
  return players.filter((player) => player.team === team).length;
}

export function c4CanJoin(state: ConnectFourState, team: ConnectFourColor): boolean {
  return c4TeamCount(state.players, team) < c4TeamCapacity(state.mode);
}

export function c4LobbyReady(state: ConnectFourState): boolean {
  return (
    c4TeamCount(state.players, "yellow") >= 1 &&
    c4TeamCount(state.players, "red") >= 1 &&
    state.players.length >= Math.min(2, c4RequiredPlayers(state.mode))
  );
}

export function joinC4Team(
  state: ConnectFourState,
  player: { id: string; name: string },
  team: ConnectFourColor,
): ConnectFourState | null {
  if (state.status !== "lobby" || !c4CanJoin(state, team)) {
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

export function startC4(state: ConnectFourState): ConnectFourState | null {
  if (state.status !== "lobby" || !c4LobbyReady(state)) {
    return null;
  }
  return {
    ...state,
    board: emptyBoard(),
    hoverCol: 3,
    turn: "yellow",
    winner: null,
    status: "playing",
  };
}

export function colorToCell(color: ConnectFourColor): ConnectFourCell {
  return color === "yellow" ? 1 : 2;
}

export function cellToColor(cell: ConnectFourCell): ConnectFourColor | null {
  if (cell === 1) {
    return "yellow";
  }
  if (cell === 2) {
    return "red";
  }
  return null;
}

function cloneBoard(board: ConnectFourCell[][]): ConnectFourCell[][] {
  return board.map((row) => [...row]);
}

export function dropInColumn(
  board: ConnectFourCell[][],
  col: number,
  color: ConnectFourColor,
): { board: ConnectFourCell[][]; row: number } | null {
  if (col < 0 || col >= C4_COLS) {
    return null;
  }
  for (let row = C4_ROWS - 1; row >= 0; row -= 1) {
    if ((board[row]?.[col] ?? 1) === 0) {
      const next = cloneBoard(board);
      const line = next[row];
      if (!line) {
        return null;
      }
      line[col] = colorToCell(color);
      return { board: next, row };
    }
  }
  return null;
}

function countLine(
  board: ConnectFourCell[][],
  row: number,
  col: number,
  dRow: number,
  dCol: number,
  cell: ConnectFourCell,
): number {
  let count = 0;
  let r = row + dRow;
  let c = col + dCol;
  while (r >= 0 && r < C4_ROWS && c >= 0 && c < C4_COLS && board[r]?.[c] === cell) {
    count += 1;
    r += dRow;
    c += dCol;
  }
  return count;
}

export function checkC4Winner(
  board: ConnectFourCell[][],
  row: number,
  col: number,
): ConnectFourColor | null {
  const cell = board[row]?.[col];
  if (!cell) {
    return null;
  }
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ] as const;

  for (const [dRow, dCol] of directions) {
    const total =
      1 +
      countLine(board, row, col, dRow, dCol, cell) +
      countLine(board, row, col, -dRow, -dCol, cell);
    if (total >= 4) {
      return cellToColor(cell);
    }
  }
  return null;
}

export function boardIsFull(board: ConnectFourCell[][]): boolean {
  return board.every((row) => row.every((cell) => cell !== 0));
}

function actorOnTurn(state: ConnectFourState, playerId: string): boolean {
  const actor = state.players.find((player) => player.id === playerId);
  return Boolean(actor && actor.team === state.turn);
}

/** Cosmetic aim column — only the team whose turn it is may update. */
export function setC4Hover(
  state: ConnectFourState,
  playerId: string,
  col: number,
): ConnectFourState | null {
  if (
    state.status !== "playing" ||
    state.winner ||
    !Number.isInteger(col) ||
    col < 0 ||
    col >= C4_COLS ||
    !actorOnTurn(state, playerId)
  ) {
    return null;
  }
  if (state.hoverCol === col) {
    return state;
  }
  return { ...state, hoverCol: col };
}

/** Server-authoritative drop: verifies the acting player owns the current turn. */
export function dropC4(
  state: ConnectFourState,
  col: number,
  playerId: string,
): ConnectFourState | null {
  if (state.status !== "playing" || state.winner || !actorOnTurn(state, playerId)) {
    return null;
  }
  const dropped = dropInColumn(state.board, col, state.turn);
  if (!dropped) {
    return null;
  }
  const winner = checkC4Winner(dropped.board, dropped.row, col);
  if (winner) {
    return {
      ...state,
      board: dropped.board,
      hoverCol: col,
      winner,
      status: "ended",
    };
  }
  if (boardIsFull(dropped.board)) {
    return {
      ...state,
      board: dropped.board,
      hoverCol: col,
      winner: "draw",
      status: "ended",
    };
  }
  return {
    ...state,
    board: dropped.board,
    hoverCol: col,
    turn: state.turn === "yellow" ? "red" : "yellow",
  };
}

export function rematchC4(state: ConnectFourState): ConnectFourState | null {
  if (state.status !== "ended") {
    return null;
  }
  return startC4({ ...state, status: "lobby", winner: null });
}

export function formatConnectFourStatus(state: ConnectFourState): string {
  if (state.status === "ended") {
    if (state.winner === "draw") {
      return "It's a draw!";
    }
    if (state.winner === "yellow") {
      return "Yellow wins!";
    }
    if (state.winner === "red") {
      return "Red wins!";
    }
  }
  return state.turn === "yellow" ? "Yellow's turn" : "Red's turn";
}

export function pointerXToColumn(clientX: number, rectLeft: number, rectWidth: number): number {
  if (rectWidth <= 0) {
    return 3;
  }
  const t = (clientX - rectLeft) / rectWidth;
  return Math.max(0, Math.min(C4_COLS - 1, Math.floor(t * C4_COLS)));
}

export function gammaToColumn(gamma: number): number {
  const clamped = Math.max(-28, Math.min(28, gamma));
  const t = (clamped + 28) / 56;
  return Math.max(0, Math.min(C4_COLS - 1, Math.round(t * (C4_COLS - 1))));
}

export function c4ActivityPhase(
  state: ConnectFourState,
): "c4-lobby" | "c4-play" {
  return state.status === "lobby" ? "c4-lobby" : "c4-play";
}

/** Local demo helper (mirror page) — not used by the server. */
export function createMock1v1Match(): ConnectFourState {
  return {
    mode: "1v1",
    players: [
      { id: "mock-yellow", name: "Sunny", team: "yellow" },
      { id: "mock-red", name: "Chili", team: "red" },
    ],
    board: emptyBoard(),
    hoverCol: 3,
    turn: "yellow",
    winner: null,
    status: "playing",
  };
}
