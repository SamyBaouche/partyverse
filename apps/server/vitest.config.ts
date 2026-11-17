import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: ["src/game/**/*.ts"],
      exclude: ["src/**/*.test.ts"],
      reporter: ["text", "html", "cobertura"],
      // Metric Z gate (#40) — measured baseline ~86%; fail CI if engine coverage drops.
      thresholds: {
        statements: 80,
        lines: 80,
        functions: 80,
        // Measured ~67% branches on game engine — gate just below baseline.
        branches: 65,
      },
    },
  },
});
