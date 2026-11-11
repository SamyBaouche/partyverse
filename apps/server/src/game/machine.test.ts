import { describe, expect, it } from "vitest";
import { createActor } from "xstate";
import { gameMachine, normalize } from "./machine.js";

const samy = { id: "a", name: "Samy", score: 0 };
const momo = { id: "b", name: "Momo", score: 0 };
const lina = { id: "c", name: "Lina", score: 0 };

function newGame(players = [samy, momo], maxRounds = 2) {
  const game = createActor(gameMachine, { input: { words: ["cat", "elephant"], maxRounds } });
  game.start();
  for (const player of players) game.send({ type: "PLAYER_JOIN", player });
  return game;
}

const scoreOf = (game: ReturnType<typeof newGame>, id: string) =>
  game.getSnapshot().context.players.find((p) => p.id === id)?.score;

describe("normalize", () => {
  it("ignores case, accents and surrounding spaces", () => {
    expect(normalize("  Éléphant ")).toBe("elephant");
  });
});

describe("lobby", () => {
  it("starts in the lobby", () => {
    expect(newGame([]).getSnapshot().value).toBe("lobby");
  });

  it("does not start with fewer than 2 players", () => {
    const game = newGame([samy]);
    game.send({ type: "START" });
    expect(game.getSnapshot().value).toBe("lobby");
  });

  it("ignores a player joining twice", () => {
    const game = newGame([samy, samy]);
    expect(game.getSnapshot().context.players).toHaveLength(1);
  });
});

describe("drawing", () => {
  it("starts round 1 with the first player drawing the first word", () => {
    const game = newGame();
    game.send({ type: "START" });
    const { value, context } = game.getSnapshot();
    expect(value).toBe("drawing");
    expect(context.round).toBe(1);
    expect(context.players[context.drawerIndex]?.id).toBe("a");
    expect(context.word).toBe("cat");
  });

  it("awards 100 to the guesser and 25 to the drawer", () => {
    const game = newGame([samy, momo, lina]);
    game.send({ type: "START" });
    game.send({ type: "GUESS", playerId: "b", text: " CAT " });
    expect(scoreOf(game, "b")).toBe(100);
    expect(scoreOf(game, "a")).toBe(25);
  });

  it("ignores the drawer's own guess", () => {
    const game = newGame([samy, momo, lina]);
    game.send({ type: "START" });
    game.send({ type: "GUESS", playerId: "a", text: "cat" });
    expect(scoreOf(game, "a")).toBe(0);
  });

  it("ignores wrong and duplicate guesses", () => {
    const game = newGame([samy, momo, lina]);
    game.send({ type: "START" });
    game.send({ type: "GUESS", playerId: "b", text: "dog" });
    game.send({ type: "GUESS", playerId: "b", text: "cat" });
    game.send({ type: "GUESS", playerId: "b", text: "cat" });
    expect(scoreOf(game, "b")).toBe(100);
  });

  it("moves to reveal when everyone has guessed", () => {
    const game = newGame();
    game.send({ type: "START" });
    game.send({ type: "GUESS", playerId: "b", text: "cat" });
    expect(game.getSnapshot().value).toBe("reveal");
  });

  it("moves to reveal when the timer ends", () => {
    const game = newGame();
    game.send({ type: "START" });
    game.send({ type: "TIMER_END" });
    expect(game.getSnapshot().value).toBe("reveal");
  });
});

describe("full game", () => {
  it("plays 2 rounds with 3 players and ends with the right scores", () => {
    const game = newGame([samy, momo, lina], 2);
    game.send({ type: "START" });

    // Round 1: Samy draws "cat"
    game.send({ type: "GUESS", playerId: "b", text: "CAT" });
    game.send({ type: "GUESS", playerId: "c", text: "cat" });
    expect(game.getSnapshot().value).toBe("reveal");

    // Round 2: Momo draws "elephant"
    game.send({ type: "TIMER_END" });
    const { context } = game.getSnapshot();
    expect(context.players[context.drawerIndex]?.id).toBe("b");
    game.send({ type: "GUESS", playerId: "a", text: "Éléphant" });
    game.send({ type: "TIMER_END" });
    game.send({ type: "TIMER_END" });

    expect(game.getSnapshot().value).toBe("scores");
    expect(scoreOf(game, "a")).toBe(150);
    expect(scoreOf(game, "b")).toBe(125);
    expect(scoreOf(game, "c")).toBe(100);
  });

  it("restarts to the lobby with scores reset", () => {
    const game = newGame([samy, momo], 1);
    game.send({ type: "START" });
    game.send({ type: "GUESS", playerId: "b", text: "cat" });
    game.send({ type: "TIMER_END" });
    game.send({ type: "RESTART" });
    const { value, context } = game.getSnapshot();
    expect(value).toBe("lobby");
    expect(context.players.every((p) => p.score === 0)).toBe(true);
  });

  it("removes a player who leaves, in any phase", () => {
    const game = newGame([samy, momo, lina]);
    game.send({ type: "START" });
    game.send({ type: "PLAYER_LEAVE", playerId: "c" });
    expect(game.getSnapshot().context.players).toHaveLength(2);
  });
});
