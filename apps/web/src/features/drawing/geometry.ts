import type { Point } from "@partyverse/shared";

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export type SurfaceRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/** Snapshot the drawable surface box (content box, no borders). */
export function readSurfaceRect(element: HTMLElement): SurfaceRect {
  const rect = element.getBoundingClientRect();
  return {
    left: rect.left,
    top: rect.top,
    width: Math.max(rect.width, 1),
    height: Math.max(rect.height, 1),
  };
}

/** Map a pointer position into the canvas rect as a normalized Point in [0, 1]. */
export function toNormalized(clientX: number, clientY: number, rect: SurfaceRect): Point {
  return {
    x: clamp01((clientX - rect.left) / rect.width),
    y: clamp01((clientY - rect.top) / rect.height),
  };
}
