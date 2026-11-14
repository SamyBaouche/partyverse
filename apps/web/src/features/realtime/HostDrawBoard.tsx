import { Button, Card } from "../../components/ui";
import { StrokeLayer } from "../drawing/StrokeLayer";
import { RevealScreen } from "../reveal/RevealScreen";
import { ScoreboardScreen } from "../scoreboard/ScoreboardScreen";
import { useGameState, useSendMessage } from "./hooks";

type HostDrawBoardProps = {
  onBack: () => void;
};

/** TV view for a live Draw Guess round driven by the party store. */
export function HostDrawBoard({ onBack }: HostDrawBoardProps) {
  const party = useGameState();
  const actions = useSendMessage();
  const ranked = [...party.players].sort(
    (a, b) => b.score - a.score || a.name.localeCompare(b.name),
  );
  const drawer = party.players.find((player) => player.id === party.drawerId);
  const maxRounds = 3;

  if (party.phase === "reveal" && party.revealedWord) {
    return (
      <RevealScreen
        result={{
          word: party.revealedWord,
          reason: party.lastRoundCorrect ? "correct" : "timeout",
          drawerName: drawer?.name ?? "Drawer",
          correctGuesserName:
            party.lastRoundCorrect === true
              ? (party.players.find((player) => player.id === party.lastGuesserId)?.name ?? null)
              : null,
          guesserDelta: party.lastRoundCorrect ? 100 : 0,
          drawerDelta: party.lastRoundCorrect ? 25 : 0,
        }}
        round={party.round}
        maxRounds={maxRounds}
      />
    );
  }

  if (party.phase === "scores") {
    return (
      <ScoreboardScreen
        players={ranked}
        variant={party.round >= maxRounds ? "final" : "betweenRounds"}
        round={party.round}
        maxRounds={maxRounds}
        playerId=""
        onContinue={() => {
          actions.startGame();
        }}
      />
    );
  }

  if (party.phase === "drawing") {
    const remaining = Math.max(0, Math.ceil((party.endsAt - Date.now()) / 1000));
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-display text-xs uppercase tracking-[0.18em] text-ink">
            Round {party.round} · {drawer?.name ?? "Drawer"} is drawing
          </p>
          <p className="font-display text-sm text-ink">{remaining}s</p>
        </div>
        <div className="aspect-[4/3] overflow-hidden rounded-[1.4rem] border-[3px] border-ink bg-[#0b1020]">
          <svg viewBox="0 0 1 1" className="h-full w-full" preserveAspectRatio="none">
            <StrokeLayer strokes={party.strokes} />
          </svg>
        </div>
        <p className="text-center font-body text-sm text-muted">
          Word length: {party.wordLength || "?"} · Guessers use their phones
        </p>
        <Button variant="secondary" onClick={onBack}>
          Back to games
        </Button>
      </div>
    );
  }

  return (
    <Card className="mx-auto flex w-full max-w-md flex-col gap-4 text-center">
      <h1 className="font-display text-sm uppercase text-ink">Waiting for players</h1>
      <p className="font-body text-sm text-muted">{party.players.length} joined</p>
      <Button
        size="lg"
        disabled={party.players.length < 2}
        onClick={() => {
          actions.startGame();
        }}
      >
        Start match
      </Button>
      <Button variant="secondary" onClick={onBack}>
        Back to games
      </Button>
    </Card>
  );
}
