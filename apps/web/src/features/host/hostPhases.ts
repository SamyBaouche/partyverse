export type HostPhase =
  | "catalog"
  | "draw-modes"
  | "lobby"
  | "draw-ready"
  | "c4-modes"
  | "c4-lobby"
  | "c4-play"
  | "ttt-modes"
  | "ttt-lobby"
  | "ttt-play"
  | "rps-modes"
  | "rps-lobby"
  | "rps-play";

export const HOST_PHASES: HostPhase[] = [
  "catalog",
  "draw-modes",
  "lobby",
  "draw-ready",
  "c4-modes",
  "c4-lobby",
  "c4-play",
  "ttt-modes",
  "ttt-lobby",
  "ttt-play",
  "rps-modes",
  "rps-lobby",
  "rps-play",
];

export function readInitialPhase(raw: string | null): HostPhase {
  if (raw && (HOST_PHASES as string[]).includes(raw)) {
    return raw as HostPhase;
  }
  return "catalog";
}
