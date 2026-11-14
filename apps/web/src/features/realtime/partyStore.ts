import { create } from "zustand";
import { ClientMessage, ServerMessage } from "@partyverse/shared";
import {
  applyServerMessage,
  initialPartySnapshot,
  type ConnectionStatus,
  type PartySnapshot,
} from "./applyServerMessage";
import type { PartyTransport } from "./transports/types";

export type PartyMetaPatch = Partial<
  Pick<
    PartySnapshot,
    | "drawerId"
    | "wordLength"
    | "secretWord"
    | "revealedWord"
    | "lastRoundCorrect"
    | "lastGuesserId"
    | "endsAt"
    | "selfId"
    | "selfName"
    | "code"
  >
>;

type PartyStore = PartySnapshot & {
  transport: PartyTransport | null;
  setTransport: (transport: PartyTransport | null) => void;
  setConnection: (connection: ConnectionStatus, lastError?: string | null) => void;
  ingestServer: (raw: unknown) => void;
  applyMeta: (patch: PartyMetaPatch) => void;
  sendClient: (raw: unknown) => { ok: true } | { ok: false; error: string };
  reset: () => void;
};

export const usePartyStore = create<PartyStore>((set, get) => ({
  ...initialPartySnapshot(),
  transport: null,

  setTransport(transport) {
    set({ transport });
  },

  setConnection(connection, lastError = null) {
    set({ connection, lastError });
  },

  ingestServer(raw) {
    const parsed = ServerMessage.safeParse(raw);
    if (!parsed.success) {
      set({ lastError: "Invalid server message" });
      return;
    }
    set((state) => applyServerMessage(state, parsed.data));
  },

  applyMeta(patch) {
    set(patch);
  },

  sendClient(raw) {
    const parsed = ClientMessage.safeParse(raw);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid client message";
      return { ok: false, error: message };
    }
    const { transport, connection } = get();
    if (!transport || connection === "idle" || connection === "disconnected") {
      return { ok: false, error: "Not connected" };
    }
    transport.send(parsed.data);
    return { ok: true };
  },

  reset() {
    const { transport } = get();
    set({ ...initialPartySnapshot(), transport });
  },
}));
