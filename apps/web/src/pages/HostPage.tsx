import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "../components/ui";
import { ConnectFourHost } from "../features/connectFour/ConnectFourHost";
import { ConnectFourModePicker } from "../features/connectFour/ConnectFourModePicker";
import { createLobbyState, createMock1v1Match } from "../features/connectFour/logic";
import { DrawModePicker } from "../features/catalog/DrawModePicker";
import { GameCatalog } from "../features/catalog/GameCatalog";
import { HostLobby } from "../features/lobby/HostLobby";
import { useMockLobby } from "../features/lobby/useMockLobby";
import {
  fetchRoomActivity,
  publishRoomActivity,
  subscribeRoomActivity,
} from "../features/session/activityApi";
import type {
  CatalogGameId,
  ConnectFourMode,
  ConnectFourState,
  DrawMode,
  RoomActivity,
} from "../features/session/types";
import { useSound } from "../lib/audio";

type HostPhase =
  "catalog" | "draw-modes" | "lobby" | "draw-ready" | "c4-modes" | "c4-lobby" | "c4-play";

function readInitialPhase(raw: string | null): HostPhase {
  if (
    raw === "draw-modes" ||
    raw === "lobby" ||
    raw === "draw-ready" ||
    raw === "catalog" ||
    raw === "c4-modes" ||
    raw === "c4-lobby" ||
    raw === "c4-play"
  ) {
    return raw;
  }
  return "catalog";
}

