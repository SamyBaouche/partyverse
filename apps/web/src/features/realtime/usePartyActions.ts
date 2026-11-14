import { useMemo } from "react";
import type { Stroke } from "@partyverse/shared";
import { usePartyStore } from "./partyStore";

/** Typed outbound actions — every payload is validated with Zod via `sendClient`. */
export function usePartyActions() {
  return useMemo(
    () => ({
      join(code: string, name: string) {
        return usePartyStore.getState().sendClient({ type: "join", code, name });
      },
      startGame() {
        return usePartyStore.getState().sendClient({ type: "startGame" });
      },
      drawStroke(stroke: Stroke) {
        return usePartyStore.getState().sendClient({ type: "drawStroke", stroke });
      },
      clearCanvas() {
        return usePartyStore.getState().sendClient({ type: "clearCanvas" });
      },
      guess(text: string) {
        return usePartyStore.getState().sendClient({ type: "guess", text });
      },
    }),
    [],
  );
}
