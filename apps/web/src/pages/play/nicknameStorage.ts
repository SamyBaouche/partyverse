const NICKNAME_STORAGE_KEY = "partyverse.nickname";
const PLAYER_ID_KEY = "partyverse.playerId";

export function readStoredNickname(): string {
  try {
    return localStorage.getItem(NICKNAME_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveNickname(name: string): void {
  try {
    localStorage.setItem(NICKNAME_STORAGE_KEY, name);
  } catch {
    // Ignore quota / private mode failures
  }
}

export function readOrCreatePlayerId(): string {
  try {
    const existing = localStorage.getItem(PLAYER_ID_KEY);
    if (existing) {
      return existing;
    }
    const id = `p-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(PLAYER_ID_KEY, id);
    return id;
  } catch {
    return `p-${Math.random().toString(36).slice(2, 10)}`;
  }
}

/** Persist the server-issued player id so refresh can soft-reconnect (#59). */
export function savePlayerId(id: string): void {
  try {
    localStorage.setItem(PLAYER_ID_KEY, id);
  } catch {
    // Ignore quota / private mode failures
  }
}

export function readStoredPlayerId(): string | null {
  try {
    return localStorage.getItem(PLAYER_ID_KEY);
  } catch {
    return null;
  }
}
