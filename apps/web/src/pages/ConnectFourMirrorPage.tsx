import { useState } from "react";
import { Link } from "react-router";
import { ConnectFourMirror } from "../features/connectFour/ConnectFourMirror";
import { createMock1v1Match } from "../features/connectFour/logic";
import type { ConnectFourState } from "../features/session/types";
import { useSound } from "../lib/audio";

/** Offline local demo — real matches use PlayPage + POST /c4. */
export default function ConnectFourMirrorPage() {
  const { play } = useSound();
  const [state, setState] = useState<ConnectFourState>(() => createMock1v1Match());

  return (
    <main className="min-h-screen">
      <div className="flex justify-center gap-3 pt-4">
        <Link
          to="/host?phase=c4-play"
          className="rounded-full border-[3px] border-line bg-panel px-4 py-2 font-display text-[9px] uppercase tracking-wide text-ink shadow-[3px_3px_0_var(--color-hard-shadow)]"
        >
          TV board
        </Link>
        <Link
          to="/"
          className="rounded-full border-[3px] border-line bg-panel px-4 py-2 font-display text-[9px] uppercase tracking-wide text-ink shadow-[3px_3px_0_var(--color-hard-shadow)]"
        >
          Home
        </Link>
      </div>
      <ConnectFourMirror
        state={state}
        onStateChange={(next) => {
          if (next.winner && !state.winner) {
            void play("win");
          } else if (next.board !== state.board) {
            void play("go");
          }
          setState(next);
        }}
      />
    </main>
  );
}
