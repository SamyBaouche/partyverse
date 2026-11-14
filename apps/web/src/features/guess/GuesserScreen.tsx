import { useEffect, useRef, useState } from "react";
import { Card } from "../../components/ui";
import { RoundTimer } from "../round/RoundTimer";
import { useRemainingTime } from "../round/useRemainingTime";
import { GuessHistory, type GuessEntry } from "./GuessHistory";
import { GuessInput } from "./GuessInput";

type GuesserScreenProps = {
  drawerName: string;
  wordLength: number;
  endsAt: number;
  onGuess: (text: string) => Promise<{ correct: boolean }>;
  /** Fired once when the player guesses correctly. */
  onCorrect?: () => void;
  /** Fired once when the round timer hits zero. */
  onTimeout?: () => void;
};

function WordHint({ length }: { length: number }) {
  return (
    <p
      className="font-display text-xl tracking-[0.35em] text-ink sm:text-2xl"
      aria-label={`${length} letter word`}
    >
      {Array.from({ length }, () => "_").join(" ")}
    </p>
  );
}

export function GuesserScreen({
  drawerName,
  wordLength,
  endsAt,
  onGuess,
  onCorrect,
  onTimeout,
}: GuesserScreenProps) {
  const [guesses, setGuesses] = useState<GuessEntry[]>([]);
  const [locked, setLocked] = useState(false);
  const remaining = useRemainingTime(endsAt);
  const timeoutSent = useRef(false);

  useEffect(() => {
    setGuesses([]);
    setLocked(false);
    timeoutSent.current = false;
  }, [endsAt]);

  useEffect(() => {
    if (remaining > 0 || locked || timeoutSent.current) {
      return;
    }
    timeoutSent.current = true;
    onTimeout?.();
  }, [locked, onTimeout, remaining]);

  async function handleGuess(text: string) {
    const result = await onGuess(text);
    setGuesses((previous) => [...previous, { text, correct: result.correct }]);
    if (result.correct) {
      setLocked(true);
      onCorrect?.();
    }
    return result;
  }

  return (
    <div className="relative flex w-full max-w-md flex-col gap-5 px-4 py-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="font-display text-[10px] uppercase tracking-[0.35em] text-muted">Guess</p>
          <h1 className="font-body text-lg font-semibold text-ink">
            <span className="text-accent">{drawerName}</span> is drawing
          </h1>
        </div>
        <RoundTimer endsAt={endsAt} />
      </header>

      <Card className="flex flex-col items-center gap-4 text-center">
        <p className="font-display text-[10px] uppercase tracking-widest text-muted">Word</p>
        <WordHint length={wordLength} />
      </Card>

      <GuessInput onGuess={handleGuess} locked={locked} />
      <GuessHistory guesses={guesses} />
    </div>
  );
}
