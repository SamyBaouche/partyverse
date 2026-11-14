import { ModeScreenHeader } from "../../components/brand/ModeScreenHeader";
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
    blurb: "You vs a friend. Drop discs on your phone. First to four in a row wins.",
    color: "#FFE566",
  },
  {
    id: "2v2",
    title: "2 vs 2",
    blurb: "Two teams of two. Teammates share a color and take turns dropping.",
    color: "#86E3C2",
  },
];

function ModeCanvas({ mode }: { mode: ConnectFourMode }) {
  if (mode === "1v1") {
    return (
      <svg viewBox="0 0 220 120" className="h-28 w-full sm:h-32" aria-hidden>
        <rect
          x="58"
          y="18"
          width="104"
          height="84"
          rx="14"
          fill="#3B6FE8"
          stroke="#1a1a1a"
          strokeWidth="3"
        />
        {Array.from({ length: 12 }, (_, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const filled = i >= 8;
          const yellow = i % 2 === 0;
          return (
            <circle
              key={i}
              cx={78 + col * 22}
              cy={38 + row * 22}
              r="8"
              fill={filled ? (yellow ? "#FFE566" : "#FF6B7A") : "#E8F2FF"}
              stroke="#1a1a1a"
              strokeWidth="2"
            />
          );
        })}
        <g transform="translate(18 48)">
          <circle cx="16" cy="16" r="16" fill="#FFE566" stroke="#1a1a1a" strokeWidth="2.5" />
          <text x="16" y="21" textAnchor="middle" fontSize="12" fontWeight="800" fill="#1a1a1a">
            1
          </text>
        </g>
        <g transform="translate(170 48)">
          <circle cx="16" cy="16" r="16" fill="#FF6B7A" stroke="#1a1a1a" strokeWidth="2.5" />
          <text x="16" y="21" textAnchor="middle" fontSize="12" fontWeight="800" fill="#1a1a1a">
            1
          </text>
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 220 120" className="h-28 w-full sm:h-32" aria-hidden>
      <rect
        x="58"
        y="18"
        width="104"
        height="84"
        rx="14"
        fill="#3B6FE8"
        stroke="#1a1a1a"
        strokeWidth="3"
      />
      {Array.from({ length: 12 }, (_, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const filled = i >= 6;
        const yellow = col < 2;
        return (
          <circle
            key={i}
            cx={78 + col * 22}
            cy={38 + row * 22}
            r="8"
            fill={filled ? (yellow ? "#FFE566" : "#FF6B7A") : "#E8F2FF"}
            stroke="#1a1a1a"
            strokeWidth="2"
          />
        );
      })}
      <g transform="translate(8 34)">
        <circle cx="14" cy="14" r="13" fill="#FFE566" stroke="#1a1a1a" strokeWidth="2.2" />
        <circle cx="34" cy="14" r="13" fill="#FFE566" stroke="#1a1a1a" strokeWidth="2.2" />
        <text x="24" y="48" textAnchor="middle" fontSize="11" fontWeight="800" fill="#1a1a1a">
          2
        </text>
      </g>
      <g transform="translate(164 34)">
        <circle cx="14" cy="14" r="13" fill="#FF6B7A" stroke="#1a1a1a" strokeWidth="2.2" />
        <circle cx="34" cy="14" r="13" fill="#FF6B7A" stroke="#1a1a1a" strokeWidth="2.2" />
        <text x="24" y="48" textAnchor="middle" fontSize="11" fontWeight="800" fill="#1a1a1a">
          2
        </text>
      </g>
    </svg>
  );
}

type ConnectFourModePickerProps = {
  onSelect: (mode: ConnectFourMode) => void;
  onBack: () => void;
};

export function ConnectFourModePicker({ onSelect, onBack }: ConnectFourModePickerProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 py-8 sm:gap-12 sm:px-8 md:px-10 md:py-10">
      <ModeScreenHeader onBack={onBack} />

      <div className="space-y-3 sm:space-y-4">
        <p className="font-display text-xs uppercase tracking-[0.22em] text-ink/70 sm:text-sm">
          Connect Four
        </p>
        <h1 className="font-body text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl md:text-6xl">
          Choose a match
        </h1>
        <p className="max-w-2xl font-body text-lg text-ink/75 sm:text-xl md:text-[1.35rem]">
          Friends scan the QR, join a team, then play on their phones while the TV shows the board.
        </p>
      </div>

      <ul className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:gap-8">
        {MODES.map((mode) => (
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
              <ModeCanvas mode={mode.id} />
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
