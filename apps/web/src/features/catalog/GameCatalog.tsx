import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { PartyverseWordmark } from "../../components/brand/PartyverseWordmark";
import { cn } from "../../lib/cn";
import { CATALOG_GAMES } from "../session/catalog";
import type { CatalogGame, CatalogGameId } from "../session/types";
import { GameHoverDemo } from "./GameHoverDemo";
import { GameIcon } from "./GameIcons";

type GameCatalogProps = {
  onSelect: (gameId: CatalogGameId) => void;
};

function GameCard({
  game,
  index,
  onSelect,
}: {
  game: CatalogGame;
  index: number;
  onSelect: (gameId: CatalogGameId) => void;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [demo, setDemo] = useState(false);
  const hoverTimer = useRef<number | null>(null);

  function clearHoverTimer() {
    if (hoverTimer.current !== null) {
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  }

  return (
    <motion.li
      ref={ref}
      initial={reduceMotion ? false : { opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { delay: 0.05 * index, duration: 0.35, ease: [0.22, 1, 0.36, 1] }
      }
    >
      <div
        className={cn(
          "brutal-card flex h-full flex-col overflow-hidden rounded-[1.75rem]",
          game.locked && "opacity-75",
        )}
        style={{ backgroundColor: game.accent }}
      >
        <div
          className="art-frame relative mx-5 mt-5 flex aspect-[5/4] items-center justify-center overflow-hidden rounded-[1.25rem]"
          onPointerEnter={() => {
            if (game.locked || reduceMotion) {
              return;
            }
            clearHoverTimer();
            hoverTimer.current = window.setTimeout(() => setDemo(true), 450);
          }}
          onPointerLeave={() => {
            clearHoverTimer();
            setDemo(false);
          }}
        >
          {demo && !game.locked ? (
            <GameHoverDemo id={game.id} accent={game.accent} />
          ) : (
            <GameIcon id={game.id} className="h-[78%] w-[78%] text-[#1a1a1a]" />
          )}
          {game.locked ? (
            <span className="absolute right-3 top-3 rounded-full border-[3px] border-[#1a1a1a] bg-white px-2.5 py-1 font-display text-[8px] uppercase tracking-widest text-[#1a1a1a]">
              Soon
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-2.5 px-5 pb-5 pt-4">
          <p className="font-display text-[8px] uppercase tracking-[0.2em] text-[#1a1a1a]/65">
            {game.tagline}
          </p>
          <h2 className="font-body text-2xl font-extrabold leading-tight tracking-tight text-[#1a1a1a]">
            {game.title}
          </h2>
          <p className="font-body text-[15px] leading-snug text-[#1a1a1a]/80">
            {game.locked ? "Coming soon — this battle unlocks later." : game.blurb}
          </p>

          <button
            type="button"
            disabled={game.locked}
            onClick={() => onSelect(game.id)}
            className={cn(
              "mt-auto inline-flex h-12 w-full items-center justify-center rounded-full border-[3px] border-[#1a1a1a] bg-white font-body text-sm font-bold text-[#1a1a1a] shadow-[4px_4px_0_var(--color-hard-shadow)] transition-transform",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a1a1a]",
              game.locked
                ? "cursor-not-allowed opacity-60"
                : "hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_var(--color-hard-shadow)]",
            )}
          >
            {game.locked ? "Locked" : "Start a room →"}
          </button>
        </div>
      </div>
    </motion.li>
  );
}

export function GameCatalog({ onSelect }: GameCatalogProps) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-8 px-5 py-6 sm:gap-10 sm:px-8 sm:py-8 lg:px-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <PartyverseWordmark />
        <a
          href="/play/KXPM"
          className="inline-flex h-10 items-center rounded-full border-[3px] border-ink bg-white px-4 font-display text-[9px] uppercase tracking-widest text-ink shadow-[3px_3px_0_var(--color-hard-shadow)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Join a room
        </a>
      </header>

      <section className="grid items-end gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-5">
          <h1 className="sr-only">Partyverse living-room mini games</h1>
          <div className="flex flex-col items-start gap-2.5" aria-hidden>
            <span className="inline-block rounded-2xl border-[3px] border-ink bg-[#FFE566] px-3 py-2 font-body text-2xl font-extrabold tracking-tight text-ink shadow-[4px_4px_0_var(--color-hard-shadow)] sm:text-3xl md:text-4xl">
              Pick a game.
            </span>
            <span className="inline-block rounded-2xl border-[3px] border-ink bg-[#86E3C2] px-3 py-2 font-body text-2xl font-extrabold tracking-tight text-ink shadow-[4px_4px_0_var(--color-hard-shadow)] sm:text-3xl md:text-4xl">
              Send a link.
            </span>
            <span className="inline-block font-body text-3xl font-extrabold tracking-tight text-brand sm:text-4xl md:text-5xl">
              Partyverse!
            </span>
          </div>
          <p className="max-w-md font-body text-base leading-relaxed text-ink/75 sm:text-lg">
            Quick mini-games for the living room — every move shows up on phones and the TV. No
            accounts, no downloads.
          </p>
        </div>

        <div className="hidden justify-center gap-4 lg:flex" aria-hidden>
          <span className="mt-8 font-display text-5xl text-[#FF5A6A]">X</span>
          <span className="font-display text-6xl text-[#5B8CFF]">O</span>
          <span className="mt-12 h-10 w-10 rounded-full border-[4px] border-ink bg-[#FF5A6A]" />
        </div>
      </section>

      <div className="space-y-3">
        <h2 className="font-body text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Choose your battle
        </h2>
        <p className="max-w-xl font-body text-sm text-ink/70 sm:text-base">
          Host on the TV. Friends join with a code or link.
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {CATALOG_GAMES.map((game, index) => (
          <GameCard key={game.id} game={game} index={index} onSelect={onSelect} />
        ))}
      </ul>

      <section className="brutal-panel rounded-[1.6rem] px-5 py-6 sm:px-8">
        <h2 className="font-body text-xl font-extrabold text-ink sm:text-2xl">How it works</h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            {
              n: "1",
              color: "#FFE566",
              title: "Pick a game",
              body: "Choose a battle and open a room.",
            },
            {
              n: "2",
              color: "#86E3C2",
              title: "Share the link",
              body: "Friends join on their phone in one tap.",
            },
            {
              n: "3",
              color: "#FFB4C8",
              title: "Play live",
              body: "Moves sync instantly. Rematch anytime.",
            },
          ].map((step) => (
            <li key={step.n} className="flex gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[3px] border-ink font-display text-sm text-ink shadow-[3px_3px_0_#1a1a1a]"
                style={{ backgroundColor: step.color }}
              >
                {step.n}
              </span>
              <div>
                <p className="font-body text-sm font-bold text-ink">{step.title}</p>
                <p className="mt-1 font-body text-sm text-ink/75">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
