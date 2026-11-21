import type { RoomDocument, RoomStore } from "./persist/roomStore.js";

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
let roomStore: RoomStore | null = null;
let membershipReader: ((code: string) => Omit<RoomDocument, "activity" | "updatedAt" | "ttl"> | null) | null =
  null;

export function configureRoomPersistence(options: {
  store: RoomStore;
  readMembership: (code: string) => Omit<RoomDocument, "activity" | "updatedAt" | "ttl"> | null;
}): void {
  roomStore = options.store;
  membershipReader = options.readMembership;
}

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

/** Prefer memory; on cold miss try Cosmos then seed memory. */
export async function loadRoomActivity(code: string): Promise<RoomActivity> {
  const key = code.toUpperCase();
  if (rooms.has(key)) {
    return rooms.get(key)!.activity;
  }
  if (roomStore) {
    const doc = await roomStore.get(key);
    if (doc) {
      rooms.set(key, { activity: doc.activity, updatedAt: doc.updatedAt });
      return doc.activity;
    }
  }
  return ensureRoom(key).activity;
}

export function setRoomActivity(code: string, activity: RoomActivity): RoomActivity {
  const key = code.toUpperCase();
  rooms.set(key, { activity, updatedAt: Date.now() });
  persistRoom(key);
  return activity;
}

export function persistRoom(code: string): void {
  if (!roomStore || !membershipReader) {
    return;
  }
  const key = code.toUpperCase();
  const membership = membershipReader(key);
  if (!membership) {
    return;
  }
  const session = rooms.get(key);
  const doc: RoomDocument = {
    id: key,
    code: key,
    hostId: membership.hostId,
    players: membership.players,
    activity: session?.activity ?? { phase: "lobby" },
    updatedAt: Date.now(),
    ttl: 86400,
  };
  void roomStore.upsert(doc).catch(() => {
    // Persistence is best-effort; memory remains authoritative for the live replica.
  });
}

export async function loadRoomDocument(code: string): Promise<RoomDocument | null> {
  if (!roomStore) {
    return null;
  }
  return roomStore.get(code.toUpperCase());
}

export function clearRoomActivity(code: string): void {
  const key = code.toUpperCase();
  rooms.delete(key);
  if (roomStore) {
    void roomStore.delete(key).catch(() => undefined);
  }
}
