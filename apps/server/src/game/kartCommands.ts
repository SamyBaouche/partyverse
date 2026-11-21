import {
  createWishKartLobby,
  joinKart,
  kartActivityPhase,
  leaveKart,
  rematchKart,
  setKartInput,
  startCountdown,
  WishKartState,
  type KartInput,
  type WishKartState as KartState,
} from "@partyverse/shared";
import { getRoomActivity, setRoomActivity } from "../session.js";
import { RoomError } from "./rooms.js";

export type KartCommand =
  | { type: "bootstrap" }
  | { type: "join"; playerId: string; name: string }
  | { type: "leave"; playerId: string }
  | { type: "input"; playerId: string; input: Partial<KartInput> }
  | { type: "start" }
  | { type: "rematch" };

export function readKartState(code: string): KartState | null {
  const activity = getRoomActivity(code);
  if (activity.phase !== "kart-lobby" && activity.phase !== "kart-play") {
    return null;
  }
  const parsed = WishKartState.safeParse(activity.state);
  return parsed.success ? parsed.data : null;
}

export function writeKartState(code: string, state: KartState): KartState {
  setRoomActivity(code, {
    phase: kartActivityPhase(state),
    gameId: "wish-kart",
    state,
  });
  return state;
}

export function applyKartCommand(code: string, command: KartCommand): KartState {
  const key = code.toUpperCase();

  if (command.type === "bootstrap") {
    return writeKartState(key, createWishKartLobby());
  }

  const current = readKartState(key);
  if (!current) {
    throw new RoomError("INVALID_INPUT", "Kart Rush is not active in this room");
  }

  let next: KartState | null = null;
  switch (command.type) {
    case "join":
      if (!command.playerId.trim() || !command.name.trim()) {
        throw new RoomError("INVALID_INPUT", "Invalid join payload");
      }
      next = joinKart(current, command.playerId.trim(), command.name.trim());
      break;
    case "leave":
      if (!command.playerId.trim()) {
        throw new RoomError("INVALID_INPUT", "Invalid leave payload");
      }
      next = leaveKart(current, command.playerId.trim());
      break;
    case "input":
      if (!command.playerId.trim() || !command.input || typeof command.input !== "object") {
        throw new RoomError("INVALID_INPUT", "Invalid input payload");
      }
      next = setKartInput(current, command.playerId.trim(), command.input);
      break;
    case "start":
      if (current.status !== "lobby") {
        throw new RoomError("INVALID_INPUT", "Race already started");
      }
      next = startCountdown(current);
      break;
    case "rematch":
      if (current.status !== "finished") {
        throw new RoomError("INVALID_INPUT", "Race is not finished");
      }
      next = rematchKart(current);
      break;
    default:
      throw new RoomError("INVALID_INPUT", "Unknown Kart Rush command");
  }

  if (!next) {
    throw new RoomError("INVALID_INPUT", "Illegal Kart Rush move");
  }
  return writeKartState(key, next);
}
