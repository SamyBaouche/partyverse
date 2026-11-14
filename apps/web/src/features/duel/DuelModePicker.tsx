import type { ReactNode } from "react";
import { ModeScreenHeader } from "../../components/brand/ModeScreenHeader";
import { cn } from "../../lib/cn";
import type { DuelMode } from "../session/types";

type DuelModePickerProps = {
  gameTitle: string;
  headline?: string;
  support: string;
  oneBlurb: string;
  twoBlurb: string;
  onSelect: (mode: DuelMode) => void;
  onBack: () => void;
  canvas: (mode: DuelMode) => ReactNode;
};

export function DuelModePicker({
  gameTitle,
  headline = "Choose a match",
  support,
  oneBlurb,
  twoBlurb,
  onSelect,
  onBack,
  canvas,
}: DuelModePickerProps) {
  const modes: Array<{ id: DuelMode; title: string; blurb: string; color: string }> = [
    { id: "1v1", title: "1 vs 1", blurb: oneBlurb, color: "#FFE566" },
    { id: "2v2", title: "2 vs 2", blurb: twoBlurb, color: "#86E3C2" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-8 sm:gap-12 sm:px-8 md:px-10 md:py-10">
      <ModeScreenHeader onBack={onBack} />

      <div className="space-y-3 sm:space-y-4">
        <p className="font-display text-xs uppercase tracking-[0.22em] text-ink/70 sm:text-sm">
          {gameTitle}
        </p>
        <h1 className="font-body text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl md:text-6xl">
          {headline}
        </h1>
        <p className="max-w-2xl font-body text-lg text-ink/75 sm:text-xl md:text-[1.35rem]">
          {support}
        </p>
      </div>

      <ul className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:gap-8">
        {modes.map((mode) => (
          <li key={mode.id}>
            <button
              type="button"
              onClick={() => onSelect(mode.id)}
              className={cn(
                "brutal-card flex min-h-56 w-full flex-col gap-4 rounded-[1.6rem] p-6 text-left transition-transform sm:min-h-64 sm:rounded-[1.8rem] sm:p-8",
                "hover:-translate-y-0.5 active:translate-y-0.5",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
              )}
              style={{ backgroundColor: mode.color }}
            >
              {canvas(mode.id)}
              <span className="font-body text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                {mode.title}
              </span>
              <p className="font-body text-base leading-relaxed text-ink/80 sm:text-lg">
                {mode.blurb}
              </p>
              <span className="mt-auto inline-flex h-14 items-center justify-center rounded-full border-[3px] border-ink bg-white font-body text-base font-bold text-ink shadow-[4px_4px_0_#1a1a1a] sm:h-16 sm:text-lg">
                Start a room →
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
