import { motion, useReducedMotion } from "motion/react";
import { Button, Card, PlayerAvatar } from "../../components/ui";

type WaitingScreenProps = {
  name: string;
  onLeave: () => void;
};

export function WaitingScreen({ name, onLeave }: WaitingScreenProps) {
  const reduceMotion = useReducedMotion();

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
          You&apos;re in, {name}!
        </h1>
        <p className="blink-soft font-body text-base text-muted">
          Look at the TV — waiting for the host to start
        </p>
      </div>

      <Button variant="ghost" size="md" onClick={onLeave}>
        Leave
      </Button>
    </Card>
  );
}
