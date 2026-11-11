import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { audioEngine } from "./AudioEngine";
import type { SoundName } from "./types";

type SoundContextValue = {
  play: (name: SoundName) => void;
  startMusic: () => void;
  stopMusic: () => void;
  muted: boolean;
  toggleMute: () => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(() => audioEngine.isMuted());

  const play = useCallback((name: SoundName) => {
    void audioEngine.play(name);
  }, []);

  const startMusic = useCallback(() => {
    void audioEngine.startMusic();
  }, []);

  const stopMusic = useCallback(() => {
    audioEngine.stopMusic();
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((previous) => {
      const next = !previous;
      audioEngine.setMuted(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ play, startMusic, stopMusic, muted, toggleMute }),
    [play, startMusic, stopMusic, muted, toggleMute],
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
