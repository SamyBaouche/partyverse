import { describe, expect, it } from "vitest";
import { createMemoryRoomStore } from "./roomStore.js";

describe("memory room store", () => {
  it("round-trips activity documents", async () => {
    const store = createMemoryRoomStore();
    await store.upsert({
      id: "ABCD",
      code: "ABCD",
      hostId: "host-1",
      players: [{ id: "p1", name: "Ada", score: 0 }],
      activity: { phase: "catalog" },
      updatedAt: Date.now(),
    });
    const doc = await store.get("abcd");
    expect(doc?.hostId).toBe("host-1");
    expect(doc?.activity).toEqual({ phase: "catalog" });
    await store.delete("ABCD");
    expect(await store.get("ABCD")).toBeNull();
  });
});
