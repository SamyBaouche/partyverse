export type ConnectFourMode = "1v1" | "2v2";
export type ConnectFourColor = "yellow" | "red";

export type ConnectFourPlayer = {
  id: string;
  name: string;
  team: ConnectFourColor;
};

export type ConnectFourCell = 0 | 1 | 2;

export type ConnectFourState = {
  mode: ConnectFourMode;
  players: ConnectFourPlayer[];
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

type RoomSession = {
  activity: RoomActivity;
  updatedAt: number;
};

const rooms = new Map<string, RoomSession>();

function ensureRoom(code: string): RoomSession {
  const existing = rooms.get(code);
  if (existing) {
    return existing;
  }
  const created: RoomSession = {
    activity: { phase: "lobby" },
    updatedAt: Date.now(),
  };
  rooms.set(code, created);
  return created;
}

export function getRoomActivity(code: string): RoomActivity {
  return ensureRoom(code.toUpperCase()).activity;
}

export function setRoomActivity(code: string, activity: RoomActivity): RoomActivity {
  const key = code.toUpperCase();
  rooms.set(key, { activity, updatedAt: Date.now() });
  return activity;
}
