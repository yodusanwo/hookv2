/**
 * Derives a slug to match Sanity `recipeCategory.slug` for PDP recipe cards.
 * Prefer the optional Shopify filter metafield (same as /shop) when configured; else productType.
 * Values should align with Recipe Category slugs in Studio (e.g. "salmon", "halibut").
 */
export function recipeCategorySlugFromProduct(filters: {
  filterMetafieldValue?: string | null;
  productType?: string | null;
}): string | null {
  const raw =
    (filters.filterMetafieldValue?.trim() ||
      filters.productType?.trim() ||
      "") || "";
  if (!raw) return null;
  return raw.toLowerCase().replace(/\s+/g, "-");
}
