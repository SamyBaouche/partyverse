import { useMemo } from "react";
import type { Point, Stroke, StrokeColor, StrokeTool } from "@partyverse/shared";
import { cn } from "../../lib/cn";
import { DEFAULT_DRAW_COLOR, strokeWidthForTool } from "./colors";

/** Normalized board space — matches the live preview polyline. */
const VIEW_SIZE = 1;

type StrokeLayerProps = {
  strokes: Stroke[];
  className?: string;
};

type GroupedStroke = {
  id: string;
  color: StrokeColor;
  tool: StrokeTool;
  points: Point[];
};

type RenderItem =
  | { id: string; kind: "path"; d: string; color: StrokeColor; width: number }
  | { id: string; kind: "dot"; cx: number; cy: number; color: StrokeColor; width: number };

function groupStrokes(strokes: Stroke[]): GroupedStroke[] {
  const map = new Map<string, GroupedStroke>();
  for (const stroke of strokes) {
    const color = stroke.color ?? DEFAULT_DRAW_COLOR;
    const tool = stroke.tool ?? "pen";
    const existing = map.get(stroke.id);
    if (existing) {
      existing.points.push(...stroke.points);
    } else {
      map.set(stroke.id, { id: stroke.id, color, tool, points: [...stroke.points] });
    }
  }
  return Array.from(map.values());
}

/**
 * Polyline path that follows the finger exactly.
 * No filled freehand outline = no blot when the stroke ends.
 */
function pointsToPath(points: Point[]): string {
  const first = points[0];
  if (!first) {
    return "";
  }
  let d = `M ${first.x} ${first.y}`;
  for (let i = 1; i < points.length; i++) {
    const point = points[i];
    if (!point) {
      continue;
    }
    d += ` L ${point.x} ${point.y}`;
  }
  return d;
}

export function StrokeLayer({ strokes, className }: StrokeLayerProps) {
  const items = useMemo(() => {
    return groupStrokes(strokes).flatMap(({ id, color, tool, points }): RenderItem[] => {
      const width = strokeWidthForTool(tool);
      if (points.length === 0) {
        return [];
      }
      if (points.length === 1) {
        const only = points[0];
        if (!only) {
          return [];
        }
        return [{ id, kind: "dot", cx: only.x, cy: only.y, color, width }];
      }
      const d = pointsToPath(points);
      return d ? [{ id, kind: "path", d, color, width }] : [];
    });
  }, [strokes]);

  return (
    <svg
      viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
      preserveAspectRatio="none"
      className={cn("h-full w-full", className)}
      aria-hidden
    >
      {items.map((item) =>
        item.kind === "path" ? (
          <path
            key={item.id}
            d={item.d}
            fill="none"
            stroke={item.color}
            strokeWidth={item.width}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <circle key={item.id} cx={item.cx} cy={item.cy} r={item.width / 2} fill={item.color} />
        ),
      )}
    </svg>
  );
}
