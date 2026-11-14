import type { DuelMode } from "../session/types";
import { DuelModePicker } from "../duel/DuelModePicker";

function Canvas({ mode }: { mode: DuelMode }) {
  return (
    <svg viewBox="0 0 220 120" className="h-28 w-full sm:h-32" aria-hidden>
      <rect x="70" y="16" width="80" height="88" rx="12" fill="#fff" stroke="#1a1a1a" strokeWidth="3" />
      <path d="M96 24v72M124 24v72M78 48h64M78 72h64" stroke="#1a1a1a" strokeWidth="3" />
      <path d="M82 32l10 10M92 32l-10 10" stroke="#4EA1FF" strokeWidth="3" strokeLinecap="round" />
      <circle cx="110" cy="60" r="9" fill="none" stroke="#FF6B7A" strokeWidth="3" />
      {mode === "1v1" ? (
        <>
          <circle cx="28" cy="60" r="16" fill="#4EA1FF" stroke="#1a1a1a" strokeWidth="2.5" />
          <text x="28" y="65" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff">
            1
          </text>
          <circle cx="192" cy="60" r="16" fill="#FF6B7A" stroke="#1a1a1a" strokeWidth="2.5" />
          <text x="192" y="65" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff">
            1
          </text>
        </>
      ) : (
        <>
          <circle cx="22" cy="48" r="13" fill="#4EA1FF" stroke="#1a1a1a" strokeWidth="2.2" />
          <circle cx="42" cy="48" r="13" fill="#4EA1FF" stroke="#1a1a1a" strokeWidth="2.2" />
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

export function TicTacToeModePicker({ onSelect, onBack }: Props) {
  return (
    <DuelModePicker
      gameTitle="Tic-Tac-Toe"
      support="Friends scan the QR, pick X or O, then tap cells on their phones."
      oneBlurb="Classic showdown. One player is X, one is O. Three in a row wins."
      twoBlurb="Two teams of two. Teammates share a mark and take turns placing."
      onSelect={onSelect}
      onBack={onBack}
      canvas={(mode) => <Canvas mode={mode} />}
    />
  );
}
