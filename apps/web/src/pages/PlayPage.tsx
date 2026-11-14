import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { RoomCode, type Player } from "@partyverse/shared";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button, Card } from "../components/ui";
import { ConnectFourPhone } from "../features/connectFour/ConnectFourPhone";
import { DrawerScreen } from "../features/drawing/DrawerScreen";
import { GuesserScreen } from "../features/guess/GuesserScreen";
import { useMockDrawGame, type MockRole } from "../features/guess/useMockDrawGame";
import { JoinForm } from "../features/join/JoinForm";
import { ROOM_ERROR_MESSAGES } from "../features/join/messages";
import { mockJoin } from "../features/join/mockJoin";
import { WaitingScreen } from "../features/join/WaitingScreen";
import { RevealScreen } from "../features/reveal/RevealScreen";
import { ScoreboardScreen } from "../features/scoreboard/ScoreboardScreen";
import {
  fetchRoomActivity,
  publishRoomActivity,
  subscribeRoomActivity,
} from "../features/session/activityApi";
import type { ConnectFourState, RoomActivity } from "../features/session/types";
import { useSound } from "../lib/audio";

const NICKNAME_STORAGE_KEY = "partyverse.nickname";
const PLAYER_ID_KEY = "partyverse.playerId";
const MOCK_DRAWING_DELAY_MS = 3000;

type ScreenPhase =
  "form" | "submitting" | "waiting" | "drawing" | "reveal" | "roundScores" | "finalScores";

