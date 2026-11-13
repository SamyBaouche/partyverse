import { useEffect, useRef } from "react";
import type { Player } from "@partyverse/shared";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { Button, Card, PlayerAvatar } from "../../components/ui";
import { useSound } from "../../lib/audio";

type HostLobbyProps = {
  code: string;
  joinUrl: string;
  players: Player[];
  maxPlayers: number;
  onStart: () => void;
  startLabel?: string;
};

function LobbyPlayerRow({ player }: { player: Player }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.li
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.8, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, scale: 0.9 }}
      transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 22 }}
      className="flex items-center gap-3 rounded-2xl border-[3px] border-ink bg-[#fffaf2] px-3 py-2"
    >
      <PlayerAvatar name={player.name} size="md" />
      <span className="font-body text-lg font-semibold text-ink">{player.name}</span>
    </motion.li>
  );
}

export function HostLobby({
  code,
  joinUrl,
  players,
  maxPlayers,
  onStart,
  startLabel = "Start game",
}: HostLobbyProps) {
  const emptySlots = Math.max(0, maxPlayers - players.length);
  const canStart = players.length >= 1;
  const { play } = useSound();
  const previousCount = useRef(players.length);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (players.length > previousCount.current) {
      play("join");
    }
    previousCount.current = players.length;
  }, [players.length, play]);

  return (
    <motion.div
      className="flex w-full max-w-6xl flex-col gap-10 px-6"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.35 }}
    >
      <div className="grid items-start gap-10 lg:grid-cols-2">
        <section className="flex flex-col items-center gap-6 text-center">
          <p className="font-display text-[10px] uppercase tracking-[0.35em] text-ink/70">
            Room code
          </p>
          <p
            className="room-code font-display text-4xl leading-tight sm:text-5xl md:text-6xl"
            aria-label={`Room code ${code}`}
          >
            {code}
          </p>
          <div className="toy-panel rounded-[1.4rem] bg-white p-4">
            <QRCodeSVG value={joinUrl} size={220} aria-label="Scan to join" />
          </div>
          <div className="space-y-2">
            <p className="inline-flex rounded-full border-[3px] border-ink bg-[#ffe566] px-3 py-1 font-display text-[10px] uppercase tracking-widest text-ink">
              Scan to join
            </p>
            <p className="font-body break-all text-sm text-ink/70">{joinUrl}</p>
          </div>
        </section>

        <section>
          <Card className="flex flex-col gap-4">
            <h2 className="font-display text-sm uppercase leading-relaxed text-ink sm:text-base">
              Players ({players.length}/{maxPlayers})
            </h2>
            <ul className="flex flex-col gap-2">
              <AnimatePresence initial={false}>
                {players.map((player) => (
                  <LobbyPlayerRow key={player.id} player={player} />
                ))}
              </AnimatePresence>
              {Array.from({ length: emptySlots }, (_, index) => (
                <li
                  key={`empty-${index}`}
                  className="flex h-14 items-center justify-center rounded-2xl border-[3px] border-dashed border-ink/40 font-body text-sm text-muted"
                >
                  Waiting for player…
                </li>
              ))}
            </ul>
          </Card>
        </section>
      </div>

      <div className="flex flex-col items-center gap-2">
        <Button size="lg" className="min-w-64 px-10" disabled={!canStart} onClick={onStart}>
          {startLabel}
        </Button>
        {!canStart ? (
          <p className="font-body text-sm text-muted">Waiting for the first player…</p>
        ) : null}
      </div>
    </motion.div>
  );
}
