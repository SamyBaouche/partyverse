import { stepRace } from "@partyverse/shared";
import { listKartRoomCodes } from "../session.js";
import { readKartState, writeKartState } from "./kartCommands.js";

const TICK_MS = 100; // 10 Hz

let timer: ReturnType<typeof setInterval> | null = null;

/** Advance all active Kart Rush races at 10 Hz. Idempotent start. */
export function startKartLoop(): void {
  if (timer) {
    return;
  }
  timer = setInterval(() => {
    const now = Date.now();
    for (const code of listKartRoomCodes()) {
      const state = readKartState(code);
      if (!state) {
        continue;
      }
      if (state.status !== "countdown" && state.status !== "racing") {
        continue;
      }
      const next = stepRace(state, now);
      if (next.tick !== state.tick || next.status !== state.status) {
        writeKartState(code, next);
      }
    }
  }, TICK_MS);
  if (typeof timer === "object" && timer && "unref" in timer) {
    timer.unref();
  }
}

export function stopKartLoop(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
