import type { KartInput, WishKartState } from "@partyverse/shared";

type KartCommandBody =
  | { type: "bootstrap" }
  | { type: "join"; playerId: string; name: string }
  | { type: "leave"; playerId: string }
  | { type: "input"; playerId: string; input: Partial<KartInput> }
  | { type: "start" }
  | { type: "rematch" };

export async function postKartCommand(
  code: string,
  command: KartCommandBody,
): Promise<WishKartState> {
  const response = await fetch(`/api/rooms/${encodeURIComponent(code)}/kart`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(command),
  });
  const body = (await response.json().catch(() => ({}))) as {
    state?: WishKartState;
    message?: string;
    error?: string;
  };
  if (!response.ok || !body.state) {
    throw new Error(body.message ?? body.error ?? "Kart Rush command failed");
  }
  return body.state;
}
