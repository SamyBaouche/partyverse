import { describe, expect, it } from "vitest";
import {
  createC4Lobby,
  dropC4,
  joinC4Team,
  rematchC4,
  setC4Hover,
  startC4,
} from "./connectFour.js";

describe("connectFour rules", () => {
  it("requires both teams and rejects wrong-player drops", () => {
    let state = createC4Lobby("1v1");
    state = joinC4Team(state, { id: "a", name: "Ada" }, "yellow")!;
    expect(startC4(state)).toBeNull();
    state = joinC4Team(state, { id: "b", name: "Bea" }, "red")!;
    state = startC4(state)!;
    expect(dropC4(state, 0, "b")).toBeNull();
    state = dropC4(state, 0, "a")!;
    expect(state.board[5]?.[0]).toBe(1);
    expect(state.turn).toBe("red");
  });

  it("detects a vertical win and rematch", () => {
    let state = createC4Lobby("1v1");
    state = joinC4Team(state, { id: "a", name: "Ada" }, "yellow")!;
    state = joinC4Team(state, { id: "b", name: "Bea" }, "red")!;
    state = startC4(state)!;
    // Yellow drops in col 0 four times interleaved with red in col 1
    for (let i = 0; i < 3; i += 1) {
      state = dropC4(state, 0, "a")!;
      state = dropC4(state, 1, "b")!;
    }
    state = dropC4(state, 0, "a")!;
    expect(state.winner).toBe("yellow");
    expect(state.status).toBe("ended");
    state = rematchC4(state)!;
    expect(state.status).toBe("playing");
    expect(state.winner).toBeNull();
  });

  it("only the active team may hover", () => {
    let state = createC4Lobby("1v1");
    state = joinC4Team(state, { id: "a", name: "Ada" }, "yellow")!;
    state = joinC4Team(state, { id: "b", name: "Bea" }, "red")!;
    state = startC4(state)!;
    expect(setC4Hover(state, "b", 5)).toBeNull();
    state = setC4Hover(state, "a", 5)!;
    expect(state.hoverCol).toBe(5);
  });
});
