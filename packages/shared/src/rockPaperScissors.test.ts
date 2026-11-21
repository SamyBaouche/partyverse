import { describe, expect, it } from "vitest";
import {
  createRpsLobby,
  joinRpsTeam,
  lockRpsPick,
  nextRpsRound,
  rematchRps,
  rpsLobbyReady,
  setRpsPick,
  startRps,
} from "./rockPaperScissors.js";

describe("rockPaperScissors rules", () => {
  it("requires both teams before start", () => {
    let state = createRpsLobby("1v1");
    expect(rpsLobbyReady(state)).toBe(false);
    state = joinRpsTeam(state, { id: "a", name: "Ada" }, "yellow")!;
    expect(startRps(state)).toBeNull();
    state = joinRpsTeam(state, { id: "b", name: "Bea" }, "red")!;
    expect(rpsLobbyReady(state)).toBe(true);
    state = startRps(state)!;
    expect(state.status).toBe("picking");
  });

  it("rejects picks from players not on a team", () => {
    let state = createRpsLobby("1v1");
    state = joinRpsTeam(state, { id: "a", name: "Ada" }, "yellow")!;
    state = joinRpsTeam(state, { id: "b", name: "Bea" }, "red")!;
    state = startRps(state)!;
    expect(setRpsPick(state, "ghost", "rock")).toBeNull();
    state = setRpsPick(state, "a", "rock")!;
    expect(state.picks.yellow).toBe("rock");
  });

  it("reveals when both teams lock and rematches after match end", () => {
    let state = createRpsLobby("1v1");
    state = joinRpsTeam(state, { id: "a", name: "Ada" }, "yellow")!;
    state = joinRpsTeam(state, { id: "b", name: "Bea" }, "red")!;
    state = startRps(state)!;
    state = setRpsPick(state, "a", "rock")!;
    state = lockRpsPick(state, "a")!;
    expect(state.status).toBe("picking");
    state = setRpsPick(state, "b", "scissors")!;
    state = lockRpsPick(state, "b")!;
    expect(state.status).toBe("reveal");
    expect(state.lastResult).toBe("yellow");
    expect(state.scores.yellow).toBe(1);

    state = nextRpsRound(state)!;
    expect(state.status).toBe("picking");
    expect(state.round).toBe(2);

    // Yellow wins two more to hit targetScore 3
    for (let i = 0; i < 2; i += 1) {
      state = setRpsPick(state, "a", "paper")!;
      state = lockRpsPick(state, "a")!;
      state = setRpsPick(state, "b", "rock")!;
      state = lockRpsPick(state, "b")!;
      if (state.status === "reveal") {
        state = nextRpsRound(state)!;
      }
    }
    expect(state.status).toBe("ended");
    expect(state.scores.yellow).toBe(3);
    state = rematchRps(state)!;
    expect(state.status).toBe("picking");
    expect(state.scores.yellow).toBe(0);
  });
});
