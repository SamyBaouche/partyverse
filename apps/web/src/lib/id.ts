/** Safe id for HTTP LAN / older Safari (no secure-context randomUUID). */
export function newClientId(prefix = "p"): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {
      // Non-secure contexts (http://LAN) can throw on some browsers.
    }
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
