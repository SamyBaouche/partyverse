import { PartyverseWordmark } from "../../components/brand/PartyverseWordmark";
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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 py-8 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <PartyverseWordmark />
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border-[3px] border-ink bg-white px-4 py-2 font-display text-[9px] uppercase tracking-wide text-ink shadow-[3px_3px_0_#1a1a1a] hover:-translate-y-0.5"
        >
          ← Games
        </button>
      </header>

      <div className="space-y-2">
        <p className="font-display text-[10px] uppercase tracking-[0.22em] text-ink/70">
          Draw Guess
        </p>
        <h1 className="font-display text-xl uppercase leading-tight text-ink sm:text-2xl">
          Choose a mode
        </h1>
        <p className="max-w-md font-body text-sm text-ink/75">
          Vote and Duo are open. Solo and AI stay locked for later.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {DRAW_MODES.map((mode) => (
          <li key={mode.id}>
            <button
              type="button"
              disabled={mode.locked}
              onClick={() => onSelect(mode.id)}
              className={cn(
                "brutal-card relative flex min-h-40 w-full flex-col gap-3 rounded-[1.4rem] p-5 text-left transition-transform duration-150",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
                mode.locked
                  ? "cursor-not-allowed opacity-65"
                  : "hover:-translate-y-0.5 active:translate-y-0.5",
              )}
              style={{ backgroundColor: MODE_COLORS[mode.id] }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-display text-xs uppercase text-ink">{mode.title}</span>
                {mode.locked ? (
                  <span className="rounded-full border-[3px] border-ink bg-white px-2.5 py-1 font-display text-[8px] uppercase tracking-widest text-ink">
                    Locked
                  </span>
                ) : (
                  <span className="rounded-full border-[3px] border-ink bg-white px-2.5 py-1 font-display text-[8px] uppercase tracking-widest text-ink">
                    Open
                  </span>
                )}
              </div>
              <p className="font-body text-sm text-ink/80">{mode.blurb}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
