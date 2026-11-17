import { useEffect, useRef, useState } from "react";
import { Button, Card } from "../../components/ui";
import type { KartInput, WishKartState } from "./logic";
import { emptyInput, joinKart, setKartInput } from "./logic";
import { useGamepadSteer } from "./useGamepadSteer";

type WishKartPhoneProps = {
  playerId: string;
  playerName: string;
  state: WishKartState;
  onStateChange: (next: WishKartState) => void;
  onLeave: () => void;
};

const ITEM_LABEL = {
  mushroom: "Mushroom",
  banana: "Banana",
  shell: "Shell",
} as const;

export function WishKartPhone({
  playerId,
  playerName,
  state,
  onStateChange,
  onLeave,
}: WishKartPhoneProps) {
  const me = state.players.find((p) => p.id === playerId);
  const [input, setInput] = useState<KartInput>(emptyInput());
  const stateRef = useRef(state);
  stateRef.current = state;
  const joinedRef = useRef(false);
  const inputRef = useRef(input);
  inputRef.current = input;

  useEffect(() => {
    if (joinedRef.current || state.status !== "lobby") {
      return;
    }
    if (state.players.some((p) => p.id === playerId && !p.isBot)) {
      joinedRef.current = true;
      return;
    }
    joinedRef.current = true;
    onStateChange(joinKart(state, playerId, playerName));
  }, [state, playerId, playerName, onStateChange]);

  useGamepadSteer(Boolean(me) && state.status !== "lobby", (pad) => {
    setInput((prev) => ({
      ...prev,
      steer: pad.steer || prev.steer,
      gas: pad.gas || prev.gas,
      brake: pad.brake || prev.brake,
      drift: pad.drift || prev.drift,
      useItem: pad.useItem,
    }));
  });

  useEffect(() => {
    if (!me || me.isBot || state.status === "lobby") {
      return;
    }
    onStateChange(setKartInput(stateRef.current, playerId, input));
    if (input.useItem) {
      setInput((prev) => ({ ...prev, useItem: false }));
    }
  }, [input, playerId, me, state.status, onStateChange]);

  function patch(partial: Partial<KartInput>) {
    setInput((prev) => ({ ...prev, ...partial }));
  }

  if (!me || me.isBot) {
    return (
      <Card className="flex w-full max-w-sm flex-col gap-4 text-center">
        <h1 className="font-display text-sm uppercase text-ink">Wish Kart</h1>
        <p className="font-body text-sm text-muted">Lobby full or race already started.</p>
        <Button onClick={onLeave}>Leave</Button>
      </Card>
    );
  }

  const racing = state.status === "countdown" || state.status === "racing";

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Card className="space-y-2 text-center" style={{ backgroundColor: me.color }}>
        <p className="font-display text-[10px] uppercase tracking-widest text-ink/70">Wish Kart</p>
        <h1 className="font-body text-xl font-extrabold text-ink">{playerName}</h1>
        <p className="font-body text-sm text-ink/80">
          {Math.min(100, Math.max(0, Math.round((me.z / state.finishZ) * 100)))}% to finish
          {me.item ? ` · ${ITEM_LABEL[me.item]}` : ""}
          {state.status === "finished" && state.winnerId === playerId ? " · You win!" : ""}
        </p>
      </Card>

      {racing ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <HoldButton
              label="◀"
              color="#B8D4FF"
              className="h-28 text-2xl"
              onHold={(down) =>
                patch({
                  steer: down ? -1 : inputRef.current.steer === -1 ? 0 : inputRef.current.steer,
                })
              }
            />
            <HoldButton
              label="▶"
              color="#FFB4C8"
              className="h-28 text-2xl"
              onHold={(down) =>
                patch({
                  steer: down ? 1 : inputRef.current.steer === 1 ? 0 : inputRef.current.steer,
                })
              }
            />
          </div>

          <HoldButton
            label="GAS"
            color="#86E3C2"
            className="h-24 text-lg"
            onHold={(down) => patch({ gas: down })}
          />

          <div className="grid grid-cols-2 gap-3">
            <HoldButton
              label="Brake"
              color="#F0F0F0"
              className="h-16 text-sm"
              onHold={(down) => patch({ brake: down })}
            />
            <HoldButton
              label="Drift"
              color="#FFE566"
              className="h-16 text-sm"
              onHold={(down) => patch({ drift: down })}
            />
          </div>

          <button
            type="button"
            disabled={!me.item}
            className="flex h-16 items-center justify-center rounded-[1.4rem] border-[3px] border-ink bg-[#7C5CFF] font-display text-sm uppercase tracking-widest text-white shadow-[4px_4px_0_#1a1a1a] disabled:opacity-40"
            onClick={() => patch({ useItem: true })}
          >
            {me.item ? `Use ${ITEM_LABEL[me.item]}` : "No item"}
          </button>
        </>
      ) : (
        <Card className="text-center">
          <p className="font-body text-sm text-muted">
            {state.status === "lobby"
              ? "You're in. Wait for the host to start — CPUs fill empty slots."
              : "Race over — watch the TV podium."}
          </p>
        </Card>
      )}

      <p className="text-center font-body text-xs text-muted">
        Gamepad: A gas · B brake · stick steer · LB drift · X item
      </p>

      <Button variant="secondary" onClick={onLeave}>
        Leave
      </Button>
    </div>
  );
}

function HoldButton({
  label,
  color,
  className,
  onHold,
}: {
  label: string;
  color: string;
  className?: string;
  onHold: (down: boolean) => void;
}) {
  return (
    <button
      type="button"
      className={`flex items-center justify-center rounded-[1.4rem] border-[3px] border-ink font-display uppercase tracking-widest text-ink shadow-[4px_4px_0_#1a1a1a] active:translate-y-0.5 ${className ?? ""}`}
      style={{ backgroundColor: color }}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        onHold(true);
      }}
      onPointerUp={() => onHold(false)}
      onPointerCancel={() => onHold(false)}
    >
      {label}
    </button>
  );
}
