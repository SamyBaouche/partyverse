import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "brutal-panel rounded-[1.6rem] bg-surface p-6 text-ink sm:rounded-[1.8rem] sm:p-7",
        className,
      )}
      {...props}
    />
  );
}
