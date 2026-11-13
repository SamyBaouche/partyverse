import { useEffect, useRef, useState, type FormEvent } from "react";
import { ClientMessage } from "@partyverse/shared";
import { motion, useAnimationControls, useReducedMotion } from "motion/react";
import { Button, Input } from "../../components/ui";
import { useSound } from "../../lib/audio";
import { cn } from "../../lib/cn";

const COOLDOWN_MS = 1500;

type GuessInputProps = {
  onGuess: (text: string) => Promise<{ correct: boolean }>;
  locked?: boolean;
  disabled?: boolean;
  className?: string;
};

export function GuessInput({
  onGuess,
  locked = false,
  disabled = false,
  className,
}: GuessInputProps) {
  const { play } = useSound();
  const reduceMotion = useReducedMotion();
  const controls = useAnimationControls();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  const coolingDown = now < cooldownUntil;
  const busy = locked || disabled || submitting || coolingDown;

  useEffect(() => {
    if (!coolingDown) {
      return;
    }
    const id = window.setInterval(() => setNow(Date.now()), 50);
    return () => window.clearInterval(id);
  }, [coolingDown]);

  useEffect(() => {
    if (!locked) {
      inputRef.current?.focus();
    }
  }, [locked, coolingDown]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) {
      return;
    }

    const parsed = ClientMessage.safeParse({ type: "guess", text: value });
    if (!parsed.success || parsed.data.type !== "guess") {
      setError(parsed.error?.issues[0]?.message ?? "Enter a guess (1–50 characters)");
      return;
    }

    const text = parsed.data.text;
    setError(null);
    setSubmitting(true);

    try {
      const result = await onGuess(text);
      setValue("");
      setCooldownUntil(Date.now() + COOLDOWN_MS);
      setNow(Date.now());

      if (result.correct) {
        void play("correct");
      } else {
        void play("wrong");
        if (!reduceMotion) {
          await controls.start({
            x: [0, -10, 10, -8, 8, -4, 4, 0],
            transition: { duration: 0.45 },
          });
        }
      }
    } finally {
      setSubmitting(false);
      // Keep the mobile keyboard open after send.
      window.requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  const cooldownProgress = coolingDown ? Math.max(0, (cooldownUntil - now) / COOLDOWN_MS) : 0;

  return (
    <motion.form
      className={cn("flex w-full flex-col gap-3", className)}
      onSubmit={(event) => {
        void handleSubmit(event);
      }}
      animate={controls}
      noValidate
    >
      <Input
        ref={inputRef}
        label="Your guess"
        placeholder="Type your guess"
        value={value}
        onChange={(event) => {
          setError(null);
          setValue(event.target.value);
        }}
        error={error ?? undefined}
        disabled={locked || disabled || submitting}
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="send"
        maxLength={50}
      />
      <div className="relative">
        <Button
          type="submit"
          fullWidth
          size="lg"
          disabled={busy}
          className="relative overflow-hidden"
        >
          {locked ? "Locked in" : submitting ? "Sending..." : coolingDown ? "Wait…" : "Send"}
        </Button>
        {coolingDown ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-2 bottom-1.5 h-1 overflow-hidden rounded-full bg-white/15"
          >
            <span
              className="block h-full rounded-full bg-accent transition-[width] duration-75 ease-linear"
              style={{ width: `${cooldownProgress * 100}%` }}
            />
          </span>
        ) : null}
      </div>
    </motion.form>
  );
}
