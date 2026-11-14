import { motion, useReducedMotion } from "motion/react";
import type { Player } from "@partyverse/shared";
import { Button, Card, PlayerAvatar } from "../../components/ui";

type ScoreboardScreenProps = {
  players: Player[];
  variant: "betweenRounds" | "final";
  round?: number;
  maxRounds?: number;
  playerId: string;
  onContinue: () => void;
};

export function ScoreboardScreen({
  players,
  variant,
  round,
  maxRounds,
  playerId,
  onContinue,
}: ScoreboardScreenProps) {
  const reduceMotion = useReducedMotion();
  const isFinal = variant === "final";

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <motion.div
        className="w-full max-w-sm"
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.35 }}
      >
        <Card className="flex flex-col gap-6">
          <header className="space-y-2 text-center">
            <p className="font-display text-[10px] uppercase tracking-[0.3em] text-muted">
              {isFinal
                ? "Final scores"
                : `Scores · after round ${round ?? "?"}${maxRounds ? `/${maxRounds}` : ""}`}
            </p>
            <h1 className="font-display text-sm uppercase leading-relaxed text-ink sm:text-base">
              {isFinal ? "Game over" : "Standings"}
            </h1>
          </header>

          <ol className="flex flex-col gap-2">
            {players.map((player, index) => {
              const isSelf = player.id === playerId || player.id.endsWith(playerId);
              return (
                <motion.li
                  key={player.id}
                  layout={!reduceMotion}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 380, damping: 22, delay: index * 0.06 }
                  }
                  className={`flex items-center gap-3 rounded-2xl border-[3px] px-3 py-2 ${
                    isSelf ? "border-accent bg-accent/10" : "border-ink bg-[#fffaf2]"
                  }`}
                >
                  <span className="w-6 font-display text-[10px] text-muted">{index + 1}</span>
                  <PlayerAvatar name={player.name} size="md" />
                  <span className="flex-1 truncate font-body font-semibold text-ink">
                    {player.name}
                    {isSelf ? " (you)" : ""}
                  </span>
                  <span className="font-display text-xs text-ink">{player.score}</span>
                </motion.li>
              );
            })}
          </ol>

          <Button fullWidth size="lg" onClick={onContinue}>
            {isFinal ? "Play again" : "Next round"}
          </Button>
        </Card>
      </motion.div>
    </main>
  );
}
