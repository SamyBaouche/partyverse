import { cn } from "../../lib/cn";
import { useRemainingTime } from "./useRemainingTime";

type RoundTimerProps = {
  endsAt: number;
  className?: string;
};

export function RoundTimer({ endsAt, className }: RoundTimerProps) {
  const seconds = useRemainingTime(endsAt);
  const urgent = seconds <= 10;

  return (
    <p
      className={cn(
        "font-display text-sm tabular-nums tracking-widest",
        urgent ? "text-danger" : "text-accent",
        className,
      )}
      aria-live="polite"
      aria-label={`${seconds} seconds remaining`}
    >
      {seconds}s
    </p>
  );
}
