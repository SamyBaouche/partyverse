import { describe, expect, it } from "vitest";
import { getGameMode } from "@partyverse/shared";
import { DEFAULT_ROOM_MODE, getServerGameMode, listServerGameModes } from "./registry.js";

describe("GameMode registry", () => {
  it("registers draw-guess with a server engine factory", () => {
    const mode = getServerGameMode("draw-guess");
    expect(mode.meta).toEqual(getGameMode("draw-guess"));
    expect(mode.meta.authority).toBe("server");
    expect(mode.createEngine).toBeTypeOf("function");

    const actor = mode.createEngine!(["apple", "banana"]);
    expect(actor.getSnapshot().matches("lobby")).toBe(true);
    actor.stop();
  });

  it("lists all v1 modes and defaults rooms to draw-guess", () => {
    const modes = listServerGameModes();
    expect(modes.map((entry) => entry.meta.id)).toEqual([
      "draw-guess",
      "tic-tac-toe",
      "rock-paper-scissors",
      "connect-four",
      "wish-kart",
    ]);
    expect(DEFAULT_ROOM_MODE).toBe("draw-guess");
    expect(getServerGameMode("tic-tac-toe").createEngine).toBeUndefined();
  });
});
