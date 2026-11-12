import { PlayerName, type Player, type RoomErrorCode } from "@partyverse/shared";

export type MockJoinResult = { ok: true; player: Player } | { ok: false; error: RoomErrorCode };

export async function mockJoin(code: string, name: string): Promise<MockJoinResult> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  if (code === "FULL") {
    return { ok: false, error: "ROOM_FULL" };
  }
  if (code === "LATE") {
    return { ok: false, error: "GAME_STARTED" };
  }
  if (code === "ZZZZ") {
    return { ok: false, error: "ROOM_NOT_FOUND" };
  }
  if (name.trim().toLowerCase() === "taken") {
    return { ok: false, error: "NAME_TAKEN" };
  }

  const parsedName = PlayerName.parse(name);
  return {
    ok: true,
    player: {
      id: crypto.randomUUID(),
      name: parsedName,
      score: 0,
    },
  };
}
