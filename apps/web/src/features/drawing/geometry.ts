import type { Point } from "@partyverse/shared";

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Map a pointer position into the canvas rect as a normalized Point in [0, 1]. */
export function toNormalized(clientX: number, clientY: number, rect: DOMRect): Point {
  const width = rect.width || 1;
  const height = rect.height || 1;
  return {
    x: clamp01((clientX - rect.left) / width),
    y: clamp01((clientY - rect.top) / height),
  };
}

const average = (a: number, b: number) => (a + b) / 2;

/** Standard perfect-freehand helper: outline points → SVG path `d` string. */
export function getSvgPathFromStroke(points: number[][], closed = true): string {
  const len = points.length;
  if (len < 4) {
    return "";
  }

  const first = points[0];
  const second = points[1];
  const third = points[2];
  if (!first || !second || !third) {
    return "";
  }

  let a = first;
  let b = second;
  const c = third;

  let result = `M${a[0]!.toFixed(2)},${a[1]!.toFixed(2)} Q${b[0]!.toFixed(2)},${b[1]!.toFixed(
    2,
  )} ${average(b[0]!, c[0]!).toFixed(2)},${average(b[1]!, c[1]!).toFixed(2)} T`;

  for (let i = 2, max = len - 1; i < max; i++) {
    a = points[i]!;
    b = points[i + 1]!;
    result += `${average(a[0]!, b[0]!).toFixed(2)},${average(a[1]!, b[1]!).toFixed(2)} `;
  }

  if (closed) {
    result += "Z";
  }

  return result;
}
