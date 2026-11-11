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
      className="flex items-center gap-3 rounded-xl border border-accent/20 bg-surface-raised/70 px-3 py-2"
    >
      <PlayerAvatar name={player.name} size="md" />
      <span className="font-body text-lg font-medium text-white">{player.name}</span>
    </motion.li>
  );
}

export function HostLobby({ code, joinUrl, players, maxPlayers, onStart }: HostLobbyProps) {
  const emptySlots = Math.max(0, maxPlayers - players.length);
  const canStart = players.length >= 2;
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
          <p className="font-display text-[10px] uppercase tracking-[0.35em] text-accent neon-text-cyan">
            Room code
          </p>
          <p
            className="blink-soft neon-text font-display text-4xl leading-tight text-white sm:text-5xl md:text-6xl"
            aria-label={`Room code ${code}`}
          >
            {code}
          </p>
          <div className="rounded-2xl border border-accent/50 bg-white p-4 neon-border">
            <QRCodeSVG value={joinUrl} size={220} aria-label="Scan to join" />
          </div>
          <div className="space-y-2">
            <p className="font-display text-[11px] uppercase tracking-widest text-neon-yellow neon-text-cyan">
              Scan to join
            </p>
            <p className="font-body break-all text-sm text-slate-300">{joinUrl}</p>
          </div>
        </section>

        <section>
          <Card className="flex flex-col gap-4">
            <h2 className="font-display text-sm uppercase leading-relaxed text-white neon-text-cyan sm:text-base">
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
                  className="flex h-14 items-center justify-center rounded-xl border border-dashed border-accent/30 font-body text-sm text-slate-400"
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
          Start game
        </Button>
        {!canStart ? (
          <p className="font-body text-sm text-slate-300">At least 2 players needed</p>
        ) : null}
      </div>
    </motion.div>
  );
}
