import { cn } from "../../lib/cn";
import type { ConnectFourCell, ConnectFourColor, ConnectFourState } from "../session/types";
import { C4_COLS, C4_ROWS, cellToColor } from "./logic";

const COIN: Record<ConnectFourColor, string> = {
  yellow: "#FFE566",
  red: "#FF6B7A",
};

function Coin({
  color,
  className,
  ghost,
}: {
  color: ConnectFourColor;
  className?: string;
  ghost?: boolean;
}) {
  return (
    <span
      className={cn(
        "box-border inline-block rounded-full border-[3px] border-[#1a1a1a]",
        ghost ? "opacity-90 shadow-none" : "shadow-[2px_2px_0_#1a1a1a]",
        className,
      )}
      style={{ backgroundColor: COIN[color] }}
    />
  );
}

type ConnectFourBoardProps = {
  state: ConnectFourState;
  className?: string;
};

export function ConnectFourBoard({ state, className }: ConnectFourBoardProps) {
  const hoverColor = state.turn;

  return (
    <div className={cn("w-full max-w-3xl", className)}>
      {/* Hover coin stays inside the blue frame so nothing overflows the board */}
      <div className="brutal-card overflow-hidden rounded-[1.6rem] bg-[#3B6FE8] p-3 sm:p-4">
        <div
          className="mb-2 grid gap-1.5 sm:mb-3 sm:gap-2"
          style={{ gridTemplateColumns: `repeat(${C4_COLS}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: C4_COLS }, (_, col) => (
            <div key={`hover-${col}`} className="flex aspect-square items-center justify-center">
              {state.status === "playing" && state.hoverCol === col ? (
                <Coin color={hoverColor} className="h-[85%] w-[85%]" ghost />
              ) : (
                <span className="h-[85%] w-[85%] rounded-full bg-[#2f5fd0]/35" />
              )}
            </div>
          ))}
        </div>

        <div
          className="grid gap-1.5 sm:gap-2"
          style={{ gridTemplateColumns: `repeat(${C4_COLS}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: C4_ROWS }, (_, row) =>
            Array.from({ length: C4_COLS }, (_, col) => {
              const cell = (state.board[row]?.[col] ?? 0) as ConnectFourCell;
              const color = cellToColor(cell);
              return (
                <div
                  key={`${row}-${col}`}
                  className="relative aspect-square overflow-hidden rounded-full border-[3px] border-[#1a1a1a] bg-[#f7f1e4]"
                >
                  {color ? (
                    <Coin color={color} className="absolute inset-0 h-full w-full shadow-none" />
                  ) : null}
                </div>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}
