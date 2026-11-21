import { describe, expect, it } from "vitest";
import { applyRpsCommand } from "./rpsCommands.js";

describe("applyRpsCommand", () => {
  it("bootstraps, joins, starts, picks, and locks a round", () => {
    const code = "RPSS";
    let state = applyRpsCommand(code, { type: "bootstrap", mode: "1v1" });
    expect(state.status).toBe("lobby");

    state = applyRpsCommand(code, {
      type: "joinTeam",
      playerId: "p1",
      name: "Ada",
      team: "yellow",
    });
    state = applyRpsCommand(code, {
      type: "joinTeam",
      playerId: "p2",
      name: "Bea",
      team: "red",
    });
    state = applyRpsCommand(code, { type: "start" });
    expect(state.status).toBe("picking");

    state = applyRpsCommand(code, { type: "pick", playerId: "p1", choice: "rock" });
    state = applyRpsCommand(code, { type: "lock", playerId: "p1" });
    state = applyRpsCommand(code, { type: "pick", playerId: "p2", choice: "scissors" });
    state = applyRpsCommand(code, { type: "lock", playerId: "p2" });
    expect(state.status).toBe("reveal");
    expect(state.lastResult).toBe("yellow");

    expect(() =>
      applyRpsCommand(code, { type: "pick", playerId: "p1", choice: "paper" }),
    ).toThrow(/Illegal|INVALID/);
  });
});
