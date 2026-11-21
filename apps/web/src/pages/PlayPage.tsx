import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { RoomCode, type Player } from "@partyverse/shared";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button, Card } from "../components/ui";
import { ConnectFourPhone } from "../features/connectFour/ConnectFourPhone";
import { postC4Command } from "../features/connectFour/c4Api";
import { JoinForm } from "../features/join/JoinForm";
import { joinRoom, reconnectRoom } from "../features/join/joinRoom";
import { ROOM_ERROR_MESSAGES } from "../features/join/messages";
import { mockJoin } from "../features/join/mockJoin";
import { PartyGamePhone } from "../features/partyGames/PartyGamePhone";
import { leaveParty, type PartyGameState } from "../features/partyGames/logic";
import { DrawGuessSession, PartyProvider, resolvePartyTransportMode } from "../features/realtime";
import { RpsPhone } from "../features/rps/RpsPhone";
import { postRpsCommand } from "../features/rps/rpsApi";
import {
  fetchRoomActivity,
  publishRoomActivity,
  subscribeRoomActivity,
} from "../features/session/activityApi";
import type { RoomActivity } from "../features/session/types";
import { TicTacToePhone } from "../features/ticTacToe/TicTacToePhone";
import { postTttCommand } from "../features/ticTacToe/tttApi";
import { WishKartPhone } from "../features/wishKart/WishKartPhone";
import { postKartCommand } from "../features/wishKart/kartApi";
import { useSound } from "../lib/audio";
import { getJoinUrl } from "../lib/joinOrigin";
import {
  isC4Activity,
  isKartActivity,
  isPartyActivity,
  isRpsActivity,
  isTttActivity,
} from "./play/activityGuards";
import {
  readOrCreatePlayerId,
  readStoredNickname,
  readStoredPlayerId,
  saveNickname,
  savePlayerId,
} from "./play/nicknameStorage";

type JoinPhase = "form" | "submitting" | "joined";
type MockRole = "drawer" | "guesser";

