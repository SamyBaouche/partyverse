import { cn } from "../../lib/cn";

type PartyverseLogoProps = {
  className?: string;
  /** When true, mark is drawn for cream splash fields. */
  tone?: "splash" | "ui";
};

/**
 * Partyverse mark: a soft portal tile with a play notch —
 * cream / coral neo-brutalist palette.
 */
export function PartyverseLogo({ className, tone = "ui" }: PartyverseLogoProps) {
  const fill = tone === "splash" ? "#FFF8EC" : "#FFE566";
  const ink = "#1A1A1A";
  const accent = tone === "splash" ? "#FF6B7A" : "#86E3C2";
  const secondary = tone === "splash" ? "#4EA1FF" : "#FF6B7A";

  return (
    <svg
      viewBox="0 0 120 120"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label="Partyverse"
    >
      <defs>
        <linearGradient id="pv-tile" x1="18" y1="12" x2="100" y2="108" gradientUnits="userSpaceOnUse">
          <stop stopColor={fill} />
          <stop offset="1" stopColor={accent} />
        </linearGradient>
      </defs>
      <rect x="10" y="10" width="100" height="100" rx="28" fill="url(#pv-tile)" stroke={ink} strokeWidth="5" />
      <rect x="22" y="22" width="76" height="76" rx="20" fill={ink} />
      <path
        d="M48 38c0-3.3 2.7-6 6-6h14c11 0 20 9 20 20s-9 20-20 20H60v16c0 3.3-2.7 6-6 6s-6-2.7-6-6V38z"
        fill={fill}
      />
      <circle cx="86" cy="34" r="8" fill={accent} stroke={ink} strokeWidth="3" />
      <path d="M78 78l22 10-22 10V78z" fill={secondary} stroke={ink} strokeWidth="3" />
    </svg>
  );
}
