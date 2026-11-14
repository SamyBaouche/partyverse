import { useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button, Card } from "../../components/ui";
import { DrawerScreen } from "../drawing/DrawerScreen";
import { GuesserScreen } from "../guess/GuesserScreen";
import { WaitingScreen } from "../join/WaitingScreen";
import { RevealScreen, type RevealResult } from "../reveal/RevealScreen";
import { ScoreboardScreen } from "../scoreboard/ScoreboardScreen";
import type { RoomActivity } from "../session/types";
import { useParty } from "./useParty";
import { usePartyActions } from "./usePartyActions";
import { usePartyStore } from "./partyStore";

const MAX_ROUNDS = 2;
const GUESSER_POINTS = 100;
const DRAWER_POINTS = 25;

type DrawGuessSessionProps = {
  role: "drawer" | "guesser";
  playerName: string;
  activity: RoomActivity;
  onLeave: () => void;
};

function waitForGuessResult(playerId: string): Promise<boolean> {
  return new Promise((resolve) => {
    const current = usePartyStore.getState().lastGuess;
    if (current && current.playerId === playerId) {
      resolve(current.correct);
      return;
    }
    const unsubscribe = usePartyStore.subscribe((state) => {
      if (state.lastGuess && state.lastGuess.playerId === playerId) {
        unsubscribe();
        resolve(state.lastGuess.correct);
      }
    });
  });
}

/** Phone session driven by the party store (mock or real transport). */
export function DrawGuessSession({ role, playerName, activity, onLeave }: DrawGuessSessionProps) {
  const reduceMotion = useReducedMotion();
  const party = useParty();
  const actions = usePartyActions();

  const rankedPlayers = useMemo(
    () => [...party.players].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)),
    [party.players],
  );

  const drawer = party.players.find((player) => player.id === party.drawerId);
  const revealResult = useMemo((): RevealResult | null => {
    if (!party.revealedWord) {
      return null;
    }
    const correct = party.lastRoundCorrect === true;
    const guesser = party.players.find((player) => player.id === party.lastGuesserId);

    return {
      word: party.revealedWord,
      reason: correct ? "correct" : "timeout",
      drawerName: drawer?.name ?? "Drawer",
      correctGuesserName: correct ? (guesser?.name ?? null) : null,
      guesserDelta: correct ? GUESSER_POINTS : 0,
      drawerDelta: correct ? DRAWER_POINTS : 0,
    };
  }, [
    drawer?.name,
    party.lastGuesserId,
    party.lastRoundCorrect,
    party.players,
    party.revealedWord,
  ]);

  if (party.connection === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <Card className="flex w-full max-w-sm flex-col gap-4 text-center">
          <h1 className="font-display text-sm uppercase text-ink">Connection error</h1>
          <p className="font-body text-sm text-muted">{party.lastError ?? "Unknown error"}</p>
          <Button fullWidth onClick={onLeave}>
            Leave
          </Button>
        </Card>
      </main>
    );
  }

  if (party.phase === "drawing") {
    if (role === "drawer" || party.selfId === party.drawerId) {
      return (
        <DrawerScreen
          secretWord={party.secretWord ?? "…"}
          endsAt={party.endsAt}
          onStrokeChunk={(stroke) => {
            actions.drawStroke(stroke);
          }}
          onClear={() => {
            actions.clearCanvas();
          }}
        />
      );
    }

    return (
      <main className="flex min-h-screen justify-center">
        <GuesserScreen
          drawerName={drawer?.name ?? "Drawer"}
          wordLength={party.wordLength || 3}
          endsAt={party.endsAt}
          onGuess={async (text) => {
            // Clear previous result so we wait for this guess's response.
            usePartyStore.setState({ lastGuess: null });
            const sent = actions.guess(text);
            if (!sent.ok || !party.selfId) {
              return { correct: false };
            }
            const correct = await waitForGuessResult(party.selfId);
            return { correct };
          }}
        />
      </main>
    );
  }

  if (party.phase === "reveal" && revealResult) {
    return <RevealScreen result={revealResult} round={party.round} maxRounds={MAX_ROUNDS} />;
  }

  if (party.phase === "scores") {
    const isFinal = party.round >= MAX_ROUNDS;
    return (
      <ScoreboardScreen
        players={rankedPlayers}
        variant={isFinal ? "final" : "betweenRounds"}
        round={party.round}
        maxRounds={MAX_ROUNDS}
        playerId={party.selfId ?? ""}
        onContinue={() => {
          actions.startGame();
        }}
      />
    );
  }

  // lobby / connecting
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <AnimatePresence mode="wait">
        <motion.div
          key="waiting-party"
          className="w-full max-w-sm"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
          transition={{ duration: reduceMotion ? 0 : 0.3 }}
        >
          <WaitingScreen name={playerName} activity={activity} onLeave={onLeave} />
          {import.meta.env.DEV ? (
            <p className="mt-4 text-center font-body text-xs text-muted">
              Party store · {party.connection} · mock round starting…
            </p>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
