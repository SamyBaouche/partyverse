import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PressStart } from "../components/PressStart";
import { HostLobby } from "../features/lobby/HostLobby";
import { useMockLobby } from "../features/lobby/useMockLobby";

export default function HostPage() {
  const { code, players } = useMockLobby();
  const joinUrl = `${window.location.origin}/play/${code}`;
  const [started, setStarted] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <main className="relative flex min-h-screen flex-col items-center">
      <AnimatePresence mode="wait">
        {!started ? (
          <PressStart key="press-start" onStart={() => setStarted(true)} />
        ) : (
          <motion.div
            key="lobby"
            className="flex w-full flex-col items-center gap-8 px-4 py-8"
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.4 }}
          >
            <h1 className="font-display text-lg uppercase tracking-widest text-white neon-text sm:text-xl">
              Partyverse
            </h1>
            <HostLobby
              code={code}
              joinUrl={joinUrl}
              players={players}
              maxPlayers={8}
              onStart={() => {
                console.log("Start game");
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
