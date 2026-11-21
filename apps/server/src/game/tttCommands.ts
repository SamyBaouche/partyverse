import {
  createTttLobby,
  DuelMode,
  joinTttTeam,
  placeTttMark,
  rematchTtt,
  startTtt,
  TicTacToeMark,
  TicTacToeState,
  tttActivityPhase,
} from "@partyverse/shared";
import type { TicTacToeState as TttState } from "@partyverse/shared";
import { getRoomActivity, setRoomActivity } from "../session.js";
import { RoomError } from "./rooms.js";

export type TttCommand =
  | { type: "bootstrap"; mode: string }
  | { type: "joinTeam"; playerId: string; name: string; team: string }
  | { type: "start" }
  | { type: "place"; playerId: string; index: number }
  | { type: "rematch" };

function readState(code: string): TttState | null {
  const activity = getRoomActivity(code);
  if (activity.phase !== "ttt-lobby" && activity.phase !== "ttt-play") {
    return null;
  }
  const parsed = TicTacToeState.safeParse(activity.state);
  return parsed.success ? parsed.data : null;
}

function writeState(code: string, state: TttState): TttState {
  setRoomActivity(code, {
    phase: tttActivityPhase(state),
    gameId: "tic-tac-toe",
    state,
  });
  return state;
}

export function applyTttCommand(code: string, command: TttCommand): TttState {
  const key = code.toUpperCase();

  if (command.type === "bootstrap") {
    const mode = DuelMode.safeParse(command.mode);
    if (!mode.success) {
      throw new RoomError("INVALID_INPUT", "Invalid Tic-Tac-Toe mode");
    }
    return writeState(key, createTttLobby(mode.data));
  }

  const current = readState(key);
  if (!current) {
    throw new RoomError("INVALID_INPUT", "Tic-Tac-Toe is not active in this room");
  }

  let next: TttState | null = null;
  switch (command.type) {
    case "joinTeam": {
      const team = TicTacToeMark.safeParse(command.team);
      if (!team.success || !command.playerId.trim() || !command.name.trim()) {
        throw new RoomError("INVALID_INPUT", "Invalid join payload");
      }
      next = joinTttTeam(
        current,
        { id: command.playerId.trim(), name: command.name.trim().slice(0, 16) },
        team.data,
      );
      break;
    }
    case "start":
      next = startTtt(current);
      break;
    case "place":
      if (!Number.isInteger(command.index)) {
        throw new RoomError("INVALID_INPUT", "Invalid cell index");
      }
      next = placeTttMark(current, command.index, command.playerId);
      break;
    case "rematch":
      next = rematchTtt(current);
      break;
    default:
      throw new RoomError("INVALID_INPUT", "Unknown Tic-Tac-Toe command");
  }

  if (!next) {
    throw new RoomError("INVALID_INPUT", "Illegal Tic-Tac-Toe move");
  }
  return writeState(key, next);
}
