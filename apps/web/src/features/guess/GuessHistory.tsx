import { cn } from "../../lib/cn";

export type GuessEntry = {
  text: string;
  correct: boolean;
};

type GuessHistoryProps = {
  guesses: GuessEntry[];
  className?: string;
};

export function GuessHistory({ guesses, className }: GuessHistoryProps) {
  if (guesses.length === 0) {
    return null;
  }

  return (
    <ul className={cn("flex flex-col gap-1.5 font-body text-sm", className)}>
      {guesses.map((guess, index) => (
        <li
          key={`${guess.text}-${index}`}
          className={cn(
            "rounded-xl border border-white/8 bg-surface-raised px-3 py-2 text-ink",
            !guess.correct && "text-muted line-through decoration-danger/80",
            guess.correct && "border-success/40 text-success",
          )}
        >
          {guess.text}
        </li>
      ))}
    </ul>
  );
}
