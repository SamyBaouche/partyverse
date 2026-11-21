import { describe, expect, it } from "vitest";
import { applyC4Command } from "./c4Commands.js";

describe("applyC4Command", () => {
  it("bootstraps, joins, starts, and drops", () => {
    const code = "C4C4";
    let state = applyC4Command(code, { type: "bootstrap", mode: "1v1" });
    expect(state.status).toBe("lobby");

    state = applyC4Command(code, {
      type: "joinTeam",
      playerId: "p1",
      name: "Ada",
      team: "yellow",
    });
    state = applyC4Command(code, {
      type: "joinTeam",
      playerId: "p2",
      name: "Bea",
      team: "red",
    });
    state = applyC4Command(code, { type: "start" });
    expect(state.status).toBe("playing");

    state = applyC4Command(code, { type: "hover", playerId: "p1", col: 2 });
    expect(state.hoverCol).toBe(2);
    state = applyC4Command(code, { type: "drop", playerId: "p1", col: 2 });
    expect(state.board[5]?.[2]).toBe(1);
    expect(() =>
      applyC4Command(code, { type: "drop", playerId: "p1", col: 3 }),
    ).toThrow(/Illegal|INVALID/);
  });
});
