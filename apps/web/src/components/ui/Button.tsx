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
    "bg-brand text-white border-2 border-white/15 shadow-[0_5px_0_#2347a8] hover:bg-brand-hover active:translate-y-1 active:shadow-[0_2px_0_#2347a8]",
  secondary:
    "bg-surface-raised text-ink border-2 border-white/10 shadow-[0_5px_0_#0b1220] hover:bg-[#273352] active:translate-y-1 active:shadow-[0_2px_0_#0b1220]",
  ghost:
    "bg-white/5 text-ink border-2 border-white/15 shadow-[0_4px_0_rgb(0_0_0_/_0.35)] hover:bg-white/10 active:translate-y-1 active:shadow-none",
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
      whileTap={disabled || reduceMotion ? undefined : { scale: 0.96 }}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl font-display uppercase tracking-wide",
        "transition-[transform,box-shadow,background-color] duration-150",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0 disabled:active:shadow-[0_5px_0_#2347a8]",
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
