import { useMemo } from "react";
import { getStroke } from "perfect-freehand";
import type { Point, Stroke } from "@partyverse/shared";
import { cn } from "../../lib/cn";
import { getSvgPathFromStroke } from "./geometry";

const VIEW_WIDTH = 4;
const VIEW_HEIGHT = 3;

const STROKE_OPTIONS = {
  size: 0.12,
  thinning: 0.55,
  smoothing: 0.5,
  streamline: 0.45,
  simulatePressure: true,
  last: true,
} as const;

type StrokeLayerProps = {
  strokes: Stroke[];
  className?: string;
};

function groupPointsById(strokes: Stroke[]): Array<{ id: string; points: Point[] }> {
  const map = new Map<string, Point[]>();
  for (const stroke of strokes) {
    const existing = map.get(stroke.id);
    if (existing) {
      existing.push(...stroke.points);
    } else {
      map.set(stroke.id, [...stroke.points]);
    }
  }
  return Array.from(map, ([id, points]) => ({ id, points }));
}

export function StrokeLayer({ strokes, className }: StrokeLayerProps) {
  const paths = useMemo(() => {
    return groupPointsById(strokes).flatMap(({ id, points }) => {
      if (points.length === 0) {
        return [];
      }
      const input = points.map(
        (point) => [point.x * VIEW_WIDTH, point.y * VIEW_HEIGHT] as number[],
      );
      const outline = getStroke(input, STROKE_OPTIONS);
      const d = getSvgPathFromStroke(outline);
      if (!d) {
        return [];
      }
      return [{ id, d }];
    });
  }, [strokes]);

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      className={cn("h-full w-full", className)}
      aria-hidden
    >
      {paths.map(({ id, d }) => (
        <path
          key={id}
          d={d}
          fill="#f8fbff"
          style={{
            filter:
              "drop-shadow(0 0 4px rgb(94 200 255 / 0.85)) drop-shadow(0 0 12px rgb(91 157 255 / 0.4))",
          }}
        />
      ))}
    </svg>
  );
}
