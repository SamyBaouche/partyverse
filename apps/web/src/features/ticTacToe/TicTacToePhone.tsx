import { Button } from "../../components/ui";
import { useSound } from "../../lib/audio";
import { cn } from "../../lib/cn";
import type { TicTacToeMark, TicTacToeState } from "../session/types";
import { formatTttStatus, joinTttTeam, placeTttMark, tttCanJoin } from "./logic";

type Props = {
  playerId: string;
  playerName: string;
  state: TicTacToeState;
  onStateChange: (state: TicTacToeState) => void;
  onLeave: () => void;
};

export function TicTacToePhone({
  playerId,
  playerName,
  state,
  onStateChange,
  onLeave,
}: Props) {
  const { play } = useSound();
  const me = state.players.find((player) => player.id === playerId) ?? null;
  const myTurn = !!me && state.status === "playing" && !state.winner && state.turn === me.team;

  function joinTeam(team: TicTacToeMark) {
    const next = joinTttTeam(state, { id: playerId, name: playerName }, team);
    if (!next) {
      return;
    }
    void play("join");
    onStateChange(next);
  }

  function tapCell(index: number) {
    if (!myTurn) {
      return;
    }
    const next = placeTttMark(state, index);
    if (!next) {
      void play("wrong");
      return;
    }
    void play(next.winner ? "win" : "go");
    onStateChange(next);
  }

  if (state.status === "lobby" && !me) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-6">
        <h1 className="font-body text-2xl font-extrabold text-ink">Pick a team</h1>
        <p className="font-body text-ink/70">Tic-Tac-Toe · {state.mode}</p>
        <div className="grid grid-cols-2 gap-3">
          {(["x", "o"] as const).map((team) => (
            <Button
              key={team}
              size="lg"
              fullWidth
              disabled={!tttCanJoin(state, team)}
              onClick={() => joinTeam(team)}
              className={team === "x" ? "!bg-[#4EA1FF]" : "!bg-[#FF6B7A]"}
            >
              Join {team.toUpperCase()}
            </Button>
          ))}
        </div>
        <Button variant="secondary" onClick={onLeave}>
          Leave
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-[10px] uppercase tracking-widest text-ink/60">
          {me ? `${me.team.toUpperCase()} · ${me.name}` : playerName}
        </p>
        <span className="rounded-full border-[3px] border-ink bg-[#FFE566] px-3 py-1 font-display text-[9px] uppercase text-ink">
          {formatTttStatus(state)}
        </span>
      </div>

      {state.status === "lobby" ? (
        <p className="font-body text-ink/75">You’re in. Wait for the host to start.</p>
      ) : null}

      <div className="grid grid-cols-3 gap-2">
        {state.board.map((cell, index) => (
          <button
            key={index}
            type="button"
            disabled={!myTurn || cell !== null}
            onClick={() => tapCell(index)}
            className={cn(
              "flex aspect-square items-center justify-center rounded-[1.1rem] border-[3px] border-ink bg-white text-3xl font-extrabold",
              myTurn && !cell ? "active:translate-y-0.5" : "opacity-90",
            )}
          >
            {cell === "x" ? (
              <span className="text-[#4EA1FF]">X</span>
            ) : cell === "o" ? (
              <span className="text-[#FF6B7A]">O</span>
            ) : myTurn ? (
              <span className="text-ink/20">·</span>
            ) : null}
          </button>
        ))}
      </div>

      <Button variant="secondary" onClick={onLeave}>
        Leave
      </Button>
    </div>
  );
}
