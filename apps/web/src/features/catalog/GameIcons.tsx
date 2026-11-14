import type { ComponentType, ReactNode } from "react";
import connectFourArt from "../../assets/connect-four.png";
import drawGuessArt from "../../assets/draw-guess.png";
import rpsHandsArt from "../../assets/rps-hands.png";
import ticTacToeArt from "../../assets/tic-tac-toe.png";
import type { CatalogGameId } from "../session/types";

type IconProps = { className?: string };

/** Games that use full-bleed photo art in the catalog reel. */
export const ART_BUBBLE_GAMES = new Set<CatalogGameId>([
  "tic-tac-toe",
  "connect-four",
  "rock-paper-scissors",
  "draw-guess",
]);

function Frame({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden fill="none">
      {children}
    </svg>
  );
}

function ArtIcon({ src, className }: { src: string; className?: string }) {
  return (
    <img
      src={src}
      alt=""
      draggable={false}
      className={["h-full w-full object-cover object-center", className]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    />
  );
}

/** Pencil bent into a question mark. */
export function DrawGuessIcon({ className }: IconProps) {
  return <ArtIcon src={drawGuessArt} className={className} />;
}

export function TicTacToeIcon({ className }: IconProps) {
  return <ArtIcon src={ticTacToeArt} className={className} />;
}

/** Blue board with red + yellow discs. */
export function ConnectFourIcon({ className }: IconProps) {
  return <ArtIcon src={connectFourArt} className={className} />;
}

/** Three hands (rock / paper / scissors). */
export function RockPaperScissorsIcon({ className }: IconProps) {
  return <ArtIcon src={rpsHandsArt} className={className} />;
}

/** Sherlock Holmes — deerstalker + pipe silhouette. */
export function ImposterIcon({ className }: IconProps) {
  return (
    <Frame className={className}>
      <circle cx="32" cy="32" r="26" fill="#E8DCC8" stroke="#1a1a1a" strokeWidth="2.5" />
      {/* Deerstalker hat */}
      <path
        d="M16 28c2-12 10-16 16-16s14 4 16 16"
        fill="#3D2B1F"
        stroke="#1a1a1a"
        strokeWidth="2"
      />
      <path d="M14 28h36" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22 18l-6-6M42 18l6-6" stroke="#3D2B1F" strokeWidth="3" strokeLinecap="round" />
      {/* Face */}
      <ellipse cx="32" cy="36" rx="12" ry="13" fill="#F0D5B8" stroke="#1a1a1a" strokeWidth="2" />
      <path d="M24 34h4M36 34h4" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 42c2 2 6 2 8 0" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" />
      {/* Pipe */}
      <path
        d="M36 44h14c2 0 3 1.5 2 3l-2 1"
        fill="#6B3F1D"
        stroke="#1a1a1a"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <rect
        x="34"
        y="42"
        width="5"
        height="4"
        rx="1"
        fill="#6B3F1D"
        stroke="#1a1a1a"
        strokeWidth="1.4"
      />
      <path d="M48 42c2-4 4-5 6-4" stroke="#9aa3b0" strokeWidth="1.5" strokeLinecap="round" />
      {/* Magnifier hint */}
      <circle cx="18" cy="48" r="5" stroke="#1a1a1a" strokeWidth="2" fill="#fff8" />
      <path d="M21.5 51.5l4 4" stroke="#1a1a1a" strokeWidth="2.2" strokeLinecap="round" />
    </Frame>
  );
}

export function WordRushIcon({ className }: IconProps) {
  return (
    <Frame className={className}>
      <path
        d="M12 40V24h10l6 16h8l6-16h10v16"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M18 48h28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M44 14l8 6-8 6"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Frame>
  );
}

/** Classic cartoon bomb with fuse spark. */
export function BombPartyIcon({ className }: IconProps) {
  return (
    <Frame className={className}>
      <circle cx="30" cy="38" r="18" fill="#2A2A2A" stroke="#1a1a1a" strokeWidth="2.5" />
      <ellipse cx="24" cy="32" rx="5" ry="3" fill="#ffffff55" />
      <rect
        x="26"
        y="18"
        width="8"
        height="6"
        rx="1.5"
        fill="#6B7280"
        stroke="#1a1a1a"
        strokeWidth="1.5"
      />
      <path d="M34 18c4-6 10-8 16-6" stroke="#8B5A2B" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="52" cy="10" r="5" fill="#FFE566" stroke="#1a1a1a" strokeWidth="1.8" />
      <circle cx="52" cy="10" r="2.2" fill="#FF6B7A" />
      <path
        d="M48 8l-2-3M56 8l2-3M52 5v-3"
        stroke="#FF6B7A"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Frame>
  );
}

export function TriviaBlitzIcon({ className }: IconProps) {
  return (
    <Frame className={className}>
      <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="3" />
      <path
        d="M32 18v6M32 40v6M18 32h6M40 32h6"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="32" cy="32" r="5" fill="currentColor" />
    </Frame>
  );
}

export function CharadesIcon({ className }: IconProps) {
  return (
    <Frame className={className}>
      <circle cx="32" cy="18" r="8" stroke="currentColor" strokeWidth="3" />
      <path
        d="M20 54c2-14 8-20 12-20s10 6 12 20"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M14 34h12M38 28h12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </Frame>
  );
}

export function SpyfallIcon({ className }: IconProps) {
  return (
    <Frame className={className}>
      <path
        d="M8 32s10-14 24-14 24 14 24 14-10 14-24 14S8 32 8 32z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="32" r="7" stroke="currentColor" strokeWidth="3" />
      <circle cx="32" cy="32" r="2.5" fill="currentColor" />
    </Frame>
  );
}

export function RedFlagIcon({ className }: IconProps) {
  return (
    <Frame className={className}>
      <path d="M18 12v40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M18 14h28l-6 10 6 10H18"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </Frame>
  );
}

const ICONS: Record<CatalogGameId, ComponentType<IconProps>> = {
  "tic-tac-toe": TicTacToeIcon,
  "connect-four": ConnectFourIcon,
  "rock-paper-scissors": RockPaperScissorsIcon,
  "draw-guess": DrawGuessIcon,
  imposter: ImposterIcon,
  "word-rush": WordRushIcon,
  "bomb-party": BombPartyIcon,
  "trivia-blitz": TriviaBlitzIcon,
  charades: CharadesIcon,
  spyfall: SpyfallIcon,
  "red-flag": RedFlagIcon,
};

export function GameIcon({ id, className }: { id: CatalogGameId; className?: string }) {
  const Icon = ICONS[id];
  return <Icon className={className} />;
}
