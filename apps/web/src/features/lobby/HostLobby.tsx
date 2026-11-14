import { useEffect, useRef, useState } from "react";
import type { Player } from "@partyverse/shared";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { Button, Card, PlayerAvatar } from "../../components/ui";
import { copyText } from "../../lib/copyText";
import { useSound } from "../../lib/audio";

type HostLobbyProps = {
  code: string;
  joinUrl: string;
  players: Player[];
  maxPlayers: number;
  onStart: () => void;
  startLabel?: string;
  starting?: boolean;
};

function LobbyPlayerRow({ player, index }: { player: Player; index: number }) {
  const reduceMotion = useReducedMotion();
  const badge = index === 0 ? "Host" : "Friend";
  const tint = index === 0 ? "bg-[#FFB4C8]" : "bg-[#B8D4FF]";

  return (
    <motion.li
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.8, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, scale: 0.9 }}
      transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 22 }}
      className={`flex items-center gap-3 rounded-2xl border-[3px] border-ink px-3 py-2 ${tint}`}
    >
      <PlayerAvatar name={player.name} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-body text-lg font-semibold text-ink">{player.name}</p>
        <p className="font-display text-[8px] uppercase tracking-widest text-ink/60">{badge}</p>
      </div>
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
  starting = false,
}: HostLobbyProps) {
  const emptySlots = Math.max(0, maxPlayers - players.length);
  const canStart = players.length >= 1;
  const { play } = useSound();
  const previousCount = useRef(players.length);
  const reduceMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (players.length > previousCount.current) {
      play("join");
    }
    previousCount.current = players.length;
  }, [players.length, play]);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const id = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(id);
  }, [copied]);

  return (
    <motion.div
      className="flex w-full max-w-6xl flex-col gap-8 px-4 sm:gap-10 sm:px-6"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.35 }}
    >
      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-10">
        <section className="flex flex-col items-center gap-5 text-center">
          <p className="font-display text-[10px] uppercase tracking-[0.35em] text-ink/70">Room</p>
          <p
            className="room-code font-display text-4xl leading-tight tracking-[0.14em] sm:text-5xl md:text-6xl"
            aria-label={`Room code ${code}`}
          >
            {code.split("").join(" ")}
          </p>

          <div className="toy-panel w-full max-w-[240px] rounded-[1.4rem] bg-white p-3 sm:p-4">
            <QRCodeSVG
              value={joinUrl}
              className="h-auto w-full"
              size={200}
              aria-label="Scan to join"
            />
          </div>

          <div className="flex w-full max-w-sm flex-col gap-3">
            <Button
              variant="ghost"
              size="md"
              fullWidth
              onClick={() => {
                void copyText(joinUrl).then((ok) => {
                  if (ok) {
                    setCopied(true);
                  }
                });
              }}
            >
              {copied ? "Copied!" : "Copy invite link"}
            </Button>
            <p className="break-all font-body text-xs text-ink/60 sm:text-sm">{joinUrl}</p>
            <p className="sr-only" aria-live="polite">
              {copied ? "Invite link copied" : ""}
            </p>
          </div>
        </section>

        <section>
          <Card className="flex flex-col gap-4">
            <h2 className="font-display text-sm uppercase leading-relaxed text-ink sm:text-base">
              Players ({players.length}/{maxPlayers})
            </h2>
            <ul className="flex flex-col gap-2" aria-live="polite">
              <AnimatePresence initial={false}>
                {players.map((player, index) => (
                  <LobbyPlayerRow key={player.id} player={player} index={index} />
                ))}
              </AnimatePresence>
              {Array.from({ length: emptySlots }, (_, index) => (
                <li
                  key={`empty-${index}`}
                  className="flex h-14 items-center justify-center rounded-2xl border-[3px] border-dashed border-ink/40 font-body text-sm text-muted"
                >
                  Waiting for a friend…
                </li>
              ))}
            </ul>
          </Card>
        </section>
      </div>

      <div className="flex flex-col items-center gap-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <Button
          size="lg"
          className="min-w-64 px-10"
          disabled={!canStart}
          loading={starting}
          onClick={onStart}
        >
          {starting ? "Starting…" : startLabel}
        </Button>
        {!canStart ? (
          <p className="font-body text-sm text-muted">Waiting for the first player…</p>
        ) : null}
      </div>
    </motion.div>
  );
}
