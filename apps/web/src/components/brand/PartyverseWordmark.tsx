import { cn } from "../../lib/cn";

const LETTERS = [
  { ch: "P", color: "#FF6B7A" },
  { ch: "a", color: "#4EA1FF" },
  { ch: "r", color: "#FFE566" },
  { ch: "t", color: "#86E3C2" },
  { ch: "y", color: "#FF9EAA" },
  { ch: "v", color: "#4EA1FF" },
  { ch: "e", color: "#FFE566" },
  { ch: "r", color: "#86E3C2" },
  { ch: "s", color: "#FF6B7A" },
  { ch: "e", color: "#FFB4C8" },
] as const;

type PartyverseWordmarkProps = {
  className?: string;
};

/** Squabble-inspired multicolor wordmark with thick ink outline. */
export function PartyverseWordmark({ className }: PartyverseWordmarkProps) {
  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-end font-display text-lg uppercase leading-none tracking-tight sm:text-xl",
        className,
      )}
      aria-label="Partyverse"
    >
      {LETTERS.map((letter, index) => (
        <span
          key={`${letter.ch}-${index}`}
          className="wordmark-letter"
          style={{ color: letter.color }}
        >
          {letter.ch}
        </span>
      ))}
    </span>
  );
}
