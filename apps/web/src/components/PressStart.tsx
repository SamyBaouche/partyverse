import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useSound } from "../lib/audio";

type PressStartProps = {
  onStart: () => void;
};

export function PressStart({ onStart }: PressStartProps) {
  const { play, startMusic, unlock } = useSound();
  const reduceMotion = useReducedMotion();
  const [starting, setStarting] = useState(false);

  const begin = useCallback(async () => {
    if (starting) {
      return;
    }
    setStarting(true);
    try {
      // Keep unlock in the same user-gesture turn before any long work.
      await unlock();
      await play("go");
      await startMusic();
      onStart();
    } catch {
      setStarting(false);
    }
  }, [starting, unlock, play, startMusic, onStart]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        void begin();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [begin]);

  return (
    <motion.button
      type="button"
      className="flex min-h-screen w-full flex-col items-center justify-center gap-6 px-6 text-center"
      onClick={() => {
        void begin();
      }}
      disabled={starting}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="toy-panel rounded-3xl px-8 py-10 sm:px-12">
        <p className="font-display text-sm uppercase tracking-[0.4em] text-brand">Partyverse</p>
        <p
          className={`font-display mt-4 text-3xl uppercase leading-relaxed text-ink sm:text-5xl ${
            reduceMotion ? "" : "blink-soft"
          }`}
        >
          Press Start
        </p>
        <p className="font-body mt-4 text-sm text-muted">
          {starting ? "Starting…" : "Click or press Enter / Space to enter the lobby"}
        </p>
      </div>
    </motion.button>
  );
}
