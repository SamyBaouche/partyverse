import { useShallow } from "zustand/react/shallow";
import { usePartyStore } from "./partyStore";

/** Read party snapshot fields for UI (stable shallow select). */
export function useParty() {
  return usePartyStore(
    useShallow((state) => ({
      connection: state.connection,
      lastError: state.lastError,
      code: state.code,
      selfId: state.selfId,
      selfName: state.selfName,
      phase: state.phase,
      round: state.round,
      players: state.players,
      strokes: state.strokes,
      drawerId: state.drawerId,
      wordLength: state.wordLength,
      secretWord: state.secretWord,
      revealedWord: state.revealedWord,
      lastRoundCorrect: state.lastRoundCorrect,
      lastGuesserId: state.lastGuesserId,
      endsAt: state.endsAt,
      lastGuess: state.lastGuess,
    })),
  );
}

export function usePartyPlayers() {
  return usePartyStore((state) => state.players);
}

export function usePartyPhase() {
  return usePartyStore((state) => state.phase);
}
