import { GAME_MODES } from "@partyverse/shared";
import type { CatalogGame, DrawMode } from "./types";

/** Coming-soon catalog entries (not GameMode plugins yet). */
const LOCKED_GAMES: CatalogGame[] = [
  {
    id: "imposter",
    title: "Impostor",
    tagline: "FIND THE FAKE",
    blurb: "Someone doesn't know the word. Talk, bluff, and vote them out.",
    accent: "#A8E6FF",
    locked: true,
  },
  {
    id: "word-rush",
    title: "Quiz Rush",
    tagline: "TYPE FAST",
    blurb: "Speed prompts hit the room. First correct answer wins the point.",
    accent: "#D4B8FF",
    locked: true,
  },
  {
    id: "bomb-party",
    title: "Punchline Battle",
    tagline: "PASS THE BOMB",
    blurb: "Type a word with the letters before the bomb pops.",
    accent: "#B8F2C8",
    locked: true,
  },
  {
    id: "trivia-blitz",
    title: "Estimation",
    tagline: "QUICK ANSWERS",
    blurb: "Fast questions, loud buzzers, and a climbing scoreboard.",
    accent: "#FFC4A8",
    locked: true,
  },
  {
    id: "charades",
    title: "Most Likely To",
    tagline: "ACT IT OUT",
    blurb: "No talking — mime the prompt while your team guesses.",
    accent: "#C8D4FF",
    locked: true,
  },
  {
    id: "spyfall",
    title: "Bluff",
    tagline: "SPOT THE SPY",
    blurb: "Everyone knows the place except one spy. Ask carefully.",
    accent: "#F5D0A9",
    locked: true,
  },
  {
    id: "red-flag",
    title: "Reflex",
    tagline: "VOTE THE WORST",
    blurb: "Wild dating pitches. Vote the biggest red flag in the room.",
    accent: "#E8C4FF",
    locked: true,
  },
];

/** Lobby picker: GameMode registry first, then locked Coming soon. */
export const CATALOG_GAMES: CatalogGame[] = [
  ...GAME_MODES.map((mode): CatalogGame => ({
    id: mode.id,
    title: mode.title,
    tagline: mode.tagline,
    blurb: mode.blurb,
    accent: mode.accent,
    locked: false,
  })),
  ...LOCKED_GAMES,
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
