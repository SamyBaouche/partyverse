import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type AvatarSize = "sm" | "md" | "lg";

type PlayerAvatarProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  name: string;
  size?: AvatarSize;
};

const AVATAR_COLORS = [
  "bg-[#ff5a6a]",
  "bg-[#ff9f43]",
  "bg-[#ffd23f]",
  "bg-[#3ddc84]",
  "bg-[#4ea1ff]",
  "bg-[#7c6cff]",
  "bg-[#ff5ac8]",
  "bg-[#2dd4bf]",
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
        "inline-flex animate-pop-in items-center justify-center rounded-2xl font-bold text-white",
        "border-2 border-white shadow-[0_4px_0_rgb(15_23_42_/_0.12)]",
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
