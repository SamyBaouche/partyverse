import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { RoomCode, type Player } from "@partyverse/shared";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button, Card } from "../components/ui";
import { ConnectFourPhone } from "../features/connectFour/ConnectFourPhone";
import { JoinForm } from "../features/join/JoinForm";
import { ROOM_ERROR_MESSAGES } from "../features/join/messages";
import { mockJoin } from "../features/join/mockJoin";
import { DrawGuessSession, PartyProvider } from "../features/realtime";
import {
  fetchRoomActivity,
  publishRoomActivity,
  subscribeRoomActivity,
} from "../features/session/activityApi";
import type { ConnectFourState, RoomActivity } from "../features/session/types";
import { useSound } from "../lib/audio";

const NICKNAME_STORAGE_KEY = "partyverse.nickname";
const PLAYER_ID_KEY = "partyverse.playerId";

type JoinPhase = "form" | "submitting" | "joined";
type MockRole = "drawer" | "guesser";

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
  const forceMock = searchParams.get("mock") === "1";
  const [phase, setPhase] = useState<JoinPhase>("form");
  const [name, setName] = useState(readStoredNickname);
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerId] = useState(readOrCreatePlayerId);
  const [serverError, setServerError] = useState<string | null>(null);
  const [activity, setActivity] = useState<RoomActivity>({ phase: "lobby" });

  useEffect(() => {
    const parsed = RoomCode.safeParse(normalizedCode);
    if (!parsed.success) {
      return;
    }
    const roomCode = parsed.data;
    void fetchRoomActivity(roomCode).then(setActivity);
    return subscribeRoomActivity(roomCode, setActivity);
  }, [normalizedCode]);

  if (!parsedCode.success) {
    return (
      <main className="flex min-h-dvh items-center justify-center p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
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
    setPhase("joined");
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

  if (phase === "joined" && player && isC4Activity(activity)) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <motion.div
          className="w-full max-w-sm"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
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
      </main>
    );
  }

  if (phase === "joined" && player) {
    return (
      <PartyProvider
        code={code}
        selfId={playerId}
        selfName={player.name}
        role={mockRole}
        mode={forceMock ? "mock" : undefined}
      >
        <DrawGuessSession
          role={mockRole}
          playerName={player.name}
          activity={activity}
          onLeave={handleLeave}
          joinUrl={`${window.location.origin}/play/${code}`}
          roomCode={code}
        />
      </PartyProvider>
    );
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <AnimatePresence mode="wait">
        <motion.div
          key="form"
          className="w-full max-w-sm sm:max-w-md"
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
      </AnimatePresence>
    </main>
  );
}
