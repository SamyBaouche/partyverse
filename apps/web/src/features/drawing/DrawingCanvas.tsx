import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { Point, Stroke } from "@partyverse/shared";
import { Button } from "../../components/ui";
import { cn } from "../../lib/cn";
import { toNormalized } from "./geometry";
import { StrokeLayer } from "./StrokeLayer";

const CHUNK_INTERVAL_MS = 50;
const MAX_POINTS_PER_CHUNK = 500;

type DrawingCanvasProps = {
  onStrokeChunk: (stroke: Stroke) => void;
  onClear: () => void;
  disabled?: boolean;
  className?: string;
};

type ActiveStroke = {
  id: string;
  points: Point[];
  emittedCount: number;
  lastEmitAt: number;
};

function createStrokeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `stroke-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function DrawingCanvas({
  onStrokeChunk,
  onClear,
  disabled = false,
  className,
}: DrawingCanvasProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<ActiveStroke | null>(null);
  const [chunks, setChunks] = useState<Stroke[]>([]);
  const [livePoints, setLivePoints] = useState<Point[]>([]);
  const [liveId, setLiveId] = useState<string | null>(null);

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

      const chunk: Stroke = { id: active.id, points };
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
    const rect = surfaceRef.current?.getBoundingClientRect();
    const active = activeRef.current;
    if (!rect || !active) {
      return;
    }
    active.points.push(toNormalized(clientX, clientY, rect));
    setLivePoints(active.points.slice());
    flushChunks(false);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (disabled || event.button !== 0) {
      return;
    }
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    const rect = surfaceRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const id = createStrokeId();
    const point = toNormalized(event.clientX, event.clientY, rect);
    activeRef.current = {
      id,
      points: [point],
      emittedCount: 0,
      lastEmitAt: 0,
    };
    setLiveId(id);
    setLivePoints([point]);
    flushChunks(true);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (disabled || !activeRef.current) {
      return;
    }
    if (!event.currentTarget.hasPointerCapture(event.pointerId) && event.buttons !== 1) {
      return;
    }
    event.preventDefault();
    appendPoint(event.clientX, event.clientY);
  }

  function endStroke(event: ReactPointerEvent<HTMLDivElement>) {
    if (!activeRef.current) {
      return;
    }
    event.preventDefault();
    flushChunks(true);
    activeRef.current = null;
    setLiveId(null);
    setLivePoints([]);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleClear() {
    activeRef.current = null;
    setChunks([]);
    setLiveId(null);
    setLivePoints([]);
    onClear();
  }

  // Avoid duplicating the in-progress stroke: replace its emitted chunks with full live points.
  const displayStrokes: Stroke[] =
    liveId && livePoints.length > 0
      ? [...chunks.filter((chunk) => chunk.id !== liveId), { id: liveId, points: livePoints }]
      : chunks;

  return (
    <div className={cn("flex w-full flex-col gap-4", className)}>
      <div
        ref={surfaceRef}
        className={cn(
          "relative aspect-[4/3] w-full touch-none overflow-hidden rounded-3xl",
          "border-2 border-white/10 bg-[#070d18]",
          "shadow-[inset_0_0_40px_rgb(91_157_255_/_0.08)]",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-crosshair",
        )}
        style={{ touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endStroke}
        onPointerCancel={endStroke}
      >
        <StrokeLayer strokes={displayStrokes} className="pointer-events-none absolute inset-0" />
      </div>
      <Button type="button" variant="secondary" disabled={disabled} onClick={handleClear}>
        Clear
      </Button>
    </div>
  );
}
