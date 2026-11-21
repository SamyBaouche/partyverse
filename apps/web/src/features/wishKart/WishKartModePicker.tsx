import { ModeScreenHeader } from "../../components/brand/ModeScreenHeader";
import { Button } from "../../components/ui";

type WishKartModePickerProps = {
  onStart: () => void;
  onBack: () => void;
};

export function WishKartModePicker({ onStart, onBack }: WishKartModePickerProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 py-8 sm:px-8">
      <ModeScreenHeader onBack={onBack} />
      <div className="brutal-panel space-y-5 rounded-[1.8rem] bg-[#FFE566] p-6 text-center sm:p-10">
        <p className="font-display text-[10px] uppercase tracking-[0.22em] text-ink/70">
          Controller friendly
        </p>
        <h1 className="font-body text-3xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Kart Rush
        </h1>
        <p className="mx-auto max-w-lg font-body text-base text-ink/80 sm:text-lg">
          Fullscreen forward race with real cars. Dodge cones, rocks, barriers and oil. Phones or
          gamepads — CPUs fill empty slots.
        </p>
        <svg viewBox="0 0 240 120" className="mx-auto h-28 w-full max-w-sm" aria-hidden>
          <rect width="240" height="50" fill="#7EC8FF" />
          <rect y="50" width="240" height="70" fill="#2f6b45" />
          <polygon
            points="110,50 130,50 220,120 20,120"
            fill="#3d3d3d"
            stroke="#1a1a1a"
            strokeWidth="2"
          />
          <rect x="116" y="70" width="8" height="18" fill="#f8fbff" opacity="0.8" />
          <rect x="114" y="92" width="12" height="14" fill="#f8fbff" opacity="0.9" />
          <rect
            x="100"
            y="95"
            width="40"
            height="18"
            rx="5"
            fill="#FF6B7A"
            stroke="#1a1a1a"
            strokeWidth="2"
          />
          <rect
            x="70"
            y="78"
            width="22"
            height="12"
            rx="4"
            fill="#4EA1FF"
            stroke="#1a1a1a"
            strokeWidth="2"
          />
          <rect
            x="150"
            y="72"
            width="18"
            height="10"
            rx="3"
            fill="#86E3C2"
            stroke="#1a1a1a"
            strokeWidth="2"
          />
        </svg>
        <Button size="lg" fullWidth onClick={onStart} className="!h-16">
          Open lobby
        </Button>
      </div>
    </div>
  );
}
