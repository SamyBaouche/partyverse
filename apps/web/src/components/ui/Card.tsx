import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn("toy-panel rounded-3xl bg-surface/95 p-6 text-ink backdrop-blur-sm", className)}
      {...props}
    />
  );
}
