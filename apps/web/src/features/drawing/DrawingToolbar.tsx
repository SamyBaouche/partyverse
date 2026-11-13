import type { StrokeColor, StrokeTool } from "@partyverse/shared";
import { Button } from "../../components/ui";
import { cn } from "../../lib/cn";
import { ColorPalette } from "./ColorPalette";

type DrawingToolbarProps = {
  color: StrokeColor;
  tool: StrokeTool;
  disabled?: boolean;
  onColorChange: (color: StrokeColor) => void;
  onToolChange: (tool: StrokeTool) => void;
  onClear: () => void;
  className?: string;
};

export function DrawingToolbar({
  color,
  tool,
  disabled = false,
  onColorChange,
  onToolChange,
  onClear,
  className,
}: DrawingToolbarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <ColorPalette
        value={color}
        onChange={(next) => {
          onColorChange(next);
          onToolChange("pen");
        }}
        disabled={disabled}
      />

      <button
        type="button"
        aria-pressed={tool === "eraser"}
        aria-label="Eraser"
        disabled={disabled}
        onClick={() => onToolChange(tool === "eraser" ? "pen" : "eraser")}
        className={cn(
          "inline-flex h-11 items-center justify-center rounded-2xl border-2 px-4",
          "font-display text-[10px] uppercase tracking-wide transition-[transform,background-color] duration-150",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
          "disabled:cursor-not-allowed disabled:opacity-50",
          tool === "eraser"
            ? "scale-105 border-white bg-white/15 text-ink"
            : "border-white/15 bg-white/5 text-muted hover:bg-white/10 hover:text-ink",
        )}
      >
        Eraser
      </button>

      <Button
        type="button"
        variant="secondary"
        disabled={disabled}
        onClick={onClear}
        className="ml-auto"
      >
        Clear
      </Button>
    </div>
  );
}
