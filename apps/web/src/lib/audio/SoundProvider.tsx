import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
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
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted(!audioEngine.isMuted());
  }, [setMuted]);

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