function readMockRole(value: string | null): MockRole {
  return value === "drawer" ? "drawer" : "guesser";
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
  const forceMock = searchParams.get("mock") === "1" || resolvePartyTransportMode() === "mock";
  const [phase, setPhase] = useState<JoinPhase>("form");
  const [name, setName] = useState(readStoredNickname);
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerId, setPlayerId] = useState(readOrCreatePlayerId);
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
            <h1 className="font-display text-sm uppercase text-ink">Couldn’t join</h1>
            <p className="font-body text-sm text-muted">Scan the QR on the TV again to join.</p>
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

    try {
      const storedId = readStoredPlayerId();
      let result = forceMock
        ? await mockJoin(code, nickname)
        : storedId
          ? await reconnectRoom(code, storedId, nickname)
          : await joinRoom(code, nickname);

      // Soft reconnect failed (grace expired) → normal join.
      if (!forceMock && !result.ok && storedId) {
        result = await joinRoom(code, nickname);
      }

      if (!result.ok) {
        void play("wrong");
        setServerError(ROOM_ERROR_MESSAGES[result.error] ?? result.error);
        setPhase("form");
        return;
      }

      saveNickname(result.player.name);
      savePlayerId(result.player.id);
      setPlayer(result.player);
      setPlayerId(result.player.id);
      setName(result.player.name);
      void play("join");
      setPhase("joined");
    } catch (error) {
      void play("wrong");
      setServerError(error instanceof Error ? error.message : "Could not join. Try again.");
      setPhase("form");
    }
  }

  function handleLeave() {
    // C4 / TTT / RPS / Kart leave: server owns lobby state; phone just exits the UI.
    if (isKartActivity(activity)) {
      void postKartCommand(code, { type: "leave", playerId }).catch(() => undefined);
    }
    if (isPartyActivity(activity)) {
      void publishRoomActivity(code, {
        phase: activity.phase,
        gameId: activity.gameId,
        state: leaveParty(activity.state, playerId),
      });
    }
    setPlayer(null);
    setServerError(null);
    setPhase("form");
  }

  async function runC4Command(command: Parameters<typeof postC4Command>[1]) {
    try {
      const state = await postC4Command(code, command);
      const activityPhase = state.status === "lobby" ? "c4-lobby" : "c4-play";
      setActivity({ phase: activityPhase, gameId: "connect-four", state });
      if (command.type === "drop") {
        void play(state.winner ? "win" : "go");
      }
    } catch {
      void play("wrong");
    }
  }

  async function runTttCommand(command: Parameters<typeof postTttCommand>[1]) {
    try {
      const state = await postTttCommand(code, command);
      const activityPhase = state.status === "lobby" ? "ttt-lobby" : "ttt-play";
      setActivity({ phase: activityPhase, gameId: "tic-tac-toe", state });
      if (command.type === "place") {
        void play(state.winner ? "win" : "go");
      }
    } catch {
      void play("wrong");
    }
  }

  async function runRpsCommand(command: Parameters<typeof postRpsCommand>[1]) {
    try {
      const state = await postRpsCommand(code, command);
      const activityPhase = state.status === "lobby" ? "rps-lobby" : "rps-play";
      setActivity({ phase: activityPhase, gameId: "rock-paper-scissors", state });
      if (command.type === "lock") {
        void play(
          state.status === "ended" || state.status === "reveal" ? "go" : "tick",
        );
      }
    } catch {
      void play("wrong");
    }
  }

  async function runKartCommand(command: Parameters<typeof postKartCommand>[1]) {
    try {
      const state = await postKartCommand(code, command);
      const activityPhase = state.status === "lobby" ? "kart-lobby" : "kart-play";
      setActivity({ phase: activityPhase, gameId: "wish-kart", state });
    } catch {
      void play("wrong");
    }
  }

  async function publishPartyState(next: PartyGameState) {
    const activityPhase = next.status === "lobby" ? "party-lobby" : "party-play";
    const published = await publishRoomActivity(code, {
      phase: activityPhase,
      gameId: next.gameId,
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
            onJoinTeam={(team) => {
              void runC4Command({
                type: "joinTeam",
                playerId,
                name: player.name,
                team,
              });
            }}
            onHover={(col) => {
              void runC4Command({ type: "hover", playerId, col });
            }}
            onDrop={(col) => {
              void runC4Command({ type: "drop", playerId, col });
            }}
            onLeave={handleLeave}
          />
        </motion.div>
      </main>
    );
  }

  if (phase === "joined" && player && isTttActivity(activity)) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <motion.div
          className="w-full max-w-sm"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.3 }}
        >
          <TicTacToePhone
            playerId={playerId}
            playerName={player.name}
            state={activity.state}
            onJoinTeam={(team) => {
              void runTttCommand({
                type: "joinTeam",
                playerId,
                name: player.name,
                team,
              });
            }}
            onPlace={(index) => {
              void runTttCommand({ type: "place", playerId, index });
            }}
            onLeave={handleLeave}
          />
        </motion.div>
      </main>
    );
  }

  if (phase === "joined" && player && isRpsActivity(activity)) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <motion.div
          className="w-full max-w-sm"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.3 }}
        >
          <RpsPhone
            playerId={playerId}
            playerName={player.name}
            state={activity.state}
            onJoinTeam={(team) => {
              void runRpsCommand({
                type: "joinTeam",
                playerId,
                name: player.name,
                team,
              });
            }}
            onPick={(choice) => {
              void runRpsCommand({ type: "pick", playerId, choice });
            }}
            onLock={() => {
              void runRpsCommand({ type: "lock", playerId });
            }}
            onLeave={handleLeave}
          />
        </motion.div>
      </main>
    );
  }

  if (phase === "joined" && player && isKartActivity(activity)) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <motion.div
          className="w-full max-w-sm"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.3 }}
        >
          <WishKartPhone
            playerId={playerId}
            playerName={player.name}
            state={activity.state}
            onJoin={() => {
              void runKartCommand({
                type: "join",
                playerId,
                name: player.name,
              });
            }}
            onInput={(input) => {
              void runKartCommand({ type: "input", playerId, input });
            }}
            onLeave={handleLeave}
          />
        </motion.div>
      </main>
    );
  }

  if (phase === "joined" && player && isPartyActivity(activity)) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <motion.div
          className="w-full max-w-sm"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.3 }}
        >
          <PartyGamePhone
            playerId={playerId}
            playerName={player.name}
            state={activity.state}
            onStateChange={(next) => {
              void publishPartyState(next);
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
        selfId={player.id}
        selfName={player.name}
        role={mockRole}
        mode={forceMock ? "mock" : "pubsub"}
      >
        <DrawGuessSession
          role={mockRole}
          playerName={player.name}
          activity={activity}
          onLeave={handleLeave}
          joinUrl={getJoinUrl(code)}
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
