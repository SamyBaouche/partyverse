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
  /** Shows busy state and sets aria-busy (still uses disabled when true). */
  loading?: boolean;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-white border-[3px] border-line shadow-[4px_4px_0_var(--color-hard-shadow)] hover:bg-brand-hover active:translate-y-0.5 active:shadow-[2px_2px_0_var(--color-hard-shadow)]",
  secondary:
    "bg-panel text-ink border-[3px] border-line shadow-[4px_4px_0_var(--color-hard-shadow)] hover:bg-panel-muted active:translate-y-0.5 active:shadow-[2px_2px_0_var(--color-hard-shadow)]",
  ghost:
    "bg-[#ffe566] text-[#1a1a1a] border-[3px] border-line shadow-[4px_4px_0_var(--color-hard-shadow)] hover:brightness-105 active:translate-y-0.5 active:shadow-[2px_2px_0_var(--color-hard-shadow)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "h-10 px-4 text-[10px] leading-none",
  lg: "h-12 px-6 text-xs leading-none",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  className,
  type = "button",
  disabled,
  children,
  onClick,
  ...props
}: ButtonProps) {
  const { play } = useSound();
  const reduceMotion = useReducedMotion();
  const busy = Boolean(disabled || loading);

  return (
    <motion.button
      type={type}
      disabled={busy}
      aria-busy={loading || undefined}
      whileTap={busy || reduceMotion ? undefined : { scale: 0.96 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-display uppercase tracking-wide",
        "transition-[transform,box-shadow,background-color] duration-150",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0 disabled:active:shadow-[4px_4px_0_var(--color-hard-shadow)]",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      onClick={(event) => {
        if (!busy) {
          void play("click");
        }
        onClick?.(event);
      }}
      {...props}
    >
      {loading ? (
        <span
          className="h-3.5 w-3.5 rounded-full border-2 border-current border-r-transparent motion-safe:animate-[spin_0.7s_linear_infinite]"
          aria-hidden
        />
      ) : null}
      {children}
    </motion.button>
  );
}
