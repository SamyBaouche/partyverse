import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type AvatarSize = "sm" | "md" | "lg";

type PlayerAvatarProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  name: string;
  size?: AvatarSize;
};

const AVATAR_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-cyan-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-pink-500",
] as const;

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function PlayerAvatar({ name, size = "md", className, ...props }: PlayerAvatarProps) {
  const initials = name.trim().slice(0, 2).toUpperCase();
  const color = AVATAR_COLORS[hashName(name) % AVATAR_COLORS.length];

  return (
    <div
      role="img"
      aria-label={name}
      title={name}
      className={cn(
        "inline-flex animate-pop-in items-center justify-center rounded-full font-semibold text-white",
        "ring-2 ring-accent/80 shadow-[0_0_12px_rgb(0_240_255_/_0.55)]",
        sizeClasses[size],
        color,
        className,
      )}
      {...props}
    >
      {initials}
    </div>
  );
}
