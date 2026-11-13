import type { StrokeColor } from "@partyverse/shared";

/** Arcade palette for the phone drawing canvas. */
export const DRAW_COLORS = [
  "#F8FBFF",
  "#FF5A6A",
  "#FF9F43",
  "#FFD23F",
  "#3DDC84",
  "#4EA1FF",
  "#7C6CFF",
  "#FF5AC8",
  "#2DD4BF",
  "#94A3B8",
] as const satisfies readonly StrokeColor[];

export const DEFAULT_DRAW_COLOR: StrokeColor = DRAW_COLORS[0];