export default function HostPage() {
  const { code, players } = useMockLobby();
  const joinUrl = `${window.location.origin}/play/${code}`;
  const reduceMotion = useReducedMotion();
  const { play } = useSound();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [phase, setPhase] = useState<HostPhase>(() => readInitialPhase(params.get("phase")));
  const [selectedMode, setSelectedMode] = useState<"vote" | "duo" | null>(null);
  const [c4State, setC4State] = useState<ConnectFourState | null>(null);

  useEffect(() => {
    const next = readInitialPhase(params.get("phase"));
    setPhase(next);
  }, [params]);

  useEffect(() => {
    if (phase === "catalog") {
      void publishRoomActivity(code, { phase: "catalog" });
    }
  }, [code, phase]);

  useEffect(() => {
    if (phase !== "c4-lobby" && phase !== "c4-play") {
      return;
    }
    void fetchRoomActivity(code).then((activity) => {
      if (activity.phase === "c4-lobby" || activity.phase === "c4-play") {
        setC4State(activity.state);
        setPhase(activity.phase);
      }
    });
    return subscribeRoomActivity(code, (activity) => {
      if (activity.phase === "c4-lobby" || activity.phase === "c4-play") {
        setC4State(activity.state);
        setPhase(activity.phase);
      }
    });
  }, [code, phase]);

  async function setActivity(activity: RoomActivity) {
    await publishRoomActivity(code, activity);
  }

  async function publishC4(next: ConnectFourState) {
    setC4State(next);
    const activityPhase = next.status === "lobby" ? "c4-lobby" : "c4-play";
    setPhase(activityPhase);
    navigate(`/host?phase=${activityPhase}`, { replace: true });
    await setActivity({
      phase: activityPhase,
      gameId: "connect-four",
      state: next,
    });
  }

  async function handleSelectGame(gameId: CatalogGameId) {
    if (gameId === "draw-guess") {
      void play("correct");
      setPhase("draw-modes");
      navigate("/host?phase=draw-modes", { replace: true });
      await setActivity({ phase: "draw-modes", gameId: "draw-guess" });
      return;
    }
    if (gameId === "connect-four") {
      void play("correct");
      setPhase("c4-modes");
      navigate("/host?phase=c4-modes", { replace: true });
      await setActivity({ phase: "c4-modes", gameId: "connect-four" });
    }
  }

  async function handleSelectMode(mode: DrawMode) {
    if (mode !== "vote" && mode !== "duo") {
      return;
    }
    void play("go");
    setSelectedMode(mode);
    setPhase("lobby");
    navigate("/host?phase=lobby", { replace: true });
    await setActivity({ phase: "draw-ready", gameId: "draw-guess", mode });
  }

  async function handleSelectC4Mode(mode: ConnectFourMode) {
    void play("go");
    // 1v1 mock: two randoms join and the match starts immediately.
    if (mode === "1v1") {
      const mock = createMock1v1Match();
      await publishC4(mock);
      return;
    }
    const lobby = createLobbyState(mode);
    await publishC4(lobby);
  }

  async function backToCatalog() {
    void play("click");
    setSelectedMode(null);
    setC4State(null);
    navigate("/", { replace: true });
  }

  async function finishLobby() {
    void play("click");
    setPhase("draw-ready");
    navigate("/host?phase=draw-ready", { replace: true });
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center">
      <AnimatePresence mode="wait">
        {phase === "catalog" ? (
          <motion.div
            key="catalog"
            className="w-full"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: reduceMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <GameCatalog
              onSelect={(gameId) => {
                void handleSelectGame(gameId);
              }}
            />
          </motion.div>
        ) : null}

        {phase === "draw-modes" ? (
          <motion.div
            key="draw-modes"
            className="w-full"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: reduceMotion ? 0 : 0.3 }}
          >
            <DrawModePicker
              onSelect={(mode) => {
                void handleSelectMode(mode);
              }}
              onBack={() => {
                void backToCatalog();
              }}
            />
          </motion.div>
        ) : null}

        {phase === "c4-modes" ? (
          <motion.div
            key="c4-modes"
            className="w-full"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: reduceMotion ? 0 : 0.3 }}
          >
            <ConnectFourModePicker
              onSelect={(mode) => {
                void handleSelectC4Mode(mode);
              }}
              onBack={() => {
                void backToCatalog();
              }}
            />
          </motion.div>
        ) : null}

        {(phase === "c4-lobby" || phase === "c4-play") && c4State ? (
          <motion.div
            key="c4-host"
            className="w-full"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: reduceMotion ? 0 : 0.3 }}
          >
            <ConnectFourHost
              code={code}
              joinUrl={joinUrl}
              state={c4State}
              onStateChange={(next) => {
                void publishC4(next);
              }}
              onBack={() => {
                void backToCatalog();
              }}
            />
          </motion.div>
        ) : null}

        {phase === "lobby" && selectedMode ? (
          <motion.div
            key="lobby"
            className="flex w-full flex-col items-center gap-8 px-4 py-8"
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: reduceMotion ? 0 : 0.35 }}
          >
            <div className="space-y-3 text-center">
              <p className="inline-flex rounded-full border-[3px] border-ink bg-[#86e3c2] px-3 py-1 font-display text-[9px] uppercase tracking-[0.2em] text-ink">
                Draw Guess · {selectedMode}
              </p>
              <h1 className="font-display text-lg uppercase tracking-wide text-ink sm:text-xl">
                Invite the room
              </h1>
            </div>
            <HostLobby
              code={code}
              joinUrl={joinUrl}
              players={players}
              maxPlayers={8}
              startLabel="Continue"
              onStart={() => {
                void finishLobby();
              }}
            />
            <button
              type="button"
              onClick={() => {
                void backToCatalog();
              }}
              className="rounded-sm font-display text-[10px] uppercase tracking-widest text-muted underline-offset-4 hover:text-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Back to games
            </button>
          </motion.div>
        ) : null}

        {phase === "lobby" && !selectedMode ? (
          <motion.div
            key="lobby-missing-mode"
            className="flex w-full flex-col items-center gap-6 px-6 py-16 text-center"
            initial={false}
            animate={{ opacity: 1 }}
          >
            <p className="font-body text-sm text-muted">Pick a mode first.</p>
            <Button
              onClick={() => {
                setPhase("draw-modes");
                navigate("/host?phase=draw-modes", { replace: true });
              }}
            >
              Choose mode
            </Button>
          </motion.div>
        ) : null}

        {phase === "draw-ready" && selectedMode ? (
          <motion.div
            key="draw-ready"
            className="flex w-full max-w-xl flex-col items-center gap-6 px-6 py-16"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: reduceMotion ? 0 : 0.3 }}
          >
            <div className="brutal-panel w-full rounded-[1.6rem] bg-panel p-6 text-center sm:p-8">
              <div className="mb-5 flex items-center justify-center gap-2" aria-hidden>
                <span className="h-3 w-3 rounded-full border-2 border-ink bg-[#ff6b7a]" />
                <span className="h-3 w-3 rounded-full border-2 border-ink bg-[#ffe566]" />
                <span className="h-3 w-3 rounded-full border-2 border-ink bg-[#4ea1ff]" />
              </div>
              <p className="font-display text-[9px] uppercase tracking-[0.22em] text-ink/70">
                Draw Guess · {selectedMode}
              </p>
              <h1 className="mt-3 font-display text-base uppercase leading-relaxed text-ink sm:text-xl">
                Phones are synced
              </h1>
              <p className="mx-auto mt-3 max-w-md font-body text-sm text-ink/75">
                {selectedMode === "vote"
                  ? "Vote mode: everyone will draw the same prompt, then pick a favorite."
                  : "Duo mode: pairs split into drawer + guesser. Live ink comes next."}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button
                  size="lg"
                  onClick={() => {
                    window.location.href = "/draw-demo";
                  }}
                >
                  Open draw board
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    void backToCatalog();
                  }}
                >
                  Back to games
                </Button>
              </div>
            </div>
          </motion.div>
        ) : null}

        {phase === "draw-ready" && !selectedMode ? (
          <motion.div
            key="ready-missing-mode"
            className="flex w-full flex-col items-center gap-6 px-6 py-16 text-center"
            initial={false}
            animate={{ opacity: 1 }}
          >
            <Button
              onClick={() => {
                setPhase("draw-modes");
                navigate("/host?phase=draw-modes", { replace: true });
              }}
            >
              Choose mode
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
