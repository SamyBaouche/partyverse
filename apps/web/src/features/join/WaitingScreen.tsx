import { motion, useReducedMotion } from "motion/react";
import { Button, Card, PlayerAvatar } from "../../components/ui";
import type { RoomActivity } from "../session/types";

type WaitingScreenProps = {
  name: string;
  activity: RoomActivity;
  onLeave: () => void;
};

function activityCopy(activity: RoomActivity): { title: string; body: string } {
  switch (activity.phase) {
    case "lobby":
      return {
        title: "You're in",
        body: "Let's wait to choose an activity.",
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

export function WaitingScreen({ name, activity, onLeave }: WaitingScreenProps) {
  const reduceMotion = useReducedMotion();
  const copy = activityCopy(activity);

  return (
    <Card className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
      <motion.div
        initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={
          reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 18 }
        }
      >
        <PlayerAvatar name={name} size="lg" className="h-20 w-20 text-2xl" />
      </motion.div>

      <div className="space-y-3">
        <h1 className="font-display text-sm uppercase leading-relaxed text-ink sm:text-base">
          {copy.title}
        </h1>
        <p className="font-body text-base text-muted">
          Hey {name} — {copy.body}
        </p>
        <p className={`font-body text-sm text-accent ${reduceMotion ? "" : "blink-soft"}`}>
          Watch the TV
        </p>
      </div>

      <Button variant="ghost" size="md" onClick={onLeave}>
        Leave
      </Button>
    </Card>
  );
}
