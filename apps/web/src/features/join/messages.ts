import type { RoomErrorCode } from "@partyverse/shared";

export const ROOM_ERROR_MESSAGES: Record<RoomErrorCode, string> = {
  INVALID_INPUT: "Invalid room code or nickname.",
  ROOM_NOT_FOUND: "Room not found. Check the code on the TV.",
  ROOM_FULL: "This room is full (8 players max).",
  GAME_STARTED: "This game has already started.",
  NAME_TAKEN: "This nickname is already taken.",
  NOT_HOST: "Only the host can do that.",
  PLAYER_NOT_FOUND: "Player not found.",
};
