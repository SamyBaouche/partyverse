import { motion, useReducedMotion } from "motion/react";
import { Button, Card, PlayerAvatar } from "../../components/ui";
import type { RoomActivity } from "../session/types";

type WaitingScreenProps = {
  name: string;
  activity: RoomActivity;
  onLeave: () => void;
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
    case "ttt-modes":
      return {
        title: "Tic-Tac-Toe",
        body: "Host is choosing 1v1 or 2v2…",
      };
    case "ttt-lobby":
      return {
        title: "Tic-Tac-Toe",
        body: "Pick a team on the next screen.",
      };
    case "ttt-play":
      return {
        title: "Tic-Tac-Toe",
        body: "Match is live — tap a cell on your phone.",
      };
    case "rps-modes":
      return {
        title: "Rock Paper Scissors",
        body: "Host is choosing 1v1 or 2v2…",
      };
    case "rps-lobby":
      return {
        title: "Rock Paper Scissors",
        body: "Pick a team on the next screen.",
      };
    case "rps-play":
      return {
        title: "Rock Paper Scissors",
        body: "Match is live — lock in your move.",
      };
  }
}

export function WaitingScreen({ name, activity, onLeave }: WaitingScreenProps) {
  const reduceMotion = useReducedMotion();
  const copy = activityCopy(activity);

  return (
    <Card className="flex w-full max-w-md flex-col items-center gap-6 text-center sm:max-w-lg sm:gap-7">
      <div className="flex gap-2" aria-hidden>
        <span className="h-3.5 w-3.5 rounded-full bg-[#FF5A6A]" />
        <span className="h-3.5 w-3.5 rounded-full bg-[#FFE566]" />
        <span className="h-3.5 w-3.5 rounded-full bg-[#5B8CFF]" />
      </div>

      <motion.div
        initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={
          reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 18 }
        }
      >
        <PlayerAvatar name={name} size="lg" className="h-24 w-24 text-3xl" />
      </motion.div>

      <div className="space-y-3 sm:space-y-4" aria-live="polite">
        <h1 className="font-display text-base uppercase leading-relaxed text-ink sm:text-lg">
          {copy.title}
        </h1>
        <p className="font-body text-lg text-ink/80 sm:text-xl">
          Hey {name}. {copy.body}
        </p>
        <p
          className={`font-body text-base font-semibold text-accent sm:text-lg ${reduceMotion ? "" : "blink-soft"}`}
        >
          Watch the TV
        </p>
      </div>

      <Button variant="secondary" size="md" onClick={onLeave}>
        Leave
      </Button>
    </Card>
  );
}
