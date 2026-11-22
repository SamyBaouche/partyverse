import type { DuelMode, TicTacToeMark, TicTacToeState } from "@partyverse/shared";

type TttCommandBody =
  | { type: "bootstrap"; mode: DuelMode }
  | { type: "joinTeam"; playerId: string; name: string; team: TicTacToeMark }
  | { type: "start" }
  | { type: "place"; playerId: string; index: number }
  | { type: "rematch" };

export async function postTttCommand(
  code: string,
  command: TttCommandBody,
): Promise<TicTacToeState> {
  const response = await fetch(`/api/rooms/${encodeURIComponent(code)}/ttt`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(command),
  });
  const body = (await response.json().catch(() => ({}))) as {
    state?: TicTacToeState;
    message?: string;
    error?: string;
  };
  if (!response.ok || !body.state) {
    throw new Error(body.message ?? body.error ?? "Tic-Tac-Toe command failed");
  }
  return body.state;
}
