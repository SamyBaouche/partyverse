import type { DuelMode, RpsChoice, RpsPlayer, RpsState, RpsTeam } from "../session/types";

export function createRpsLobby(mode: DuelMode): RpsState {
  return {
    mode,
    players: [],
    picks: {},
    locked: {},
    scores: { yellow: 0, red: 0 },
    round: 1,
    lastResult: null,
    status: "lobby",
    targetScore: mode === "1v1" ? 3 : 5,
  };
}

export function rpsTeamCapacity(mode: DuelMode): number {
  return mode === "1v1" ? 1 : 2;
}

export function rpsRequiredPlayers(mode: DuelMode): number {
  return mode === "1v1" ? 2 : 4;
}

export function rpsTeamCount(players: RpsPlayer[], team: RpsTeam): number {
  return players.filter((player) => player.team === team).length;
}

export function rpsCanJoin(state: RpsState, team: RpsTeam): boolean {
  return rpsTeamCount(state.players, team) < rpsTeamCapacity(state.mode);
}

export function rpsLobbyReady(state: RpsState): boolean {
  return (
    rpsTeamCount(state.players, "yellow") >= 1 &&
    rpsTeamCount(state.players, "red") >= 1 &&
    state.players.length >= Math.min(2, rpsRequiredPlayers(state.mode))
  );
}

export function joinRpsTeam(
  state: RpsState,
  player: { id: string; name: string },
  team: RpsTeam,
): RpsState | null {
  if (state.status !== "lobby" || !rpsCanJoin(state, team)) {
    return null;
  }
  if (state.players.some((entry) => entry.id === player.id)) {
    return {
      ...state,
      players: state.players.map((entry) =>
        entry.id === player.id ? { ...entry, team, name: player.name } : entry,
      ),
    };
  }
  return {
    ...state,
    players: [...state.players, { id: player.id, name: player.name, team }],
  };
}

export function startRps(state: RpsState): RpsState {
  return {
    ...state,
    picks: {},
    locked: {},
    scores: { yellow: 0, red: 0 },
    round: 1,
    lastResult: null,
    status: "picking",
  };
}

export function setRpsPick(state: RpsState, team: RpsTeam, choice: RpsChoice): RpsState | null {
  if (state.status !== "picking" || state.locked[team]) {
    return null;
  }
  return {
    ...state,
    picks: { ...state.picks, [team]: choice },
  };
}

export function lockRpsPick(state: RpsState, team: RpsTeam): RpsState | null {
  if (state.status !== "picking" || !state.picks[team]) {
    return null;
  }
  const locked = { ...state.locked, [team]: true };
  const bothLocked = Boolean(locked.yellow && locked.red);
  if (!bothLocked) {
    return { ...state, locked };
  }
  return revealRps({ ...state, locked });
}

function beats(a: RpsChoice, b: RpsChoice): boolean {
  return (
    (a === "rock" && b === "scissors") ||
    (a === "paper" && b === "rock") ||
    (a === "scissors" && b === "paper")
  );
}

function revealRps(state: RpsState): RpsState {
  const yellow = state.picks.yellow;
  const red = state.picks.red;
  let lastResult: RpsTeam | "draw" | null = "draw";
  const scores = { ...state.scores };
  if (yellow && red) {
    if (beats(yellow, red)) {
      lastResult = "yellow";
      scores.yellow += 1;
    } else if (beats(red, yellow)) {
      lastResult = "red";
      scores.red += 1;
    }
  }
  const ended =
    scores.yellow >= state.targetScore || scores.red >= state.targetScore;
  return {
    ...state,
    scores,
    lastResult,
    status: ended ? "ended" : "reveal",
  };
}

export function nextRpsRound(state: RpsState): RpsState {
  if (state.status === "ended") {
    return state;
  }
  return {
    ...state,
    picks: {},
    locked: {},
    lastResult: null,
    round: state.round + 1,
    status: "picking",
  };
}

export function rematchRps(state: RpsState): RpsState {
  return startRps({ ...state, status: "lobby" });
}

export function formatRpsStatus(state: RpsState): string {
  if (state.status === "ended") {
    if (state.scores.yellow > state.scores.red) {
      return "Yellow wins the match";
    }
    if (state.scores.red > state.scores.yellow) {
      return "Red wins the match";
    }
    return "Match over";
  }
  if (state.status === "reveal") {
    if (state.lastResult === "draw") {
      return "Draw this round";
    }
    if (state.lastResult === "yellow") {
      return "Yellow wins the round";
    }
    if (state.lastResult === "red") {
      return "Red wins the round";
    }
  }
  return `Round ${state.round} · first to ${state.targetScore}`;
}

export const RPS_LABELS: Record<RpsChoice, string> = {
  rock: "Rock",
  paper: "Paper",
  scissors: "Scissors",
};
