import { useParty, usePartyPhase, usePartyPlayers } from "./useParty";
import { usePartyActions } from "./usePartyActions";
import { usePartyStore } from "./partyStore";

/** Connection + identity slice for room UI. */
export function useRoomConnection() {
  const connection = usePartyStore((state) => state.connection);
  const lastError = usePartyStore((state) => state.lastError);
  const code = usePartyStore((state) => state.code);
  const selfId = usePartyStore((state) => state.selfId);
  const selfName = usePartyStore((state) => state.selfName);
  return { connection, lastError, code, selfId, selfName };
}

/** Game snapshot used by TV / phone screens. */
export function useGameState() {
  return useParty();
}

/** Typed outbound client messages. */
export function useSendMessage() {
  return usePartyActions();
}

export { usePartyPhase, usePartyPlayers };
