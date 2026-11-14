import { useEffect, type ReactNode } from "react";
import { usePartyStore } from "./partyStore";
import { createMockTransport } from "./transports/mockTransport";
import { createPubSubTransport } from "./transports/pubSubTransport";
import type { MockTransportOptions } from "./transports/types";

export type PartyTransportMode = "mock" | "pubsub";

type PartyProviderProps = {
  code: string;
  selfId: string;
  selfName: string;
  role?: MockTransportOptions["role"];
  /** Defaults from env: `VITE_USE_MOCK=true` → mock; else pubsub (or `VITE_PARTY_TRANSPORT`). */
  mode?: PartyTransportMode;
  children: ReactNode;
};

export function resolvePartyTransportMode(explicit?: PartyTransportMode): PartyTransportMode {
  if (explicit) {
    return explicit;
  }
  if (import.meta.env.VITE_USE_MOCK === "true") {
    return "mock";
  }
  if (import.meta.env.VITE_USE_MOCK === "false") {
    return "pubsub";
  }
  const fromEnv = import.meta.env.VITE_PARTY_TRANSPORT;
  if (fromEnv === "mock" || fromEnv === "pubsub") {
    return fromEnv;
  }
  return import.meta.env.DEV ? "mock" : "pubsub";
}

/**
 * Binds a transport (mock or Azure) to the Zustand party store and
 * forwards every inbound frame through Zod `ingestServer`.
 */
export function PartyProvider({
  code,
  selfId,
  selfName,
  role = "guesser",
  mode,
  children,
}: PartyProviderProps) {
  const resolved = resolvePartyTransportMode(mode);

  useEffect(() => {
    const transport =
      resolved === "mock"
        ? createMockTransport({ selfId, selfName, role })
        : createPubSubTransport({ code, userId: selfId });

    usePartyStore.getState().reset();
    usePartyStore.getState().applyMeta({ code, selfId, selfName });
    usePartyStore.getState().setTransport(transport);

    const unsubscribe = transport.subscribe((raw) => {
      usePartyStore.getState().ingestServer(raw);
    });

    let cancelled = false;
    void (async () => {
      try {
        usePartyStore.getState().setConnection("connecting");
        await transport.connect();
        if (!cancelled) {
          usePartyStore.getState().setConnection("connected");
        }
        if (cancelled) {
          transport.disconnect();
        }
      } catch (error) {
        if (!cancelled) {
          usePartyStore
            .getState()
            .setConnection("error", error instanceof Error ? error.message : "Connection failed");
        }
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe();
      transport.disconnect();
      usePartyStore.getState().setTransport(null);
    };
  }, [code, resolved, role, selfId, selfName]);

  return children;
}
