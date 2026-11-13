import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { SplashIntro } from "../components/SplashIntro";
import { GameCatalog } from "../features/catalog/GameCatalog";
import { publishRoomActivity } from "../features/session/activityApi";
import { useSound } from "../lib/audio";

const HOST_CODE = "KXPM";
const SPLASH_SEEN_KEY = "partyverse.splash.seen";

function hasSeenSplash(): boolean {
  try {
    return sessionStorage.getItem(SPLASH_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markSplashSeen(): void {
  try {
    sessionStorage.setItem(SPLASH_SEEN_KEY, "1");
  } catch {
    // ignore
  }
}

/**
 * Catalog home. Splash plays once per browser tab session — not on every Back.
 */
export default function LandingPage() {
  const navigate = useNavigate();
  const { unlock, play, startMusic, musicEnabled, muted } = useSound();
  const [showSplash, setShowSplash] = useState(() => !hasSeenSplash());
  const [catalogReady, setCatalogReady] = useState(() => hasSeenSplash());

  const bootMusic = useCallback(async () => {
    try {
      await unlock();
      if (musicEnabled && !muted) {
        await startMusic();
      }
    } catch {
      // Ignore autoplay / unlock failures
    }
  }, [unlock, startMusic, musicEnabled, muted]);

  const finishSplash = useCallback(() => {
    markSplashSeen();
    setShowSplash(false);
    setCatalogReady(true);
    void publishRoomActivity(HOST_CODE, { phase: "catalog" });
    void bootMusic();
  }, [bootMusic]);

  useEffect(() => {
    if (showSplash) {
      return;
    }
    void bootMusic();
    function onPointer() {
      void bootMusic();
      window.removeEventListener("pointerdown", onPointer);
    }
    window.addEventListener("pointerdown", onPointer);
    return () => window.removeEventListener("pointerdown", onPointer);
  }, [showSplash, bootMusic]);

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <motion.div
        className="relative z-10"
        initial={false}
        animate={{ opacity: catalogReady || !showSplash ? 1 : 0.12 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <GameCatalog
          onSelect={(gameId) => {
            if (gameId === "draw-guess") {
              void play("correct");
              void publishRoomActivity(HOST_CODE, {
                phase: "draw-modes",
                gameId: "draw-guess",
              });
              navigate("/host?phase=draw-modes");
              return;
            }
            if (gameId === "connect-four") {
              void play("correct");
              void publishRoomActivity(HOST_CODE, {
                phase: "c4-modes",
                gameId: "connect-four",
              });
              navigate("/host?phase=c4-modes");
            }
          }}
        />
      </motion.div>

      {showSplash ? <SplashIntro onDone={finishSplash} /> : null}
    </main>
  );
}
