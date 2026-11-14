import { WebPubSubServiceClient } from "@azure/web-pubsub";
import type { ServerMessage } from "@partyverse/shared";

export type RealtimePublisher = {
  toRoom(code: string, msg: ServerMessage): Promise<void>;
  toUser(userId: string, msg: ServerMessage): Promise<void>;
};

export function roomGroupName(code: string): string {
  return `room-${code}`;
}

/** Azure Web PubSub implementation — never logs tokens or the connection string. */
export class AzureRealtimePublisher implements RealtimePublisher {
  constructor(private readonly client: WebPubSubServiceClient) {}

  async toRoom(code: string, msg: ServerMessage): Promise<void> {
    await this.client.group(roomGroupName(code)).sendToAll(msg);
  }

  async toUser(userId: string, msg: ServerMessage): Promise<void> {
    await this.client.sendToUser(userId, msg);
  }
}

/** In-memory publisher for unit tests (no Azure). */
export class InMemoryPublisher implements RealtimePublisher {
  readonly roomMessages = new Map<string, ServerMessage[]>();
  readonly userMessages = new Map<string, ServerMessage[]>();

  async toRoom(code: string, msg: ServerMessage): Promise<void> {
    const list = this.roomMessages.get(code) ?? [];
    list.push(msg);
    this.roomMessages.set(code, list);
  }

  async toUser(userId: string, msg: ServerMessage): Promise<void> {
    const list = this.userMessages.get(userId) ?? [];
    list.push(msg);
    this.userMessages.set(userId, list);
  }

  clear(): void {
    this.roomMessages.clear();
    this.userMessages.clear();
  }

  messagesForRoom(code: string): ServerMessage[] {
    return this.roomMessages.get(code) ?? [];
  }

  messagesForUser(userId: string): ServerMessage[] {
    return this.userMessages.get(userId) ?? [];
  }
}

export type ClientAccessTokenFn = (options: {
  userId: string;
  groups: string[];
}) => Promise<{ url: string }>;

export function createAzureTokenFn(client: WebPubSubServiceClient): ClientAccessTokenFn {
  return async ({ userId, groups }) => {
    // No roles: clients may only sendEvent to the server, never publish to groups.
    const token = await client.getClientAccessToken({ userId, groups });
    return { url: token.url };
  };
}
