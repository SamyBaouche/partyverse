import type { RoomActivity } from "./types";

const STORAGE_PREFIX = "partyverse.room.activity.";

function storageKey(code: string): string {
  return `${STORAGE_PREFIX}${code.toUpperCase()}`;
}

function readLocal(code: string): RoomActivity {
  try {
    const raw = localStorage.getItem(storageKey(code));
    if (!raw) {
      return { phase: "lobby" };
    }
    return JSON.parse(raw) as RoomActivity;
  } catch {
    return { phase: "lobby" };
  }
}

function writeLocal(code: string, activity: RoomActivity): void {
  try {
    localStorage.setItem(storageKey(code), JSON.stringify(activity));
    window.dispatchEvent(
      new CustomEvent("partyverse-activity", { detail: { code: code.toUpperCase(), activity } }),
    );
  } catch {
    // Ignore private mode / quota failures
  }
}

export async function fetchRoomActivity(code: string): Promise<RoomActivity> {
  try {
    const response = await fetch(`/api/rooms/${code.toUpperCase()}/activity`);
    if (!response.ok) {
      return readLocal(code);
    }
    const data = (await response.json()) as { activity: RoomActivity };
    writeLocal(code, data.activity);
    return data.activity;
  } catch {
    return readLocal(code);
  }
}

export async function publishRoomActivity(
  code: string,
  activity: RoomActivity,
): Promise<RoomActivity> {
  writeLocal(code, activity);
  try {
    const response = await fetch(`/api/rooms/${code.toUpperCase()}/activity`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(activity),
    });
    if (!response.ok) {
      return activity;
    }
    const data = (await response.json()) as { activity: RoomActivity };
    writeLocal(code, data.activity);
    return data.activity;
  } catch {
    return activity;
  }
}

export function subscribeRoomActivity(
  code: string,
  onChange: (activity: RoomActivity) => void,
): () => void {
  const upper = code.toUpperCase();

  function handleStorage(event: StorageEvent) {
    if (event.key !== storageKey(upper) || !event.newValue) {
      return;
    }
    try {
      onChange(JSON.parse(event.newValue) as RoomActivity);
    } catch {
      // ignore
    }
  }

  function handleCustom(event: Event) {
    const detail = (event as CustomEvent<{ code: string; activity: RoomActivity }>).detail;
    if (detail?.code === upper) {
      onChange(detail.activity);
    }
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener("partyverse-activity", handleCustom);

  const pollId = window.setInterval(() => {
    void fetchRoomActivity(upper).then(onChange);
  }, 350);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("partyverse-activity", handleCustom);
    window.clearInterval(pollId);
  };
}
