import type { CatalogGameId } from "../session/types";

export type PartyGameId = Extract<
  CatalogGameId,
  "imposter" | "word-rush" | "bomb-party" | "trivia-blitz" | "charades" | "spyfall" | "red-flag"
>;

export type PartyPlayer = {
  id: string;
  name: string;
  score: number;
  answer: string;
  ready: boolean;
  role: "crew" | "imposter" | "spy" | "actor" | "voter";
};

export type PartyGameState = {
  gameId: PartyGameId;
  players: PartyPlayer[];
  status: "lobby" | "playing" | "reveal" | "ended";
  round: number;
  prompt: string;
  secret: string;
  options: string[];
  roundEndsAt: number;
  winnerId: string | null;
};

const WORDS = [
  "pineapple",
  "spaceship",
  "umbrella",
  "kangaroo",
  "lighthouse",
  "avocado",
  "trampoline",
  "backpack",
  "volcano",
  "microphone",
];

const SYLLABLES = ["AN", "TH", "ING", "ER", "ON", "AL", "RE", "ST", "QU", "CH"];

const TRIVIA = [
  { q: "How many continents?", a: "7", options: ["5", "6", "7", "8"] },
  { q: "Capital of France?", a: "Paris", options: ["Lyon", "Paris", "Rome", "Madrid"] },
  { q: "Planet closest to the Sun?", a: "Mercury", options: ["Venus", "Mercury", "Mars", "Earth"] },
  { q: "How many legs does a spider have?", a: "8", options: ["6", "8", "10", "12"] },
];

const PLACES = ["Beach", "Airport", "School", "Hospital", "Casino", "Zoo", "Cinema", "Submarine"];

const CHARADES = [
  "Cooking pasta",
  "Riding a bike",
  "Brushing teeth",
  "Flying a kite",
  "Playing piano",
];

const RED_FLAGS = [
  "Says their ex is 'crazy' on date one",
  "Only texts at 2am",
  "Still lives with six roommates at 40",
  "Asks you to Venmo dinner before the appetizer",
  "Has a group chat ranking their partners",
];

export function isPartyGameId(id: string): id is PartyGameId {
  return (
    id === "imposter" ||
    id === "word-rush" ||
    id === "bomb-party" ||
    id === "trivia-blitz" ||
    id === "charades" ||
    id === "spyfall" ||
    id === "red-flag"
  );
}

export function createPartyLobby(gameId: PartyGameId): PartyGameState {
  return {
    gameId,
    players: [],
    status: "lobby",
    round: 0,
    prompt: "",
    secret: "",
    options: [],
    roundEndsAt: 0,
    winnerId: null,
  };
}

export function joinParty(state: PartyGameState, id: string, name: string): PartyGameState {
  if (state.status !== "lobby") {
    return state;
  }
  if (state.players.some((p) => p.id === id)) {
    return state;
  }
  if (state.players.length >= 8) {
    return state;
  }
  return {
    ...state,
    players: [
      ...state.players,
      {
        id,
        name,
        score: 0,
        answer: "",
        ready: false,
        role: "crew",
      },
    ],
  };
}

export function leaveParty(state: PartyGameState, id: string): PartyGameState {
  return { ...state, players: state.players.filter((p) => p.id !== id) };
}

export function startPartyRound(state: PartyGameState, now = Date.now()): PartyGameState {
  if (state.players.length < 1) {
    return state;
  }
  const round = state.round + 1;
  const deal = dealRound(state.gameId, state.players, round);
  return {
    ...state,
    status: "playing",
    round,
    prompt: deal.prompt,
    secret: deal.secret,
    options: deal.options,
    roundEndsAt: now + deal.durationMs,
    winnerId: null,
    players: deal.players,
  };
}

export function submitPartyAnswer(
  state: PartyGameState,
  playerId: string,
  answer: string,
): PartyGameState {
  if (state.status !== "playing") {
    return state;
  }
  const players = state.players.map((p) =>
    p.id === playerId ? { ...p, answer: answer.trim(), ready: true } : p,
  );
  const next = { ...state, players };
  if (players.every((p) => p.ready) || shouldAutoScore(state.gameId, answer, state.secret)) {
    return scoreRound(next);
  }
  return next;
}

export function tickPartyRound(state: PartyGameState, now = Date.now()): PartyGameState {
  if (state.status !== "playing") {
    return state;
  }
  if (now < state.roundEndsAt) {
    return state;
  }
  return scoreRound(state);
}

export function rematchParty(state: PartyGameState): PartyGameState {
  return {
    ...createPartyLobby(state.gameId),
    players: state.players.map((p) => ({
      ...p,
      score: 0,
      answer: "",
      ready: false,
      role: "crew",
    })),
  };
}

export function partyTitle(gameId: PartyGameId): string {
  switch (gameId) {
    case "imposter":
      return "Imposter";
    case "word-rush":
      return "Word Rush";
    case "bomb-party":
      return "Bomb Party";
    case "trivia-blitz":
      return "Trivia Blitz";
    case "charades":
      return "Charades";
    case "spyfall":
      return "Spyfall";
    case "red-flag":
      return "Red Flag";
  }
}

export function partyBlurb(gameId: PartyGameId): string {
  switch (gameId) {
    case "imposter":
      return "One player is the imposter. Talk, then type who you accuse.";
    case "word-rush":
      return "Type the prompt word as fast as you can.";
    case "bomb-party":
      return "Type any word that contains the syllable before the bomb pops.";
    case "trivia-blitz":
      return "Pick the right answer on your phone. First correct scores.";
    case "charades":
      return "One actor sees the prompt. Everyone else guesses on their phone.";
    case "spyfall":
      return "Everyone knows the place except the spy. Vote the spy out.";
    case "red-flag":
      return "Vote the wildest dating red flag of the round.";
  }
}

