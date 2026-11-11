import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-accent/40 bg-surface/80 p-6 backdrop-blur-sm neon-border",
        className,
      )}
      {...props}
    />
  );
}
