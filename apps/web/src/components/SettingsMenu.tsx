import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "./ui";
import { useSound } from "../lib/audio";
import { cn } from "../lib/cn";

function GearIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
      />
    </svg>
  );
}

export function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const reduceMotion = useReducedMotion();
  const {
    muted,
    volume,
    musicEnabled,
    setMuted,
    setVolume,
    setMusicEnabled,
    unlock,
    startMusic,
    stopMusic,
    play,
  } = useSound();

  const [draftMusic, setDraftMusic] = useState(musicEnabled);
  const [draftMuted, setDraftMuted] = useState(muted);
  const [draftVolume, setDraftVolume] = useState(volume);

  useEffect(() => {
    if (!open) {
      return;
    }
    setDraftMusic(musicEnabled);
    setDraftMuted(muted);
    setDraftVolume(volume);
    setSavedNote(null);
  }, [open, musicEnabled, muted, volume]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: PointerEvent) {
      const root = rootRef.current;
      if (!root || !(event.target instanceof Node)) {
        return;
      }
      if (!root.contains(event.target)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function handleSave() {
    setMusicEnabled(draftMusic);
    setMuted(draftMuted);
    setVolume(draftVolume);

    await unlock();
    if (draftMusic && !draftMuted) {
      await startMusic();
    } else {
      stopMusic();
    }
    await play("correct");
    setSavedNote("Saved");
  }

  return (
    <div ref={rootRef} className="fixed top-4 right-4 z-[70]">
      <button
        type="button"
        aria-label="Settings"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          void (async () => {
            await unlock();
            await play("click");
            if (musicEnabled && !muted && !open) {
              await startMusic();
            }
          })();
          setOpen((previous) => !previous);
        }}
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-line bg-panel text-ink shadow-[3px_3px_0_var(--color-hard-shadow)] transition-transform hover:-translate-y-0.5",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
        )}
      >
        <GearIcon className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={panelId}
            role="dialog"
            aria-label="Music settings"
            className="brutal-panel absolute right-0 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-[1.4rem] bg-panel p-4"
            initial={reduceMotion ? false : { opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
          >
            <p className="font-display text-[10px] uppercase tracking-[0.28em] text-ink">Music</p>

            <div className="mt-4 space-y-3">
              <section className="space-y-3 rounded-2xl border-[3px] border-line bg-panel-muted p-3">
                <label className="flex items-center justify-between gap-3 font-body text-sm text-ink">
                  <span>Background music</span>
                  <input
                    type="checkbox"
                    checked={draftMusic}
                    onChange={(event) => setDraftMusic(event.target.checked)}
                    className="h-4 w-4 accent-[var(--color-brand)]"
                  />
                </label>
                <label className="flex items-center justify-between gap-3 font-body text-sm text-ink">
                  <span>Mute</span>
                  <input
                    type="checkbox"
                    checked={draftMuted}
                    onChange={(event) => setDraftMuted(event.target.checked)}
                    className="h-4 w-4 accent-[var(--color-brand)]"
                  />
                </label>
                <label className="flex flex-col gap-2 font-body text-sm text-ink">
                  <span className="flex justify-between">
                    Volume <span className="text-muted">{Math.round(draftVolume * 100)}%</span>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(draftVolume * 100)}
                    onChange={(event) => setDraftVolume(Number(event.target.value) / 100)}
                    className="w-full accent-[var(--color-brand)]"
                  />
                </label>
              </section>

              <Button fullWidth onClick={() => void handleSave()}>
                Save
              </Button>
              {savedNote ? (
                <p className="text-center font-body text-xs text-success">{savedNote}</p>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
