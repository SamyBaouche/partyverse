import { useEffect, useRef, useState } from "react";
import { Button } from "../../components/ui";
import { useSound } from "../../lib/audio";
import { cn } from "../../lib/cn";
import type { ConnectFourColor, ConnectFourState } from "../session/types";
import {
  canJoinTeam,
  C4_COLS,
  formatConnectFourStatus,
  gammaToColumn,
  pointerXToColumn,
} from "./logic";

type ConnectFourPhoneProps = {
  playerId: string;
  playerName: string;
  state: ConnectFourState;
  onJoinTeam: (team: ConnectFourColor) => void;
  onHover: (col: number) => void;
  onDrop: (col: number) => void;
  onLeave: () => void;
};

async function requestOrientationPermission(): Promise<boolean> {
  const Orientation = window.DeviceOrientationEvent as unknown as {
    requestPermission?: () => Promise<"granted" | "denied">;
  };
  if (typeof Orientation.requestPermission === "function") {
    try {
      const result = await Orientation.requestPermission();
      return result === "granted";
    } catch {
      return false;
    }
  }
  return true;
}

export function ConnectFourPhone({
  playerId,
  playerName,
  state,
  onJoinTeam,
  onHover,
  onDrop,
  onLeave,
}: ConnectFourPhoneProps) {
  const { play } = useSound();
  const me = state.players.find((player) => player.id === playerId) ?? null;
  const [motionReady, setMotionReady] = useState(false);
  const [localHover, setLocalHover] = useState(state.hoverCol);
  const padRef = useRef<HTMLButtonElement>(null);
  const lastPublishedCol = useRef(state.hoverCol);
  const publishTimer = useRef<number | null>(null);

  const myTurn = !!me && state.status === "playing" && !state.winner && state.turn === me.team;
  const hoverCol = myTurn ? localHover : state.hoverCol;

  useEffect(() => {
    setLocalHover(state.hoverCol);
    lastPublishedCol.current = state.hoverCol;
  }, [state.hoverCol, state.turn]);

  useEffect(() => {
    if (!myTurn || !motionReady) {
      return;
    }

    function onOrientation(event: DeviceOrientationEvent) {
      const gamma = event.gamma;
      if (typeof gamma !== "number") {
        return;
      }
      const col = gammaToColumn(gamma);
      if (col === lastPublishedCol.current) {
        return;
      }
      lastPublishedCol.current = col;
      setLocalHover(col);
      if (publishTimer.current !== null) {
        window.clearTimeout(publishTimer.current);
      }
      publishTimer.current = window.setTimeout(() => {
        onHover(col);
      }, 80);
    }

    window.addEventListener("deviceorientation", onOrientation);
    return () => {
      window.removeEventListener("deviceorientation", onOrientation);
      if (publishTimer.current !== null) {
        window.clearTimeout(publishTimer.current);
      }
    };
  }, [myTurn, motionReady, onHover]);

  function joinTeam(team: ConnectFourColor) {
    if (state.players.some((player) => player.id === playerId) || !canJoinTeam(state, team)) {
      return;
    }
    void play("join");
    onJoinTeam(team);
  }

  function aimFromPointer(clientX: number) {
    if (!myTurn) {
      return;
    }
    const pad = padRef.current;
    if (!pad) {
      return;
    }
    const rect = pad.getBoundingClientRect();
    const col = pointerXToColumn(clientX, rect.left, rect.width);
    if (col === lastPublishedCol.current) {
      return;
    }
    lastPublishedCol.current = col;
    setLocalHover(col);
    onHover(col);
  }

  function nudge(delta: number) {
    if (!myTurn) {
      return;
    }
    const nextCol = Math.max(0, Math.min(C4_COLS - 1, hoverCol + delta));
    lastPublishedCol.current = nextCol;
    setLocalHover(nextCol);
    void play("tick");
    onHover(nextCol);
  }

  function drop() {
    if (!myTurn) {
      return;
    }
    onDrop(hoverCol);
  }

  if (state.status === "lobby" && !me) {
    return (
      <div className="brutal-panel flex w-full max-w-sm flex-col gap-5 rounded-[1.6rem] p-5">
        <div className="space-y-2 text-center">
          <p className="font-display text-[10px] uppercase tracking-[0.2em] text-ink/70">
            Four in a Row · {state.mode}
          </p>
          <h1 className="font-display text-sm uppercase text-ink">Join a team</h1>
          <p className="font-body text-sm text-ink/75">Hey {playerName} — pick your color.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(["yellow", "red"] as const).map((team) => {
            const open = canJoinTeam(state, team);
            return (
              <button
                key={team}
                type="button"
                disabled={!open}
                onClick={() => joinTeam(team)}
                className={cn(
                  "rounded-[1.2rem] border-[3px] border-ink px-3 py-6 font-display text-[10px] uppercase tracking-wide text-ink shadow-[4px_4px_0_#1a1a1a]",
                  open ? "hover:-translate-y-0.5" : "cursor-not-allowed opacity-50",
                )}
                style={{ backgroundColor: team === "yellow" ? "#FFE566" : "#FF6B7A" }}
              >
                {team}
                {!open ? " full" : ""}
              </button>
            );
          })}
        </div>
        <Button variant="ghost" onClick={onLeave}>
          Leave
        </Button>
      </div>
    );
  }

  if (state.status === "lobby" && me) {
    return (
      <div className="brutal-panel flex w-full max-w-sm flex-col items-center gap-5 rounded-[1.6rem] p-6 text-center">
        <span
          className="h-16 w-16 rounded-full border-[3px] border-ink shadow-[4px_4px_0_#1a1a1a]"
          style={{ backgroundColor: me.team === "yellow" ? "#FFE566" : "#FF6B7A" }}
        />
        <div className="space-y-2">
          <h1 className="font-display text-sm uppercase text-ink">You're on {me.team}</h1>
          <p className="font-body text-sm text-ink/75">
            Watch the TV. The host will start when both colors are ready.
          </p>
        </div>
        <Button variant="ghost" onClick={onLeave}>
          Leave
        </Button>
      </div>
    );
  }

  const coinColor = me?.team ?? state.turn;

  return (
    <div className="brutal-panel flex w-full max-w-sm flex-col gap-5 rounded-[1.6rem] p-5">
      <div className="space-y-2 text-center">
        <p className="font-display text-[10px] uppercase tracking-[0.18em] text-ink/70">
          {state.status === "ended"
            ? formatConnectFourStatus(state)
            : myTurn
              ? "Your turn"
              : "Wait for your turn"}
        </p>
        <h1 className="font-display text-sm uppercase text-ink">
          {me ? `${me.team} · ${playerName}` : "Spectator"}
        </h1>
      </div>

      {myTurn && !motionReady ? (
        <Button
          fullWidth
          variant="secondary"
          onClick={() => {
            void requestOrientationPermission().then((ok) => {
              setMotionReady(ok || true);
              void play("click");
            });
          }}
        >
          Optional: enable tilt
        </Button>
      ) : null}

      <button
        ref={padRef}
        type="button"
        disabled={!myTurn}
        onPointerMove={(event) => aimFromPointer(event.clientX)}
        onClick={() => drop()}
        className={cn(
          "relative flex min-h-56 cursor-crosshair flex-col items-center justify-center gap-4 rounded-[1.3rem] border-[3px] border-line bg-panel-muted select-none",
          myTurn ? "active:scale-[0.99]" : "cursor-default opacity-70",
        )}
      >
        <span
          className="h-24 w-24 rounded-full border-[4px] border-ink shadow-[5px_5px_0_#1a1a1a] transition-transform duration-75"
          style={{
            backgroundColor: coinColor === "yellow" ? "#FFE566" : "#FF6B7A",
            transform: `translateX(${(hoverCol - 3) * 14}px)`,
          }}
        />
        <p className="px-4 font-body text-sm text-ink/75">
          {myTurn
            ? "Move cursor left/right · click to drop"
            : "Coin lives on the TV until your turn"}
        </p>
        <p className="font-display text-[9px] uppercase tracking-widest text-ink">
          Column {hoverCol + 1}
        </p>
      </button>

      <div className="grid grid-cols-3 gap-2">
        <Button variant="secondary" disabled={!myTurn} onClick={() => nudge(-1)}>
          ←
        </Button>
        <Button disabled={!myTurn} onClick={drop}>
          Drop
        </Button>
        <Button variant="secondary" disabled={!myTurn} onClick={() => nudge(1)}>
          →
        </Button>
      </div>

      <Button variant="ghost" onClick={onLeave}>
        Leave
      </Button>
    </div>
  );
}
