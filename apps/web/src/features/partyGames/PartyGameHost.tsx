import { useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ModeScreenHeader } from "../../components/brand/ModeScreenHeader";
import { PartyverseWordmark } from "../../components/brand/PartyverseWordmark";
import { Button } from "../../components/ui";
import type { PartyGameState } from "./logic";
import { partyBlurb, partyTitle, rematchParty, startPartyRound, tickPartyRound } from "./logic";

type PartyGameHostProps = {
  joinUrl: string;
  state: PartyGameState;
  onStateChange: (state: PartyGameState) => void;
  onBack: () => void;
};

export function PartyGameHost({ joinUrl, state, onStateChange, onBack }: PartyGameHostProps) {
  const stateRef = useRef(state);
  stateRef.current = state;
  const onChangeRef = useRef(onStateChange);
  onChangeRef.current = onStateChange;

  useEffect(() => {
    if (state.status !== "playing") {
      return;
    }
    const id = window.setInterval(() => {
      const next = tickPartyRound(stateRef.current, Date.now());
      if (next.status !== stateRef.current.status) {
        onChangeRef.current(next);
      }
    }, 400);
    return () => window.clearInterval(id);
  }, [state.status]);

  const title = partyTitle(state.gameId);

  if (state.status === "lobby") {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-8 sm:gap-12 sm:px-8 md:px-10">
        <ModeScreenHeader onBack={onBack} />
        <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          <section className="flex flex-col items-center gap-6 text-center sm:gap-7">
            <p className="inline-flex rounded-full border-[3px] border-ink bg-[#86e3c2] px-5 py-2.5 font-display text-sm uppercase tracking-[0.18em] text-ink sm:text-base">
              {title}
            </p>
            <div className="toy-panel rounded-[1.8rem] bg-white p-5 sm:p-6">
              <QRCodeSVG value={joinUrl} size={280} aria-label="Scan to join" />
            </div>
            <p className="max-w-md font-body text-lg text-ink/75 sm:text-xl">{partyBlurb(state.gameId)}</p>
          </section>
          <section className="flex flex-col gap-5 sm:gap-6">
            <h1 className="font-body text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Players in room
            </h1>
            <ul className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: Math.max(4, state.players.length) }, (_, index) => {
                const player = state.players[index];
                return (
                  <li
                    key={index}
                    className="brutal-card rounded-[1.3rem] bg-white px-4 py-3 font-body text-lg font-bold text-ink"
                  >
                    {player?.name ?? "Waiting…"}
                  </li>
                );
              })}
            </ul>
            <Button
              size="lg"
              fullWidth
              disabled={state.players.length < 1}
              onClick={() => onStateChange(startPartyRound(state))}
              className="!h-16"
            >
              Start round
            </Button>
          </section>
        </div>
      </div>
    );
  }

  const remaining = Math.max(0, Math.ceil((state.roundEndsAt - Date.now()) / 1000));
  const winner = state.players.find((p) => p.id === state.winnerId);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-5 py-8 sm:px-8">
      <header className="flex w-full flex-wrap items-center justify-between gap-4">
        <PartyverseWordmark />
        <span className="rounded-full border-[3px] border-ink bg-[#FFE566] px-3 py-1 font-display text-[9px] uppercase tracking-wide text-ink">
          {title} · Round {state.round}
          {state.status === "playing" ? ` · ${remaining}s` : ""}
        </span>
      </header>

      <div className="brutal-panel w-full rounded-[1.6rem] bg-panel px-6 py-8 text-center sm:px-10">
        <p className="font-display text-[10px] uppercase tracking-[0.2em] text-muted">TV prompt</p>
        <h1 className="mt-3 font-body text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">
          {state.status === "playing" ? state.prompt : `Answer: ${state.secret}`}
        </h1>
        {state.status === "reveal" || state.status === "ended" ? (
          <p className="mt-4 font-body text-base text-ink/75">
            {state.gameId === "imposter" || state.gameId === "spyfall"
              ? "Votes are in — check phones for scores."
              : "Round scored. Keep going or crowning time."}
          </p>
        ) : null}
      </div>

      <ul className="flex w-full flex-wrap justify-center gap-2">
        {[...state.players]
          .sort((a, b) => b.score - a.score)
          .map((player) => (
            <li
              key={player.id}
              className="rounded-full border-[3px] border-ink bg-white px-3 py-1 font-body text-sm font-bold text-ink"
            >
              {player.name} · {player.score}
              {player.ready && state.status === "playing" ? " ✓" : ""}
            </li>
          ))}
      </ul>

      {state.status === "ended" && winner ? (
        <div className="brutal-card w-full max-w-xl rounded-[1.4rem] bg-[#86E3C2] px-6 py-5 text-center">
          <p className="font-body text-3xl font-extrabold text-ink">{winner.name} wins!</p>
        </div>
      ) : null}

      <div className="flex flex-wrap justify-center gap-3">
        {state.status === "reveal" ? (
          <Button size="lg" onClick={() => onStateChange(startPartyRound(state))}>
            Next round
          </Button>
        ) : null}
        {state.status === "ended" ? (
          <Button size="lg" variant="ghost" onClick={() => onStateChange(rematchParty(state))}>
            Rematch
          </Button>
        ) : null}
        <Button variant="secondary" size="lg" onClick={onBack}>
          Back to games
        </Button>
      </div>
    </div>
  );
}
