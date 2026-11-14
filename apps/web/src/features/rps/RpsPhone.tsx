import { Button } from "../../components/ui";
import { useSound } from "../../lib/audio";
import { cn } from "../../lib/cn";
import type { RpsChoice, RpsState, RpsTeam } from "../session/types";
import {
  formatRpsStatus,
  joinRpsTeam,
  lockRpsPick,
  RPS_LABELS,
  rpsCanJoin,
  setRpsPick,
} from "./logic";

type Props = {
  playerId: string;
  playerName: string;
  state: RpsState;
  onStateChange: (state: RpsState) => void;
  onLeave: () => void;
};

const CHOICES: RpsChoice[] = ["rock", "paper", "scissors"];

export function RpsPhone({ playerId, playerName, state, onStateChange, onLeave }: Props) {
  const { play } = useSound();
  const me = state.players.find((player) => player.id === playerId) ?? null;
  const canPick = !!me && state.status === "picking" && !state.locked[me.team];

  function joinTeam(team: RpsTeam) {
    const next = joinRpsTeam(state, { id: playerId, name: playerName }, team);
    if (!next) {
      return;
    }
    void play("join");
    onStateChange(next);
  }

  function pick(choice: RpsChoice) {
    if (!me || !canPick) {
      return;
    }
    const next = setRpsPick(state, me.team, choice);
    if (!next) {
      return;
    }
    void play("click");
    onStateChange(next);
  }

  function lock() {
    if (!me) {
      return;
    }
    const next = lockRpsPick(state, me.team);
    if (!next) {
      void play("wrong");
      return;
    }
    void play(next.status === "ended" || next.status === "reveal" ? "go" : "tick");
    onStateChange(next);
  }

  if (state.status === "lobby" && !me) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-6">
        <h1 className="font-body text-2xl font-extrabold text-ink">Pick a team</h1>
        <p className="font-body text-ink/70">Rock Paper Scissors · {state.mode}</p>
        <div className="grid grid-cols-2 gap-3">
          {(["yellow", "red"] as const).map((team) => (
            <Button
              key={team}
              size="lg"
              fullWidth
              disabled={!rpsCanJoin(state, team)}
              onClick={() => joinTeam(team)}
              className={team === "yellow" ? "!bg-[#FFE566] !text-ink" : "!bg-[#FF6B7A]"}
            >
              Join {team}
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
          {me ? `${me.team} · ${me.name}` : playerName}
        </p>
        <span className="rounded-full border-[3px] border-ink bg-[#FFE566] px-3 py-1 font-display text-[9px] uppercase text-ink">
          {formatRpsStatus(state)}
        </span>
      </div>

      <p className="font-body text-lg font-bold text-ink">
        Score {state.scores.yellow} – {state.scores.red}
      </p>

      {state.status === "lobby" ? (
        <p className="font-body text-ink/75">You’re in. Wait for the host to start.</p>
      ) : null}

      {state.status === "picking" ? (
        <>
          <div className="grid gap-3">
            {CHOICES.map((choice) => (
              <button
                key={choice}
                type="button"
                disabled={!canPick}
                onClick={() => pick(choice)}
                className={cn(
                  "rounded-[1.2rem] border-[3px] border-ink px-4 py-4 font-body text-xl font-extrabold text-ink shadow-[3px_3px_0_#1a1a1a]",
                  me && state.picks[me.team] === choice ? "bg-[#86E3C2]" : "bg-white",
                  !canPick && "opacity-60",
                )}
              >
                {RPS_LABELS[choice]}
              </button>
            ))}
          </div>
          <Button
            size="lg"
            fullWidth
            disabled={!canPick || !me || !state.picks[me.team]}
            onClick={lock}
          >
            Lock in
          </Button>
        </>
      ) : null}

      {state.status === "reveal" || state.status === "ended" ? (
        <p className="font-body text-lg text-ink/80">Watch the TV for the result.</p>
      ) : null}

      <Button variant="secondary" onClick={onLeave}>
        Leave
      </Button>
    </div>
  );
}
