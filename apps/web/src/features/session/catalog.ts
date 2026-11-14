import type { CatalogGame, DrawMode } from "./types";

export const CATALOG_GAMES: CatalogGame[] = [
  {
    id: "tic-tac-toe",
    title: "Tic-Tac-Toe",
    tagline: "THREE IN A ROW",
    blurb: "The classic 30-second showdown. Loser picks the next game.",
    accent: "#FFE566",
    locked: true,
  },
  {
    id: "connect-four",
    title: "Connect Four",
    tagline: "DROP & STACK",
    blurb: "Drop discs, block sneaky diagonals, line up four first.",
    accent: "#86E3C2",
    locked: false,
  },
  {
    id: "rock-paper-scissors",
    title: "Rock Paper Scissors",
    tagline: "PICK IN SECRET",
    blurb: "Both lock in at once, then reveal. Settle any argument.",
    accent: "#FFB4C8",
    locked: true,
  },
  {
    id: "draw-guess",
    title: "Draw Guess",
    tagline: "DRAW & GUESS",
    blurb: "One draws the secret word. Everyone else races to guess it live.",
    accent: "#FFD18A",
    locked: false,
  },
  {
    id: "imposter",
    title: "Imposter",
    tagline: "FIND THE FAKE",
    blurb: "Someone doesn't know the word. Talk, bluff, and vote them out.",
    accent: "#A8E6FF",
    locked: true,
  },
  {
    id: "word-rush",
    title: "Word Rush",
    tagline: "TYPE FAST",
    blurb: "Speed prompts hit the room. First correct answer wins the point.",
    accent: "#D4B8FF",
    locked: true,
  },
  {
    id: "bomb-party",
    title: "Bomb Party",
    tagline: "PASS THE BOMB",
    blurb: "Type a word with the letters before the bomb pops.",
    accent: "#B8F2C8",
    locked: true,
  },
  {
    id: "trivia-blitz",
    title: "Trivia Blitz",
    tagline: "QUICK ANSWERS",
    blurb: "Fast questions, loud buzzers, and a climbing scoreboard.",
    accent: "#FFC4A8",
    locked: true,
  },
  {
    id: "charades",
    title: "Charades",
    tagline: "ACT IT OUT",
    blurb: "No talking — mime the prompt while your team guesses.",
    accent: "#C8D4FF",
    locked: true,
  },
  {
    id: "spyfall",
    title: "Spyfall",
    tagline: "SPOT THE SPY",
    blurb: "Everyone knows the place except one spy. Ask carefully.",
    accent: "#F5D0A9",
    locked: true,
  },
  {
    id: "red-flag",
    title: "Red Flag",
    tagline: "VOTE THE WORST",
    blurb: "Wild dating pitches. Vote the biggest red flag in the room.",
    accent: "#E8C4FF",
    locked: true,
  },
];

export type DrawModeOption = {
  id: DrawMode;
  title: string;
  blurb: string;
  locked: boolean;
};

export const DRAW_MODES: DrawModeOption[] = [
  {
    id: "vote",
    title: "Vote",
    blurb: "Everyone draws. The room votes the best one.",
    locked: false,
  },
  {
    id: "duo",
    title: "Duo",
    blurb: "Teams of two — one draws, one guesses.",
    locked: false,
  },
  {
    id: "solo",
    title: "Solo",
    blurb: "Practice board. No pressure.",
    locked: true,
  },
  {
    id: "ai",
    title: "AI",
    blurb: "Draw against the machine. Later.",
    locked: true,
  },
];
