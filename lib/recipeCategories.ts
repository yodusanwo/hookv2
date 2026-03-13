/**
 * Maps Shopify productType to recipe filter category values.
 * Used to derive recipe categories from ingredient-linked products for the /recipes page filters.
 */

export const RECIPE_FILTER_VALUES = [
  "salmon",
  "sablefish",
  "halibut",
  "scallops",
  "cod",
  "seafood",
  "smoked",
] as const;

export type RecipeFilterValue = (typeof RECIPE_FILTER_VALUES)[number];

/**
 * Maps a Shopify productType string to a recipe filter category value.
 * Returns "seafood" for unknown types so recipes still appear in a category.
 */
export function productTypeToCategory(productType: string | null | undefined): RecipeFilterValue | null {
  if (!productType || typeof productType !== "string") return null;
  const lower = productType.toLowerCase().trim();
  if (!lower) return null;

  if (lower.includes("salmon")) return "salmon";
  if (lower.includes("sable")) return "sablefish";
  if (lower.includes("halibut")) return "halibut";
  if (lower.includes("scallop")) return "scallops";
  if (lower.includes("cod")) return "cod";
  if (lower.includes("smoked")) return "smoked";

  // Fallback so linked products still place the recipe in a category
  return "seafood";
}
