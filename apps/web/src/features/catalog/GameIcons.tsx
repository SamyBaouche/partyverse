import type { ComponentType, ReactNode } from "react";
import type { CatalogGameId } from "../session/types";

type IconProps = { className?: string };

function Frame({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden fill="none">
      {children}
    </svg>
  );
}

/** Pencil drawing on a tablet / screen. */
export function DrawGuessIcon({ className }: IconProps) {
  return (
    <Frame className={className}>
      <rect x="8" y="8" width="48" height="40" rx="6" fill="#FFF8EC" stroke="#1a1a1a" strokeWidth="2.5" />
      <rect x="12" y="12" width="40" height="32" rx="3" fill="#E8F4FF" stroke="#1a1a1a" strokeWidth="1.75" />
      <path
        d="M18 36c5-12 10-16 15-12 4 3 7 10 13 4"
        stroke="#1a1a1a"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="40" cy="20" r="2.2" fill="#FF6B7A" stroke="#1a1a1a" strokeWidth="1.2" />
      {/* Pencil */}
      <g transform="translate(38 34) rotate(-35)">
        <rect x="0" y="0" width="18" height="5" rx="1.5" fill="#FFE566" stroke="#1a1a1a" strokeWidth="1.5" />
        <path d="M18 0l6 2.5L18 5" fill="#F4C4A0" stroke="#1a1a1a" strokeWidth="1.3" strokeLinejoin="round" />
        <rect x="0" y="0" width="3.5" height="5" fill="#FF6B7A" stroke="#1a1a1a" strokeWidth="1.2" />
        <path d="M22 1.5l2 1-2 1" fill="#1a1a1a" />
      </g>
      <rect x="22" y="50" width="20" height="6" rx="2" fill="#D4D4D4" stroke="#1a1a1a" strokeWidth="1.5" />
    </Frame>
  );
}

export function TicTacToeIcon({ className }: IconProps) {
  // Larger board; marks inset so X / O never leave their cell.
  const xMark = (cx: number, cy: number) => {
    const s = 4.2;
    return (
      <path
        key={`x-${cx}-${cy}`}
        d={`M${cx - s} ${cy - s}l${s * 2} ${s * 2}M${cx + s} ${cy - s}l${-s * 2} ${s * 2}`}
        stroke="#FF6B7A"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    );
  };
  const oMark = (cx: number, cy: number) => (
    <circle
      key={`o-${cx}-${cy}`}
      cx={cx}
      cy={cy}
      r="4"
      stroke="#4EA1FF"
      strokeWidth="2.6"
    />
  );

  return (
    <Frame className={className}>
      <rect x="4" y="4" width="56" height="56" rx="10" fill="#fff" stroke="#1a1a1a" strokeWidth="3" />
      <path
        d="M22.7 8v48M41.3 8v48M8 22.7h48M8 41.3h48"
        stroke="#1a1a1a"
        strokeWidth="2.4"
      />
      {/* Cell centers ~13.3 / 32 / 50.7 — marks stay inside each square */}
      {xMark(13.3, 13.3)}
      {oMark(32, 13.3)}
      {xMark(50.7, 13.3)}
      {oMark(13.3, 32)}
      {xMark(32, 32)}
      {oMark(50.7, 32)}
      {oMark(13.3, 50.7)}
      {xMark(32, 50.7)}
      {oMark(50.7, 50.7)}
    </Frame>
  );
}

/** Blue board with yellow + red discs. */
export function ConnectFourIcon({ className }: IconProps) {
  const cells: Array<"empty" | "yellow" | "red">[] = [
    ["empty", "empty", "empty", "empty", "empty"],
    ["empty", "empty", "yellow", "empty", "empty"],
    ["empty", "red", "yellow", "red", "empty"],
    ["yellow", "red", "yellow", "red", "yellow"],
  ];

  return (
    <Frame className={className}>
      <rect x="6" y="10" width="52" height="44" rx="8" fill="#3B6FE8" stroke="#1a1a1a" strokeWidth="3" />
      {cells.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <circle
            key={`${rowIndex}-${colIndex}`}
            cx={14 + colIndex * 9}
            cy={18 + rowIndex * 9}
            r="3.4"
            fill={cell === "yellow" ? "#FFE566" : cell === "red" ? "#FF6B7A" : "#E8F2FF"}
            stroke="#1a1a1a"
            strokeWidth="1.5"
          />
        )),
      )}
    </Frame>
  );
}

/** Rock (pierre), scissors (ciseaux), paper (feuille). */
export function RockPaperScissorsIcon({ className }: IconProps) {
  return (
    <Frame className={className}>
      {/* Rock / pierre */}
      <g>
        <path
          d="M6 42c0-8 4-16 12-18 3-1 6 0 8 2 2-4 6-6 10-5 5 1 8 6 8 12 0 2-.3 4-1 6H7c-.6-2-1-4-1-7z"
          fill="#9CA3AF"
          stroke="#1a1a1a"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M14 36c2-3 5-4 8-3M22 40c3-2 6-2 9 0"
          stroke="#1a1a1a"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.55"
        />
      </g>

      {/* Scissors / ciseaux */}
      <g transform="translate(22 4)">
        <circle cx="8" cy="34" r="5.5" fill="#FFE566" stroke="#1a1a1a" strokeWidth="2" />
        <circle cx="20" cy="34" r="5.5" fill="#FFE566" stroke="#1a1a1a" strokeWidth="2" />
        <circle cx="8" cy="34" r="2" fill="#fff" stroke="#1a1a1a" strokeWidth="1.4" />
        <circle cx="20" cy="34" r="2" fill="#fff" stroke="#1a1a1a" strokeWidth="1.4" />
        <path
          d="M10 30 L18 8"
          stroke="#94A3B8"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M18 30 L10 8"
          stroke="#94A3B8"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path d="M10 30 L18 8M18 30 L10 8" stroke="#1a1a1a" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="14" cy="22" r="2.2" fill="#FF6B7A" stroke="#1a1a1a" strokeWidth="1.5" />
      </g>

      {/* Paper / feuille */}
      <g transform="translate(40 10)">
        <path
          d="M4 6h12l6 6v28H4V6z"
          fill="#FFF8EC"
          stroke="#1a1a1a"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path d="M16 6v6h6" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinejoin="round" />
        <path
          d="M8 22h10M8 28h10M8 34h7"
          stroke="#1a1a1a"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.7"
        />
      </g>
    </Frame>
  );
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
      <rect x="34" y="42" width="5" height="4" rx="1" fill="#6B3F1D" stroke="#1a1a1a" strokeWidth="1.4" />
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
      <rect x="26" y="18" width="8" height="6" rx="1.5" fill="#6B7280" stroke="#1a1a1a" strokeWidth="1.5" />
      <path
        d="M34 18c4-6 10-8 16-6"
        stroke="#8B5A2B"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="52" cy="10" r="5" fill="#FFE566" stroke="#1a1a1a" strokeWidth="1.8" />
      <circle cx="52" cy="10" r="2.2" fill="#FF6B7A" />
      <path d="M48 8l-2-3M56 8l2-3M52 5v-3" stroke="#FF6B7A" strokeWidth="1.5" strokeLinecap="round" />
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
