import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "../../../lib/cn";
import { CATALOG_GAMES } from "../../session/catalog";
import type { CatalogGame, CatalogGameId } from "../../session/types";
import { GameHoverDemo } from "../GameHoverDemo";
import { ART_BUBBLE_GAMES, GameIcon } from "../GameIcons";

const IMPOSTER_REEL_INDEX = CATALOG_GAMES.findIndex((game) => game.id === "imposter");

export function PadlockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <rect
        x="5"
        y="10"
        width="14"
        height="11"
        rx="2.5"
        fill="#FFE566"
        stroke="#1a1a1a"
        strokeWidth="2.2"
      />
      <path
        d="M8 10V7.5a4 4 0 0 1 8 0V10"
        stroke="#1a1a1a"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="15" r="1.6" fill="#1a1a1a" />
      <path d="M12 16.5v2" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Floating round art bubble — bob + pulse, not chip tilt. */
export function GameBubble({
  game,
  index,
  onSelect,
}: {
  game: CatalogGame;
  index: number;
  onSelect: (gameId: CatalogGameId) => void;
}) {
  const reduceMotion = useReducedMotion();
  const [hot, setHot] = useState(false);
  const [demo, setDemo] = useState(false);
  const hoverTimer = useRef<number | null>(null);
  const floatDelay = (index % 5) * 0.35;
  const floatAmp = 10 + (index % 3) * 4;
  const showPadlock = game.locked && IMPOSTER_REEL_INDEX >= 0 && index >= IMPOSTER_REEL_INDEX;

  function clearHoverTimer() {
    if (hoverTimer.current !== null) {
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  }

  function armDemo() {
    if (game.locked || reduceMotion) {
      return;
    }
    clearHoverTimer();
    hoverTimer.current = window.setTimeout(() => setDemo(true), 380);
  }

  function coolDown() {
    clearHoverTimer();
    setDemo(false);
    setHot(false);
  }

  return (
    <li className="snap-center shrink-0 list-none">
      <motion.button
        type="button"
        disabled={game.locked}
        onClick={() => {
          if (!game.locked) {
            onSelect(game.id);
          }
        }}
        aria-label={game.locked ? `${game.title}, coming soon` : `Start ${game.title}`}
        className={cn(
          "group flex h-full w-[13.5rem] flex-col items-center gap-4 text-left sm:w-[15.5rem] md:w-[17rem]",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand",
          game.locked && "cursor-not-allowed",
        )}
        initial={reduceMotion ? false : { opacity: 0, scale: 0.72, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { delay: 0.04 * index, type: "spring", stiffness: 260, damping: 16 }
        }
        onPointerEnter={() => {
          setHot(true);
          armDemo();
        }}
        onPointerLeave={coolDown}
        onPointerCancel={coolDown}
        onFocus={() => {
          setHot(true);
          armDemo();
        }}
        onBlur={coolDown}
      >
        <motion.div
          className="relative"
          animate={
            reduceMotion
              ? undefined
              : hot
                ? { y: -14, scale: 1.08 }
                : {
                    y: [0, -floatAmp, 0, floatAmp * 0.55, 0],
                    scale: [1, 1.03, 1, 0.985, 1],
                  }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : hot
                ? { type: "spring", stiffness: 420, damping: 14 }
                : {
                    duration: 3.4 + (index % 4) * 0.35,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: floatDelay,
                  }
          }
        >
          <motion.div
            className={cn(
              "relative flex aspect-square w-[13.5rem] items-center justify-center overflow-hidden rounded-full border-[3px] border-ink shadow-[6px_6px_0_var(--color-hard-shadow)] sm:w-[15.5rem] md:w-[17rem]",
              game.locked && !showPadlock && "opacity-60 grayscale-[0.35]",
              showPadlock && "opacity-90",
            )}
            style={{ backgroundColor: game.accent }}
            animate={
              reduceMotion
                ? undefined
                : hot
                  ? { rotate: [0, -4, 3, 0] }
                  : { rotate: [0, 2.5, 0, -2.5, 0] }
            }
            transition={
              reduceMotion
                ? { duration: 0 }
                : hot
                  ? { duration: 0.55, ease: "easeOut" }
                  : {
                      duration: 5.5 + (index % 3),
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: floatDelay * 0.5,
                    }
            }
          >
            {showPadlock ? (
              <span className="absolute inset-0 z-10 flex items-center justify-center">
                <PadlockIcon className="h-16 w-16 sm:h-20 sm:w-20" />
              </span>
            ) : (
              <>
                <div
                  className={cn(
                    "absolute overflow-hidden rounded-full",
                    ART_BUBBLE_GAMES.has(game.id)
                      ? "inset-0 flex items-center justify-center"
                      : "inset-[12%] bg-white/55",
                  )}
                >
                  {demo && !game.locked ? (
                    <GameHoverDemo id={game.id} accent={game.accent} />
                  ) : ART_BUBBLE_GAMES.has(game.id) ? (
                    <GameIcon
                      id={game.id}
                      className="h-full w-full max-h-full max-w-full !object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center p-[12%]">
                      <GameIcon id={game.id} className="h-full w-full text-[#1a1a1a]" />
                    </div>
                  )}
                </div>
                {game.locked ? (
                  <span className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full border-[3px] border-ink bg-white px-3 py-1 font-display text-[9px] uppercase tracking-widest text-ink shadow-[2px_2px_0_#1a1a1a] sm:text-[10px]">
                    Soon
                  </span>
                ) : null}
              </>
            )}
          </motion.div>

          {/* Accent ring pulse */}
          {!reduceMotion && !game.locked ? (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full border-[3px] border-ink"
              animate={
                hot
                  ? { scale: [1, 1.12], opacity: [0.55, 0] }
                  : { scale: [1, 1.06, 1], opacity: [0.25, 0.05, 0.25] }
              }
              transition={
                hot
                  ? { duration: 0.7, repeat: Infinity, ease: "easeOut" }
                  : { duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: floatDelay }
              }
            />
          ) : null}
        </motion.div>

        <motion.div
          className="flex w-full flex-1 flex-col text-center"
          animate={
            reduceMotion ? undefined : hot ? { y: 0, opacity: 1 } : { y: [0, -3, 0], opacity: 1 }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : hot
                ? { type: "spring", stiffness: 400, damping: 18 }
                : { duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: floatDelay }
          }
        >
          <p className="font-display text-[9px] uppercase tracking-[0.22em] text-ink/55 sm:text-[10px]">
            {game.tagline}
          </p>
          <h3 className="mt-1.5 min-h-[3.25rem] font-body text-xl font-extrabold leading-tight tracking-tight text-ink sm:min-h-[3.5rem] sm:text-2xl">
            {game.title}
          </h3>
          <p className="mx-auto mt-1.5 line-clamp-3 min-h-[3.75rem] max-w-[14rem] font-body text-sm leading-snug text-ink/70 sm:min-h-[4.5rem] sm:text-base">
            {game.locked ? "Coming soon." : game.blurb}
          </p>
          <motion.span
            className={cn(
              "mt-auto inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-full border-[3px] border-ink px-5 font-body text-sm font-bold shadow-[3px_3px_0_var(--color-hard-shadow)] sm:h-12 sm:text-base",
              game.locked ? "cursor-not-allowed bg-[#F0F0F0] text-ink/55" : "bg-white text-ink",
            )}
            animate={!game.locked && hot && !reduceMotion ? { scale: [1, 1.06, 1] } : { scale: 1 }}
            transition={
              !game.locked && hot && !reduceMotion
                ? { duration: 0.9, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.2 }
            }
          >
            {game.locked ? (
              <>
                <PadlockIcon className="h-5 w-5" />
                Locked
              </>
            ) : (
              "Play →"
            )}
          </motion.span>
        </motion.div>
      </motion.button>
    </li>
  );
}
