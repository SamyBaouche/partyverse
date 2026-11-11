import { useEffect, useState } from "react";
import type { Player } from "@partyverse/shared";

const MOCK_CODE = "KXPM";
const MOCK_NAMES = ["Samy", "Momo", "Lina", "Alex", "Noah"] as const;

export function useMockLobby() {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    let index = 0;

    const intervalId = window.setInterval(() => {
      const name = MOCK_NAMES[index];
      if (name === undefined) {
        window.clearInterval(intervalId);
        return;
      }

      const id = `mock-${index + 1}`;
      index += 1;

      setPlayers((previous) => [...previous, { id, name, score: 0 }]);
    }, 2000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return { code: MOCK_CODE, players };
}
