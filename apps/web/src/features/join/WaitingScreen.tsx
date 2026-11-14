import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button, Card, PlayerAvatar } from "../../components/ui";
import { copyText } from "../../lib/copyText";
import type { RoomActivity } from "../session/types";

type WaitingScreenProps = {
  name: string;
  activity: RoomActivity;
  onLeave: () => void;
  /** Optional invite URL for share/copy (phone waiting room). */
  joinUrl?: string;
  roomCode?: string;
};

function activityCopy(activity: RoomActivity): { title: string; body: string } {
  switch (activity.phase) {
    case "lobby":
      return {
        title: "You're in",
        body: "Waiting for the host to pick a game.",
      };
    case "catalog":
      return {
        title: "You're in",
        body: "Host is picking a mini-game on the big screen…",
      };
    case "draw-modes":
      return {
        title: "Draw Guess",
        body: "Host is choosing Vote or Duo…",
      };
    case "draw-ready":
      return {
        title: `Draw Guess · ${activity.mode}`,
        body:
          activity.mode === "vote"
            ? "Get ready to draw — then vote for the best sketch."
            : "Get ready — drawer and guesser roles are coming up.",
      };
    case "c4-modes":
      return {
        title: "Connect Four",
        body: "Host is choosing 1v1 or 2v2…",
      };
    case "c4-lobby":
      return {
        title: "Connect Four",
        body: "Pick a team on the next screen.",
      };
    case "c4-play":
      return {
        title: "Connect Four",
        body: "Match is live — use your phone as the controller.",
      };
  }
}

export function WaitingScreen({ name, activity, onLeave, joinUrl, roomCode }: WaitingScreenProps) {
  const reduceMotion = useReducedMotion();
  const copy = activityCopy(activity);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const id = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(id);
  }, [copied]);

  return (
    <Card className="flex w-full max-w-sm flex-col items-center gap-6 text-center sm:max-w-md">
      <div className="flex gap-1.5" aria-hidden>
        <span className="h-3 w-3 rounded-full bg-[#FF5A6A]" />
        <span className="h-3 w-3 rounded-full bg-[#FFE566]" />
        <span className="h-3 w-3 rounded-full bg-[#5B8CFF]" />
      </div>

      <motion.div
        initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={
          reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 18 }
        }
      >
        <PlayerAvatar name={name} size="lg" className="h-20 w-20 text-2xl" />
      </motion.div>

      <div className="space-y-3" aria-live="polite">
        <h1 className="font-display text-sm uppercase leading-relaxed text-ink sm:text-base">
          {copy.title}
        </h1>
        <p className="font-body text-base text-ink/80">
          Hey {name} — {copy.body}
        </p>
        <p
          className={`font-body text-sm font-semibold text-accent ${reduceMotion ? "" : "blink-soft"}`}
        >
          Watch the TV
        </p>
      </div>

      {joinUrl ? (
        <div className="flex w-full flex-col gap-3 rounded-[1.25rem] border-[3px] border-ink bg-[#fffaf2] p-4 text-left">
          <p className="font-display text-[9px] uppercase tracking-[0.2em] text-muted">
            Invite a friend
          </p>
          <p className="break-all font-body text-sm text-ink/80">{joinUrl}</p>
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
          {roomCode ? (
            <p className="text-center font-body text-xs text-muted">
              Or tell them the code{" "}
              <span className="font-semibold text-ink">{roomCode.split("").join(" ")}</span>
            </p>
          ) : null}
          <p className="sr-only" aria-live="polite">
            {copied ? "Invite link copied to clipboard" : ""}
          </p>
        </div>
      ) : null}

      <Button variant="secondary" size="md" onClick={onLeave}>
        Leave
      </Button>
    </Card>
  );
}
