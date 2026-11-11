import { randomUUID } from "node:crypto";
import { createActor, type Actor } from "xstate";
import { PlayerName, RoomCode, type Player } from "@partyverse/shared";
import { gameMachine } from "./machine.js";

// No I or O to avoid confusion with 1 and 0
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ";
export const MAX_PLAYERS = 8;

export type RoomErrorCode =
  | "INVALID_INPUT"
  | "ROOM_NOT_FOUND"
  | "ROOM_FULL"
  | "GAME_STARTED"
  | "NAME_TAKEN"
  | "NOT_HOST"
  | "PLAYER_NOT_FOUND";

export class RoomError extends Error {
  readonly code: RoomErrorCode;
  constructor(code: RoomErrorCode, message: string) {
    super(message);
    this.name = "RoomError";
    this.code = code;
  }
}

type Room = {
  code: string;
  hostId: string;
  actor: Actor<typeof gameMachine>;
};

export class RoomManager {
  private readonly rooms = new Map<string, Room>();

  constructor(
    private readonly words: string[],
    private readonly random: () => number = Math.random,
    private readonly newId: () => string = randomUUID,
  ) {}

  createRoom(): { code: string; hostId: string } {
    const code = this.generateCode();
    const hostId = this.newId();
    const actor = createActor(gameMachine, { input: { words: this.words } });
    actor.start();
    this.rooms.set(code, { code, hostId, actor });
    return { code, hostId };
  }

  join(code: string, name: string): Player {
    const parsedCode = RoomCode.safeParse(code);
    const parsedName = PlayerName.safeParse(name);
    if (!parsedCode.success || !parsedName.success) {
      throw new RoomError("INVALID_INPUT", "Invalid room code or nickname");
    }

    const room = this.getRoom(parsedCode.data);
    const snapshot = room.actor.getSnapshot();

    if (!snapshot.matches("lobby")) {
      throw new RoomError("GAME_STARTED", "The game has already started");
    }
    if (snapshot.context.players.length >= MAX_PLAYERS) {
      throw new RoomError("ROOM_FULL", "The room is full");
    }
    const wanted = parsedName.data.toLowerCase();
    if (snapshot.context.players.some((p) => p.name.toLowerCase() === wanted)) {
      throw new RoomError("NAME_TAKEN", "This nickname is already taken");
    }

    const player: Player = { id: this.newId(), name: parsedName.data, score: 0 };
    room.actor.send({ type: "PLAYER_JOIN", player });
    return player;
  }

  kick(code: string, hostId: string, playerId: string): void {
    const room = this.getRoom(code);
    if (room.hostId !== hostId) {
      throw new RoomError("NOT_HOST", "Only the host can kick a player");
    }
    if (!this.players(code).some((p) => p.id === playerId)) {
      throw new RoomError("PLAYER_NOT_FOUND", "Player not found");
    }
    room.actor.send({ type: "PLAYER_LEAVE", playerId });
  }

  leave(code: string, playerId: string): void {
    this.getRoom(code).actor.send({ type: "PLAYER_LEAVE", playerId });
  }

  players(code: string): Player[] {
    return this.getRoom(code).actor.getSnapshot().context.players;
  }

  getRoom(code: string): Room {
    const room = this.rooms.get(code);
    if (!room) throw new RoomError("ROOM_NOT_FOUND", "Room not found");
    return room;
  }

  deleteRoom(code: string): void {
    this.getRoom(code).actor.stop();
    this.rooms.delete(code);
  }

  private generateCode(): string {
    for (let attempt = 0; attempt < 100; attempt++) {
      let code = "";
      for (let i = 0; i < 4; i++) {
        code += ALPHABET.charAt(Math.floor(this.random() * ALPHABET.length));
      }
      if (!this.rooms.has(code)) return code;
    }
    throw new Error("Could not generate a unique room code");
  }
}
