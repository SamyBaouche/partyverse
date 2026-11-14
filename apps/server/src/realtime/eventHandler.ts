import { WebPubSubEventHandler } from "@azure/web-pubsub-express";
import { ClientMessage } from "@partyverse/shared";
import type { GameSessionManager } from "../game/session.js";
import type { RealtimePublisher } from "./publisher.js";

export type EventHandlerDeps = {
  hub: string;
  sessions: GameSessionManager;
  publisher: RealtimePublisher;
  /** Optional allow-list for the CloudEvents abuse-protection handshake. */
  allowedEndpoints?: string[];
};

/**
 * Azure Web PubSub upstream webhook. Clients sendEvent → here → Zod → machine → broadcast.
 * Mount via `@fastify/express` at the handler path (default `/eventhandler`).
 */
export function createWebPubSubEventHandler(deps: EventHandlerDeps): WebPubSubEventHandler {
  const { hub, sessions, publisher, allowedEndpoints } = deps;

  return new WebPubSubEventHandler(hub, {
    path: "/eventhandler",
    allowedEndpoints,
    onConnected: (req) => {
      // Membership is established via HTTP join / create; connection just proves the token.
      void req.context.userId;
    },
    onDisconnected: (req) => {
      const userId = req.context.userId;
      if (userId) {
        void sessions.handleDisconnect(userId);
      }
    },
    handleUserEvent: async (req, res) => {
      const userId = req.context.userId;
      if (!userId) {
        res.fail(401, "Missing userId");
        return;
      }

      const code = sessions.findCodeForUser(userId);
      if (!code) {
        await publisher.toUser(userId, {
          type: "error",
          message: "You are not in a room",
        });
        res.success();
        return;
      }

      const parsed = ClientMessage.safeParse(req.data);
      if (!parsed.success) {
        await publisher.toUser(userId, {
          type: "error",
          message: parsed.error.issues[0]?.message ?? "Invalid message",
        });
        res.success();
        return;
      }

      try {
        await sessions.handleClientMessage(code, userId, parsed.data);
      } catch (error) {
        await publisher.toUser(userId, {
          type: "error",
          message: error instanceof Error ? error.message : "Server error",
        });
      }

      res.success();
    },
  });
}
