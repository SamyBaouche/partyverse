import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, id, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex w-full flex-col gap-1.5 font-body">
      <label
        htmlFor={inputId}
        className="font-display text-[9px] uppercase tracking-[0.18em] text-ink"
      >
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "h-12 w-full rounded-2xl border-[3px] border-line bg-panel px-4 text-ink",
          "placeholder:text-muted",
          "transition-shadow duration-150",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
          "focus-visible:shadow-[3px_3px_0_var(--color-hard-shadow)]",
          error && "border-danger focus-visible:outline-danger",
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
});
