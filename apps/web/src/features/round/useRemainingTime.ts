import { useEffect, useState } from "react";

/** Whole seconds left until `endsAt` (epoch ms). Never negative. */
export function useRemainingTime(endsAt: number): number {
  const [remainingMs, setRemainingMs] = useState(() => Math.max(0, endsAt - Date.now()));

  useEffect(() => {
    function tick() {
      setRemainingMs(Math.max(0, endsAt - Date.now()));
    }
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [endsAt]);

  return Math.ceil(remainingMs / 1000);
}
