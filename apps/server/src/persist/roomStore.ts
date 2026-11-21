import type { RoomActivity } from "../session.js";

export type StoredPlayer = {
  id: string;
  name: string;
  score: number;
};

export type RoomDocument = {
  id: string;
  code: string;
  hostId: string;
  players: StoredPlayer[];
  activity: RoomActivity;
  updatedAt: number;
  /** Cosmos TTL seconds from last write (container defaultTtl also applies). */
  ttl?: number;
};

export type RoomStore = {
  get(code: string): Promise<RoomDocument | null>;
  upsert(doc: RoomDocument): Promise<void>;
  delete(code: string): Promise<void>;
};

/** In-memory store for tests / local without Cosmos. */
export function createMemoryRoomStore(): RoomStore {
  const docs = new Map<string, RoomDocument>();
  return {
    async get(code) {
      return docs.get(code.toUpperCase()) ?? null;
    },
    async upsert(doc) {
      docs.set(doc.code.toUpperCase(), { ...doc, code: doc.code.toUpperCase(), id: doc.code.toUpperCase() });
    },
    async delete(code) {
      docs.delete(code.toUpperCase());
    },
  };
}
