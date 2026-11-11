import confetti from "canvas-confetti";

const NEON_COLORS = ["#ff2bd6", "#00f0ff", "#ffe600", "#39ff14", "#ffffff"];

export function celebrate(): void {
  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    return;
  }

  void confetti({
    particleCount: 110,
    spread: 78,
    startVelocity: 42,
    origin: { y: 0.65 },
    colors: NEON_COLORS,
  });

  window.setTimeout(() => {
    void confetti({
      particleCount: 70,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: NEON_COLORS,
    });
    void confetti({
      particleCount: 70,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: NEON_COLORS,
    });
  }, 180);
}
