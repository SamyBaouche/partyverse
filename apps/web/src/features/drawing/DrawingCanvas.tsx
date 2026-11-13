import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { Point, Stroke, StrokeColor, StrokeTool } from "@partyverse/shared";
import { cn } from "../../lib/cn";
import { CANVAS_BG_COLOR, DEFAULT_DRAW_COLOR, strokeWidthForTool } from "./colors";
import { DrawingToolbar } from "./DrawingToolbar";
import { readSurfaceRect, toNormalized, type SurfaceRect } from "./geometry";
import { StrokeLayer } from "./StrokeLayer";

const CHUNK_INTERVAL_MS = 50;
const MAX_POINTS_PER_CHUNK = 500;
/** Ignore micro-jitter from fat-finger samples (normalized space). */
const MIN_POINT_DISTANCE = 0.0025;
/**
 * Drop teleport samples (common on iOS when the visual viewport jumps or
 * coalesced touch events report bad coordinates).
 */
const MAX_POINT_JUMP = 0.35;

type DrawingCanvasProps = {
  onStrokeChunk: (stroke: Stroke) => void;
  onClear: () => void;
  disabled?: boolean;
  className?: string;
};

type ActiveStroke = {
  id: string;
  color: StrokeColor;
  tool: StrokeTool;
  points: Point[];
  emittedCount: number;
  lastEmitAt: number;
  /** Frozen for the whole gesture so iOS URL-bar resize can't skew coordinates. */
  rect: SurfaceRect;
  pointerId: number;
};

function createStrokeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `stroke-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function distanceSq(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function DrawingCanvas({
  onStrokeChunk,
  onClear,
  disabled = false,
  className,
}: DrawingCanvasProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<ActiveStroke | null>(null);
  const livePointsRef = useRef<Point[]>([]);
  const liveIdRef = useRef<string | null>(null);
  const liveColorRef = useRef<StrokeColor>(DEFAULT_DRAW_COLOR);
  const liveToolRef = useRef<StrokeTool>("pen");
  const rafRef = useRef<number | null>(null);
  const [chunks, setChunks] = useState<Stroke[]>([]);
  const [livePoints, setLivePoints] = useState<Point[]>([]);
  const [liveId, setLiveId] = useState<string | null>(null);
  const [liveColor, setLiveColor] = useState<StrokeColor>(DEFAULT_DRAW_COLOR);
  const [liveTool, setLiveTool] = useState<StrokeTool>("pen");
  const [color, setColor] = useState<StrokeColor>(DEFAULT_DRAW_COLOR);
  const [tool, setTool] = useState<StrokeTool>("pen");

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  function scheduleLivePaint() {
    if (rafRef.current !== null) {
      return;
    }
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      setLiveId(liveIdRef.current);
      setLivePoints(livePointsRef.current.slice());
      setLiveColor(liveColorRef.current);
      setLiveTool(liveToolRef.current);
    });
  }

  function flushChunks(force: boolean) {
    const active = activeRef.current;
    if (!active) {
      return;
    }

    const now = performance.now();
    let pending = active.points.length - active.emittedCount;
    if (pending <= 0) {
      return;
    }
    if (!force && now - active.lastEmitAt < CHUNK_INTERVAL_MS) {
      return;
    }

    while (pending > 0) {
      const take = Math.min(MAX_POINTS_PER_CHUNK, pending);
      const points = active.points.slice(active.emittedCount, active.emittedCount + take);
      if (points.length === 0) {
        break;
      }

      const chunk: Stroke = {
        id: active.id,
        color: active.color,
        tool: active.tool,
        points,
      };
      active.emittedCount += take;
      active.lastEmitAt = now;
      setChunks((previous) => [...previous, chunk]);
      onStrokeChunk(chunk);

      pending = active.points.length - active.emittedCount;
      if (!force) {
        break;
      }
    }
  }

  function appendPoint(clientX: number, clientY: number) {
    const active = activeRef.current;
    if (!active) {
      return;
    }

    const point = toNormalized(clientX, clientY, active.rect);
    const previous = active.points[active.points.length - 1];
    if (previous) {
      const jump = distanceSq(previous, point);
      if (jump < MIN_POINT_DISTANCE * MIN_POINT_DISTANCE) {
        return;
      }
      if (jump > MAX_POINT_JUMP * MAX_POINT_JUMP) {
        return;
      }
    }

    active.points.push(point);
    livePointsRef.current = active.points;
    scheduleLivePaint();
    flushChunks(false);
  }

  function finishStroke() {
    flushChunks(true);
    activeRef.current = null;
    liveIdRef.current = null;
    livePointsRef.current = [];
    scheduleLivePaint();
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (disabled || !event.isPrimary || event.button !== 0) {
      return;
    }
    if (activeRef.current) {
      return;
    }

    const surface = surfaceRef.current;
    if (!surface) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    surface.setPointerCapture(event.pointerId);

    const rect = readSurfaceRect(surface);
    const id = createStrokeId();
    const point = toNormalized(event.clientX, event.clientY, rect);
    const strokeColor = tool === "eraser" ? CANVAS_BG_COLOR : color;

    activeRef.current = {
      id,
      color: strokeColor,
      tool,
      points: [point],
      emittedCount: 0,
      lastEmitAt: 0,
      rect,
      pointerId: event.pointerId,
    };
    liveIdRef.current = id;
    liveColorRef.current = strokeColor;
    liveToolRef.current = tool;
    livePointsRef.current = [point];
    scheduleLivePaint();
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const active = activeRef.current;
    if (disabled || !active || !event.isPrimary) {
      return;
    }
    if (event.pointerId !== active.pointerId) {
      return;
    }
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (event.pointerType === "touch") {
      appendPoint(event.clientX, event.clientY);
      return;
    }

    const coalesced = event.nativeEvent.getCoalescedEvents?.() ?? [event.nativeEvent];
    for (const sample of coalesced) {
      appendPoint(sample.clientX, sample.clientY);
    }
  }

  function endStroke(event: ReactPointerEvent<HTMLDivElement>) {
    const active = activeRef.current;
    if (!active || event.pointerId !== active.pointerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    appendPoint(event.clientX, event.clientY);
    finishStroke();

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleLostPointerCapture(event: ReactPointerEvent<HTMLDivElement>) {
    const active = activeRef.current;
    if (!active || event.pointerId !== active.pointerId) {
      return;
    }
    finishStroke();
  }

  function handleClear() {
    activeRef.current = null;
    liveIdRef.current = null;
    livePointsRef.current = [];
    setChunks([]);
    setLiveId(null);
    setLivePoints([]);
    onClear();
  }

  const finishedStrokes = liveId !== null ? chunks.filter((chunk) => chunk.id !== liveId) : chunks;
  const liveWidth = strokeWidthForTool(liveTool);

  const livePolyline =
    livePoints.length > 0 ? livePoints.map((point) => `${point.x},${point.y}`).join(" ") : null;

  const toolsLocked = disabled || liveId !== null;

  return (
    <div className={cn("flex w-full flex-col gap-4", className)}>
      <div
        className={cn(
          "relative aspect-[4/3] w-full overflow-hidden rounded-3xl",
          "border-2 border-white/10 bg-[#070d18]",
          "shadow-[inset_0_0_40px_rgb(91_157_255_/_0.08)]",
        )}
      >
        <div
          ref={surfaceRef}
          className={cn(
            "absolute inset-0 touch-none select-none",
            "[-webkit-touch-callout:none] [-webkit-user-select:none]",
            disabled ? "cursor-not-allowed opacity-60" : "cursor-crosshair",
          )}
          style={{ touchAction: "none", overscrollBehavior: "none" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endStroke}
          onPointerCancel={endStroke}
          onLostPointerCapture={handleLostPointerCapture}
          onContextMenu={(event) => event.preventDefault()}
        >
          <StrokeLayer strokes={finishedStrokes} className="pointer-events-none absolute inset-0" />
          {livePolyline ? (
            <svg
              viewBox="0 0 1 1"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 h-full w-full"
              aria-hidden
            >
              {livePoints.length === 1 ? (
                <circle
                  cx={livePoints[0]?.x ?? 0}
                  cy={livePoints[0]?.y ?? 0}
                  r={liveWidth / 2}
                  fill={liveColor}
                />
              ) : (
                <polyline
                  points={livePolyline}
                  fill="none"
                  stroke={liveColor}
                  strokeWidth={liveWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          ) : null}
        </div>
      </div>

      <DrawingToolbar
        color={color}
        tool={tool}
        disabled={toolsLocked}
        onColorChange={setColor}
        onToolChange={setTool}
        onClear={handleClear}
      />
    </div>
  );
}
