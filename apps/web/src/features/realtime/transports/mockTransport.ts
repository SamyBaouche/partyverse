import { normalize, type ClientMessage, type Player, type ServerMessage } from "@partyverse/shared";
import { usePartyStore } from "../partyStore";
import type { MockTransportOptions, PartyTransport } from "./types";

const WORDS = ["cat", "pizza", "rocket"] as const;
const GUESSER_POINTS = 100;
const DRAWER_POINTS = 25;

/**
 * Local transport that speaks the same ServerMessage contract as Azure will.
 * UI should not know this is a mock — only the store + Zod pipeline.
 */
export function createMockTransport(options: MockTransportOptions): PartyTransport {
  const { selfId, selfName, role, maxRounds = 2, roundMs = 45_000, autoStartMs = 3_000 } = options;

  const listeners = new Set<(raw: unknown) => void>();
  const timers = new Set<number>();
  let connected = false;
  let round = 0;
  let word: string = WORDS[0];
  let players: Player[] = [];
  let drawerId = "";
  let awarded = false;
  let endsAt = 0;

  function emit(message: ServerMessage) {
    for (const listener of listeners) {
      listener(message);
    }
  }

  function schedule(fn: () => void, ms: number) {
    const id = window.setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
  }

  function clearTimers() {
    for (const id of timers) {
      window.clearTimeout(id);
    }
    timers.clear();
  }

  function seedPlayers(): Player[] {
    if (role === "drawer") {
      return [
        { id: selfId, name: selfName, score: 0 },
        { id: "guesser-momo", name: "Momo", score: 0 },
        { id: "guesser-lina", name: "Lina", score: 0 },
      ];
    }
    return [
      { id: "drawer-samy", name: "Samy", score: 0 },
      { id: selfId, name: selfName, score: 0 },
      { id: "guesser-lina", name: "Lina", score: 0 },
    ];
  }

  function beginRound(nextRound: number) {
    round = nextRound;
    word = WORDS[(nextRound - 1) % WORDS.length] ?? WORDS[0];
    awarded = false;
    drawerId = role === "drawer" ? selfId : "drawer-samy";
    endsAt = Date.now() + roundMs;

    usePartyStore.getState().applyMeta({
      drawerId,
      wordLength: word.length,
      secretWord: word,
      revealedWord: null,
      lastRoundCorrect: null,
      lastGuesserId: null,
      endsAt,
    });

    emit({ type: "phaseChanged", phase: "drawing", round });
    emit({ type: "canvasCleared" });

    schedule(() => {
      if (!awarded && usePartyStore.getState().phase === "drawing") {
        endRound("timeout");
      }
    }, roundMs);
  }

  function endRound(reason: "correct" | "timeout", guesserId?: string) {
    if (awarded) {
      return;
    }
    awarded = true;

    let nextPlayers = players.map((player) => ({ ...player }));
    if (reason === "correct" && guesserId) {
      nextPlayers = nextPlayers.map((player) => {
        if (player.id === guesserId) {
          return { ...player, score: player.score + GUESSER_POINTS };
        }
        if (player.id === drawerId) {
          return { ...player, score: player.score + DRAWER_POINTS };
        }
        return player;
      });
    } else if (reason === "timeout" && role === "drawer") {
      // Drawer mock: pretend Momo scored so reveal still shows points.
      const buddy = nextPlayers.find((player) => player.id !== drawerId);
      if (buddy) {
        nextPlayers = nextPlayers.map((player) => {
          if (player.id === buddy.id) {
            return { ...player, score: player.score + GUESSER_POINTS };
          }
          if (player.id === drawerId) {
            return { ...player, score: player.score + DRAWER_POINTS };
          }
          return player;
        });
      }
    }

    players = nextPlayers;
    const guesserIdForMeta =
      reason === "correct"
        ? (guesserId ?? nextPlayers.find((player) => player.id !== drawerId)?.id ?? null)
        : null;
    usePartyStore.getState().applyMeta({
      revealedWord: word,
      lastRoundCorrect: reason === "correct",
      lastGuesserId: guesserIdForMeta,
    });
    emit({ type: "scoresUpdated", players });
    emit({ type: "phaseChanged", phase: "reveal", round });

    schedule(() => {
      emit({ type: "phaseChanged", phase: "scores", round });
    }, 4_200);
  }

  function handleClient(message: ClientMessage) {
    if (!connected) {
      return;
    }

    if (message.type === "join") {
      return;
    }

    if (message.type === "startGame") {
      const phase = usePartyStore.getState().phase;
      if (phase === "scores" && round < maxRounds) {
        beginRound(round + 1);
        return;
      }
      if (phase === "scores" && round >= maxRounds) {
        players = players.map((player) => ({ ...player, score: 0 }));
        emit({ type: "scoresUpdated", players });
        beginRound(1);
        return;
      }
      if (phase === "lobby") {
        beginRound(1);
      }
      return;
    }

    if (message.type === "drawStroke") {
      emit({ type: "strokeDrawn", stroke: message.stroke });
      return;
    }

    if (message.type === "clearCanvas") {
      emit({ type: "canvasCleared" });
      return;
    }

    if (message.type === "guess") {
      if (role === "drawer" || awarded) {
        emit({ type: "guessResult", playerId: selfId, correct: false });
        return;
      }
      const correct = normalize(message.text) === normalize(word);
      emit({ type: "guessResult", playerId: selfId, correct });
      if (correct) {
        endRound("correct", selfId);
      }
    }
  }

  return {
    async connect() {
      connected = true;
      usePartyStore.getState().setConnection("connecting");
      players = seedPlayers();
      usePartyStore.getState().applyMeta({
        selfId,
        selfName,
        drawerId: null,
        wordLength: 0,
        revealedWord: null,
        endsAt: 0,
      });
      usePartyStore.getState().setConnection("connected");

      for (const player of players) {
        emit({ type: "playerJoined", player });
      }
      emit({ type: "phaseChanged", phase: "lobby", round: 0 });

      if (autoStartMs > 0) {
        schedule(() => {
          if (usePartyStore.getState().phase === "lobby") {
            beginRound(1);
          }
        }, autoStartMs);
      }
    },

    disconnect() {
      connected = false;
      clearTimers();
      usePartyStore.getState().setConnection("disconnected");
    },

    send(message) {
      schedule(() => handleClient(message), 120);
    },

    subscribe(onMessage) {
      listeners.add(onMessage);
      return () => {
        listeners.delete(onMessage);
      };
    },
  };
}
