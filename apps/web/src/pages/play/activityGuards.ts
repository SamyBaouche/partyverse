import type { RoomActivity } from "../../features/session/types";

export function isC4Activity(
  activity: RoomActivity,
): activity is Extract<RoomActivity, { phase: "c4-lobby" | "c4-play" }> {
  return activity.phase === "c4-lobby" || activity.phase === "c4-play";
}

export function isTttActivity(
  activity: RoomActivity,
): activity is Extract<RoomActivity, { phase: "ttt-lobby" | "ttt-play" }> {
  return activity.phase === "ttt-lobby" || activity.phase === "ttt-play";
}

export function isRpsActivity(
  activity: RoomActivity,
): activity is Extract<RoomActivity, { phase: "rps-lobby" | "rps-play" }> {
  return activity.phase === "rps-lobby" || activity.phase === "rps-play";
}

export function isKartActivity(
  activity: RoomActivity,
): activity is Extract<RoomActivity, { phase: "kart-lobby" | "kart-play" }> {
  return activity.phase === "kart-lobby" || activity.phase === "kart-play";
}

export function isPartyActivity(
  activity: RoomActivity,
): activity is Extract<RoomActivity, { phase: "party-lobby" | "party-play" }> {
  return activity.phase === "party-lobby" || activity.phase === "party-play";
}
