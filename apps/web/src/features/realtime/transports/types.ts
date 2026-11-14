import type { ClientMessage } from "@partyverse/shared";

export type PartyTransport = {
  connect: () => Promise<void> | void;
  disconnect: () => void;
  send: (message: ClientMessage) => void;
  /** Register a listener for inbound server frames (already JSON-parsed objects). */
  subscribe: (onMessage: (raw: unknown) => void) => () => void;
};

export type MockTransportOptions = {
  selfId: string;
  selfName: string;
  role: "drawer" | "guesser";
  maxRounds?: number;
  /** Round length in ms (default 45s). */
  roundMs?: number;
  /** Auto-start drawing after join delay (DEV mock). */
  autoStartMs?: number;
};

export type PubSubTransportOptions = {
  code: string;
  userId: string;
  negotiateUrl?: string;
};
