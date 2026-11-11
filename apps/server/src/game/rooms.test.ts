import { describe, expect, it } from "vitest";
import { MAX_PLAYERS, RoomError, RoomManager } from "./rooms.js";

const errorCode = (fn: () => unknown) => {
  try {
    fn();
  } catch (e) {
    return e instanceof RoomError ? e.code : "UNKNOWN";
  }
  return "NO_ERROR";
};

describe("RoomManager", () => {
  it("creates a room with a 4-letter code without I or O", () => {
    const { code } = new RoomManager(["chat"]).createRoom();
    expect(code).toMatch(/^[A-HJ-NP-Z]{4}$/);
  });

  it("generates unique codes", () => {
    const rooms = new RoomManager(["chat"]);
    const codes = new Set(Array.from({ length: 50 }, () => rooms.createRoom().code));
    expect(codes.size).toBe(50);
  });

  it("adds a joining player", () => {
    const rooms = new RoomManager(["chat"]);
    const { code } = rooms.createRoom();
    const player = rooms.join(code, "Samy");
    expect(rooms.players(code)).toEqual([player]);
  });

  it("rejects an invalid or unknown code", () => {
    const rooms = new RoomManager(["chat"]);
    expect(errorCode(() => rooms.join("abcd", "Samy"))).toBe("INVALID_INPUT");
    expect(errorCode(() => rooms.join("ZZZZ", "Samy"))).toBe("ROOM_NOT_FOUND");
  });

  it("rejects a taken nickname, case-insensitively", () => {
    const rooms = new RoomManager(["chat"]);
    const { code } = rooms.createRoom();
    rooms.join(code, "Samy");
    expect(errorCode(() => rooms.join(code, "samy"))).toBe("NAME_TAKEN");
  });

  it(`rejects player #${MAX_PLAYERS + 1}`, () => {
    const rooms = new RoomManager(["chat"]);
    const { code } = rooms.createRoom();
    for (let i = 0; i < MAX_PLAYERS; i++) rooms.join(code, `Player${i}`);
    expect(errorCode(() => rooms.join(code, "Extra"))).toBe("ROOM_FULL");
  });

  it("rejects joining a started game", () => {
    const rooms = new RoomManager(["chat"]);
    const { code } = rooms.createRoom();
    rooms.join(code, "Samy");
    rooms.join(code, "Momo");
    rooms.getRoom(code).actor.send({ type: "START" });
    expect(errorCode(() => rooms.join(code, "Late"))).toBe("GAME_STARTED");
  });

  it("only the host can kick a player", () => {
    const rooms = new RoomManager(["chat"]);
    const { code, hostId } = rooms.createRoom();
    const momo = rooms.join(code, "Momo");
    expect(errorCode(() => rooms.kick(code, "faux-token", momo.id))).toBe("NOT_HOST");
    rooms.kick(code, hostId, momo.id);
    expect(rooms.players(code)).toEqual([]);
  });

  it("removes a player who leaves", () => {
    const rooms = new RoomManager(["cat"]);
    const { code } = rooms.createRoom();
    const samy = rooms.join(code, "Samy");
    rooms.leave(code, samy.id);
    expect(rooms.players(code)).toEqual([]);
  });

  it("deletes a room", () => {
    const rooms = new RoomManager(["cat"]);
    const { code } = rooms.createRoom();
    rooms.deleteRoom(code);
    expect(errorCode(() => rooms.getRoom(code))).toBe("ROOM_NOT_FOUND");
  });

  it("fails when no unique code can be generated", () => {
    const rooms = new RoomManager(["cat"], () => 0);
    rooms.createRoom();
    expect(() => rooms.createRoom()).toThrow("Could not generate a unique room code");
  });
});
