import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PartyverseLogo } from "./brand/PartyverseLogo";
import { PartyverseWordmark } from "./brand/PartyverseWordmark";

type SplashIntroProps = {
  onDone: () => void;
};

type SplashPhase = "enter" | "hold" | "zoom" | "gone";

/**
 * Full-screen cream boot: logo appears → soft hold → zooms and dissolves
 * into the mini-game page.
 */
export function SplashIntro({ onDone }: SplashIntroProps) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<SplashPhase>("enter");
  const finishedRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (reduceMotion) {
      setPhase("hold");
      const id = window.setTimeout(() => {
        finishedRef.current = true;
        setPhase("gone");
        onDoneRef.current();
      }, 1800);
      return () => window.clearTimeout(id);
    }

    const hold = window.setTimeout(() => setPhase("hold"), 500);
    const zoom = window.setTimeout(() => setPhase("zoom"), 2400);
    const done = window.setTimeout(() => {
      if (finishedRef.current) {
        return;
      }
      finishedRef.current = true;
      setPhase("gone");
      onDoneRef.current();
    }, 3400);

    return () => {
      window.clearTimeout(hold);
      window.clearTimeout(zoom);
      window.clearTimeout(done);
    };
  }, [reduceMotion]);

  return (
    <AnimatePresence>
      {phase !== "gone" ? (
        <motion.div
          key="splash"
          className="bg-squabble-splash fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="squabble-wash" />
          </div>

          <motion.div
            className="relative z-10 flex flex-col items-center gap-7"
            initial={{ opacity: 0, scale: 0.72 }}
            animate={
              phase === "zoom"
                ? { opacity: 0, scale: 7.2, filter: "blur(18px)" }
                : { opacity: 1, scale: 1, filter: "blur(0px)" }
            }
            transition={
              phase === "zoom"
                ? { duration: 0.9, ease: [0.16, 1, 0.3, 1] }
                : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
            }
          >
            <motion.div
              className="h-36 w-36 drop-shadow-[6px_6px_0_#1a1a1a] sm:h-44 sm:w-44"
              animate={
                phase === "hold" && !reduceMotion ? { scale: [1, 1.06, 1] } : { scale: 1 }
              }
              transition={
                phase === "hold" && !reduceMotion
                  ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.3 }
              }
            >
              <PartyverseLogo tone="splash" />
            </motion.div>

            <div className="flex flex-col items-center gap-3">
              <PartyverseWordmark className="text-2xl sm:text-3xl" />
              {phase !== "zoom" ? (
                <div className="flex items-center gap-2" aria-label="Loading">
                  <span className="splash-dot" />
                  <span className="splash-dot splash-dot-delay-1" style={{ background: "#ffe566" }} />
                  <span className="splash-dot splash-dot-delay-2" style={{ background: "#86e3c2" }} />
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
