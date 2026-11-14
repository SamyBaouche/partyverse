import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { PartyverseWordmark } from "../../components/brand/PartyverseWordmark";
import { cn } from "../../lib/cn";
import { CATALOG_GAMES } from "../session/catalog";
import type { CatalogGame, CatalogGameId } from "../session/types";
import { GameHoverDemo } from "./GameHoverDemo";
import { ART_BUBBLE_GAMES, GameIcon } from "./GameIcons";

type GameCatalogProps = {
  onSelect: (gameId: CatalogGameId) => void;
  /** Replay the boot splash and return to the catalog home. */
  onLogoClick?: () => void;
};

type TiltChipProps = {
  lean: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  as?: "a" | "button" | "div";
  href?: string;
  disabled?: boolean;
  onClick?: () => void;
  "aria-label"?: string;
};

/** Hero-only chip: leans at rest, tilts toward the pointer. */
function TiltChip({
  lean,
  className,
  style,
  children,
  as = "button",
  href,
  disabled,
  onClick,
  "aria-label": ariaLabel,
}: TiltChipProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);
  const [tilt, setTilt] = useState({ rotate: lean, x: 0, y: 0, scale: 1 });
  const canPress = as !== "div" && !disabled;
  const canTilt = !reduceMotion;

  function handlePointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (!canTilt) {
      return;
    }
    const node = ref.current;
    if (!node) {
      return;
    }
    const rect = node.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setActive(true);
    setTilt({
      rotate: lean + px * 28,
      x: px * 22,
      y: py * 16 - 6,
      scale: 1.08,
    });
  }

  function resetTilt() {
    setActive(false);
    setTilt({ rotate: lean, x: 0, y: 0, scale: 1 });
  }

  const motionProps = {
    className: cn(
      "inline-block max-w-full origin-center will-change-transform",
      canPress &&
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
      className,
    ),
    style: { transformStyle: "preserve-3d" as const, ...style },
    initial: reduceMotion ? false : ({ rotate: lean * 0.35, y: 14, opacity: 0 } as const),
    animate: reduceMotion
      ? { rotate: 0, x: 0, y: 0, scale: 1, opacity: 1 }
      : active
        ? {
            rotate: tilt.rotate,
            x: tilt.x,
            y: tilt.y,
            scale: tilt.scale,
            opacity: 1,
          }
        : {
            rotate: [lean, lean + 4.5, lean - 3.5, lean + 2, lean],
            x: [0, lean > 0 ? 6 : -6, lean > 0 ? -4 : 4, 0],
            y: [0, -5, -2, -6, 0],
            scale: 1,
            opacity: 1,
          },
    transition: reduceMotion
      ? { duration: 0 }
      : active
        ? { type: "spring" as const, stiffness: 380, damping: 12, mass: 0.55 }
        : {
            rotate: { duration: 3.2, repeat: Infinity, ease: "easeInOut" as const },
            x: { duration: 3.2, repeat: Infinity, ease: "easeInOut" as const },
            y: { duration: 2.6, repeat: Infinity, ease: "easeInOut" as const },
            opacity: { duration: 0.45 },
          },
    whileTap: canPress ? { scale: 0.93, rotate: lean * 1.6 } : undefined,
    onPointerMove: handlePointerMove,
    onPointerLeave: resetTilt,
    onPointerCancel: resetTilt,
  };

  if (as === "a" && href) {
    return (
      <motion.a
        ref={ref as RefObject<HTMLAnchorElement>}
        href={href}
        aria-label={ariaLabel}
        {...motionProps}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={ref as RefObject<HTMLButtonElement>}
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      {...motionProps}
    >
      {children}
    </motion.button>
  );
}

const CHIP_SHELL =
  "rounded-2xl border-[3px] border-ink px-4 py-3 text-left font-body font-extrabold leading-tight tracking-tight text-ink shadow-[4px_4px_0_var(--color-hard-shadow)] sm:rounded-[1.35rem] sm:px-5 sm:py-3.5";

const IMPOSTER_REEL_INDEX = CATALOG_GAMES.findIndex((game) => game.id === "imposter");

