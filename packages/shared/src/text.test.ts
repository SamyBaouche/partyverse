import { describe, expect, it } from "vitest";
import { normalize } from "./text.js";

describe("normalize", () => {
  it("strips accents, case and surrounding spaces", () => {
    expect(normalize("  Éléphant ")).toBe("elephant");
  });

  it("lowercases ASCII letters", () => {
    expect(normalize("CAT")).toBe("cat");
  });

  it("keeps an empty string empty after trim", () => {
    expect(normalize("   ")).toBe("");
    expect(normalize("")).toBe("");
  });

  it("accepts accented guesses that match the normalized word", () => {
    expect(normalize("  CÂT ")).toBe("cat");
  });
});
