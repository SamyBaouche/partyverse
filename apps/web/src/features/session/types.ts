export type DrawMode = "vote" | "duo" | "solo" | "ai";

export type DuelMode = "1v1" | "2v2";
export type ConnectFourMode = DuelMode;
export type ConnectFourColor = "yellow" | "red";

export type ConnectFourPlayer = {
  id: string;
  name: string;
  team: ConnectFourColor;
};

export type ConnectFourCell = 0 | 1 | 2; // empty | yellow | red

export type ConnectFourState = {
  mode: ConnectFourMode;
  players: ConnectFourPlayer[];
  /** 6 rows × 7 cols, row 0 is the top. */
  board: ConnectFourCell[][];
  hoverCol: number;
  turn: ConnectFourColor;
  winner: ConnectFourColor | "draw" | null;
  status: "lobby" | "playing" | "ended";
};

export type TicTacToeMark = "x" | "o";
export type TicTacToePlayer = {
  id: string;
  name: string;
  team: TicTacToeMark;
};
export type TicTacToeState = {
  mode: DuelMode;
  players: TicTacToePlayer[];
  /** 9 cells, row-major. */
  board: Array<TicTacToeMark | null>;
  turn: TicTacToeMark;
  winner: TicTacToeMark | "draw" | null;
  status: "lobby" | "playing" | "ended";
};

export type RpsChoice = "rock" | "paper" | "scissors";
export type RpsTeam = "yellow" | "red";
export type RpsPlayer = {
  id: string;
  name: string;
  team: RpsTeam;
};
export type RpsState = {
  mode: DuelMode;
  players: RpsPlayer[];
  /** Team pick for the current round (any teammate can set until both locked). */
  picks: Partial<Record<RpsTeam, RpsChoice>>;
  locked: Partial<Record<RpsTeam, boolean>>;
  scores: Record<RpsTeam, number>;
  round: number;
  lastResult: RpsTeam | "draw" | null;
  status: "lobby" | "picking" | "reveal" | "ended";
  targetScore: number;
};

export type RoomActivity =
  | { phase: "lobby" }
  | { phase: "catalog" }
  | { phase: "draw-modes"; gameId: "draw-guess" }
  | { phase: "draw-ready"; gameId: "draw-guess"; mode: "vote" | "duo" }
  | { phase: "c4-modes"; gameId: "connect-four" }
  | { phase: "c4-lobby"; gameId: "connect-four"; state: ConnectFourState }
  | { phase: "c4-play"; gameId: "connect-four"; state: ConnectFourState }
  | { phase: "ttt-modes"; gameId: "tic-tac-toe" }
  | { phase: "ttt-lobby"; gameId: "tic-tac-toe"; state: TicTacToeState }
  | { phase: "ttt-play"; gameId: "tic-tac-toe"; state: TicTacToeState }
  | { phase: "rps-modes"; gameId: "rock-paper-scissors" }
  | { phase: "rps-lobby"; gameId: "rock-paper-scissors"; state: RpsState }
  | { phase: "rps-play"; gameId: "rock-paper-scissors"; state: RpsState };

export type CatalogGameId =
  | "tic-tac-toe"
  | "connect-four"
  | "rock-paper-scissors"
  | "draw-guess"
  | "imposter"
  | "word-rush"
  | "bomb-party"
  | "trivia-blitz"
  | "charades"
  | "spyfall"
  | "red-flag";

export type CatalogGame = {
  id: CatalogGameId;
  title: string;
  tagline: string;
  blurb: string;
  accent: string;
  locked: boolean;
};
