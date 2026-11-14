import { useRef } from "react";
import { Button } from "../../components/ui";
import { useSound } from "../../lib/audio";
import { cn } from "../../lib/cn";
import type { ConnectFourState } from "../session/types";
import { applyDrop, C4_COLS, formatConnectFourStatus, pointerXToColumn } from "./logic";

type ConnectFourMirrorProps = {
  state: ConnectFourState;
  onStateChange: (state: ConnectFourState) => void;
  onOpenTv?: () => void;
};

/**
 * Phone-shaped mirror controller for desktop mock tests.
 * Move the cursor left/right to aim the column; click to drop.
 */
export function ConnectFourMirror({ state, onStateChange, onOpenTv }: ConnectFourMirrorProps) {
  const { play } = useSound();
  const padRef = useRef<HTMLButtonElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const playing = state.status === "playing" && !state.winner;
  const turnColor = state.turn;
  const yellow = state.players.find((player) => player.team === "yellow");
  const red = state.players.find((player) => player.team === "red");

  function aimFromEvent(clientX: number) {
    if (!playing) {
      return;
    }
    const pad = padRef.current;
    if (!pad) {
      return;
    }
    const rect = pad.getBoundingClientRect();
    const col = pointerXToColumn(clientX, rect.left, rect.width);
    if (col === stateRef.current.hoverCol) {
      return;
    }
    onStateChange({ ...stateRef.current, hoverCol: col });
  }

  function drop() {
    if (!playing) {
      return;
    }
    const current = stateRef.current;
    const next = applyDrop(current, current.hoverCol);
    if (next === current) {
      void play("wrong");
      return;
    }
    void play(next.winner ? "win" : "go");
    onStateChange(next);
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5 px-4 py-8">
      <div className="text-center">
        <p className="font-display text-[10px] uppercase tracking-[0.22em] text-ink/70">
          Phone mirror · Connect Four
        </p>
        <h1 className="mt-2 font-body text-2xl font-extrabold text-ink">Controller</h1>
        <p className="mt-1 font-body text-sm text-ink/75">
          Move cursor left/right to aim. Click to drop.
        </p>
      </div>

      <div className="flex w-full gap-2">
        <div
          className="flex flex-1 items-center justify-center rounded-2xl border-[3px] border-[#1a1a1a] px-3 py-2 font-body text-sm font-bold text-[#1a1a1a]"
          style={{ backgroundColor: "#FFE566" }}
        >
          {yellow?.name ?? "Yellow"}
        </div>
        <div className="flex items-center font-display text-[10px] text-ink">VS</div>
        <div
          className="flex flex-1 items-center justify-center rounded-2xl border-[3px] border-[#1a1a1a] px-3 py-2 font-body text-sm font-bold text-[#1a1a1a]"
          style={{ backgroundColor: "#FF6B7A" }}
        >
          {red?.name ?? "Red"}
        </div>
      </div>

      {/* Phone bezel */}
      <div className="brutal-card w-full max-w-[22rem] rounded-[2rem] bg-[#1a1a1a] p-3 shadow-[8px_8px_0_var(--color-hard-shadow)]">
        <div className="mb-3 flex justify-center">
          <span className="h-1.5 w-16 rounded-full bg-[#3a3a3a]" />
        </div>

        <div className="rounded-[1.4rem] bg-panel p-4">
          <p
            className="mb-3 rounded-full border-[3px] border-[#1a1a1a] px-3 py-1.5 text-center font-body text-sm font-extrabold text-[#1a1a1a]"
            style={{
              backgroundColor:
                state.status === "ended"
                  ? state.winner === "yellow"
                    ? "#FFE566"
                    : state.winner === "red"
                      ? "#FF6B7A"
                      : "#86E3C2"
                  : turnColor === "yellow"
                    ? "#FFE566"
                    : "#FF6B7A",
            }}
          >
            {state.status === "ended"
              ? formatConnectFourStatus(state)
              : `${formatConnectFourStatus(state)} · column ${state.hoverCol + 1}`}
          </p>

          <button
            ref={padRef}
            type="button"
            disabled={!playing}
            onPointerMove={(event) => aimFromEvent(event.clientX)}
            onClick={() => drop()}
            className={cn(
              "relative flex min-h-64 w-full cursor-crosshair flex-col items-center justify-center gap-4 overflow-hidden rounded-[1.2rem] border-[3px] border-line bg-panel-muted select-none",
              !playing && "cursor-default opacity-70",
            )}
          >
            {/* Column guides */}
            <div className="pointer-events-none absolute inset-x-3 bottom-3 top-3 grid opacity-25"
              style={{ gridTemplateColumns: `repeat(${C4_COLS}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: C4_COLS }, (_, index) => (
                <div
                  key={index}
                  className={cn(
                    "mx-0.5 rounded-full border-2 border-dashed border-[#1a1a1a]",
                    index === state.hoverCol && "bg-[#1a1a1a]/10 opacity-100",
                  )}
                />
              ))}
            </div>

            <span
              className="relative z-10 h-20 w-20 rounded-full border-[4px] border-[#1a1a1a] shadow-[5px_5px_0_#1a1a1a] transition-transform duration-75"
              style={{
                backgroundColor: turnColor === "yellow" ? "#FFE566" : "#FF6B7A",
                transform: `translateX(${(state.hoverCol - 3) * 18}px)`,
              }}
            />
            <p className="relative z-10 px-4 text-center font-body text-sm text-ink/80">
              {playing
                ? "Slide cursor to pick a line · click to drop"
                : "Match over — rematch on the TV"}
            </p>
          </button>

          <div className="mt-3 grid grid-cols-7 gap-1">
            {Array.from({ length: C4_COLS }, (_, col) => (
              <button
                key={col}
                type="button"
                disabled={!playing}
                onClick={() => {
                  onStateChange({ ...stateRef.current, hoverCol: col });
                  window.setTimeout(() => {
                    const next = applyDrop(stateRef.current, col);
                    if (next !== stateRef.current) {
                      void play(next.winner ? "win" : "go");
                      onStateChange(next);
                    }
                  }, 40);
                }}
                className={cn(
                  "aspect-square rounded-full border-2 border-[#1a1a1a]",
                  col === state.hoverCol
                    ? turnColor === "yellow"
                      ? "bg-[#FFE566]"
                      : "bg-[#FF6B7A]"
                    : "bg-panel",
                )}
                aria-label={`Drop in column ${col + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-3 flex justify-center">
          <span className="h-10 w-10 rounded-full border-2 border-[#3a3a3a]" />
        </div>
      </div>

      {onOpenTv ? (
        <Button variant="secondary" onClick={onOpenTv}>
          Open TV board
        </Button>
      ) : null}
    </div>
  );
}
