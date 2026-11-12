import { useMemo } from "react";
import { getStroke } from "perfect-freehand";
import type { Point, Stroke } from "@partyverse/shared";
import { cn } from "../../lib/cn";
import { getSvgPathFromStroke } from "./geometry";

const VIEW_WIDTH = 4;
const VIEW_HEIGHT = 3;

/** Stable finger-friendly stroke: less thinning so touch input doesn't look blotchy. */
const STROKE_OPTIONS = {
  size: 0.16,
  thinning: 0.15,
  smoothing: 0.65,
  streamline: 0.55,
  simulatePressure: true,
  last: true,
  start: { cap: true, taper: 0 },
  end: { cap: true, taper: 0 },
} as const;

type StrokeLayerProps = {
  strokes: Stroke[];
  className?: string;
};

type RenderPath =
  | { id: string; kind: "path"; d: string }
  | { id: string; kind: "dot"; cx: number; cy: number; r: number };

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

/** A lone tap needs a few nearby samples so perfect-freehand can form a visible dot. */
function ensureRenderableInput(points: Point[]): number[][] {
  const mapped = points.map((point) => [point.x * VIEW_WIDTH, point.y * VIEW_HEIGHT] as number[]);
  if (mapped.length >= 2) {
    return mapped;
  }
  const origin = mapped[0] ?? [0, 0];
  const x = origin[0] ?? 0;
  const y = origin[1] ?? 0;
  const jitter = 0.02;
  return [
    [x, y],
    [x + jitter, y],
    [x + jitter, y + jitter],
    [x, y + jitter],
  ];
}

export function StrokeLayer({ strokes, className }: StrokeLayerProps) {
  const paths = useMemo(() => {
    return groupPointsById(strokes).flatMap(({ id, points }): RenderPath[] => {
      if (points.length === 0) {
        return [];
      }

      const input = ensureRenderableInput(points);
      const outline = getStroke(input, STROKE_OPTIONS);
      const d = getSvgPathFromStroke(outline);
      if (d) {
        return [{ id, kind: "path", d }];
      }

      const first = points[0];
      if (!first) {
        return [];
      }
      return [
        {
          id,
          kind: "dot",
          cx: first.x * VIEW_WIDTH,
          cy: first.y * VIEW_HEIGHT,
          r: STROKE_OPTIONS.size / 2,
        },
      ];
    });
  }, [strokes]);

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      preserveAspectRatio="none"
      className={cn("h-full w-full", className)}
      aria-hidden
    >
      {paths.map((item) =>
        item.kind === "path" ? (
          <path
            key={item.id}
            d={item.d}
            fill="#f8fbff"
            style={{
              filter:
                "drop-shadow(0 0 4px rgb(94 200 255 / 0.85)) drop-shadow(0 0 12px rgb(91 157 255 / 0.4))",
            }}
          />
        ) : (
          <circle
            key={item.id}
            cx={item.cx}
            cy={item.cy}
            r={item.r}
            fill="#f8fbff"
            style={{
              filter:
                "drop-shadow(0 0 4px rgb(94 200 255 / 0.85)) drop-shadow(0 0 12px rgb(91 157 255 / 0.4))",
            }}
          />
        ),
      )}
    </svg>
  );
}
