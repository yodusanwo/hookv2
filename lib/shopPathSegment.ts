import type { CategorySectionBlockData } from "@/components/sections/CategorySectionBlock";

/** Builds the `/shop/[segment]` path piece for a collection handle or Shopify product-type filter value. */
export function shopPathSegmentFromValue(value: string): string {
  return encodeURIComponent(
    value.trim().toLowerCase().replace(/\s+/g, "-"),
  );
}

/**
 * Resolves a URL segment to either a collection section or a product-type filter from Sanity.
 * Collection handles are checked first, then filter values (case- and hyphen-insensitive).
 */
export function resolveShopPathSegment(
  rawSegment: string,
  collectionSections: CategorySectionBlockData[],
  filterOptions: Array<{ value: string }>,
): { kind: "collection"; handle: string } | { kind: "filter"; value: string } | null {
  let decoded = rawSegment.trim();
  try {
    decoded = decodeURIComponent(decoded).trim();
  } catch {
    return null;
  }
  if (!decoded) return null;

  const exactColl = collectionSections.find((s) => s.collectionHandle === decoded);
  if (exactColl) return { kind: "collection", handle: exactColl.collectionHandle };

  const collCi = collectionSections.find(
    (s) => s.collectionHandle.toLowerCase() === decoded.toLowerCase(),
  );
  if (collCi) return { kind: "collection", handle: collCi.collectionHandle };

  const exactFilter = filterOptions.find((f) => f.value === decoded);
  if (exactFilter) return { kind: "filter", value: exactFilter.value };

  const filterCi = filterOptions.find(
    (f) => f.value.toLowerCase() === decoded.toLowerCase(),
  );
  if (filterCi) return { kind: "filter", value: filterCi.value };

  const decNorm = decoded.toLowerCase().replace(/-/g, " ").replace(/\s+/g, " ").trim();
  const fuzzyColl = collectionSections.find((s) => {
    const h = s.collectionHandle.toLowerCase().replace(/-/g, " ").replace(/\s+/g, " ").trim();
    return h === decNorm;
  });
  if (fuzzyColl) return { kind: "collection", handle: fuzzyColl.collectionHandle };

  const fuzzyFilter = filterOptions.find((f) => {
    const fv = f.value.toLowerCase().replace(/\s+/g, " ").trim();
    return fv === decNorm;
  });
  if (fuzzyFilter) return { kind: "filter", value: fuzzyFilter.value };

  return null;
}
