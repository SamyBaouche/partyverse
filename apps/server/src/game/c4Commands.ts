import {
  ConnectFourColor,
  ConnectFourState,
  createC4Lobby,
  c4ActivityPhase,
  DuelMode,
  dropC4,
  joinC4Team,
  rematchC4,
  setC4Hover,
  startC4,
} from "@partyverse/shared";
import type { ConnectFourState as C4State } from "@partyverse/shared";
import { getRoomActivity, setRoomActivity } from "../session.js";
import { RoomError } from "./rooms.js";

export type C4Command =
  | { type: "bootstrap"; mode: string }
  | { type: "joinTeam"; playerId: string; name: string; team: string }
  | { type: "start" }
  | { type: "hover"; playerId: string; col: number }
  | { type: "drop"; playerId: string; col: number }
  | { type: "rematch" };

function readState(code: string): C4State | null {
  const activity = getRoomActivity(code);
  if (activity.phase !== "c4-lobby" && activity.phase !== "c4-play") {
    return null;
  }
  const parsed = ConnectFourState.safeParse(activity.state);
  return parsed.success ? parsed.data : null;
}

function writeState(code: string, state: C4State): C4State {
  setRoomActivity(code, {
    phase: c4ActivityPhase(state),
    gameId: "connect-four",
    state,
  });
  return state;
}

export function applyC4Command(code: string, command: C4Command): C4State {
  const key = code.toUpperCase();

  if (command.type === "bootstrap") {
    const mode = DuelMode.safeParse(command.mode);
    if (!mode.success) {
      throw new RoomError("INVALID_INPUT", "Invalid Four in a Row mode");
    }
    return writeState(key, createC4Lobby(mode.data));
  }

  const current = readState(key);
  if (!current) {
    throw new RoomError("INVALID_INPUT", "Four in a Row is not active in this room");
  }

  let next: C4State | null = null;
  switch (command.type) {
    case "joinTeam": {
      const team = ConnectFourColor.safeParse(command.team);
      if (!team.success || !command.playerId.trim() || !command.name.trim()) {
        throw new RoomError("INVALID_INPUT", "Invalid join payload");
      }
      next = joinC4Team(
        current,
        { id: command.playerId.trim(), name: command.name.trim().slice(0, 16) },
        team.data,
      );
      break;
    }
    case "start":
      next = startC4(current);
      break;
    case "hover":
      if (!command.playerId.trim() || !Number.isInteger(command.col)) {
        throw new RoomError("INVALID_INPUT", "Invalid hover payload");
      }
      next = setC4Hover(current, command.playerId.trim(), command.col);
      break;
    case "drop":
      if (!command.playerId.trim() || !Number.isInteger(command.col)) {
        throw new RoomError("INVALID_INPUT", "Invalid drop payload");
      }
      next = dropC4(current, command.col, command.playerId.trim());
      break;
    case "rematch":
      next = rematchC4(current);
      break;
    default:
      throw new RoomError("INVALID_INPUT", "Unknown Four in a Row command");
  }

  if (!next) {
    throw new RoomError("INVALID_INPUT", "Illegal Four in a Row move");
  }
  return writeState(key, next);
}
