import { describe, expect, it } from "vitest";
import {
  createTttLobby,
  joinTttTeam,
  placeTttMark,
  rematchTtt,
  startTtt,
  tttLobbyReady,
} from "./ticTacToe.js";

describe("ticTacToe rules", () => {
  it("requires both teams before start", () => {
    let state = createTttLobby("1v1");
    expect(tttLobbyReady(state)).toBe(false);
    state = joinTttTeam(state, { id: "a", name: "Ada" }, "x")!;
    expect(startTtt(state)).toBeNull();
    state = joinTttTeam(state, { id: "b", name: "Bea" }, "o")!;
    expect(tttLobbyReady(state)).toBe(true);
    state = startTtt(state)!;
    expect(state.status).toBe("playing");
  });

  it("rejects moves from the wrong player", () => {
    let state = createTttLobby("1v1");
    state = joinTttTeam(state, { id: "a", name: "Ada" }, "x")!;
    state = joinTttTeam(state, { id: "b", name: "Bea" }, "o")!;
    state = startTtt(state)!;
    expect(placeTttMark(state, 0, "b")).toBeNull();
    state = placeTttMark(state, 0, "a")!;
    expect(state.board[0]).toBe("x");
    expect(state.turn).toBe("o");
  });

  it("detects a win and rematch", () => {
    let state = createTttLobby("1v1");
    state = joinTttTeam(state, { id: "a", name: "Ada" }, "x")!;
    state = joinTttTeam(state, { id: "b", name: "Bea" }, "o")!;
    state = startTtt(state)!;
    state = placeTttMark(state, 0, "a")!;
    state = placeTttMark(state, 3, "b")!;
    state = placeTttMark(state, 1, "a")!;
    state = placeTttMark(state, 4, "b")!;
    state = placeTttMark(state, 2, "a")!;
    expect(state.winner).toBe("x");
    expect(state.status).toBe("ended");
    state = rematchTtt(state)!;
    expect(state.status).toBe("playing");
    expect(state.board.every((cell) => cell === null)).toBe(true);
  });
});
