import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useSound } from "../../lib/audio";

type CountdownProps = {
  onDone?: () => void;
};

const STEPS = ["3", "2", "1", "GO!"] as const;

export function Countdown({ onDone }: CountdownProps) {
  const { play } = useSound();
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const label = STEPS[index] ?? "GO!";

  useEffect(() => {
    if (label === "GO!") {
      play("go");
    } else {
      play("tick");
    }

    const delay = label === "GO!" ? 700 : 800;
    const timer = window.setTimeout(() => {
      if (index >= STEPS.length - 1) {
        onDone?.();
        return;
      }
      setIndex((previous) => previous + 1);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [index, label, onDone, play]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.p
          key={label}
          className="font-display text-6xl text-white neon-text sm:text-8xl"
          initial={reduceMotion ? false : { scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={reduceMotion ? undefined : { scale: 1.4, opacity: 0 }}
          transition={
            reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 18 }
          }
        >
          {label}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
