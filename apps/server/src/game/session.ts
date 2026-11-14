import type { ClientMessage, ServerMessage } from "@partyverse/shared";
import { drawerId } from "./machine.js";
import { RoomError, RoomManager } from "./rooms.js";
import { DEFAULT_WORDS } from "./words.js";
import type { RealtimePublisher } from "../realtime/publisher.js";

export const DRAWING_MS = 60_000;
export const REVEAL_MS = 5_000;

type RoomTimers = {
  drawing?: ReturnType<typeof setTimeout>;
  reveal?: ReturnType<typeof setTimeout>;
};

type SessionOptions = {
  publisher: RealtimePublisher;
  words?: string[];
  drawingMs?: number;
  revealMs?: number;
  now?: () => number;
  /** Injected for tests so TIMER_END can use fake timers. */
  schedule?: (fn: () => void, ms: number) => ReturnType<typeof setTimeout>;
  clearSchedule?: (id: ReturnType<typeof setTimeout>) => void;
};

/**
 * One XState actor per room (via RoomManager), plus server-owned timers
 * and PubSub broadcasts. Clients never see the secret word except the drawer
 * (`yourWord`) and everyone during `reveal`.
 */
export class GameSessionManager {
  readonly rooms: RoomManager;
  private readonly publisher: RealtimePublisher;
  private readonly drawingMs: number;
  private readonly revealMs: number;
  private readonly now: () => number;
  private readonly schedule: (fn: () => void, ms: number) => ReturnType<typeof setTimeout>;
  private readonly clearSchedule: (id: ReturnType<typeof setTimeout>) => void;
  private readonly timers = new Map<string, RoomTimers>();
  /** Reverse lookup: userId → room code (host + players). */
  private readonly userRooms = new Map<string, string>();

  constructor(options: SessionOptions) {
    this.publisher = options.publisher;
    this.drawingMs = options.drawingMs ?? DRAWING_MS;
    this.revealMs = options.revealMs ?? REVEAL_MS;
    this.now = options.now ?? Date.now;
    this.schedule = options.schedule ?? ((fn, ms) => setTimeout(fn, ms));
    this.clearSchedule = options.clearSchedule ?? ((id) => clearTimeout(id));
    this.rooms = new RoomManager(options.words ?? [...DEFAULT_WORDS]);
  }

  createRoom(): { code: string; hostId: string } {
    const created = this.rooms.createRoom();
    this.userRooms.set(created.hostId, created.code);
    return created;
  }

  join(code: string, name: string): { playerId: string } {
    const player = this.rooms.join(code, name);
    this.userRooms.set(player.id, code.toUpperCase());
    void this.publisher.toRoom(code.toUpperCase(), {
      type: "playerJoined",
      player,
    });
    return { playerId: player.id };
  }

  findCodeForUser(userId: string): string | undefined {
    return this.userRooms.get(userId);
  }

  isAllowedInRoom(code: string, userId: string): boolean {
    try {
      const room = this.rooms.getRoom(code);
      if (room.hostId === userId) {
        return true;
      }
      return this.rooms.players(code).some((player) => player.id === userId);
    } catch {
      return false;
    }
  }

  async handleClientMessage(code: string, userId: string, message: ClientMessage): Promise<void> {
    const room = this.rooms.getRoom(code);
    const snapshot = room.actor.getSnapshot();
    const currentDrawer = drawerId(snapshot.context);

    if (message.type === "join") {
      // HTTP POST /api/rooms/:code/players is the join path; ignore duplicate join events.
      return;
    }

    if (message.type === "startGame") {
      if (room.hostId !== userId) {
        await this.publisher.toUser(userId, {
          type: "error",
          message: "Only the host can start the game",
        });
        return;
      }
      if (snapshot.matches("scores")) {
        room.actor.send({ type: "RESTART" });
      }
      const before = room.actor.getSnapshot();
      room.actor.send({ type: "START" });
      const after = room.actor.getSnapshot();
      if (after.matches("drawing") && !before.matches("drawing")) {
        await this.enterDrawing(code);
      }
      return;
    }

    if (message.type === "drawStroke") {
      if (userId !== currentDrawer || !snapshot.matches("drawing")) {
        await this.publisher.toUser(userId, {
          type: "error",
          message: "Only the current drawer can draw",
        });
        return;
      }
      await this.publisher.toRoom(code, { type: "strokeDrawn", stroke: message.stroke });
      return;
    }

    if (message.type === "clearCanvas") {
      if (userId !== currentDrawer || !snapshot.matches("drawing")) {
        await this.publisher.toUser(userId, {
          type: "error",
          message: "Only the current drawer can clear the canvas",
        });
        return;
      }
      await this.publisher.toRoom(code, { type: "canvasCleared" });
      return;
    }

    if (message.type === "guess") {
      if (userId === currentDrawer) {
        await this.publisher.toUser(userId, {
          type: "error",
          message: "The drawer cannot guess",
        });
        return;
      }
      if (!snapshot.matches("drawing")) {
        await this.publisher.toUser(userId, {
          type: "error",
          message: "Guessing is only allowed while drawing",
        });
        return;
      }

      const before = room.actor.getSnapshot();
      room.actor.send({ type: "GUESS", playerId: userId, text: message.text });
      const after = room.actor.getSnapshot();
      const correct = after.context.guessedIds.length > before.context.guessedIds.length;

      await this.publisher.toRoom(code, {
        type: "guessResult",
        playerId: userId,
        correct,
      });

      if (correct) {
        await this.publisher.toRoom(code, {
          type: "scoresUpdated",
          players: after.context.players,
        });
      }

      if (after.matches("reveal") && !before.matches("reveal")) {
        await this.enterReveal(code);
      }
    }
  }

