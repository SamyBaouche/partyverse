import Fastify from "fastify";
import fastifyExpress from "@fastify/express";
import { WebPubSubServiceClient } from "@azure/web-pubsub";
import { isRoomActivity, RoomActivityBody } from "./activity/validateActivity.js";
import { getRoomActivity, setRoomActivity } from "./session.js";
import { GameSessionManager } from "./game/session.js";
import {
  AzureRealtimePublisher,
  createAzureTokenFn,
  type ClientAccessTokenFn,
  type RealtimePublisher,
} from "./realtime/publisher.js";
import { startKartLoop } from "./game/kartLoop.js";
import { registerApiRoutes } from "./realtime/routes.js";
import { createWebPubSubEventHandler } from "./realtime/eventHandler.js";

export type BuildAppOptions = {
  sessions?: GameSessionManager;
  publisher?: RealtimePublisher;
  getClientAccessToken?: ClientAccessTokenFn;
  /** When set, mounts the Azure Web PubSub event handler (skipped in pure unit tests). */
  webPubSub?: {
    connectionString: string;
    hub: string;
    allowedEndpoints?: string[];
  };
};

export async function buildApp(options: BuildAppOptions = {}) {
  const app = Fastify({ logger: true });

  let publisher = options.publisher;
  let getClientAccessToken = options.getClientAccessToken;
  let serviceClient: WebPubSubServiceClient | undefined;

  if (options.webPubSub) {
    serviceClient = new WebPubSubServiceClient(
      options.webPubSub.connectionString,
      options.webPubSub.hub,
    );
    publisher = publisher ?? new AzureRealtimePublisher(serviceClient);
    getClientAccessToken = getClientAccessToken ?? createAzureTokenFn(serviceClient);
  }

  if (!publisher || !getClientAccessToken) {
    throw new Error("buildApp requires publisher + getClientAccessToken, or webPubSub config");
  }

  const sessions = options.sessions ?? new GameSessionManager({ publisher });

  app.addHook("onRequest", async (_request, reply) => {
    reply.header("Access-Control-Allow-Origin", "*");
    reply.header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
    reply.header("Access-Control-Allow-Headers", "Content-Type");
  });

  app.options("/*", async (_request, reply) => {
    return reply.status(204).send();
  });

  app.get("/health", async () => {
    return { status: "ok", uptime: process.uptime() };
  });

  await registerApiRoutes(app, { sessions, getClientAccessToken });
  startKartLoop();

  app.get<{ Params: { code: string } }>("/api/rooms/:code/activity", async (request, reply) => {
    const code = request.params.code.toUpperCase();
    if (!/^[A-Z]{4}$/.test(code)) {
      return reply.status(400).send({ error: "INVALID_ROOM_CODE" });
    }
    return { activity: getRoomActivity(code) };
  });

  app.put<{ Params: { code: string }; Body: unknown }>(
    "/api/rooms/:code/activity",
    { schema: { body: RoomActivityBody } },
    async (request, reply) => {
      const code = request.params.code.toUpperCase();
      if (!/^[A-Z]{4}$/.test(code)) {
        return reply.status(400).send({ error: "INVALID_ROOM_CODE" });
      }
      if (!isRoomActivity(request.body)) {
        return reply.status(400).send({ error: "INVALID_ACTIVITY" });
      }
      // Tic-Tac-Toe / RPS mutations must go through command endpoints (server rules).
      if (
        (request.body.phase === "ttt-lobby" || request.body.phase === "ttt-play") &&
        "state" in request.body
      ) {
        return reply.status(400).send({
          error: "USE_TTT_COMMANDS",
          message: "Use POST /api/rooms/:code/ttt for Tic-Tac-Toe",
        });
      }
      if (
        (request.body.phase === "rps-lobby" || request.body.phase === "rps-play") &&
        "state" in request.body
      ) {
        return reply.status(400).send({
          error: "USE_RPS_COMMANDS",
          message: "Use POST /api/rooms/:code/rps for Rock Paper Scissors",
        });
      }
      if (
        (request.body.phase === "c4-lobby" || request.body.phase === "c4-play") &&
        "state" in request.body
      ) {
        return reply.status(400).send({
          error: "USE_C4_COMMANDS",
          message: "Use POST /api/rooms/:code/c4 for Four in a Row",
        });
      }
      if (
        (request.body.phase === "kart-lobby" || request.body.phase === "kart-play") &&
        "state" in request.body
      ) {
        return reply.status(400).send({
          error: "USE_KART_COMMANDS",
          message: "Use POST /api/rooms/:code/kart for Kart Rush",
        });
      }
      const activity = setRoomActivity(code, request.body);
      return { activity };
    },
  );

  if (options.webPubSub) {
    await app.register(fastifyExpress);
    const handler = createWebPubSubEventHandler({
      hub: options.webPubSub.hub,
      sessions,
      publisher,
      allowedEndpoints: options.webPubSub.allowedEndpoints,
    });
    // Express middleware for CloudEvents abuse-protection + event delivery.
    app.use(handler.getMiddleware());
  }

  return { app, sessions, publisher };
}
