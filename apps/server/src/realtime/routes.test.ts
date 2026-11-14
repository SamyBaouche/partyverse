import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import { GameSessionManager } from "../game/session.js";
import { InMemoryPublisher } from "./publisher.js";

describe("API routes", () => {
  const apps: Array<Awaited<ReturnType<typeof buildApp>>> = [];

  afterEach(async () => {
    for (const built of apps) {
      await built.app.close();
    }
    apps.length = 0;
  });

  async function makeApp() {
    const publisher = new InMemoryPublisher();
    const sessions = new GameSessionManager({ publisher });
    const built = await buildApp({
      sessions,
      publisher,
      getClientAccessToken: async ({ userId, groups }) => ({
        url: `wss://example.test/client?user=${encodeURIComponent(userId)}&groups=${groups.join(",")}`,
      }),
    });
    apps.push(built);
    return built;
  }

  it("POST /api/rooms creates a room", async () => {
    const { app } = await makeApp();
    const res = await app.inject({ method: "POST", url: "/api/rooms" });
    expect(res.statusCode).toBe(200);
    const body = res.json() as { code: string; hostId: string };
    expect(body.code).toMatch(/^[A-Z]{4}$/);
    expect(body.hostId.length).toBeGreaterThan(0);
  });

  it("POST /api/rooms/:code/players joins and maps RoomError codes", async () => {
    const { app } = await makeApp();
    const created = await app.inject({ method: "POST", url: "/api/rooms" });
    const { code } = created.json() as { code: string };

    const ok = await app.inject({
      method: "POST",
      url: `/api/rooms/${code}/players`,
      payload: { name: "Ada" },
    });
    expect(ok.statusCode).toBe(200);
    expect((ok.json() as { playerId: string }).playerId).toBeTruthy();

    const taken = await app.inject({
      method: "POST",
      url: `/api/rooms/${code}/players`,
      payload: { name: "Ada" },
    });
    expect(taken.statusCode).toBe(409);
    expect((taken.json() as { error: string }).error).toBe("NAME_TAKEN");

    const missing = await app.inject({
      method: "POST",
      url: `/api/rooms/ZZZZ/players`,
      payload: { name: "Zoe" },
    });
    expect(missing.statusCode).toBe(404);
    expect((missing.json() as { error: string }).error).toBe("ROOM_NOT_FOUND");
  });

  it("GET /api/negotiate returns a stubbed url for room members", async () => {
    const { app } = await makeApp();
    const created = await app.inject({ method: "POST", url: "/api/rooms" });
    const { code, hostId } = created.json() as { code: string; hostId: string };

    const hostNeg = await app.inject({
      method: "GET",
      url: `/api/negotiate?code=${code}&userId=${hostId}`,
    });
    expect(hostNeg.statusCode).toBe(200);
    const hostBody = hostNeg.json() as { url: string };
    expect(hostBody.url).toContain(encodeURIComponent(hostId));
    expect(hostBody.url).toContain(`room-${code}`);

    const joined = await app.inject({
      method: "POST",
      url: `/api/rooms/${code}/players`,
      payload: { name: "Ada" },
    });
    const { playerId } = joined.json() as { playerId: string };

    const playerNeg = await app.inject({
      method: "GET",
      url: `/api/negotiate?code=${code}&userId=${playerId}`,
    });
    expect(playerNeg.statusCode).toBe(200);

    const stranger = await app.inject({
      method: "GET",
      url: `/api/negotiate?code=${code}&userId=not-a-member`,
    });
    expect(stranger.statusCode).toBe(403);
  });
});
