import type { DuelMode } from "../session/types";
import { DuelModePicker } from "../duel/DuelModePicker";

function Canvas({ mode }: { mode: DuelMode }) {
  return (
    <svg viewBox="0 0 220 120" className="h-28 w-full sm:h-32" aria-hidden>
      <circle cx="110" cy="60" r="36" fill="#76A2AF" stroke="#1a1a1a" strokeWidth="3" />
      <circle cx="96" cy="52" r="10" fill="#fff" stroke="#1a1a1a" strokeWidth="2" />
      <rect
        x="112"
        y="42"
        width="18"
        height="12"
        rx="3"
        fill="#fff"
        stroke="#1a1a1a"
        strokeWidth="2"
      />
      <path
        d="M118 68h14M122 64v16M128 64v16"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {mode === "1v1" ? (
        <>
          <circle cx="28" cy="60" r="16" fill="#FFE566" stroke="#1a1a1a" strokeWidth="2.5" />
          <text x="28" y="65" textAnchor="middle" fontSize="12" fontWeight="800" fill="#1a1a1a">
            1
          </text>
          <circle cx="192" cy="60" r="16" fill="#FF6B7A" stroke="#1a1a1a" strokeWidth="2.5" />
          <text x="192" y="65" textAnchor="middle" fontSize="12" fontWeight="800" fill="#1a1a1a">
            1
          </text>
        </>
      ) : (
        <>
          <circle cx="22" cy="48" r="13" fill="#FFE566" stroke="#1a1a1a" strokeWidth="2.2" />
          <circle cx="42" cy="48" r="13" fill="#FFE566" stroke="#1a1a1a" strokeWidth="2.2" />
          <text x="32" y="82" textAnchor="middle" fontSize="11" fontWeight="800" fill="#1a1a1a">
            2
          </text>
          <circle cx="178" cy="48" r="13" fill="#FF6B7A" stroke="#1a1a1a" strokeWidth="2.2" />
          <circle cx="198" cy="48" r="13" fill="#FF6B7A" stroke="#1a1a1a" strokeWidth="2.2" />
          <text x="188" y="82" textAnchor="middle" fontSize="11" fontWeight="800" fill="#1a1a1a">
            2
          </text>
        </>
      )}
    </svg>
  );
}

type Props = {
  onSelect: (mode: DuelMode) => void;
  onBack: () => void;
};

export function RpsModePicker({ onSelect, onBack }: Props) {
  return (
    <DuelModePicker
      gameTitle="Rock Paper Scissors"
      support="Friends scan the QR, join a team, then lock rock, paper, or scissors together."
      oneBlurb="You vs a friend. Lock a move each round. First to three wins."
      twoBlurb="Two teams of two. Teammates share one move each round. First to five wins."
      onSelect={onSelect}
      onBack={onBack}
      canvas={(mode) => <Canvas mode={mode} />}
    />
  );
}
