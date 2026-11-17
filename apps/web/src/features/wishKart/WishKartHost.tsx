import { useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ModeScreenHeader } from "../../components/brand/ModeScreenHeader";
import { PartyverseWordmark } from "../../components/brand/PartyverseWordmark";
import { Button } from "../../components/ui";
import type { WishKartState } from "./logic";
import {
  createWishKartLobby,
  emptyInput,
  rematchKart,
  setKartInput,
  standingsOf,
  startCountdown,
  stepRace,
} from "./logic";
import { useGamepadSteer } from "./useGamepadSteer";
import { WishKartTrack } from "./WishKartTrack";

type WishKartHostProps = {
  joinUrl: string;
  state: WishKartState;
  onStateChange: (state: WishKartState) => void;
  onBack: () => void;
};

export function WishKartHost({ joinUrl, state, onStateChange, onBack }: WishKartHostProps) {
  const stateRef = useRef(state);
  stateRef.current = state;
  const onChangeRef = useRef(onStateChange);
  onChangeRef.current = onStateChange;

  // Local P1 on the TV: keyboard + first gamepad (handy for solo testing).
  const localId = state.players.find((p) => !p.isBot)?.id ?? state.players[0]?.id;

  useGamepadSteer(
    Boolean(localId) && (state.status === "countdown" || state.status === "racing"),
    (input) => {
      if (!localId) {
        return;
      }
      onChangeRef.current(setKartInput(stateRef.current, localId, input));
    },
  );

  useEffect(() => {
    if (state.status !== "countdown" && state.status !== "racing") {
      return;
    }
    function onKey(event: KeyboardEvent, down: boolean) {
      if (!localId) {
        return;
      }
      const cur = stateRef.current.players.find((p) => p.id === localId)?.input ?? emptyInput();
      const next = { ...cur };
      if (event.code === "ArrowLeft" || event.code === "KeyA") {
        next.steer = down ? -1 : cur.steer === -1 ? 0 : cur.steer;
      }
      if (event.code === "ArrowRight" || event.code === "KeyD") {
        next.steer = down ? 1 : cur.steer === 1 ? 0 : cur.steer;
      }
      if (event.code === "ArrowUp" || event.code === "KeyW") {
        next.gas = down;
      }
      if (event.code === "ArrowDown" || event.code === "KeyS") {
        next.brake = down;
      }
      if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
        next.drift = down;
      }
      if (down && (event.code === "Space" || event.code === "KeyE")) {
        next.useItem = true;
      }
      onChangeRef.current(setKartInput(stateRef.current, localId, next));
    }
    const down = (event: KeyboardEvent) => onKey(event, true);
    const up = (event: KeyboardEvent) => onKey(event, false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [localId, state.status]);

  useEffect(() => {
    if (state.status !== "countdown" && state.status !== "racing") {
      return;
    }
    let raf = 0;
    let last = performance.now();
    function tick(now: number) {
      if (now - last >= 50) {
        last = now;
        const next = stepRace(stateRef.current, Date.now());
        if (next.tick !== stateRef.current.tick || next.status !== stateRef.current.status) {
          onChangeRef.current(next);
        }
      }
      raf = window.requestAnimationFrame(tick);
    }
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [state.status]);

  if (state.status === "lobby") {
    const humans = state.players.filter((p) => !p.isBot);
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-8 sm:gap-12 sm:px-8 md:px-10">
        <ModeScreenHeader onBack={onBack} />
        <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          <section className="flex flex-col items-center gap-6 text-center sm:gap-7">
            <p className="inline-flex rounded-full border-[3px] border-ink bg-[#FFE566] px-5 py-2.5 font-display text-sm uppercase tracking-[0.18em] text-ink sm:text-base">
              Wish Kart · forward race
            </p>
            <div className="toy-panel rounded-[1.8rem] bg-white p-5 sm:p-6">
              <QRCodeSVG value={joinUrl} size={280} aria-label="Scan to join" />
            </div>
            <p className="max-w-md font-body text-lg text-ink/75 sm:text-xl">
              Straight shot to the finish. Steer, gas, items. CPUs fill empty slots.
            </p>
          </section>

          <section className="flex flex-col gap-5 sm:gap-6">
            <h1 className="font-body text-3xl font-extrabold tracking-tight text-ink sm:text-4xl md:text-5xl">
              Race lobby
            </h1>
            <ul className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }, (_, index) => {
                const racer = state.players[index];
                return (
                  <li
                    key={index}
                    className="brutal-card flex min-h-20 items-center gap-3 rounded-[1.4rem] px-4 py-3"
                    style={{ backgroundColor: racer?.color ?? "#F0F0F0" }}
                  >
                    <span className="font-display text-xs uppercase text-ink/70">P{index + 1}</span>
                    <span className="font-body text-lg font-extrabold text-ink">
                      {racer?.name ?? "CPU soon…"}
                    </span>
                  </li>
                );
              })}
            </ul>
            <Button
              size="lg"
              fullWidth
              onClick={() => onStateChange(startCountdown(state))}
              className="!h-16 !text-sm sm:!h-20 sm:!text-base"
            >
              {humans.length > 0 ? "Start race" : "Start with CPUs"}
            </Button>
            <p className="text-center font-body text-base text-ink/70 sm:text-lg">
              TV keys: WASD / arrows · Shift drift · Space item. Or plug a gamepad.
            </p>
          </section>
        </div>
      </div>
    );
  }

  const standings = standingsOf(state);
  const winner = state.players.find((p) => p.id === state.winnerId);

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[#1a1a1a]">
      <WishKartTrack state={state} fullscreen className="relative min-h-0 flex-1 w-full" />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 sm:p-4">
        <div className="pointer-events-auto">
          <PartyverseWordmark />
        </div>
        <ol className="flex max-w-[70%] flex-wrap justify-end gap-1.5">
          {standings.map((kart, index) => (
            <li
              key={kart.id}
              className="rounded-full border-[3px] border-ink px-2.5 py-1 font-body text-xs font-bold text-ink shadow-[3px_3px_0_#1a1a1a] sm:text-sm"
              style={{ backgroundColor: kart.color }}
            >
              #{index + 1} {kart.name.slice(0, 10)} ·{" "}
              {Math.min(100, Math.max(0, Math.round((kart.z / state.finishZ) * 100)))}%
            </li>
          ))}
        </ol>
      </div>

      {state.status === "finished" && winner ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/35 p-6">
          <div
            className="brutal-card w-full max-w-xl rounded-[1.4rem] px-6 py-6 text-center"
            style={{ backgroundColor: winner.color }}
          >
            <p className="font-body text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">
              {winner.name} wins!
            </p>
            <p className="mt-2 font-body text-sm text-ink/75">Podium locked. Rematch or catalog.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Button size="lg" onClick={() => onStateChange(rematchKart(state))}>
                Rematch
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => onStateChange(createWishKartLobby())}
              >
                New lobby
              </Button>
              <Button variant="secondary" size="lg" onClick={onBack}>
                Back to games
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="absolute bottom-4 right-4">
          <Button variant="secondary" size="md" onClick={onBack}>
            Exit
          </Button>
        </div>
      )}
    </div>
  );
}
