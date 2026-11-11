import { useSound } from "../lib/audio";

export function MuteToggle() {
  const { muted, toggleMute, play } = useSound();

  return (
    <button
      type="button"
      className="fixed top-4 right-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-surface/90 text-brand shadow-[0_4px_0_rgb(0_0_0_/_0.35)] backdrop-blur-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      aria-label={muted ? "Unmute sound" : "Mute sound"}
      aria-pressed={muted}
      onClick={() => {
        toggleMute();
        if (muted) {
          play("click");
        }
      }}
    >
      {muted ? (
        <span aria-hidden className="font-display text-[10px] text-ink">
          OFF
        </span>
      ) : (
        <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
          <path d="M4 10v4h3l5 4V6L7 10H4z" />
          <path d="M16 9c1.2 1 1.8 2.2 1.8 3s-.6 2-1.8 3" />
          <path d="M18.5 7c1.8 1.6 2.8 3.4 2.8 5s-1 3.4-2.8 5" />
        </svg>
      )}
    </button>
  );
}
