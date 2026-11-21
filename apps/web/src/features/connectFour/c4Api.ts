import type {
  ConnectFourColor,
  ConnectFourMode,
  ConnectFourState,
} from "@partyverse/shared";

type C4CommandBody =
  | { type: "bootstrap"; mode: ConnectFourMode }
  | { type: "joinTeam"; playerId: string; name: string; team: ConnectFourColor }
  | { type: "start" }
  | { type: "hover"; playerId: string; col: number }
  | { type: "drop"; playerId: string; col: number }
  | { type: "rematch" };

export async function postC4Command(
  code: string,
  command: C4CommandBody,
): Promise<ConnectFourState> {
  const response = await fetch(`/api/rooms/${encodeURIComponent(code)}/c4`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(command),
  });
  const body = (await response.json().catch(() => ({}))) as {
    state?: ConnectFourState;
    message?: string;
    error?: string;
  };
  if (!response.ok || !body.state) {
    throw new Error(body.message ?? body.error ?? "Four in a Row command failed");
  }
  return body.state;
}
