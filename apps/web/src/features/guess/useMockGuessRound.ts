import { useCallback, useMemo, useRef, useState } from "react";
import { normalize } from "@partyverse/shared";

const MOCK_WORD = "cat";
const ROUND_MS = 60_000;
const NETWORK_DELAY_MS = 150;

/**
 * Dev mock for a drawing round. The secret word stays inside this hook;
 * guessers only ever receive `wordLength` via the screen props.
 */
export function useMockGuessRound() {
  const wordRef = useRef(MOCK_WORD);
  const [endsAt] = useState(() => Date.now() + ROUND_MS);

  const submitGuess = useCallback(async (text: string): Promise<{ correct: boolean }> => {
    await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS));
    return {
      correct: normalize(text) === normalize(wordRef.current),
    };
  }, []);

  return useMemo(
    () => ({
      drawerName: "Samy",
      wordLength: wordRef.current.length,
      /** Only pass this to DrawerScreen — never to GuesserScreen. */
      secretWord: wordRef.current,
      endsAt,
      submitGuess,
    }),
    [endsAt, submitGuess],
  );
}
