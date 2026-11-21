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

/** Opaque game state blobs validated loosely in validateActivity. */
export type RoomActivity =
  | { phase: "lobby" }
  | { phase: "catalog" }
  | { phase: "draw-modes"; gameId: "draw-guess" }
  | { phase: "draw-ready"; gameId: "draw-guess"; mode: "vote" | "duo" }
  | { phase: "c4-modes"; gameId: "connect-four" }
  | { phase: "c4-lobby"; gameId: "connect-four"; state: ConnectFourState }
  | { phase: "c4-play"; gameId: "connect-four"; state: ConnectFourState }
  | { phase: "ttt-modes"; gameId: "tic-tac-toe" }
  | { phase: "ttt-lobby"; gameId: "tic-tac-toe"; state: Record<string, unknown> }
  | { phase: "ttt-play"; gameId: "tic-tac-toe"; state: Record<string, unknown> }
  | { phase: "rps-modes"; gameId: "rock-paper-scissors" }
  | { phase: "rps-lobby"; gameId: "rock-paper-scissors"; state: Record<string, unknown> }
  | { phase: "rps-play"; gameId: "rock-paper-scissors"; state: Record<string, unknown> }
  | { phase: "kart-modes"; gameId: "wish-kart" }
  | { phase: "kart-lobby"; gameId: "wish-kart"; state: Record<string, unknown> }
  | { phase: "kart-play"; gameId: "wish-kart"; state: Record<string, unknown> }
  | {
      phase: "party-lobby" | "party-play";
      gameId: string;
      state: Record<string, unknown>;
    };

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

/** Room codes currently in a Kart Rush lobby/race (for the 10 Hz sim loop). */
export function listKartRoomCodes(): string[] {
  const codes: string[] = [];
  for (const [code, session] of rooms) {
    if (session.activity.phase === "kart-lobby" || session.activity.phase === "kart-play") {
      codes.push(code);
    }
  }
  return codes;
}
