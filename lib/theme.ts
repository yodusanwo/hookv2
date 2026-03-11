/**
 * Theme helpers for section background vs text contrast.
 * Light backgrounds use dark text (#1E1E1E); dark (e.g. navy) uses light text.
 */

const LIGHT_BACKGROUND_HEX = new Set([
  "#d4f2ff",
  "#e6f7ff",
  "#ffffff",
  "#f2f2f5",
  "#f1f5f9",
  "#fafafc",
]);

export function isLightBackgroundColor(hex: string | undefined | null): boolean {
  if (!hex || typeof hex !== "string") return false;
  return LIGHT_BACKGROUND_HEX.has(hex.toLowerCase().trim());
}
