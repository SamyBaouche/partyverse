import { QRCodeSVG } from "qrcode.react";
import { Button } from "../../components/ui";
import { PartyverseWordmark } from "../../components/brand/PartyverseWordmark";
import type { ConnectFourColor, ConnectFourState } from "../session/types";
import { ConnectFourBoard } from "./ConnectFourBoard";
import {
  formatConnectFourStatus,
  isLobbyReady,
  rematch,
  requiredPlayers,
  startPlaying,
  teamCount,
} from "./logic";

type ConnectFourHostProps = {
  code: string;
  joinUrl: string;
  state: ConnectFourState;
  onStateChange: (state: ConnectFourState) => void;
  onBack: () => void;
};

function TeamColumn({
  label,
  color,
  names,
  capacity,
}: {
  label: string;
  color: string;
  names: string[];
  capacity: number;
}) {
  return (
    <div
      className="brutal-card flex min-h-40 flex-1 flex-col gap-3 rounded-[1.4rem] p-4"
      style={{ backgroundColor: color }}
    >
      <p className="font-display text-[10px] uppercase tracking-widest text-[#1a1a1a]">{label}</p>
      <ul className="flex flex-col gap-2">
        {Array.from({ length: capacity }, (_, index) => {
          const name = names[index];
          return (
            <li
              key={`${label}-${index}`}
              className="rounded-xl border-[3px] border-[#1a1a1a] bg-white px-3 py-2 font-body text-sm text-[#1a1a1a]"
            >
              {name ?? "Waiting…"}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ConnectFourHost({
  code,
  joinUrl,
  state,
  onStateChange,
  onBack,
}: ConnectFourHostProps) {
  const capacity = state.mode === "1v1" ? 1 : 2;
  const yellow = state.players.filter((player) => player.team === "yellow").map((p) => p.name);
  const red = state.players.filter((player) => player.team === "red").map((p) => p.name);
  const ready = isLobbyReady(state);

  if (state.status === "lobby") {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8 sm:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <PartyverseWordmark />
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border-[3px] border-ink bg-white px-4 py-2 font-display text-[9px] uppercase tracking-wide text-ink shadow-[3px_3px_0_#1a1a1a]"
          >
            ← Games
          </button>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_1fr]">
          <section className="flex flex-col items-center gap-5 text-center">
            <p className="inline-flex rounded-full border-[3px] border-ink bg-[#86e3c2] px-3 py-1 font-display text-[9px] uppercase tracking-[0.18em] text-ink">
              Connect Four · {state.mode}
            </p>
            <p className="room-code font-display text-4xl sm:text-5xl" aria-label={`Room code ${code}`}>
              {code}
            </p>
            <div className="toy-panel rounded-[1.4rem] bg-white p-4">
              <QRCodeSVG value={joinUrl} size={220} aria-label="Scan to join" />
            </div>
            <p className="font-body text-sm text-ink/75">
              Scan to join a team — need {requiredPlayers(state.mode)} players
              ({teamCount(state.players, "yellow") + teamCount(state.players, "red")}/
              {requiredPlayers(state.mode)})
            </p>
          </section>

          <section className="flex flex-col gap-4">
            <h1 className="font-display text-lg uppercase text-ink">Pick your team</h1>
            <div className="flex flex-col gap-4 sm:flex-row">
              <TeamColumn label="Yellow" color="#FFE566" names={yellow} capacity={capacity} />
              <TeamColumn label="Red" color="#FF6B7A" names={red} capacity={capacity} />
            </div>
            <Button
              size="lg"
              fullWidth
              disabled={!ready}
              onClick={() => onStateChange(startPlaying(state))}
            >
              Start match
            </Button>
            {!ready ? (
              <p className="text-center font-body text-sm text-ink/70">
                Waiting for at least one player on each color…
              </p>
            ) : null}
          </section>
        </div>
      </div>
    );
  }

  const statusLabel = formatConnectFourStatus(state);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-5 py-8 sm:px-8">
      <header className="flex w-full flex-wrap items-center justify-between gap-4">
        <PartyverseWordmark />
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border-[3px] border-line bg-panel px-3 py-1 font-display text-[9px] uppercase tracking-wide text-ink">
            ROOM {code}
          </span>
          <span
            className="rounded-full border-[3px] border-[#1a1a1a] px-3 py-1 font-display text-[9px] uppercase tracking-wide text-[#1a1a1a]"
            style={{
              backgroundColor:
                state.status === "ended"
                  ? "#86E3C2"
                  : state.turn === "yellow"
                    ? "#FFE566"
                    : "#FF6B7A",
            }}
          >
            {statusLabel}
          </span>
        </div>
      </header>

      <div className="flex w-full flex-wrap items-center justify-center gap-2">
        {state.players.map((player) => (
          <span
            key={player.id}
            className="rounded-full border-[3px] border-[#1a1a1a] px-3 py-1 font-body text-sm font-bold text-[#1a1a1a]"
            style={{ backgroundColor: player.team === "yellow" ? "#FFE566" : "#FF6B7A" }}
          >
            {player.name}
          </span>
        ))}
      </div>

      {state.status === "ended" ? (
        <div
          className="brutal-card w-full max-w-xl rounded-[1.4rem] px-6 py-5 text-center"
          style={{
            backgroundColor:
              state.winner === "yellow"
                ? "#FFE566"
                : state.winner === "red"
                  ? "#FF6B7A"
                  : "#86E3C2",
          }}
        >
          <p className="font-body text-3xl font-extrabold tracking-tight text-[#1a1a1a] sm:text-4xl">
            {statusLabel}
          </p>
          <p className="mt-2 font-body text-sm text-[#1a1a1a]/75">
            {state.winner === "draw"
              ? "Board is full — rematch whenever you're ready."
              : "Four in a row. Rematch or head back to the catalog."}
          </p>
        </div>
      ) : null}

      <ConnectFourBoard state={state} />

      <div className="flex flex-wrap justify-center gap-3">
        <Button
          size="lg"
          onClick={() => {
            window.open("/c4-phone", "_blank", "noopener,noreferrer");
          }}
        >
          Open phone mirror
        </Button>
        {state.status === "ended" ? (
          <Button size="lg" variant="ghost" onClick={() => onStateChange(rematch(state))}>
            Rematch
          </Button>
        ) : null}
        <Button variant="secondary" size="lg" onClick={onBack}>
          Back to games
        </Button>
      </div>

      <p className="max-w-lg text-center font-body text-sm text-ink/70">
        Phone mirror: move the cursor left/right to aim the disc, click to drop it on the TV.
      </p>
    </div>
  );
}

export function teamColorLabel(color: ConnectFourColor): string {
  return color === "yellow" ? "Yellow" : "Red";
}
