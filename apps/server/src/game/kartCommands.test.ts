import { describe, expect, it, afterEach } from "vitest";
import { applyKartCommand } from "./kartCommands.js";
import { startKartLoop, stopKartLoop } from "./kartLoop.js";

describe("applyKartCommand + kart loop", () => {
  afterEach(() => {
    stopKartLoop();
  });

  it("bootstraps, joins, starts, and accepts input", () => {
    const code = "KART";
    let state = applyKartCommand(code, { type: "bootstrap" });
    expect(state.status).toBe("lobby");
    expect(state.players.filter((p) => p.isBot).length).toBe(4);

    state = applyKartCommand(code, {
      type: "join",
      playerId: "p1",
      name: "Ada",
    });
    expect(state.players.some((p) => p.id === "p1" && !p.isBot)).toBe(true);

    state = applyKartCommand(code, { type: "start" });
    expect(state.status).toBe("countdown");

    state = applyKartCommand(code, {
      type: "input",
      playerId: "p1",
      input: { gas: true, steer: 0.5 },
    });
    expect(state.players.find((p) => p.id === "p1")?.input.gas).toBe(true);

    startKartLoop();
    expect(() => startKartLoop()).not.toThrow();
  });
});