  async handleDisconnect(userId: string): Promise<void> {
    const code = this.userRooms.get(userId);
    if (!code) {
      return;
    }

    try {
      const room = this.rooms.getRoom(code);
      const isPlayer = this.rooms.players(code).some((player) => player.id === userId);

      if (isPlayer) {
        room.actor.send({ type: "PLAYER_LEAVE", playerId: userId });
        await this.publisher.toRoom(code, { type: "playerLeft", playerId: userId });
      }

      this.userRooms.delete(userId);

      // Delete once the party is empty (no players left).
      if (this.rooms.players(code).length === 0) {
        this.deleteRoom(code);
      }
    } catch (error) {
      if (!(error instanceof RoomError) || error.code !== "ROOM_NOT_FOUND") {
        throw error;
      }
    }
  }

  deleteRoom(code: string): void {
    this.clearTimers(code);
    for (const [userId, roomCode] of this.userRooms) {
      if (roomCode === code) {
        this.userRooms.delete(userId);
      }
    }
    try {
      this.rooms.deleteRoom(code);
    } catch (error) {
      if (!(error instanceof RoomError) || error.code !== "ROOM_NOT_FOUND") {
        throw error;
      }
    }
  }

  /** Exposed for tests: fire TIMER_END as the server would after a phase timeout. */
  async fireTimerEnd(code: string): Promise<void> {
    const room = this.rooms.getRoom(code);
    const before = room.actor.getSnapshot();
    room.actor.send({ type: "TIMER_END" });
    const after = room.actor.getSnapshot();

    if (after.matches("reveal") && !before.matches("reveal")) {
      await this.enterReveal(code);
      return;
    }
    if (after.matches("drawing") && before.matches("reveal")) {
      await this.enterDrawing(code);
      return;
    }
    if (after.matches("scores")) {
      this.clearTimers(code);
      await this.publisher.toRoom(code, {
        type: "phaseChanged",
        phase: "scores",
        round: after.context.round,
        maxRounds: after.context.maxRounds,
        drawerId: null,
        wordLength: 0,
      });
      await this.publisher.toRoom(code, {
        type: "scoresUpdated",
        players: after.context.players,
      });
    }
  }

  private async enterDrawing(code: string): Promise<void> {
    this.clearTimers(code);
    const room = this.rooms.getRoom(code);
    const context = room.actor.getSnapshot().context;
    const drawer = drawerId(context);
    const endsAt = this.now() + this.drawingMs;

    const phaseMessage: ServerMessage = {
      type: "phaseChanged",
      phase: "drawing",
      round: context.round,
      maxRounds: context.maxRounds,
      drawerId: drawer ?? null,
      wordLength: context.word.length,
      endsAt,
    };
    await this.publisher.toRoom(code, phaseMessage);
    await this.publisher.toRoom(code, { type: "canvasCleared" });

    if (drawer && context.word) {
      await this.publisher.toUser(drawer, { type: "yourWord", word: context.word });
    }

    const timer = this.schedule(() => {
      void this.fireTimerEnd(code);
    }, this.drawingMs);
    this.timers.set(code, { ...this.timers.get(code), drawing: timer });
  }

  private async enterReveal(code: string): Promise<void> {
    this.clearTimers(code);
    const room = this.rooms.getRoom(code);
    const context = room.actor.getSnapshot().context;
    const endsAt = this.now() + this.revealMs;

    await this.publisher.toRoom(code, {
      type: "phaseChanged",
      phase: "reveal",
      round: context.round,
      maxRounds: context.maxRounds,
      drawerId: drawerId(context) ?? null,
      wordLength: context.word.length,
      endsAt,
      word: context.word,
    });

    const timer = this.schedule(() => {
      void this.fireTimerEnd(code);
    }, this.revealMs);
    this.timers.set(code, { ...this.timers.get(code), reveal: timer });
  }

  private clearTimers(code: string): void {
    const existing = this.timers.get(code);
    if (!existing) {
      return;
    }
    if (existing.drawing) {
      this.clearSchedule(existing.drawing);
    }
    if (existing.reveal) {
      this.clearSchedule(existing.reveal);
    }
    this.timers.delete(code);
  }
}
