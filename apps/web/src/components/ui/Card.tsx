import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn("brutal-panel rounded-[1.6rem] bg-surface p-6 text-ink", className)}
      {...props}
    />
  );
}