function PadlockIcon({ className }: { className?: string }) {
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
function GameBubble({
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
function HowItWorks() {
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

function GameReel({ onSelect }: { onSelect: (gameId: CatalogGameId) => void }) {
  const reduceMotion = useReducedMotion();
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  function updateEdges() {
    const node = scrollerRef.current;
    if (!node) {
      return;
    }
    const max = node.scrollWidth - node.clientWidth;
    setCanLeft(node.scrollLeft > 8);
    setCanRight(node.scrollLeft < max - 8);
  }

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) {
      return;
    }
    updateEdges();
    node.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    return () => {
      node.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, []);

  function scrollByDir(direction: "left" | "right") {
    const node = scrollerRef.current;
    if (!node) {
      return;
    }
    const amount = Math.min(node.clientWidth * 0.85, 380);
    node.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  }

  return (
    <div className="relative -mx-4 sm:-mx-8 md:-mx-10 lg:-mx-12">
      {/* Soft edge fades — no hard vertical chrome */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[var(--color-arcade-bg)] to-transparent transition-opacity sm:w-24 md:w-28",
          canLeft ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[var(--color-arcade-bg)] to-transparent transition-opacity sm:w-24 md:w-28",
          canRight ? "opacity-100" : "opacity-0",
        )}
      />

      <button
        type="button"
        aria-label="Previous games"
        disabled={!canLeft}
        onClick={() => scrollByDir("left")}
        className={cn(
          "absolute top-[36%] left-2 z-20 -translate-y-1/2 text-ink transition-opacity sm:left-4",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
          canLeft ? "opacity-70 hover:opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <motion.span
          className="flex"
          animate={reduceMotion || !canLeft ? undefined : { x: [0, -6, 0] }}
          transition={
            reduceMotion || !canLeft
              ? { duration: 0 }
              : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <svg viewBox="0 0 24 24" className="h-9 w-9 sm:h-11 sm:w-11" aria-hidden fill="none">
            <path
              d="M15 5 L8 12 l7 7"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.span>
      </button>
      <button
        type="button"
        aria-label="Next games"
        disabled={!canRight}
        onClick={() => scrollByDir("right")}
        className={cn(
          "absolute top-[36%] right-2 z-20 -translate-y-1/2 text-ink transition-opacity sm:right-4",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
          canRight ? "opacity-70 hover:opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <motion.span
          className="flex"
          animate={reduceMotion || !canRight ? undefined : { x: [0, 6, 0] }}
          transition={
            reduceMotion || !canRight
              ? { duration: 0 }
              : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <svg viewBox="0 0 24 24" className="h-9 w-9 sm:h-11 sm:w-11" aria-hidden fill="none">
            <path
              d="M9 5 L16 12 l-7 7"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.span>
      </button>

      <ul
        ref={scrollerRef}
        className={cn(
          "flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-10 pb-4 pt-6 sm:gap-8 sm:px-14 sm:pb-5 sm:pt-8 md:gap-10 md:px-16",
          "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {CATALOG_GAMES.map((game, index) => (
          <GameBubble key={game.id} game={game} index={index} onSelect={onSelect} />
        ))}
        <li aria-hidden className="w-2 shrink-0 list-none sm:w-4" />
      </ul>
    </div>
  );
}

export function GameCatalog({ onSelect, onLogoClick }: GameCatalogProps) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col gap-8 px-4 pb-5 pt-20 sm:gap-10 sm:px-8 sm:pb-8 sm:pt-24 md:gap-12 md:px-10 md:pb-10 lg:px-12">
      <button
        type="button"
        onClick={onLogoClick}
        className="fixed top-4 left-4 z-[70] max-w-[min(70vw,18rem)] rounded-sm text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:left-5"
        aria-label="Partyverse home"
      >
        <PartyverseWordmark className="text-xl sm:text-2xl md:text-[1.7rem]" />
      </button>

      <section className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)] lg:gap-12 xl:gap-16">
        <div>
          <h1 className="sr-only">Partyverse living-room mini games</h1>
          <div className="flex flex-col items-start gap-4 perspective-[800px] sm:gap-5">
            <TiltChip
              as="a"
              href="#battles"
              lean={-6}
              className={cn(CHIP_SHELL, "bg-[#FFE566] text-[1.7rem] sm:text-4xl md:text-5xl")}
            >
              Pick a game.
            </TiltChip>
            <TiltChip
              as="a"
              href="/play/KXPM"
              lean={7}
              className={cn(
                CHIP_SHELL,
                "bg-[#86E3C2] text-[1.7rem] sm:ml-6 sm:text-4xl md:ml-10 md:text-5xl",
              )}
            >
              Join on phones.
            </TiltChip>
          </div>
          <p className="mt-10 max-w-xl font-body text-lg leading-relaxed text-ink/75 sm:mt-12 sm:text-xl md:mt-14 md:text-[1.35rem]">
            Quick mini-games for the living room. Every move shows up on phones and the TV. No
            accounts, no downloads.
          </p>
        </div>

        <HowItWorks />
      </section>

      <section id="battles" className="scroll-mt-24 space-y-5 sm:scroll-mt-28 sm:space-y-6">
        <div className="space-y-2 sm:space-y-3">
          <h2 className="font-body text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Choose your battle
          </h2>
          <p className="max-w-2xl font-body text-base text-ink/70 sm:text-lg">
            Swipe the reel. Host on the TV. Friends scan the QR on their phone.
          </p>
        </div>

        <GameReel onSelect={onSelect} />
      </section>
    </div>
  );
}
