import { useCallback, useMemo, useRef, useState } from "react";
import { normalize, type Player } from "@partyverse/shared";

const WORDS = ["cat", "pizza", "rocket"] as const;
const ROUND_MS = 45_000;
const NETWORK_DELAY_MS = 150;
const GUESSER_POINTS = 100;
const DRAWER_POINTS = 25;

export type MockRole = "drawer" | "guesser";
export type RoundEndReason = "correct" | "timeout";

export type MockRoundResult = {
  word: string;
  reason: RoundEndReason;
  drawerName: string;
  correctGuesserName: string | null;
  guesserDelta: number;
  drawerDelta: number;
};

type UseMockDrawGameArgs = {
  selfId: string;
  selfName: string;
  role: MockRole;
  maxRounds?: number;
};

/**
 * Local mock of the server draw-guess loop: drawing → reveal → next / scores.
 * Mirrors machine scoring (+100 guesser, +25 drawer).
 */
export function useMockDrawGame({ selfId, selfName, role, maxRounds = 2 }: UseMockDrawGameArgs) {
  const wordsRef = useRef([...WORDS]);
  const [round, setRound] = useState(0);
  const [endsAt, setEndsAt] = useState(0);
  const [word, setWord] = useState<string>(WORDS[0]);
  const [lastResult, setLastResult] = useState<MockRoundResult | null>(null);
  const [players, setPlayers] = useState<Player[]>(() => seedPlayers(selfId, selfName, role));
  const awardedRef = useRef(false);

  const drawer = useMemo(
    () => players.find((p) => p.id.startsWith("drawer-")) ?? players[0]!,
    [players],
  );
  const selfIsDrawer = role === "drawer";

  const startRound = useCallback((nextRound: number) => {
    const index = (nextRound - 1) % wordsRef.current.length;
    const nextWord = wordsRef.current[index] ?? WORDS[0];
    awardedRef.current = false;
    setLastResult(null);
    setRound(nextRound);
    setWord(nextWord);
    setEndsAt(Date.now() + ROUND_MS);
  }, []);

  const beginGame = useCallback(() => {
    setPlayers(seedPlayers(selfId, selfName, role));
    startRound(1);
  }, [role, selfId, selfName, startRound]);

  const applyScores = useCallback(
    (reason: RoundEndReason, guesserName: string | null) => {
      if (awardedRef.current) {
        return;
      }
      awardedRef.current = true;

      const guesserDelta = reason === "correct" ? GUESSER_POINTS : 0;
      const drawerDelta = reason === "correct" ? DRAWER_POINTS : 0;

      setPlayers((previous) =>
        previous.map((player) => {
          if (player.id === drawer.id) {
            return { ...player, score: player.score + drawerDelta };
          }
          if (reason === "correct" && player.name === guesserName) {
            return { ...player, score: player.score + guesserDelta };
          }
          return player;
        }),
      );

      setLastResult({
        word,
        reason,
        drawerName: drawer.name,
        correctGuesserName: guesserName,
        guesserDelta,
        drawerDelta,
      });
    },
    [drawer.id, drawer.name, word],
  );

  const submitGuess = useCallback(
    async (text: string): Promise<{ correct: boolean }> => {
      await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS));
      if (selfIsDrawer || awardedRef.current) {
        return { correct: false };
      }
      const correct = normalize(text) === normalize(word);
      if (correct) {
        applyScores("correct", selfName);
      }
      return { correct };
    },
    [applyScores, selfIsDrawer, selfName, word],
  );

  const endRoundTimeout = useCallback(() => {
    if (awardedRef.current) {
      return;
    }
    // Drawer mock: pretend a buddy got it so reveal still shows points often.
    if (selfIsDrawer) {
      const buddy = players.find((p) => p.id !== drawer.id);
      applyScores("correct", buddy?.name ?? "Momo");
      return;
    }
    applyScores("timeout", null);
  }, [applyScores, drawer.id, players, selfIsDrawer]);

  const hasMoreRounds = round > 0 && round < maxRounds;

  const rankedPlayers = useMemo(
    () => [...players].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)),
    [players],
  );

  return {
    round,
    maxRounds,
    word,
    endsAt,
    drawerName: drawer.name,
    wordLength: word.length,
    secretWord: word,
    players: rankedPlayers,
    lastResult,
    hasMoreRounds,
    beginGame,
    startRound,
    submitGuess,
    endRoundTimeout,
  };
}

function seedPlayers(selfId: string, selfName: string, role: MockRole): Player[] {
  if (role === "drawer") {
    return [
      { id: `drawer-${selfId}`, name: selfName, score: 0 },
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
