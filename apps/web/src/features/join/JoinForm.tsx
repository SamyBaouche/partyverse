import { useState, type FormEvent } from "react";
import { PlayerName } from "@partyverse/shared";
import { PartyverseWordmark } from "../../components/brand/PartyverseWordmark";
import { Button, Card, Input } from "../../components/ui";

type JoinFormProps = {
  code: string;
  name: string;
  onNameChange: (name: string) => void;
  submitting: boolean;
  serverError?: string | null;
  onSubmit: (name: string) => void;
};

export function JoinForm({
  code: _code,
  name,
  onNameChange,
  submitting,
  serverError,
  onSubmit,
}: JoinFormProps) {
  const [fieldError, setFieldError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = PlayerName.safeParse(name);
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? "Invalid nickname");
      return;
    }
    setFieldError(null);
    onSubmit(result.data);
  }

  const error = fieldError ?? serverError ?? undefined;

  return (
    <Card className="flex w-full max-w-md flex-col gap-6 sm:max-w-lg sm:gap-7">
      <div className="flex flex-col items-center gap-4 text-center sm:gap-5">
        <PartyverseWordmark className="text-xl sm:text-2xl" />
        <p className="font-display text-[11px] uppercase tracking-[0.35em] text-muted sm:text-xs">
          Join the party
        </p>
      </div>

      <form
        className="flex flex-col gap-5"
        onSubmit={handleSubmit}
        noValidate
        aria-busy={submitting || undefined}
      >
        <Input
          label="Your name"
          placeholder="Nickname"
          value={name}
          onChange={(event) => {
            setFieldError(null);
            onNameChange(event.target.value);
          }}
          error={error}
          autoFocus
          autoComplete="nickname"
          enterKeyHint="go"
          maxLength={16}
          disabled={submitting}
        />
        <Button type="submit" fullWidth size="lg" loading={submitting}>
          {submitting ? "Joining…" : "Join →"}
        </Button>
      </form>
    </Card>
  );
}
