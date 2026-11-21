import { useEffect, useRef } from "react";
import type { KartInput } from "./logic";

/**
 * Reads a connected gamepad into arcade racing controls (steer / accelerate).
 * Left stick / d-pad = steer · A/RT = gas · B/LT = brake · LB = drift · X/RB = item
 */
export function useGamepadSteer(
  enabled: boolean,
  onInput: (input: KartInput) => void,
  padIndex = 0,
): void {
  const onInputRef = useRef(onInput);
  onInputRef.current = onInput;

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    let raf = 0;
    let last: KartInput = {
      steer: 0,
      gas: false,
      brake: false,
      drift: false,
      useItem: false,
    };
    let prevItem = false;

    function poll() {
      const pads = navigator.getGamepads?.() ?? [];
      const pad = pads[padIndex];
      let steer = 0;
      let gas = false;
      let brake = false;
      let drift = false;
      let useItem = false;

      if (pad) {
        const axis = pad.axes[0] ?? 0;
        steer = Math.abs(axis) > 0.18 ? axis : 0;
        if (pad.buttons[14]?.pressed) {
          steer = -1;
        }
        if (pad.buttons[15]?.pressed) {
          steer = 1;
        }
        // 0=A gas, 1=B brake, 7=RT gas, 6=LT brake, 4=LB drift, 2=X / 5=RB item
        gas = Boolean(pad.buttons[0]?.pressed || pad.buttons[7]?.pressed);
        brake = Boolean(pad.buttons[1]?.pressed || pad.buttons[6]?.pressed);
        drift = Boolean(pad.buttons[4]?.pressed);
        const itemDown = Boolean(pad.buttons[2]?.pressed || pad.buttons[5]?.pressed);
        useItem = itemDown && !prevItem;
        prevItem = itemDown;
      }

      if (
        steer !== last.steer ||
        gas !== last.gas ||
        brake !== last.brake ||
        drift !== last.drift ||
        useItem !== last.useItem
      ) {
        last = { steer, gas, brake, drift, useItem };
        onInputRef.current(last);
      }
      raf = window.requestAnimationFrame(poll);
    }

    raf = window.requestAnimationFrame(poll);
    return () => window.cancelAnimationFrame(raf);
  }, [enabled, padIndex]);
}
