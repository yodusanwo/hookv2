/**
 * Parses recipe slug from Sanity recipesBlock `url` (same rules as RecipesSection).
 */
export function recipeSlugFromSanityUrl(
  raw: string | undefined | null,
): string | null {
  if (!raw?.trim()) return null;
  let u = raw.trim();
  if (u.startsWith("http://") || u.startsWith("https://")) {
    try {
      const path = new URL(u).pathname;
      const m = path.match(/\/recipes\/([^/?#]+)/);
      return m ? decodeURIComponent(m[1]!) : null;
    } catch {
      return null;
    }
  }
  u = u.replace(/^\/+/, "");
  if (u === "recipes" || u === "") return null;
  if (u.startsWith("recipes/")) {
    const rest = u.slice("recipes/".length);
    return rest.split("/").filter(Boolean)[0] ?? null;
  }
  return u.split("/").filter(Boolean)[0] ?? null;
}
