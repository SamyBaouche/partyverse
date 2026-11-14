import { QRCodeSVG } from "qrcode.react";
import { ModeScreenHeader } from "../../components/brand/ModeScreenHeader";
import { PartyverseWordmark } from "../../components/brand/PartyverseWordmark";
import { Button } from "../../components/ui";
import type { TicTacToeMark, TicTacToeState } from "../session/types";
import {
  formatTttStatus,
  rematchTtt,
  startTtt,
  tttLobbyReady,
  tttRequiredPlayers,
  tttTeamCount,
} from "./logic";

type Props = {
  joinUrl: string;
  state: TicTacToeState;
  onStateChange: (state: TicTacToeState) => void;
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
      <p className="font-display text-xs uppercase tracking-[0.2em] text-ink sm:text-sm">
        {label} · {names.length}/{capacity}
      </p>
      <ul className="flex flex-col gap-3">
        {Array.from({ length: capacity }, (_, index) => (
          <li
            key={index}
            className="rounded-2xl border-[3px] border-ink bg-white px-4 py-3.5 font-body text-lg font-bold text-ink sm:text-xl"
          >
            {names[index] ?? "Waiting…"}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TicTacToeHost({ joinUrl, state, onStateChange, onBack }: Props) {
  const capacity = state.mode === "1v1" ? 1 : 2;
  const xs = state.players.filter((p) => p.team === "x").map((p) => p.name);
  const os = state.players.filter((p) => p.team === "o").map((p) => p.name);
  const ready = tttLobbyReady(state);

  if (state.status === "lobby") {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-8 sm:gap-12 sm:px-8 md:px-10">
        <ModeScreenHeader onBack={onBack} />
        <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          <section className="flex flex-col items-center gap-6 text-center sm:gap-7">
            <p className="inline-flex rounded-full border-[3px] border-ink bg-[#A8E6FF] px-5 py-2.5 font-display text-sm uppercase tracking-[0.18em] text-ink sm:text-base">
              Tic-Tac-Toe · {state.mode}
            </p>
            <div className="toy-panel rounded-[1.8rem] bg-white p-5 sm:p-6">
              <QRCodeSVG value={joinUrl} size={280} aria-label="Scan to join" />
            </div>
            <p className="max-w-md font-body text-lg text-ink/75 sm:text-xl">
              Scan to join — need {tttRequiredPlayers(state.mode)} players (
              {tttTeamCount(state.players, "x") + tttTeamCount(state.players, "o")}/
              {tttRequiredPlayers(state.mode)})
            </p>
          </section>
          <section className="flex flex-col gap-5 sm:gap-6">
            <h1 className="font-body text-3xl font-extrabold tracking-tight text-ink sm:text-4xl md:text-5xl">
              Pick your team
            </h1>
            <div className="flex flex-col gap-5 sm:flex-row sm:gap-6">
              <TeamColumn label="X" color="#4EA1FF" names={xs} capacity={capacity} />
              <TeamColumn label="O" color="#FF6B7A" names={os} capacity={capacity} />
            </div>
            <Button
              size="lg"
              fullWidth
              disabled={!ready}
              onClick={() => onStateChange(startTtt(state))}
              className="!h-16 !text-sm sm:!h-20 sm:!text-base"
            >
              Start match
            </Button>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-5 py-8 sm:px-8">
      <header className="flex w-full flex-wrap items-center justify-between gap-4">
        <PartyverseWordmark />
        <span className="rounded-full border-[3px] border-ink bg-[#FFE566] px-3 py-1 font-display text-[9px] uppercase tracking-wide text-ink">
          {formatTttStatus(state)}
        </span>
      </header>

      <div className="grid w-full max-w-md grid-cols-3 gap-3">
        {state.board.map((cell, index) => (
          <div
            key={index}
            className="flex aspect-square items-center justify-center rounded-[1.2rem] border-[3px] border-ink bg-white text-4xl font-extrabold text-ink sm:text-5xl"
          >
            {cell === "x" ? (
              <span className="text-[#4EA1FF]">X</span>
            ) : cell === "o" ? (
              <span className="text-[#FF6B7A]">O</span>
            ) : null}
          </div>
        ))}
      </div>

      {state.status === "ended" ? (
        <Button size="lg" onClick={() => onStateChange(rematchTtt(state))}>
          Rematch
        </Button>
      ) : null}
    </div>
  );
}

export type { TicTacToeMark };
