import type { StrokeColor } from "@partyverse/shared";

/** Matches the drawable surface background (eraser paints this). */
export const CANVAS_BG_COLOR = "#070d18" as const satisfies StrokeColor;

/** Compact arcade swatches shown in the color popover. */
export const DRAW_COLORS = [
  "#F8FBFF",
  "#E2E8F0",
  "#94A3B8",
  "#64748B",
  "#1E293B",
  "#0F172A",
  "#FF5A6A",
  "#EF4444",
  "#B91C1C",
  "#FF9F43",
  "#F97316",
  "#C2410C",
  "#FFD23F",
  "#EAB308",
  "#A16207",
  "#3DDC84",
  "#22C55E",
  "#15803D",
  "#2DD4BF",
  "#14B8A6",
  "#0F766E",
  "#4EA1FF",
  "#3B82F6",
  "#1D4ED8",
  "#7C6CFF",
  "#8B5CF6",
  "#6D28D9",
  "#FF5AC8",
  "#EC4899",
  "#BE185D",
] as const satisfies readonly StrokeColor[];

export const DEFAULT_DRAW_COLOR: StrokeColor = DRAW_COLORS[0];

export const PEN_STROKE_WIDTH = 0.02;
export const ERASER_STROKE_WIDTH = 0.07;

export function strokeWidthForTool(tool: "pen" | "eraser"): number {
  return tool === "eraser" ? ERASER_STROKE_WIDTH : PEN_STROKE_WIDTH;
}
