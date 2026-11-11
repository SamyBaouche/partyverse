import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-white neon-border-pink hover:bg-brand-hover shadow-[0_4px_0_#8a0070] active:translate-y-1 active:shadow-[0_1px_0_#8a0070]",
  secondary:
    "bg-surface-raised text-accent neon-border hover:bg-[#2f0058] shadow-[0_4px_0_#0a4a55] active:translate-y-1 active:shadow-[0_1px_0_#0a4a55]",
  ghost:
    "bg-transparent text-neon-yellow border border-neon-yellow/50 hover:bg-surface-raised/60 shadow-[0_3px_0_rgb(255_230_0_/_0.25)] active:translate-y-1 active:shadow-none",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "h-10 px-4 text-[10px] leading-none",
  lg: "h-12 px-6 text-xs leading-none",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  type = "button",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-display uppercase tracking-wide",
        "transition-[transform,box-shadow,background-color] duration-150",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0 disabled:active:shadow-[0_4px_0_#8a0070]",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  );
}
