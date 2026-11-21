import { CosmosClient, type Container } from "@azure/cosmos";
import type { RoomDocument, RoomStore } from "./roomStore.js";

export type CosmosRoomStoreOptions = {
  connectionString: string;
  databaseId?: string;
  containerId?: string;
};

export async function createCosmosRoomStore(
  options: CosmosRoomStoreOptions,
): Promise<RoomStore> {
  const client = new CosmosClient(options.connectionString);
  const databaseId = options.databaseId ?? "partyverse";
  const containerId = options.containerId ?? "rooms";
  const { database } = await client.databases.createIfNotExists({ id: databaseId });
  const { container } = await database.containers.createIfNotExists({
    id: containerId,
    partitionKey: { paths: ["/code"] },
    defaultTtl: 86400,
  });
  return new CosmosRoomStore(container);
}

class CosmosRoomStore implements RoomStore {
  constructor(private readonly container: Container) {}

  async get(code: string): Promise<RoomDocument | null> {
    const key = code.toUpperCase();
    try {
      const { resource } = await this.container.item(key, key).read<RoomDocument>();
      return resource ?? null;
    } catch (error) {
      const status = (error as { code?: number }).code;
      if (status === 404) {
        return null;
      }
      throw error;
    }
  }

  async upsert(doc: RoomDocument): Promise<void> {
    const key = doc.code.toUpperCase();
    await this.container.items.upsert({
      ...doc,
      id: key,
      code: key,
      updatedAt: Date.now(),
      ttl: 86400,
    });
  }

  async delete(code: string): Promise<void> {
    const key = code.toUpperCase();
    try {
      await this.container.item(key, key).delete();
    } catch (error) {
      const status = (error as { code?: number }).code;
      if (status !== 404) {
        throw error;
      }
    }
  }
}
