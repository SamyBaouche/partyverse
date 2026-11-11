import type { ButtonHTMLAttributes } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "../../lib/cn";
import { useSound } from "../../lib/audio";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "md" | "lg";

type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd"
> & {
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
  onClick,
  ...props
}: ButtonProps) {
  const { play } = useSound();
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileTap={disabled || reduceMotion ? undefined : { scale: 0.95 }}
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
      onClick={(event) => {
        if (!disabled) {
          play("click");
        }
        onClick?.(event);
      }}
      {...props}
    />
  );
}
