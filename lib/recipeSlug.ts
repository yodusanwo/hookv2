/**
 * Normalizes the `[slug]` route param for recipe pages.
 * Trims accidental spaces / trailing %20 so Sanity `slug.current` still matches.
 */
export function normalizeRecipeSlugParam(raw: string | undefined): string {
  if (raw == null || typeof raw !== "string") return "";
  let s = raw;
  try {
    s = decodeURIComponent(s);
  } catch {
    // keep raw if encoding is invalid
  }
  return s.trim();
}
