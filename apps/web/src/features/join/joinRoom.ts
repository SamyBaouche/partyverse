import {
  PlayerName,
  RoomErrorCode,
  type Player,
  type RoomErrorCode as RoomError,
} from "@partyverse/shared";

export type JoinRoomResult = { ok: true; player: Player } | { ok: false; error: RoomError };

const FETCH_MS = 8_000;

async function fetchJson(input: string, init?: RequestInit): Promise<Response> {
  return fetch(input, { ...init, signal: AbortSignal.timeout(FETCH_MS) });
}

/** Create a Draw Guess room on the authoritative server. */
export async function createRoom(): Promise<{ code: string; hostId: string }> {
  const response = await fetchJson("/api/rooms", { method: "POST" });
  if (!response.ok) {
    throw new Error(`Failed to create room (${response.status})`);
  }
  return (await response.json()) as { code: string; hostId: string };
}

/** Join a room via HTTP; PubSub negotiate comes after with the returned playerId. */
export async function joinRoom(code: string, name: string): Promise<JoinRoomResult> {
  const parsedName = PlayerName.safeParse(name);
  if (!parsedName.success) {
    return { ok: false, error: "INVALID_INPUT" };
  }

  try {
    const response = await fetchJson(`/api/rooms/${encodeURIComponent(code)}/players`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: parsedName.data }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      const parsed = RoomErrorCode.safeParse(body?.error);
      return { ok: false, error: parsed.success ? parsed.data : "INVALID_INPUT" };
    }

    const body = (await response.json()) as { playerId: string };
    return {
      ok: true,
      player: { id: body.playerId, name: parsedName.data, score: 0 },
    };
  } catch {
    return { ok: false, error: "ROOM_NOT_FOUND" };
  }
}
