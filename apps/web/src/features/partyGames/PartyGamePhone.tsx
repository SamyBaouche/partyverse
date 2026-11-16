import { useEffect, useRef, useState } from "react";
import { Button, Card } from "../../components/ui";
import type { PartyGameState } from "./logic";
import { joinParty, partyTitle, submitPartyAnswer } from "./logic";

type PartyGamePhoneProps = {
  playerId: string;
  playerName: string;
  state: PartyGameState;
  onStateChange: (next: PartyGameState) => void;
  onLeave: () => void;
};

export function PartyGamePhone({
  playerId,
  playerName,
  state,
  onStateChange,
  onLeave,
}: PartyGamePhoneProps) {
  const me = state.players.find((p) => p.id === playerId);
  const [draft, setDraft] = useState("");
  const joinedRef = useRef(false);

  useEffect(() => {
    if (joinedRef.current || state.status !== "lobby") {
      return;
    }
    if (state.players.some((p) => p.id === playerId)) {
      joinedRef.current = true;
      return;
    }
    joinedRef.current = true;
    onStateChange(joinParty(state, playerId, playerName));
  }, [state, playerId, playerName, onStateChange]);

  useEffect(() => {
    setDraft("");
  }, [state.round]);

  if (!me) {
    return (
      <Card className="flex w-full max-w-sm flex-col gap-4 text-center">
        <h1 className="font-display text-sm uppercase text-ink">{partyTitle(state.gameId)}</h1>
        <p className="font-body text-sm text-muted">Lobby full or round already running.</p>
        <Button onClick={onLeave}>Leave</Button>
      </Card>
    );
  }

  const privateHint =
    state.status === "playing"
      ? me.role === "imposter"
        ? "You are the IMPOSTER. Fake it."
        : me.role === "spy"
          ? "You are the SPY. Figure out the place."
          : me.role === "actor"
            ? `Act this out (keep quiet): ${state.secret}`
            : state.gameId === "imposter" || state.gameId === "spyfall"
              ? `Secret: ${state.secret}`
              : state.gameId === "charades"
                ? "Watch the actor. Type your guess."
                : null
      : null;

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <Card className="space-y-2 text-center">
        <p className="font-display text-[10px] uppercase tracking-widest text-muted">
          {partyTitle(state.gameId)}
        </p>
        <h1 className="font-body text-xl font-extrabold text-ink">{playerName}</h1>
        <p className="font-body text-sm text-muted">Score {me.score}</p>
        {privateHint ? <p className="font-body text-sm font-semibold text-ink">{privateHint}</p> : null}
      </Card>

      {state.status === "lobby" ? (
        <Card className="text-center">
          <p className="font-body text-sm text-muted">You&apos;re in. Wait for the host to start.</p>
        </Card>
      ) : null}

      {state.status === "playing" && !me.ready ? (
        <Card className="space-y-3">
          {state.options.length > 0 ? (
            <div className="grid gap-2">
              {state.options.map((option) => (
                <Button
                  key={option}
                  fullWidth
                  variant="secondary"
                  onClick={() => onStateChange(submitPartyAnswer(state, playerId, option))}
                >
                  {option}
                </Button>
              ))}
            </div>
          ) : (
            <form
              className="flex flex-col gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                if (!draft.trim()) {
                  return;
                }
                onStateChange(submitPartyAnswer(state, playerId, draft));
              }}
            >
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="h-14 rounded-[1rem] border-[3px] border-ink px-4 font-body text-base text-ink"
                placeholder="Type your answer"
                autoCapitalize="none"
                autoCorrect="off"
              />
              <Button type="submit" fullWidth disabled={!draft.trim()}>
                Lock in
              </Button>
            </form>
          )}
        </Card>
      ) : null}

      {state.status === "playing" && me.ready ? (
        <Card className="text-center">
          <p className="font-body text-sm text-muted">Locked in. Waiting on the room…</p>
        </Card>
      ) : null}

      {(state.status === "reveal" || state.status === "ended") && (
        <Card className="text-center">
          <p className="font-body text-sm text-ink">
            {state.status === "ended" ? "Game over — watch the TV." : "Round over — watch the TV."}
          </p>
          <p className="mt-2 font-body text-xs text-muted">Your answer: {me.answer || "—"}</p>
        </Card>
      )}

      <Button variant="secondary" onClick={onLeave}>
        Leave
      </Button>
    </div>
  );
}