function dealRound(
  gameId: PartyGameId,
  players: PartyPlayer[],
  round: number,
): {
  prompt: string;
  secret: string;
  options: string[];
  durationMs: number;
  players: PartyPlayer[];
} {
  const reset = players.map((p) => ({ ...p, answer: "", ready: false, role: "crew" as const }));
  const pick = <T>(list: T[]) => list[(round - 1) % list.length] as T;

  if (gameId === "word-rush") {
    const word = pick(WORDS);
    return {
      prompt: `Type: ${word.toUpperCase()}`,
      secret: word,
      options: [],
      durationMs: 20000,
      players: reset,
    };
  }

  if (gameId === "bomb-party") {
    const syllable = pick(SYLLABLES);
    return {
      prompt: `Word containing “${syllable}”`,
      secret: syllable.toLowerCase(),
      options: [],
      durationMs: 15000,
      players: reset,
    };
  }

  if (gameId === "trivia-blitz") {
    const item = pick(TRIVIA);
    return {
      prompt: item.q,
      secret: item.a,
      options: item.options,
      durationMs: 18000,
      players: reset,
    };
  }

  if (gameId === "charades") {
    const prompt = pick(CHARADES);
    const actorIndex = (round - 1) % Math.max(players.length, 1);
    return {
      prompt: "Guess what they're acting out!",
      secret: prompt,
      options: [],
      durationMs: 45000,
      players: reset.map((p, index) => ({
        ...p,
        role: index === actorIndex ? "actor" : "crew",
      })),
    };
  }

  if (gameId === "imposter") {
    const word = pick(WORDS);
    const imposterIndex = (round - 1) % Math.max(players.length, 1);
    return {
      prompt: "Discuss the secret word, then accuse the imposter.",
      secret: word,
      options: reset.map((p) => p.name),
      durationMs: 60000,
      players: reset.map((p, index) => ({
        ...p,
        role: index === imposterIndex ? "imposter" : "crew",
      })),
    };
  }

  if (gameId === "spyfall") {
    const place = pick(PLACES);
    const spyIndex = (round - 1) % Math.max(players.length, 1);
    return {
      prompt: "Ask questions about the place. Vote who the spy is.",
      secret: place,
      options: reset.map((p) => p.name),
      durationMs: 60000,
      players: reset.map((p, index) => ({
        ...p,
        role: index === spyIndex ? "spy" : "crew",
      })),
    };
  }

  // red-flag
  const flag = pick(RED_FLAGS);
  return {
    prompt: "Which is the biggest red flag?",
    secret: flag,
    options: [flag, pick(RED_FLAGS), pick(RED_FLAGS)].filter(
      (value, index, arr) => arr.indexOf(value) === index,
    ),
    durationMs: 25000,
    players: reset.map((p) => ({ ...p, role: "voter" })),
  };
}

function shouldAutoScore(gameId: PartyGameId, answer: string, secret: string): boolean {
  if (gameId === "word-rush") {
    return normalize(answer) === normalize(secret);
  }
  if (gameId === "bomb-party") {
    return normalize(answer).includes(normalize(secret)) && answer.trim().length >= 3;
  }
  if (gameId === "trivia-blitz" || gameId === "charades") {
    return normalize(answer) === normalize(secret);
  }
  return false;
}

function scoreRound(state: PartyGameState): PartyGameState {
  const players = state.players.map((p) => {
    let score = p.score;
    if (
      state.gameId === "word-rush" ||
      state.gameId === "trivia-blitz" ||
      state.gameId === "charades"
    ) {
      if (normalize(p.answer) === normalize(state.secret)) {
        score += 1;
      }
    } else if (state.gameId === "bomb-party") {
      if (normalize(p.answer).includes(normalize(state.secret)) && p.answer.trim().length >= 3) {
        score += 1;
      }
    } else if (state.gameId === "imposter" || state.gameId === "spyfall") {
      const targetRole = state.gameId === "imposter" ? "imposter" : "spy";
      const target = state.players.find((player) => player.role === targetRole);
      if (target && normalize(p.answer) === normalize(target.name) && p.role !== targetRole) {
        score += 1;
      }
      if (p.role === targetRole) {
        const votes = state.players.filter(
          (voter) => normalize(voter.answer) === normalize(p.name),
        ).length;
        if (votes === 0) {
          score += 2;
        }
      }
    } else if (state.gameId === "red-flag") {
      // Majority vote wins a point for anyone who picked the plurality option.
      const counts = new Map<string, number>();
      for (const voter of state.players) {
        if (!voter.answer) {
          continue;
        }
        counts.set(voter.answer, (counts.get(voter.answer) ?? 0) + 1);
      }
      let best = "";
      let bestCount = -1;
      for (const [key, count] of counts) {
        if (count > bestCount) {
          best = key;
          bestCount = count;
        }
      }
      if (best && p.answer === best) {
        score += 1;
      }
    }
    return { ...p, score, ready: true };
  });

  const leader = [...players].sort((a, b) => b.score - a.score)[0] ?? null;
  const target = state.gameId === "trivia-blitz" || state.gameId === "word-rush" ? 5 : 3;
  const ended = Boolean(leader && leader.score >= target);

  return {
    ...state,
    players,
    status: ended ? "ended" : "reveal",
    winnerId: ended ? (leader?.id ?? null) : null,
  };
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}
