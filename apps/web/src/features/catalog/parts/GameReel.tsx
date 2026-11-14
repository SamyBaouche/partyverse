import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "../../../lib/cn";
import { CATALOG_GAMES } from "../../session/catalog";
import type { CatalogGameId } from "../../session/types";
import { GameBubble } from "./GameBubble";

export function GameReel({ onSelect }: { onSelect: (gameId: CatalogGameId) => void }) {
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
