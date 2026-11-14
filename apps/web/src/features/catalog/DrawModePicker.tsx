import { ModeScreenHeader } from "../../components/brand/ModeScreenHeader";
import { cn } from "../../lib/cn";
import { DRAW_MODES } from "../session/catalog";
import type { DrawMode } from "../session/types";

const MODE_COLORS: Record<DrawMode, string> = {
  vote: "#FFE566",
  duo: "#86E3C2",
  solo: "#FFB4C8",
  ai: "#A8E6FF",
};

type DrawModePickerProps = {
  onSelect: (mode: DrawMode) => void;
  onBack: () => void;
};

export function DrawModePicker({ onSelect, onBack }: DrawModePickerProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-8 sm:gap-12 sm:px-8 md:px-10 md:py-10">
      <ModeScreenHeader onBack={onBack} />

      <div className="space-y-3 sm:space-y-4">
        <p className="font-display text-xs uppercase tracking-[0.22em] text-ink/70 sm:text-sm">
          Draw Guess
        </p>
        <h1 className="font-body text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl md:text-6xl">
          Choose a mode
        </h1>
        <p className="max-w-2xl font-body text-lg text-ink/75 sm:text-xl md:text-[1.35rem]">
          Vote and Duo are open. Solo and AI stay locked for later.
        </p>
      </div>

      <ul className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:gap-8">
        {DRAW_MODES.map((mode) => (
          <li key={mode.id}>
            <button
              type="button"
              disabled={mode.locked}
              onClick={() => onSelect(mode.id)}
              className={cn(
                "brutal-card relative flex min-h-52 w-full flex-col gap-4 rounded-[1.6rem] p-6 text-left transition-transform duration-150 sm:min-h-60 sm:rounded-[1.8rem] sm:p-8",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
                mode.locked
                  ? "cursor-not-allowed opacity-65"
                  : "hover:-translate-y-0.5 active:translate-y-0.5",
              )}
              style={{ backgroundColor: MODE_COLORS[mode.id] }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-body text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                  {mode.title}
                </span>
                {mode.locked ? (
                  <span className="rounded-full border-[3px] border-ink bg-white px-3 py-1.5 font-display text-[10px] uppercase tracking-widest text-ink sm:text-[11px]">
                    Locked
                  </span>
                ) : (
                  <span className="rounded-full border-[3px] border-ink bg-white px-3 py-1.5 font-display text-[10px] uppercase tracking-widest text-ink sm:text-[11px]">
                    Open
                  </span>
                )}
              </div>
              <p className="font-body text-base leading-relaxed text-ink/80 sm:text-lg">
                {mode.blurb}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
