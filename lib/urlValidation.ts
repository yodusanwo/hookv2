/**
 * Validates Sanity-sourced URLs to prevent XSS and open redirects.
 * Only allows relative paths (/, #), and absolute http(s) URLs.
 */
export function isValidHref(href: string): boolean {
  if (!href || typeof href !== "string") return false;
  const trimmed = href.trim();
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return true;
  try {
    const u = new URL(trimmed);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Returns a safe href for use in anchor/Link elements.
 * Invalid URLs are replaced with "#" to avoid XSS/open redirect.
 */
export function safeHref(href: string | undefined | null): string {
  if (!href) return "#";
  return isValidHref(href) ? href.trim() : "#";
}
