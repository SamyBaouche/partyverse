import { useState, type FormEvent } from "react";
import { PlayerName } from "@partyverse/shared";
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
  code,
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
    <Card className="flex w-full max-w-sm flex-col gap-6">
      <div className="text-center">
        <p className="font-display text-[10px] uppercase tracking-[0.35em] text-muted">Room</p>
        <p className="room-code font-display mt-3 text-3xl" aria-label={`Room code ${code}`}>
          {code}
        </p>
      </div>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
        <Input
          label="Nickname"
          placeholder="Your nickname"
          value={name}
          onChange={(event) => {
            setFieldError(null);
            onNameChange(event.target.value);
          }}
          error={error}
          autoFocus
          autoComplete="off"
          enterKeyHint="go"
          maxLength={16}
          disabled={submitting}
        />
        <Button type="submit" fullWidth size="lg" disabled={submitting}>
          {submitting ? "Joining..." : "Join"}
        </Button>
      </form>
    </Card>
  );
}
