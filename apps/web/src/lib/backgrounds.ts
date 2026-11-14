export const BACKGROUND_IDS = [
  "squabble",
  "dusk",
  "nardo",
  "mauve",
  "friv",
  "sandbox",
  "tunnel",
  "synthwave",
  "phosphor",
  "vortex",
  "hex",
  "starstreak",
  "marquee",
  "plasma",
] as const;

export type BackgroundId = (typeof BACKGROUND_IDS)[number];

export type BackgroundOption = {
  id: BackgroundId;
  title: string;
  blurb: string;
};

export const BACKGROUNDS: BackgroundOption[] = [
  {
    id: "squabble",
    title: "Cream Dots",
    blurb: "Playful cream paper with coral dots",
  },
  {
    id: "dusk",
    title: "Dusk Ember",
    blurb: "Warm ink night with soft peach light",
  },
  {
    id: "nardo",
    title: "Nardo Grey",
    blurb: "Matte grey lobby — clean mini-game hub",
  },
  {
    id: "mauve",
    title: "Mauve Lobby",
    blurb: "Soft purple mini-game portal",
  },
  {
    id: "friv",
    title: "Mini-game Lobby",
    blurb: "Soft portal vibe — sober, playful, Friv-ish",
  },
  {
    id: "sandbox",
    title: "Sandbox Minigame",
    blurb: "Dark night playground with glowing toy blocks",
  },
  {
    id: "tunnel",
    title: "Vector Tunnel",
    blurb: "Tempest-style rings, reticle, laser sweep",
  },
  {
    id: "synthwave",
    title: "Synthwave Sun",
    blurb: "Classic Outrun sun + perspective grid",
  },
  {
    id: "phosphor",
    title: "CRT Phosphor",
    blurb: "Green terminal rain on a tube screen",
  },
  {
    id: "vortex",
    title: "Neon Vortex",
    blurb: "Spinning conic swirl into a black hole",
  },
  {
    id: "hex",
    title: "Hex Hive",
    blurb: "Drifting honeycomb circuit board",
  },
  {
    id: "starstreak",
    title: "Hyperspace",
    blurb: "Asteroids-style star streaks rushing past",
  },
  {
    id: "marquee",
    title: "LED Marquee",
    blurb: "Cabinet attract-mode LED ticker stripes",
  },
  {
    id: "plasma",
    title: "Arcade Plasma",
    blurb: "Soft neon blobs, no sun / no floor grid",
  },
];

export function isBackgroundId(value: string | null): value is BackgroundId {
  return BACKGROUND_IDS.includes(value as BackgroundId);
}

export function resolveBackgroundId(value: string | null): BackgroundId {
  return isBackgroundId(value) ? value : "squabble";
}
