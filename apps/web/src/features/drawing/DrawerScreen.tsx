import { useEffect, useRef } from "react";
import type { Stroke } from "@partyverse/shared";
import { RoundTimer } from "../round/RoundTimer";
import { useRemainingTime } from "../round/useRemainingTime";
import { DrawingCanvas } from "./DrawingCanvas";

type DrawerScreenProps = {
  secretWord: string;
  endsAt: number;
  onStrokeChunk?: (stroke: Stroke) => void;
  onClear?: () => void;
  /** Fired once when the round timer hits zero. */
  onTimeout?: () => void;
};

export function DrawerScreen({
  secretWord,
  endsAt,
  onStrokeChunk,
  onClear,
  onTimeout,
}: DrawerScreenProps) {
  const remaining = useRemainingTime(endsAt);
  const timeoutSent = useRef(false);

  useEffect(() => {
    timeoutSent.current = false;
  }, [endsAt]);

  useEffect(() => {
    if (remaining > 0 || timeoutSent.current) {
      return;
    }
    timeoutSent.current = true;
    onTimeout?.();
  }, [onTimeout, remaining]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscroll;
    };
  }, []);

  return (
    <main
      className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-4 overscroll-none px-4 py-5 touch-none"
      style={{ touchAction: "none", overscrollBehavior: "none" }}
    >
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="font-display text-[10px] uppercase tracking-[0.35em] text-muted">Draw</p>
          <h1 className="font-display text-base uppercase leading-relaxed text-ink sm:text-lg">
            Draw: <span className="text-accent">{secretWord}</span>
          </h1>
        </div>
        <RoundTimer endsAt={endsAt} />
      </header>

      <DrawingCanvas
        className="flex-1"
        disabled={remaining <= 0}
        onStrokeChunk={(stroke) => {
          onStrokeChunk?.(stroke);
        }}
        onClear={() => {
          onClear?.();
        }}
      />
    </main>
  );
}
