import type { FastifyInstance } from "fastify";
import { PlayerName, RoomCode } from "@partyverse/shared";
import { RoomError } from "../game/rooms.js";
import type { GameSessionManager } from "../game/session.js";
import { roomGroupName, type ClientAccessTokenFn } from "./publisher.js";

function statusForRoomError(code: RoomError["code"]): number {
  switch (code) {
    case "INVALID_INPUT":
      return 400;
    case "ROOM_NOT_FOUND":
    case "PLAYER_NOT_FOUND":
      return 404;
    case "ROOM_FULL":
    case "GAME_STARTED":
    case "NAME_TAKEN":
    case "NOT_HOST":
      return 409;
    default:
      return 400;
  }
}

export type ApiRouteDeps = {
  sessions: GameSessionManager;
  getClientAccessToken: ClientAccessTokenFn;
};

export async function registerApiRoutes(app: FastifyInstance, deps: ApiRouteDeps): Promise<void> {
  const { sessions, getClientAccessToken } = deps;

  app.post("/api/rooms", async () => {
    const { code, hostId } = sessions.createRoom();
    return { code, hostId };
  });

  app.post<{ Params: { code: string }; Body: { name?: unknown } }>(
    "/api/rooms/:code/players",
    async (request, reply) => {
      const parsedCode = RoomCode.safeParse(request.params.code.toUpperCase());
      const parsedName = PlayerName.safeParse(request.body?.name);
      if (!parsedCode.success || !parsedName.success) {
        return reply
          .status(400)
          .send({ error: "INVALID_INPUT", message: "Invalid room code or nickname" });
      }

      try {
        const { playerId } = sessions.join(parsedCode.data, parsedName.data);
        return { playerId };
      } catch (error) {
        if (error instanceof RoomError) {
          return reply.status(statusForRoomError(error.code)).send({
            error: error.code,
            message: error.message,
          });
        }
        throw error;
      }
    },
  );

  app.get<{ Querystring: { code?: string; userId?: string } }>(
    "/api/negotiate",
    async (request, reply) => {
      const parsedCode = RoomCode.safeParse((request.query.code ?? "").toUpperCase());
      const userId = (request.query.userId ?? "").trim();
      if (!parsedCode.success || !userId) {
        return reply
          .status(400)
          .send({ error: "INVALID_INPUT", message: "code and userId are required" });
      }

      if (!sessions.isAllowedInRoom(parsedCode.data, userId)) {
        return reply.status(403).send({ error: "FORBIDDEN", message: "User is not in this room" });
      }

      const token = await getClientAccessToken({
        userId,
        groups: [roomGroupName(parsedCode.data)],
      });
      return { url: token.url };
    },
  );
}
