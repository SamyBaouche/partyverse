import type { PartyTransport, PubSubTransportOptions } from "./types";

/**
 * Real Azure Web PubSub transport (stub until #19 negotiate lands).
 * Same `PartyTransport` shape as the mock — UI stays transport-agnostic.
 */
export function createPubSubTransport(options: PubSubTransportOptions): PartyTransport {
  const negotiateUrl = options.negotiateUrl ?? `/api/negotiate?code=${options.code}`;
  const listeners = new Set<(raw: unknown) => void>();
  let socket: WebSocket | null = null;

  return {
    async connect() {
      const response = await fetch(negotiateUrl);
      if (!response.ok) {
        throw new Error(`Negotiate failed (${response.status})`);
      }
      const data = (await response.json()) as { url?: string };
      if (!data.url) {
        throw new Error("Negotiate response missing url");
      }

      await new Promise<void>((resolve, reject) => {
        const ws = new WebSocket(data.url!);
        socket = ws;
        ws.addEventListener("open", () => resolve());
        ws.addEventListener("error", () => reject(new Error("WebSocket connection failed")));
        ws.addEventListener("message", (event) => {
          try {
            const raw = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
            for (const listener of listeners) {
              listener(raw);
            }
          } catch {
            // Ignore non-JSON frames
          }
        });
        ws.addEventListener("close", () => {
          socket = null;
        });
      });
    },

    disconnect() {
      socket?.close();
      socket = null;
    },

    send(message) {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        throw new Error("WebSocket is not open");
      }
      socket.send(JSON.stringify(message));
    },

    subscribe(onMessage) {
      listeners.add(onMessage);
      return () => {
        listeners.delete(onMessage);
      };
    },
  };
}
