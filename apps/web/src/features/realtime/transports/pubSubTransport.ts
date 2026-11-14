import { WebPubSubClient } from "@azure/web-pubsub-client";
import type { ClientMessage } from "@partyverse/shared";
import type { PartyTransport, PubSubTransportOptions } from "./types";

/**
 * Azure Web PubSub transport. Tokens come from `/api/negotiate` (no client roles).
 * Outbound traffic is `sendEvent` only; inbound is `server-message` / `group-message`.
 */
export function createPubSubTransport(options: PubSubTransportOptions): PartyTransport {
  const listeners = new Set<(raw: unknown) => void>();
  let client: WebPubSubClient | null = null;

  function emit(raw: unknown) {
    for (const listener of listeners) {
      listener(raw);
    }
  }

  function ingestPayload(data: unknown) {
    if (data == null) {
      return;
    }
    if (typeof data === "string") {
      try {
        emit(JSON.parse(data));
      } catch {
        // Ignore non-JSON frames
      }
      return;
    }
    emit(data);
  }

  return {
    async connect() {
      const next = new WebPubSubClient({
        getClientAccessUrl: async () => {
          const url =
            options.negotiateUrl ??
            `/api/negotiate?code=${encodeURIComponent(options.code)}&userId=${encodeURIComponent(options.userId)}`;
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Negotiate failed (${response.status})`);
          }
          const body = (await response.json()) as { url?: string };
          if (!body.url) {
            throw new Error("Negotiate response missing url");
          }
          return body.url;
        },
      });

      next.on("server-message", (event) => {
        ingestPayload(event.message.data);
      });
      next.on("group-message", (event) => {
        ingestPayload(event.message.data);
      });

      await next.start();
      client = next;
    },

    disconnect() {
      if (client) {
        void client.stop();
        client = null;
      }
    },

    send(message: ClientMessage) {
      if (!client) {
        throw new Error("Web PubSub client is not connected");
      }
      void client.sendEvent("message", message, "json");
    },

    subscribe(onMessage) {
      listeners.add(onMessage);
      return () => {
        listeners.delete(onMessage);
      };
    },
  };
}
