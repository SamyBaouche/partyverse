export type DrawMode = "vote" | "duo" | "solo" | "ai";

export type ConnectFourMode = "1v1" | "2v2";
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

export type RoomActivity =
  | { phase: "lobby" }
  | { phase: "catalog" }
  | { phase: "draw-modes"; gameId: "draw-guess" }
  | { phase: "draw-ready"; gameId: "draw-guess"; mode: "vote" | "duo" }
  | { phase: "c4-modes"; gameId: "connect-four" }
  | { phase: "c4-lobby"; gameId: "connect-four"; state: ConnectFourState }
  | { phase: "c4-play"; gameId: "connect-four"; state: ConnectFourState };

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
