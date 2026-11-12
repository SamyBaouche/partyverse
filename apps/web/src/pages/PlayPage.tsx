import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { RoomCode, type Player } from "@partyverse/shared";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button, Card } from "../components/ui";
import { JoinForm } from "../features/join/JoinForm";
import { ROOM_ERROR_MESSAGES } from "../features/join/messages";
import { mockJoin } from "../features/join/mockJoin";
import { WaitingScreen } from "../features/join/WaitingScreen";
import { useSound } from "../lib/audio";

const NICKNAME_STORAGE_KEY = "partyverse.nickname";

type JoinPhase = "form" | "submitting" | "joined";

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

export default function PlayPage() {
  const { code: rawCode } = useParams();
  const navigate = useNavigate();
  const normalizedCode = (rawCode ?? "").toUpperCase();
  const parsedCode = RoomCode.safeParse(normalizedCode);
  const { play } = useSound();
  const reduceMotion = useReducedMotion();

  const [phase, setPhase] = useState<JoinPhase>("form");
  const [name, setName] = useState(readStoredNickname);
  const [player, setPlayer] = useState<Player | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

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
    setPhase("joined");
  }

  function handleLeave() {
    setPlayer(null);
    setServerError(null);
    setPhase("form");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <AnimatePresence mode="wait">
        {phase === "joined" && player ? (
          <motion.div
            key="waiting"
            className="w-full max-w-sm"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: reduceMotion ? 0 : 0.3 }}
          >
            <WaitingScreen name={player.name} onLeave={handleLeave} />
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
