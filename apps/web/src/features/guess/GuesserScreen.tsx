import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Card } from "../../components/ui";
import { RoundTimer } from "../round/RoundTimer";
import { GuessHistory, type GuessEntry } from "./GuessHistory";
import { GuessInput } from "./GuessInput";

type GuesserScreenProps = {
  drawerName: string;
  wordLength: number;
  endsAt: number;
  onGuess: (text: string) => Promise<{ correct: boolean }>;
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

export function GuesserScreen({ drawerName, wordLength, endsAt, onGuess }: GuesserScreenProps) {
  const reduceMotion = useReducedMotion();
  const [guesses, setGuesses] = useState<GuessEntry[]>([]);
  const [locked, setLocked] = useState(false);

  async function handleGuess(text: string) {
    const result = await onGuess(text);
    setGuesses((previous) => [...previous, { text, correct: result.correct }]);
    if (result.correct) {
      setLocked(true);
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

      <AnimatePresence>
        {locked ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b3d2c]/92 p-6"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={reduceMotion ? false : { scale: 0.85, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              transition={
                reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 22 }
              }
            >
              <p className="font-display text-lg uppercase leading-relaxed text-white sm:text-xl">
                You got it!
              </p>
              <p className="font-display mt-4 text-3xl text-accent">+100</p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
