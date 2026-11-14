import {
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "../../../lib/cn";

type TiltChipProps = {
  lean: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  as?: "a" | "button" | "div";
  href?: string;
  disabled?: boolean;
  onClick?: () => void;
  "aria-label"?: string;
};

/** Hero-only chip: leans at rest, tilts toward the pointer. */
export function TiltChip({
  lean,
  className,
  style,
  children,
  as = "button",
  href,
  disabled,
  onClick,
  "aria-label": ariaLabel,
}: TiltChipProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);
  const [tilt, setTilt] = useState({ rotate: lean, x: 0, y: 0, scale: 1 });
  const canPress = as !== "div" && !disabled;
  const canTilt = !reduceMotion;

  function handlePointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (!canTilt) {
      return;
    }
    const node = ref.current;
    if (!node) {
      return;
    }
    const rect = node.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setActive(true);
    setTilt({
      rotate: lean + px * 28,
      x: px * 22,
      y: py * 16 - 6,
      scale: 1.08,
    });
  }

  function resetTilt() {
    setActive(false);
    setTilt({ rotate: lean, x: 0, y: 0, scale: 1 });
  }

  const motionProps = {
    className: cn(
      "inline-block max-w-full origin-center will-change-transform",
      canPress &&
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
      className,
    ),
    style: { transformStyle: "preserve-3d" as const, ...style },
    initial: reduceMotion ? false : ({ rotate: lean * 0.35, y: 14, opacity: 0 } as const),
    animate: reduceMotion
      ? { rotate: 0, x: 0, y: 0, scale: 1, opacity: 1 }
      : active
        ? {
            rotate: tilt.rotate,
            x: tilt.x,
            y: tilt.y,
            scale: tilt.scale,
            opacity: 1,
          }
        : {
            rotate: [lean, lean + 4.5, lean - 3.5, lean + 2, lean],
            x: [0, lean > 0 ? 6 : -6, lean > 0 ? -4 : 4, 0],
            y: [0, -5, -2, -6, 0],
            scale: 1,
            opacity: 1,
          },
    transition: reduceMotion
      ? { duration: 0 }
      : active
        ? { type: "spring" as const, stiffness: 380, damping: 12, mass: 0.55 }
        : {
            rotate: { duration: 3.2, repeat: Infinity, ease: "easeInOut" as const },
            x: { duration: 3.2, repeat: Infinity, ease: "easeInOut" as const },
            y: { duration: 2.6, repeat: Infinity, ease: "easeInOut" as const },
            opacity: { duration: 0.45 },
          },
    whileTap: canPress ? { scale: 0.93, rotate: lean * 1.6 } : undefined,
    onPointerMove: handlePointerMove,
    onPointerLeave: resetTilt,
    onPointerCancel: resetTilt,
  };

  if (as === "a" && href) {
    return (
      <motion.a
        ref={ref as RefObject<HTMLAnchorElement>}
        href={href}
        aria-label={ariaLabel}
        {...motionProps}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={ref as RefObject<HTMLButtonElement>}
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      {...motionProps}
    >
      {children}
    </motion.button>
  );
}

export const CHIP_SHELL =
  "rounded-2xl border-[3px] border-ink px-4 py-3 text-left font-body font-extrabold leading-tight tracking-tight text-ink shadow-[4px_4px_0_var(--color-hard-shadow)] sm:rounded-[1.35rem] sm:px-5 sm:py-3.5";
