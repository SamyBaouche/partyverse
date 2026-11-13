import { useEffect, useId, useRef, useState } from "react";
import type { StrokeColor } from "@partyverse/shared";
import { cn } from "../../lib/cn";
import { DRAW_COLORS } from "./colors";

type ColorPaletteProps = {
  value: StrokeColor;
  onChange: (color: StrokeColor) => void;
  disabled?: boolean;
  className?: string;
};

function normalizeHex(value: string): StrokeColor | null {
  const trimmed = value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
    return trimmed.toUpperCase() as StrokeColor;
  }
  if (/^[0-9A-Fa-f]{6}$/.test(trimmed)) {
    return `#${trimmed.toUpperCase()}` as StrokeColor;
  }
  return null;
}

/**
 * Single color chip that opens a popover with many swatches + free picker.
 */
export function ColorPalette({ value, onChange, disabled = false, className }: ColorPaletteProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const root = rootRef.current;
      if (!root || !(event.target instanceof Node)) {
        return;
      }
      if (!root.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function pick(color: StrokeColor) {
    onChange(color);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-label="Choose ink color"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        disabled={disabled}
        onClick={() => setOpen((previous) => !previous)}
        className={cn(
          "h-11 w-11 rounded-full border-2 transition-[transform,box-shadow] duration-150",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
          "disabled:cursor-not-allowed disabled:opacity-50",
          open
            ? "scale-110 border-white shadow-[0_0_0_3px_rgb(91_157_255_/_0.55)]"
            : "border-white/30 hover:scale-105",
        )}
        style={{ backgroundColor: value }}
      />

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Color picker"
          className={cn(
            "absolute bottom-full left-0 z-20 mb-3 w-[min(18rem,calc(100vw-2rem))]",
            "rounded-2xl border border-white/15 bg-[#0b1220]/90 p-3 shadow-xl backdrop-blur-md",
          )}
        >
          <div className="grid grid-cols-6 gap-2" role="listbox" aria-label="Swatches">
            {DRAW_COLORS.map((color) => {
              const selected = color.toUpperCase() === value.toUpperCase();
              return (
                <button
                  key={color}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  aria-label={`Color ${color}`}
                  onClick={() => pick(color)}
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-transform duration-100",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                    selected ? "scale-110 border-white" : "border-white/20 hover:scale-105",
                  )}
                  style={{ backgroundColor: color }}
                />
              );
            })}
          </div>

          <label className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <span className="font-display text-[9px] uppercase tracking-widest text-muted">
              Any
            </span>
            <input
              type="color"
              value={value}
              aria-label="Custom color"
              className="h-9 w-full cursor-pointer rounded-lg border-0 bg-transparent p-0"
              onChange={(event) => {
                const next = normalizeHex(event.target.value);
                if (next) {
                  onChange(next);
                }
              }}
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
