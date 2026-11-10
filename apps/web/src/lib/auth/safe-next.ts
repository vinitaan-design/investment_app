const BASE = "https://investkea.invalid";

/**
 * Returns an in-app path to send the user to after sign-in. Anything that could leave the
 * site (absolute URLs, protocol-relative "//", backslash tricks, other schemes) falls back.
 */
export function safeNextPath(next: string | null | undefined, fallback = "/app"): string {
  if (!next || typeof next !== "string") return fallback;
  if (next.length > 512) return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  // Control characters (incl. tab/newline, which browsers strip) are never valid here.
  if (/[\u0000-\u001f\u007f]/.test(next)) return fallback;
  try {
    const url = new URL(next, BASE);
    if (url.origin !== BASE) return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
