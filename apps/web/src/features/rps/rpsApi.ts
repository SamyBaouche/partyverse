import type { DuelMode, RpsChoice, RpsState, RpsTeam } from "@partyverse/shared";

type RpsCommandBody =
  | { type: "bootstrap"; mode: DuelMode }
  | { type: "joinTeam"; playerId: string; name: string; team: RpsTeam }
  | { type: "start" }
  | { type: "pick"; playerId: string; choice: RpsChoice }
  | { type: "lock"; playerId: string }
  | { type: "nextRound" }
  | { type: "rematch" };

export async function postRpsCommand(
  code: string,
  command: RpsCommandBody,
): Promise<RpsState> {
  const response = await fetch(`/api/rooms/${encodeURIComponent(code)}/rps`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(command),
  });
  const body = (await response.json().catch(() => ({}))) as {
    state?: RpsState;
    message?: string;
    error?: string;
  };
  if (!response.ok || !body.state) {
    throw new Error(body.message ?? body.error ?? "Rock Paper Scissors command failed");
  }
  return body.state;
}
