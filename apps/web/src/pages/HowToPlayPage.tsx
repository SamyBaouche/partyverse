import { Link, useNavigate } from "react-router";
import { motion, useReducedMotion } from "motion/react";
import { PartyverseWordmark } from "../components/brand/PartyverseWordmark";
import { Button } from "../components/ui";

const STEPS = [
  {
    n: "01",
    tint: "#FFE566",
    title: "Open on the TV",
    body: "Launch Partyverse on the big screen. Pick Draw Guess (or another open game) and choose a mode.",
  },
  {
    n: "02",
    tint: "#86E3C2",
    title: "Scan the QR",
    body: "Friends point their phone camera at the QR. Same Wi‑Fi as the TV — they land in the lobby in one tap.",
  },
  {
    n: "03",
    tint: "#FFB4C8",
    title: "Play live",
    body: "Host starts when at least two players are in. Drawing, guessing, and scores sync through the room.",
  },
] as const;

/**
 * Dedicated how-to-play surface (#63) — one job: teach the TV → phone loop.
 */
export default function HowToPlayPage() {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();

  return (
    <main className="relative min-h-dvh overflow-x-hidden px-5 py-10 sm:px-8 md:px-12 md:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 10% 0%, #ffe56655, transparent 55%), radial-gradient(ellipse 70% 45% at 90% 10%, #86e3c255, transparent 50%), radial-gradient(ellipse 60% 40% at 50% 100%, #ffb4c844, transparent 45%), #f7f1e4",
        }}
      />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
        <header className="flex flex-col items-start gap-5">
          <Link
            to="/"
            className="rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <PartyverseWordmark className="text-2xl sm:text-3xl" />
          </Link>
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-3"
          >
            <p className="font-display text-[10px] uppercase tracking-[0.35em] text-ink/60">
              Quick start
            </p>
            <h1 className="font-body text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
              How to play
            </h1>
            <p className="max-w-xl font-body text-lg text-ink/75 sm:text-xl">
              One TV hosts. Phones join. No accounts — just a room code and a nickname.
            </p>
          </motion.div>
        </header>

        <ol className="flex flex-col gap-5">
          {STEPS.map((step, index) => (
            <motion.li
              key={step.n}
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduceMotion ? 0 : 0.4,
                delay: reduceMotion ? 0 : 0.08 + index * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="brutal-card flex gap-4 rounded-[1.4rem] border-[3px] border-ink p-5 sm:gap-5 sm:p-6"
              style={{ backgroundColor: step.tint }}
            >
              <span className="font-display text-sm text-ink/70 sm:text-base">{step.n}</span>
              <div className="space-y-2">
                <h2 className="font-body text-xl font-extrabold text-ink sm:text-2xl">
                  {step.title}
                </h2>
                <p className="font-body text-base leading-relaxed text-ink/80 sm:text-lg">
                  {step.body}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>

        <motion.div
          className="flex flex-wrap items-center gap-3"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduceMotion ? 0 : 0.35, duration: reduceMotion ? 0 : 0.3 }}
        >
          <Button size="lg" onClick={() => navigate("/")}>
            Back to games
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate("/host?phase=draw-modes")}>
            Host Draw Guess
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
