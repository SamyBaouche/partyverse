import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

const HOW_STEPS = [
  {
    n: "1",
    color: "#FFE566",
    title: "Pick a game",
    body: "Choose a battle and open a room.",
  },
  {
    n: "2",
    color: "#86E3C2",
    title: "Scan the QR",
    body: "Friends join on their phone in one tap.",
  },
  {
    n: "3",
    color: "#FFB4C8",
    title: "Play live",
    body: "Moves sync instantly. Rematch anytime.",
  },
] as const;

/** Stamp cascade + flip badges — not chip tilt, not bubble float. */
export function HowItWorks() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const [flipped, setFlipped] = useState<string | null>(null);

  return (
    <aside ref={ref} className="relative space-y-4 sm:space-y-5 lg:pt-1">
      <motion.h2
        className="font-body text-2xl font-extrabold text-ink sm:text-3xl"
        initial={reduceMotion ? false : { opacity: 0, x: 36, clipPath: "inset(0 100% 0 0)" }}
        animate={
          inView || reduceMotion ? { opacity: 1, x: 0, clipPath: "inset(0 0% 0 0)" } : undefined
        }
        transition={reduceMotion ? { duration: 0 } : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        How it works
      </motion.h2>

      <ol className="relative flex flex-col gap-4 sm:gap-5">
        {/* Draw-down guide line */}
        <motion.span
          aria-hidden
          className="absolute top-3 bottom-3 left-[1.35rem] w-[3px] origin-top rounded-full bg-ink/15 sm:left-[1.45rem]"
          initial={reduceMotion ? false : { scaleY: 0 }}
          animate={inView || reduceMotion ? { scaleY: 1 } : undefined}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { delay: 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }
          }
        />

        {HOW_STEPS.map((step, index) => (
          <motion.li
            key={step.n}
            className="relative z-[1] flex gap-3.5 sm:gap-4"
            initial={reduceMotion ? false : { opacity: 0, x: 48 }}
            animate={inView || reduceMotion ? { opacity: 1, x: 0 } : undefined}
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    delay: 0.22 + index * 0.18,
                    type: "spring",
                    stiffness: 320,
                    damping: 22,
                  }
            }
            onPointerEnter={() => setFlipped(step.n)}
            onPointerLeave={() => setFlipped(null)}
          >
            <motion.span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[3px] border-ink font-display text-sm text-ink shadow-[3px_3px_0_#1a1a1a] sm:h-12 sm:w-12 sm:text-base"
              style={{ backgroundColor: step.color, transformStyle: "preserve-3d" }}
              initial={reduceMotion ? false : { scale: 1.7, y: -28, rotateX: -90 }}
              animate={
                inView || reduceMotion
                  ? {
                      scale: flipped === step.n ? 1.12 : 1,
                      y: 0,
                      rotateX: flipped === step.n ? 180 : 0,
                    }
                  : undefined
              }
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : flipped === step.n
                    ? { type: "spring", stiffness: 420, damping: 16 }
                    : {
                        delay: 0.28 + index * 0.18,
                        type: "spring",
                        stiffness: 460,
                        damping: 14,
                        mass: 0.7,
                      }
              }
            >
              <span
                className="inline-block"
                style={{
                  transform: flipped === step.n ? "rotateX(180deg)" : undefined,
                }}
              >
                {step.n}
              </span>
            </motion.span>
            <div className="min-w-0 pt-0.5">
              <motion.p
                className="font-body text-base font-bold text-ink sm:text-lg"
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={inView || reduceMotion ? { opacity: 1, y: 0 } : undefined}
                transition={
                  reduceMotion ? { duration: 0 } : { delay: 0.34 + index * 0.18, duration: 0.35 }
                }
              >
                {step.title}
              </motion.p>
              <motion.p
                className="mt-1 font-body text-base text-ink/75 sm:text-lg"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={inView || reduceMotion ? { opacity: 1, y: 0 } : undefined}
                transition={
                  reduceMotion ? { duration: 0 } : { delay: 0.42 + index * 0.18, duration: 0.4 }
                }
              >
                {step.body}
              </motion.p>
            </div>
          </motion.li>
        ))}
      </ol>
    </aside>
  );
}
