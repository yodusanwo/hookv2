/**
 * Constrain Shopify CDN image bytes for thumbnails/cards.
 * Appends `width` (and optional `format`) query params when the URL is cdn.shopify.com.
 */
export function shopifyImageUrlForWidth(
  url: string | null | undefined,
  width: number,
  options?: { format?: "webp" | "jpg" | "pjpg" },
): string | null {
  if (!url?.trim()) return null;
  try {
    const u = new URL(url);
    if (!u.hostname.includes("cdn.shopify.com")) return url;
    u.searchParams.set("width", String(Math.max(1, Math.round(width))));
    if (options?.format) u.searchParams.set("format", options.format);
    return u.toString();
  } catch {
    return url;
  }
}
