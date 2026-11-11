import { assign, setup } from "xstate";
import type { Player } from "@partyverse/shared";

export type GameContext = {
  players: Player[];
  round: number;
  maxRounds: number;
  drawerIndex: number;
  words: string[];
  word: string;
  guessedIds: string[];
};

export type GameEvent =
  | { type: "PLAYER_JOIN"; player: Player }
  | { type: "PLAYER_LEAVE"; playerId: string }
  | { type: "START" }
  | { type: "GUESS"; playerId: string; text: string }
  | { type: "TIMER_END" }
  | { type: "RESTART" };

// "Éléphant " → "elephant": compare without accents, case or surrounding spaces
export const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

export const drawerId = (context: GameContext) =>
  context.players[context.drawerIndex % Math.max(context.players.length, 1)]?.id;

export const gameMachine = setup({
  types: {
    context: {} as GameContext,
    events: {} as GameEvent,
    input: {} as { words: string[]; maxRounds?: number },
  },
  guards: {
    enoughPlayers: ({ context }) => context.players.length >= 2,
    isCorrectGuess: ({ context, event }) =>
      event.type === "GUESS" &&
      event.playerId !== drawerId(context) &&
      !context.guessedIds.includes(event.playerId) &&
      normalize(event.text) === normalize(context.word),
    everyoneGuessed: ({ context }) =>
      context.players.length > 1 && context.guessedIds.length >= context.players.length - 1,
    hasMoreRounds: ({ context }) => context.round < context.maxRounds,
  },
  actions: {
    addPlayer: assign({
      players: ({ context, event }) =>
        event.type === "PLAYER_JOIN" && !context.players.some((p) => p.id === event.player.id)
          ? [...context.players, event.player]
          : context.players,
    }),
    removePlayer: assign({
      players: ({ context, event }) =>
        event.type === "PLAYER_LEAVE"
          ? context.players.filter((p) => p.id !== event.playerId)
          : context.players,
    }),
    startRound: assign(({ context }) => ({
      drawerIndex: context.round % Math.max(context.players.length, 1),
      word: context.words[context.round % context.words.length] ?? "",
      round: context.round + 1,
      guessedIds: [],
    })),
    awardPoints: assign(({ context, event }) => {
      if (event.type !== "GUESS") return {};
      const drawer = drawerId(context);
      return {
        guessedIds: [...context.guessedIds, event.playerId],
        players: context.players.map((p) => {
          if (p.id === event.playerId) return { ...p, score: p.score + 100 };
          if (p.id === drawer) return { ...p, score: p.score + 25 };
          return p;
        }),
      };
    }),
    resetGame: assign(({ context }) => ({
      round: 0,
      drawerIndex: 0,
      word: "",
      guessedIds: [],
      players: context.players.map((p) => ({ ...p, score: 0 })),
    })),
  },
}).createMachine({
  id: "game",
  initial: "lobby",
  context: ({ input }) => ({
    players: [],
    round: 0,
    maxRounds: input.maxRounds ?? 3,
    drawerIndex: 0,
    words: input.words,
    word: "",
    guessedIds: [],
  }),
  on: {
    PLAYER_LEAVE: { actions: "removePlayer" },
  },
  states: {
    lobby: {
      on: {
        PLAYER_JOIN: { actions: "addPlayer" },
        START: { guard: "enoughPlayers", target: "drawing" },
      },
    },
    drawing: {
      entry: "startRound",
      always: { guard: "everyoneGuessed", target: "reveal" },
      on: {
        GUESS: { guard: "isCorrectGuess", actions: "awardPoints" },
        TIMER_END: { target: "reveal" },
      },
    },
    reveal: {
      on: {
        TIMER_END: [{ guard: "hasMoreRounds", target: "drawing" }, { target: "scores" }],
      },
    },
    scores: {
      on: {
        RESTART: { target: "lobby", actions: "resetGame" },
      },
    },
  },
});
