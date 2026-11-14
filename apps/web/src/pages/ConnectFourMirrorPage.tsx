import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ConnectFourMirror } from "../features/connectFour/ConnectFourMirror";
import { createMock1v1Match } from "../features/connectFour/logic";
import {
  fetchRoomActivity,
  publishRoomActivity,
  subscribeRoomActivity,
} from "../features/session/activityApi";
import type { ConnectFourState } from "../features/session/types";
import { useSound } from "../lib/audio";

const HOST_CODE = "KXPM";

export default function ConnectFourMirrorPage() {
  const { play } = useSound();
  const [state, setState] = useState<ConnectFourState | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const activity = await fetchRoomActivity(HOST_CODE);
      if (cancelled) {
        return;
      }
      if (activity.phase === "c4-play" || activity.phase === "c4-lobby") {
        setState(activity.state);
        return;
      }
      // No active match — spin up a mock 1v1 so the mirror is instantly playable.
      const mock = createMock1v1Match();
      if (cancelled) {
        return;
      }
      setState(mock);
      await publishRoomActivity(HOST_CODE, {
        phase: "c4-play",
        gameId: "connect-four",
        state: mock,
      });
      if (!cancelled) {
        void play("go");
      }
    }

    void boot();
    const unsubscribe = subscribeRoomActivity(HOST_CODE, (activity) => {
      if (activity.phase === "c4-play" || activity.phase === "c4-lobby") {
        setState(activity.state);
      }
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [play]);

  async function publish(next: ConnectFourState) {
    setState(next);
    await publishRoomActivity(HOST_CODE, {
      phase: next.status === "lobby" ? "c4-lobby" : "c4-play",
      gameId: "connect-four",
      state: next,
    });
  }

  if (!state) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <p className="font-body text-sm text-ink">Loading phone mirror…</p>
      </main>
    );
  }

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
          void publish(next);
        }}
      />
    </main>
  );
}
