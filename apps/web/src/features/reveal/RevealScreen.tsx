import { useEffect, useEffectEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button, Card, PlayerAvatar } from "../../components/ui";
import { celebrate } from "../../components/effects";
import { useSound } from "../../lib/audio";

export type RevealResult = {
  word: string;
  reason: "correct" | "timeout";
  drawerName: string;
  correctGuesserName: string | null;
  guesserDelta: number;
  drawerDelta: number;
};

type RevealScreenProps = {
  result: RevealResult;
  round: number;
  maxRounds: number;
  dwellMs?: number;
  onDone?: () => void;
};

export function RevealScreen({
  result,
  round,
  maxRounds,
  dwellMs = 4200,
  onDone,
}: RevealScreenProps) {
  const reduceMotion = useReducedMotion();
  const { play } = useSound();
  const gotIt = result.reason === "correct";
  const onDoneEvent = useEffectEvent(() => {
    onDone?.();
  });

  useEffect(() => {
    if (gotIt) {
      celebrate();
      void play("win");
    } else {
      void play("wrong");
    }
    const id = window.setTimeout(() => {
      onDoneEvent();
    }, dwellMs);
    return () => window.clearTimeout(id);
  }, [dwellMs, gotIt, play]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <motion.div
        className="w-full max-w-sm"
        initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={
          reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 360, damping: 24 }
        }
      >
        <Card className="flex flex-col items-center gap-6 text-center">
          <p className="font-display text-[10px] uppercase tracking-[0.3em] text-muted">
            Round {round}/{maxRounds} · Reveal
          </p>

          <motion.p
            className="font-display text-2xl uppercase leading-relaxed text-ink sm:text-3xl"
            initial={reduceMotion ? false : { scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 280, damping: 16, delay: 0.08 }
            }
          >
            {result.word}
          </motion.p>

          <p className="font-body text-sm text-muted">
            {gotIt
              ? `${result.correctGuesserName ?? "Someone"} got it!`
              : "Time's up — nobody guessed it."}
          </p>

          <ul className="flex w-full flex-col gap-2">
            {gotIt && result.correctGuesserName ? (
              <ScoreChip
                name={result.correctGuesserName}
                label={`+${result.guesserDelta}`}
                delay={0.15}
              />
            ) : null}
            {gotIt && result.drawerDelta > 0 ? (
              <ScoreChip
                name={result.drawerName}
                label={`Drawer +${result.drawerDelta}`}
                delay={0.28}
              />
            ) : null}
          </ul>

          {onDone ? (
            <Button fullWidth size="lg" onClick={onDone}>
              {round < maxRounds ? "Next" : "See scores"}
            </Button>
          ) : null}
        </Card>
      </motion.div>
    </main>
  );
}

function ScoreChip({ name, label, delay }: { name: string; label: string; delay: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.li
      className="flex items-center gap-3 rounded-2xl border-[3px] border-ink bg-[#fffaf2] px-3 py-2 text-left"
      initial={reduceMotion ? false : { opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={
        reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 22, delay }
      }
    >
      <PlayerAvatar name={name} size="md" />
      <span className="flex-1 font-body font-semibold text-ink">{name}</span>
      <span className="font-display text-[10px] uppercase tracking-widest text-accent">
        {label}
      </span>
    </motion.li>
  );
}
