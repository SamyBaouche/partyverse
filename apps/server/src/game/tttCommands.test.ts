import { describe, expect, it } from "vitest";
import { applyTttCommand } from "./tttCommands.js";

describe("applyTttCommand", () => {
  it("bootstraps, joins, starts, and plays a legal game", () => {
    const code = "TTTT";
    let state = applyTttCommand(code, { type: "bootstrap", mode: "1v1" });
    expect(state.status).toBe("lobby");

    applyTttCommand(code, {
      type: "joinTeam",
      playerId: "p1",
      name: "Ada",
      team: "x",
    });
    applyTttCommand(code, {
      type: "joinTeam",
      playerId: "p2",
      name: "Bea",
      team: "o",
    });
    state = applyTttCommand(code, { type: "start" });
    expect(state.status).toBe("playing");

    state = applyTttCommand(code, { type: "place", playerId: "p1", index: 0 });
    expect(state.board[0]).toBe("x");
    expect(() => applyTttCommand(code, { type: "place", playerId: "p1", index: 1 })).toThrow(
      /Illegal|INVALID/,
    );
  });
});
