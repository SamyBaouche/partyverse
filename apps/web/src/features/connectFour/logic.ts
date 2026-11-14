import type {
  ConnectFourCell,
  ConnectFourColor,
  ConnectFourMode,
  ConnectFourPlayer,
  ConnectFourState,
} from "../session/types";

export const C4_ROWS = 6;
export const C4_COLS = 7;

export function emptyBoard(): ConnectFourCell[][] {
  return Array.from({ length: C4_ROWS }, () =>
    Array.from({ length: C4_COLS }, () => 0 as ConnectFourCell),
  );
}

export function createLobbyState(mode: ConnectFourMode): ConnectFourState {
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

const MOCK_YELLOW_NAMES = ["Sunny", "Lemon", "Goldie", "Pixel", "Nova"] as const;
const MOCK_RED_NAMES = ["Chili", "Ruby", "Blaze", "Tomato", "Spark"] as const;

function pickName(pool: readonly string[], used: Set<string>): string {
  const available = pool.filter((name) => !used.has(name));
  const list = available.length > 0 ? available : [...pool];
  return list[Math.floor(Math.random() * list.length)] ?? "Guest";
}

/** Seed two random players and jump straight into a playable 1v1 mock. */
export function createMock1v1Match(): ConnectFourState {
  const used = new Set<string>();
  const yellowName = pickName(MOCK_YELLOW_NAMES, used);
  used.add(yellowName);
  const redName = pickName(MOCK_RED_NAMES, used);

  return startPlaying({
    mode: "1v1",
    players: [
      { id: "mock-yellow", name: yellowName, team: "yellow" },
      { id: "mock-red", name: redName, team: "red" },
    ],
    board: emptyBoard(),
    hoverCol: 3,
    turn: "yellow",
    winner: null,
    status: "lobby",
  });
}

export function pointerXToColumn(clientX: number, rectLeft: number, rectWidth: number): number {
  if (rectWidth <= 0) {
    return 3;
  }
  const t = (clientX - rectLeft) / rectWidth;
  return Math.max(0, Math.min(C4_COLS - 1, Math.floor(t * C4_COLS)));
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

export function teamCapacity(mode: ConnectFourMode): number {
  return mode === "1v1" ? 1 : 2;
}

export function requiredPlayers(mode: ConnectFourMode): number {
  return mode === "1v1" ? 2 : 4;
}

export function teamCount(players: ConnectFourPlayer[], team: ConnectFourColor): number {
  return players.filter((player) => player.team === team).length;
}

export function canJoinTeam(state: ConnectFourState, team: ConnectFourColor): boolean {
  return teamCount(state.players, team) < teamCapacity(state.mode);
}

export function isLobbyReady(state: ConnectFourState): boolean {
  return (
    teamCount(state.players, "yellow") >= 1 &&
    teamCount(state.players, "red") >= 1 &&
    state.players.length >= Math.min(2, requiredPlayers(state.mode))
  );
}

export function cloneBoard(board: ConnectFourCell[][]): ConnectFourCell[][] {
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

export function checkWinner(
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

export function applyDrop(state: ConnectFourState, col: number): ConnectFourState {
  if (state.status !== "playing" || state.winner) {
    return state;
  }
  const dropped = dropInColumn(state.board, col, state.turn);
  if (!dropped) {
    return state;
  }
  const winner = checkWinner(dropped.board, dropped.row, col);
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

export function startPlaying(state: ConnectFourState): ConnectFourState {
  return {
    ...state,
    board: emptyBoard(),
    hoverCol: 3,
    turn: "yellow",
    winner: null,
    status: "playing",
  };
}

export function rematch(state: ConnectFourState): ConnectFourState {
  return startPlaying(state);
}

/** English UI label for match result / whose turn. */
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

export function gammaToColumn(gamma: number): number {
  // Portrait phone: gamma is left/right tilt. Map ~±28° across 7 columns.
  const clamped = Math.max(-28, Math.min(28, gamma));
  const t = (clamped + 28) / 56;
  return Math.max(0, Math.min(C4_COLS - 1, Math.round(t * (C4_COLS - 1))));
}
