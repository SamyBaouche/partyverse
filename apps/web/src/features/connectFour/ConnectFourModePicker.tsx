import { PartyverseWordmark } from "../../components/brand/PartyverseWordmark";
import { cn } from "../../lib/cn";
import type { ConnectFourMode } from "../session/types";

const MODES: {
  id: ConnectFourMode;
  title: string;
  blurb: string;
  color: string;
}[] = [
  {
    id: "1v1",
    title: "1 vs 1",
    blurb: "Quick mock: two random players join. Aim on the phone mirror, click to drop.",
    color: "#FFE566",
  },
  {
    id: "2v2",
    title: "2 vs 2",
    blurb: "Four players — two yellow, two red. Teammates share the same turns.",
    color: "#86E3C2",
  },
];

type ConnectFourModePickerProps = {
  onSelect: (mode: ConnectFourMode) => void;
  onBack: () => void;
};

export function ConnectFourModePicker({ onSelect, onBack }: ConnectFourModePickerProps) {
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
          Connect Four
        </p>
        <h1 className="font-display text-xl uppercase leading-tight text-ink sm:text-2xl">
          Choose a match
        </h1>
        <p className="max-w-md font-body text-sm text-ink/75">
          Friends scan the QR, join a team, then aim with their phone while the TV shows the board.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {MODES.map((mode) => (
          <li key={mode.id}>
            <button
              type="button"
              onClick={() => onSelect(mode.id)}
              className={cn(
                "brutal-card flex min-h-44 w-full flex-col gap-3 rounded-[1.4rem] p-5 text-left transition-transform",
                "hover:-translate-y-0.5 active:translate-y-0.5",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
              )}
              style={{ backgroundColor: mode.color }}
            >
              <span className="font-display text-sm uppercase text-ink">{mode.title}</span>
              <p className="font-body text-sm text-ink/80">{mode.blurb}</p>
              <span className="mt-auto inline-flex h-10 items-center justify-center rounded-full border-[3px] border-ink bg-white font-display text-[9px] uppercase tracking-wide text-ink shadow-[3px_3px_0_#1a1a1a]">
                Start a room →
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
