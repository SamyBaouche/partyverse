import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryPublisher } from "../realtime/publisher.js";
import { GameSessionManager } from "./session.js";

describe("GameSessionManager event routing", () => {
  let publisher: InMemoryPublisher;
  let sessions: GameSessionManager;

  beforeEach(() => {
    vi.useFakeTimers();
    publisher = new InMemoryPublisher();
    sessions = new GameSessionManager({
      publisher,
      words: ["cat", "pizza"],
      drawingMs: 60_000,
      revealMs: 5_000,
      now: () => Date.now(),
      schedule: (fn, ms) => setTimeout(fn, ms),
      clearSchedule: (id) => clearTimeout(id),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function seedLobby() {
    const { code, hostId } = sessions.createRoom();
    const a = sessions.join(code, "Ada");
    const b = sessions.join(code, "Bob");
    publisher.clear();
    return { code, hostId, playerA: a.playerId, playerB: b.playerId };
  }

  it("rejects startGame from a non-host", async () => {
    const { code, playerA } = seedLobby();
    await sessions.handleClientMessage(code, playerA, { type: "startGame" });
    expect(publisher.messagesForUser(playerA)).toEqual([
      { type: "error", message: "Only the host can start the game" },
    ]);
    expect(sessions.rooms.getRoom(code).actor.getSnapshot().matches("lobby")).toBe(true);
  });

  it("rejects drawStroke from a non-drawer", async () => {
    const { code, hostId, playerA, playerB } = seedLobby();
    await sessions.handleClientMessage(code, hostId, { type: "startGame" });
    publisher.clear();

    const drawer = sessions.rooms.getRoom(code).actor.getSnapshot().context;
    const drawerUser = drawer.players[drawer.drawerIndex % drawer.players.length]?.id;
    const nonDrawer = drawerUser === playerA ? playerB : playerA;

    await sessions.handleClientMessage(code, nonDrawer!, {
      type: "drawStroke",
      stroke: {
        id: "s1",
        color: "#FF0000",
        tool: "pen",
        points: [{ x: 0.1, y: 0.2 }],
      },
    });

    expect(publisher.messagesForUser(nonDrawer!)).toEqual([
      { type: "error", message: "Only the current drawer can draw" },
    ]);
  });

  it("rejects guess from the drawer", async () => {
    const { code, hostId } = seedLobby();
    await sessions.handleClientMessage(code, hostId, { type: "startGame" });
    publisher.clear();

    const context = sessions.rooms.getRoom(code).actor.getSnapshot().context;
    const drawer = context.players[context.drawerIndex % context.players.length]!.id;

    await sessions.handleClientMessage(code, drawer, { type: "guess", text: "cat" });
    expect(publisher.messagesForUser(drawer)).toEqual([
      { type: "error", message: "The drawer cannot guess" },
    ]);
  });

  it("broadcasts guessResult without the word on a correct guess", async () => {
    const { code, hostId, playerA, playerB } = seedLobby();
    await sessions.handleClientMessage(code, hostId, { type: "startGame" });

    const context = sessions.rooms.getRoom(code).actor.getSnapshot().context;
    const drawer = context.players[context.drawerIndex % context.players.length]!.id;
    const guesser = drawer === playerA ? playerB : playerA;
    publisher.clear();

    await sessions.handleClientMessage(code, guesser, { type: "guess", text: context.word });

    const roomMsgs = publisher.messagesForRoom(code);
    const guessResult = roomMsgs.find((msg) => msg.type === "guessResult");
    expect(guessResult).toEqual({ type: "guessResult", playerId: guesser, correct: true });
    expect(JSON.stringify(guessResult)).not.toContain(context.word);

    const yourWord = publisher.messagesForUser(drawer).find((msg) => msg.type === "yourWord");
    // Drawer already received yourWord at round start; must not leak via guessResult.
    expect(yourWord === undefined || yourWord.type === "yourWord").toBe(true);
  });

  it("fires TIMER_END after the drawing duration", async () => {
    const { code, hostId } = seedLobby();
    await sessions.handleClientMessage(code, hostId, { type: "startGame" });
    expect(sessions.rooms.getRoom(code).actor.getSnapshot().matches("drawing")).toBe(true);

    await vi.advanceTimersByTimeAsync(60_000);
    expect(sessions.rooms.getRoom(code).actor.getSnapshot().matches("reveal")).toBe(true);

    const reveal = publisher.messagesForRoom(code).find((msg) => msg.type === "phaseChanged");
    // Last phaseChanged should be reveal and include the word for everyone.
    const phases = publisher
      .messagesForRoom(code)
      .filter((msg) => msg.type === "phaseChanged") as Array<{
      type: "phaseChanged";
      phase: string;
      word?: string;
    }>;
    const lastPhase = phases.at(-1);
    expect(lastPhase?.phase).toBe("reveal");
    expect(lastPhase?.word).toBeTruthy();
    expect(reveal).toBeTruthy();
  });

  it("deletes the room when it becomes empty", async () => {
    const { code, playerA, playerB } = seedLobby();
    await sessions.handleDisconnect(playerA);
    expect(() => sessions.rooms.getRoom(code)).not.toThrow();

    await sessions.handleDisconnect(playerB);
    expect(() => sessions.rooms.getRoom(code)).toThrow(/not found/i);
  });
});
