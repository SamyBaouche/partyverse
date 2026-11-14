import { QRCodeSVG } from "qrcode.react";
import { ModeScreenHeader } from "../../components/brand/ModeScreenHeader";
import { PartyverseWordmark } from "../../components/brand/PartyverseWordmark";
import { Button } from "../../components/ui";
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
      className="brutal-card flex min-h-52 flex-1 flex-col gap-4 rounded-[1.7rem] p-5 sm:min-h-56 sm:p-6"
      style={{ backgroundColor: color }}
    >
      <p className="font-display text-xs uppercase tracking-[0.2em] text-[#1a1a1a] sm:text-sm">
        {label} · {names.length}/{capacity}
      </p>
      <ul className="flex flex-col gap-3">
        {Array.from({ length: capacity }, (_, index) => {
          const name = names[index];
          return (
            <li
              key={`${label}-${index}`}
              className="rounded-2xl border-[3px] border-[#1a1a1a] bg-white px-4 py-3.5 font-body text-lg font-bold text-[#1a1a1a] sm:text-xl"
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
  code: _code,
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
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-8 sm:gap-12 sm:px-8 md:px-10">
        <ModeScreenHeader onBack={onBack} />

        <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          <section className="flex flex-col items-center gap-6 text-center sm:gap-7">
            <p className="inline-flex rounded-full border-[3px] border-ink bg-[#86e3c2] px-5 py-2.5 font-display text-sm uppercase tracking-[0.18em] text-ink sm:text-base">
              Connect Four · {state.mode}
            </p>
            <div className="toy-panel rounded-[1.8rem] bg-white p-5 sm:p-6">
              <QRCodeSVG value={joinUrl} size={280} aria-label="Scan to join" />
            </div>
            <p className="max-w-md font-body text-lg text-ink/75 sm:text-xl">
              Scan to join a team — need {requiredPlayers(state.mode)} players (
              {teamCount(state.players, "yellow") + teamCount(state.players, "red")}/
              {requiredPlayers(state.mode)})
            </p>
          </section>

          <section className="flex flex-col gap-5 sm:gap-6">
            <h1 className="font-body text-3xl font-extrabold tracking-tight text-ink sm:text-4xl md:text-5xl">
              Pick your team
            </h1>
            <div className="flex flex-col gap-5 sm:flex-row sm:gap-6">
              <TeamColumn label="Yellow" color="#FFE566" names={yellow} capacity={capacity} />
              <TeamColumn label="Red" color="#FF6B7A" names={red} capacity={capacity} />
            </div>
            <Button
              size="lg"
              fullWidth
              disabled={!ready}
              onClick={() => onStateChange(startPlaying(state))}
              className="!h-16 !text-sm sm:!h-20 sm:!text-base"
            >
              Start match
            </Button>
            {!ready ? (
              <p className="text-center font-body text-base text-ink/70 sm:text-lg">
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
