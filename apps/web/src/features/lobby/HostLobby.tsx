import { useEffect, useState } from "react";
import type { Player } from "@partyverse/shared";
import { QRCodeSVG } from "qrcode.react";
import { Button, Card, PlayerAvatar } from "../../components/ui";
import { cn } from "../../lib/cn";

type HostLobbyProps = {
  code: string;
  joinUrl: string;
  players: Player[];
  maxPlayers: number;
  onStart: () => void;
};

function LobbyPlayerRow({ player }: { player: Player }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setVisible(true);
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-xl bg-surface-raised px-3 py-2 transition-all duration-300",
        visible ? "scale-100 opacity-100" : "scale-95 opacity-0",
      )}
    >
      <PlayerAvatar name={player.name} size="md" />
      <span className="text-lg font-medium text-white">{player.name}</span>
    </li>
  );
}

export function HostLobby({ code, joinUrl, players, maxPlayers, onStart }: HostLobbyProps) {
  const emptySlots = Math.max(0, maxPlayers - players.length);
  const canStart = players.length >= 2;

  return (
    <div className="flex w-full max-w-6xl flex-col gap-10 px-6">
      <div className="grid items-start gap-10 lg:grid-cols-2">
        <section className="flex flex-col items-center gap-6 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-zinc-400">Room code</p>
          <p className="text-7xl font-black tracking-[0.35em] text-white sm:text-8xl">{code}</p>
          <div className="rounded-2xl bg-white p-4 shadow-lg">
            <QRCodeSVG value={joinUrl} size={220} aria-label="Scan to join" />
          </div>
          <div className="space-y-1">
            <p className="text-xl font-semibold text-white">Scan to join</p>
            <p className="break-all text-sm text-zinc-400">{joinUrl}</p>
          </div>
        </section>

        <section>
          <Card className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold text-white">
              Players ({players.length}/{maxPlayers})
            </h2>
            <ul className="flex flex-col gap-2">
              {players.map((player) => (
                <LobbyPlayerRow key={player.id} player={player} />
              ))}
              {Array.from({ length: emptySlots }, (_, index) => (
                <li
                  key={`empty-${index}`}
                  className="flex h-14 items-center justify-center rounded-xl border border-dashed border-zinc-700 text-sm text-zinc-500"
                >
                  Waiting for player…
                </li>
              ))}
            </ul>
          </Card>
        </section>
      </div>

      <div className="flex flex-col items-center gap-2">
        <Button size="lg" className="min-w-64 px-10 text-xl" disabled={!canStart} onClick={onStart}>
          Start game
        </Button>
        {!canStart ? <p className="text-sm text-zinc-400">At least 2 players needed</p> : null}
      </div>
    </div>
  );
}
