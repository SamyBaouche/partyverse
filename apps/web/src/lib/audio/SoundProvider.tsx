import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { audioEngine } from "./AudioEngine";
import type { SoundName } from "./types";

type SoundContextValue = {
  play: (name: SoundName) => Promise<void>;
  startMusic: () => Promise<void>;
  stopMusic: () => void;
  unlock: () => Promise<void>;
  muted: boolean;
  volume: number;
  musicEnabled: boolean;
  setMuted: (muted: boolean) => void;
  setVolume: (volume: number) => void;
  setMusicEnabled: (enabled: boolean) => void;
  toggleMute: () => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [muted, setMutedState] = useState(() => audioEngine.isMuted());
  const [volume, setVolumeState] = useState(() => audioEngine.getVolume());
  const [musicEnabled, setMusicEnabledState] = useState(() => audioEngine.isMusicEnabled());

  const unlock = useCallback(async () => {
    await audioEngine.unlock();
  }, []);

  const play = useCallback(async (name: SoundName) => {
    await audioEngine.play(name);
  }, []);

  const startMusic = useCallback(async () => {
    await audioEngine.startMusic();
  }, []);

  const stopMusic = useCallback(() => {
    audioEngine.stopMusic();
  }, []);

  const setMuted = useCallback((next: boolean) => {
    audioEngine.setMuted(next);
    setMutedState(next);
    if (!next && audioEngine.isMusicEnabled()) {
      void audioEngine.startMusic();
    }
  }, []);

  const setVolume = useCallback((next: number) => {
    audioEngine.setVolume(next);
    setVolumeState(audioEngine.getVolume());
  }, []);

  const setMusicEnabled = useCallback((enabled: boolean) => {
    audioEngine.setMusicEnabled(enabled);
    setMusicEnabledState(enabled);
    if (!enabled) {
      audioEngine.stopMusic();
    } else if (!audioEngine.isMuted()) {
      void audioEngine.startMusic();
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted(!audioEngine.isMuted());
  }, [setMuted]);

  // Keep audio unlocked + music alive after the first user gesture, across routes.
  useEffect(() => {
    let armed = false;

    async function wake() {
      try {
        await audioEngine.unlock();
        if (audioEngine.isMusicEnabled() && !audioEngine.isMuted()) {
          if (!audioEngine.isMusicPlaying()) {
            await audioEngine.startMusic();
          }
        }
      } catch {
        // ignore autoplay / unlock failures
      }
    }

    function onGesture() {
      void wake();
      if (!armed) {
        armed = true;
      }
    }

    function onVisibility() {
      if (document.visibilityState === "visible") {
        void wake();
      }
    }

    window.addEventListener("pointerdown", onGesture, { capture: true });
    window.addEventListener("keydown", onGesture, { capture: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("pointerdown", onGesture, { capture: true });
      window.removeEventListener("keydown", onGesture, { capture: true });
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const value = useMemo(
    () => ({
      play,
      startMusic,
      stopMusic,
      unlock,
      muted,
      volume,
      musicEnabled,
      setMuted,
      setVolume,
      setMusicEnabled,
      toggleMute,
    }),
    [
      play,
      startMusic,
      stopMusic,
      unlock,
      muted,
      volume,
      musicEnabled,
      setMuted,
      setVolume,
      setMusicEnabled,
      toggleMute,
    ],
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound(): SoundContextValue {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
}
