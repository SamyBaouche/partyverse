import type { StrokeColor } from "@partyverse/shared";
import { cn } from "../../lib/cn";
import { DRAW_COLORS } from "./colors";

type ColorPaletteProps = {
  value: StrokeColor;
  onChange: (color: StrokeColor) => void;
  disabled?: boolean;
  className?: string;
};

export function ColorPalette({ value, onChange, disabled = false, className }: ColorPaletteProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Ink color"
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      {DRAW_COLORS.map((color) => {
        const selected = color === value;
        return (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`Color ${color}`}
            disabled={disabled}
            onClick={() => onChange(color)}
            className={cn(
              "h-10 w-10 rounded-full border-2 transition-[transform,box-shadow] duration-150",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              "disabled:cursor-not-allowed disabled:opacity-50",
              selected
                ? "scale-110 border-white shadow-[0_0_0_3px_rgb(91_157_255_/_0.55)]"
                : "border-white/25 hover:scale-105",
            )}
            style={{ backgroundColor: color }}
          />
        );
      })}
    </div>
  );
}
