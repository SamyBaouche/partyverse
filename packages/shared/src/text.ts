/**
 * Normalize free-text answers for comparison.
 * "Éléphant " → "elephant" (no accents, case, or surrounding spaces).
 */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}