function readStoredNickname(): string {
  try {
    return localStorage.getItem(NICKNAME_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function saveNickname(name: string): void {
  try {
    localStorage.setItem(NICKNAME_STORAGE_KEY, name);
  } catch {
    // Ignore quota / private mode failures
  }
}

function readMockRole(value: string | null): MockRole {
  return value === "drawer" ? "drawer" : "guesser";
}

function readOrCreatePlayerId(): string {
  try {
    const existing = localStorage.getItem(PLAYER_ID_KEY);
    if (existing) {
      return existing;
    }
    const id = `p-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(PLAYER_ID_KEY, id);
    return id;
  } catch {
    return `p-${Math.random().toString(36).slice(2, 10)}`;
  }
}

function isC4Activity(
  activity: RoomActivity,
): activity is Extract<RoomActivity, { phase: "c4-lobby" | "c4-play" }> {
  return activity.phase === "c4-lobby" || activity.phase === "c4-play";
}

export default function PlayPage() {
  const { code: rawCode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const normalizedCode = (rawCode ?? "").toUpperCase();
  const parsedCode = RoomCode.safeParse(normalizedCode);
  const { play } = useSound();
  const reduceMotion = useReducedMotion();

  const mockRole = readMockRole(searchParams.get("role"));
  const [phase, setPhase] = useState<ScreenPhase>("form");
  const [name, setName] = useState(readStoredNickname);
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerId] = useState(readOrCreatePlayerId);
  const [serverError, setServerError] = useState<string | null>(null);
  const [activity, setActivity] = useState<RoomActivity>({ phase: "lobby" });

  const mockGame = useMockDrawGame({
    selfId: playerId,
    selfName: player?.name ?? (name || "Player"),
    role: mockRole,
    maxRounds: 2,
  });
  const { beginGame } = mockGame;

  useEffect(() => {
    const parsed = RoomCode.safeParse(normalizedCode);
    if (!parsed.success) {
      return;
    }
    const roomCode = parsed.data;
    void fetchRoomActivity(roomCode).then(setActivity);
    return subscribeRoomActivity(roomCode, setActivity);
  }, [normalizedCode]);

  // Only depend on activity.phase — full `activity` is a new object every poll (~350ms)
  // and would reset this timer forever.
  useEffect(() => {
    if (!import.meta.env.DEV || phase !== "waiting") {
      return;
    }
    if (activity.phase === "c4-lobby" || activity.phase === "c4-play") {
      return;
    }
    const timer = window.setTimeout(() => {
      beginGame();
      setPhase("drawing");
    }, MOCK_DRAWING_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [phase, activity.phase, beginGame]);

  if (!parsedCode.success) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <Card className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
          <div className="space-y-2">
            <h1 className="font-display text-sm uppercase text-ink">Invalid room code</h1>
            <p className="font-body text-sm text-muted">
              Room codes are 4 letters. Check the TV and try again.
            </p>
          </div>
          <Button fullWidth size="lg" onClick={() => navigate("/")}>
            Back home
          </Button>
        </Card>
      </main>
    );
  }

  const code = parsedCode.data;

  async function handleJoin(nickname: string) {
    setServerError(null);
    setPhase("submitting");

    const result = await mockJoin(code, nickname);
    if (!result.ok) {
      void play("wrong");
      setServerError(ROOM_ERROR_MESSAGES[result.error]);
      setPhase("form");
      return;
    }

    saveNickname(result.player.name);
    setPlayer(result.player);
    setName(result.player.name);
    void play("join");
    setPhase("waiting");
  }

  function handleLeave() {
    if (isC4Activity(activity)) {
      const nextPlayers = activity.state.players.filter((entry) => entry.id !== playerId);
      const nextState: ConnectFourState = { ...activity.state, players: nextPlayers };
      void publishRoomActivity(code, {
        phase: activity.phase,
        gameId: "connect-four",
        state: nextState,
      });
    }
    setPlayer(null);
    setServerError(null);
    setPhase("form");
  }

  async function publishC4State(next: ConnectFourState) {
    const activityPhase = next.status === "lobby" ? "c4-lobby" : "c4-play";
    const published = await publishRoomActivity(code, {
      phase: activityPhase,
      gameId: "connect-four",
      state: next,
    });
    setActivity(published);
  }

  function goToReveal() {
    setPhase("reveal");
  }

  function handleRevealDone() {
    if (mockGame.hasMoreRounds) {
      setPhase("roundScores");
      return;
    }
    setPhase("finalScores");
  }

  function handleScoreboardContinue() {
    if (phase === "finalScores") {
      mockGame.beginGame();
      setPhase("drawing");
      return;
    }
    mockGame.startRound(mockGame.round + 1);
    setPhase("drawing");
  }

  if (phase === "drawing" && player && !isC4Activity(activity)) {
    if (mockRole === "drawer") {
      return (
        <DrawerScreen
          secretWord={mockGame.secretWord}
          endsAt={mockGame.endsAt}
          onTimeout={() => {
            mockGame.endRoundTimeout();
            goToReveal();
          }}
        />
      );
    }
    return (
      <main className="flex min-h-screen justify-center">
        <GuesserScreen
          drawerName={mockGame.drawerName}
          wordLength={mockGame.wordLength}
          endsAt={mockGame.endsAt}
          onGuess={mockGame.submitGuess}
          onCorrect={goToReveal}
          onTimeout={() => {
            mockGame.endRoundTimeout();
            goToReveal();
          }}
        />
      </main>
    );
  }

  if (phase === "reveal" && player) {
    if (!mockGame.lastResult) {
      return null;
    }
    return (
      <RevealScreen
        result={mockGame.lastResult}
        round={mockGame.round}
        maxRounds={mockGame.maxRounds}
        onDone={handleRevealDone}
      />
    );
  }

  if ((phase === "roundScores" || phase === "finalScores") && player) {
    return (
      <ScoreboardScreen
        players={mockGame.players}
        variant={phase === "finalScores" ? "final" : "betweenRounds"}
        round={mockGame.round}
        maxRounds={mockGame.maxRounds}
        playerId={playerId}
        onContinue={handleScoreboardContinue}
      />
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <AnimatePresence mode="wait">
        {phase === "waiting" && player && isC4Activity(activity) ? (
          <motion.div
            key="c4-phone"
            className="w-full max-w-sm"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: reduceMotion ? 0 : 0.3 }}
          >
            <ConnectFourPhone
              playerId={playerId}
              playerName={player.name}
              state={activity.state}
              onStateChange={(next) => {
                void publishC4State(next);
              }}
              onLeave={handleLeave}
            />
          </motion.div>
        ) : phase === "waiting" && player ? (
          <motion.div
            key="waiting"
            className="w-full max-w-sm"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: reduceMotion ? 0 : 0.3 }}
          >
            <WaitingScreen name={player.name} activity={activity} onLeave={handleLeave} />
            {import.meta.env.DEV ? (
              <p className="mt-4 text-center font-body text-xs text-muted">
                Mock round starts in a few seconds ({mockRole})…
              </p>
            ) : null}
          </motion.div>
        ) : (
          <motion.div
            key="form"
            className="w-full max-w-sm"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: reduceMotion ? 0 : 0.3 }}
          >
            <JoinForm
              code={code}
              name={name}
              onNameChange={(value) => {
                setServerError(null);
                setName(value);
              }}
              submitting={phase === "submitting"}
              serverError={serverError}
              onSubmit={(nickname) => {
                void handleJoin(nickname);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
