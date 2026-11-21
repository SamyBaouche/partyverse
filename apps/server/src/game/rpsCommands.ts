import {
  createRpsLobby,
  DuelMode,
  joinRpsTeam,
  lockRpsPick,
  nextRpsRound,
  rematchRps,
  RpsChoice,
  RpsState,
  RpsTeam,
  rpsActivityPhase,
  setRpsPick,
  startRps,
} from "@partyverse/shared";
import type { RpsState as RpsStateType } from "@partyverse/shared";
import { getRoomActivity, setRoomActivity } from "../session.js";
import { RoomError } from "./rooms.js";

export type RpsCommand =
  | { type: "bootstrap"; mode: string }
  | { type: "joinTeam"; playerId: string; name: string; team: string }
  | { type: "start" }
  | { type: "pick"; playerId: string; choice: string }
  | { type: "lock"; playerId: string }
  | { type: "nextRound" }
  | { type: "rematch" };

function readState(code: string): RpsStateType | null {
  const activity = getRoomActivity(code);
  if (activity.phase !== "rps-lobby" && activity.phase !== "rps-play") {
    return null;
  }
  const parsed = RpsState.safeParse(activity.state);
  return parsed.success ? parsed.data : null;
}

function writeState(code: string, state: RpsStateType): RpsStateType {
  setRoomActivity(code, {
    phase: rpsActivityPhase(state),
    gameId: "rock-paper-scissors",
    state,
  });
  return state;
}

export function applyRpsCommand(code: string, command: RpsCommand): RpsStateType {
  const key = code.toUpperCase();

  if (command.type === "bootstrap") {
    const mode = DuelMode.safeParse(command.mode);
    if (!mode.success) {
      throw new RoomError("INVALID_INPUT", "Invalid Rock Paper Scissors mode");
    }
    return writeState(key, createRpsLobby(mode.data));
  }

  const current = readState(key);
  if (!current) {
    throw new RoomError("INVALID_INPUT", "Rock Paper Scissors is not active in this room");
  }

  let next: RpsStateType | null = null;
  switch (command.type) {
    case "joinTeam": {
      const team = RpsTeam.safeParse(command.team);
      if (!team.success || !command.playerId.trim() || !command.name.trim()) {
        throw new RoomError("INVALID_INPUT", "Invalid join payload");
      }
      next = joinRpsTeam(
        current,
        { id: command.playerId.trim(), name: command.name.trim().slice(0, 16) },
        team.data,
      );
      break;
    }
    case "start":
      next = startRps(current);
      break;
    case "pick": {
      const choice = RpsChoice.safeParse(command.choice);
      if (!choice.success || !command.playerId.trim()) {
        throw new RoomError("INVALID_INPUT", "Invalid pick payload");
      }
      next = setRpsPick(current, command.playerId.trim(), choice.data);
      break;
    }
    case "lock":
      if (!command.playerId.trim()) {
        throw new RoomError("INVALID_INPUT", "Invalid lock payload");
      }
      next = lockRpsPick(current, command.playerId.trim());
      break;
    case "nextRound":
      next = nextRpsRound(current);
      break;
    case "rematch":
      next = rematchRps(current);
      break;
    default:
      throw new RoomError("INVALID_INPUT", "Unknown Rock Paper Scissors command");
  }

  if (!next) {
    throw new RoomError("INVALID_INPUT", "Illegal Rock Paper Scissors move");
  }
  return writeState(key, next);
}
